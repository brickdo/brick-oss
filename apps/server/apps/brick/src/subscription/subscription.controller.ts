/**
 * Copyright (C) 2025 Monadfix OÜ
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Request, Response } from 'express'
import {
  Post,
  Req,
  Res,
  HttpStatus,
  Get,
  UseGuards,
  Put,
  Header,
  Body,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { UserService } from '@brick/user/user.service'
import { SubscriptionPlanId } from '@brick/misc/constants/subscription'
import { SubscriptionService } from './subscription.service'
import { StripeClient } from '@brick/stripe/stripe-client.provider'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { Stripe } from 'stripe'
import { AuthenticatedRequest } from '@brick/types'

const { STRIPE_ENDPOINT_SECRET } = process.env

type StripeEventKeys =
  | 'checkoutSessionCompleted'
  | 'invoicePaymentFailed'
  | 'invoicePaymentSucceeded'
  | 'customerSubscriptionDeleted'
  | 'customerSubscriptionUpdated'

const StripeEvent: {
  [key in StripeEventKeys]: Stripe.WebhookEndpointUpdateParams.EnabledEvent
} = {
  checkoutSessionCompleted: 'checkout.session.completed',
  invoicePaymentFailed: 'invoice.payment_failed',
  invoicePaymentSucceeded: 'invoice.payment_succeeded',
  customerSubscriptionDeleted: 'customer.subscription.deleted',
  customerSubscriptionUpdated: 'customer.subscription.updated',
}

const appUrl = process.env.PUBLICVAR_BRICK_URL
const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

@ApiControllerDecorator('subscription')
export class SubscriptionController {
  constructor(
    private readonly userService: UserService,
    private readonly subscriptionService: SubscriptionService,
    private readonly stripeClient: StripeClient,
  ) {}

  @Get('plans')
  getSubscriptionPlans() {
    return []
  }

  @Get('user-subscription')
  @UseGuards(JwtAuthGuard)
  async getUserSubscription(@Req() req: AuthenticatedRequest) {
    const planId = req.user.subscriptionPlan
    const subscriptionId = (await this.subscriptionService.getUserSubscription(req.user))?.id

    return {
      planId,
      subscriptionId,
      extraItems: await this.subscriptionService.getUserInvoicedExtraItems(req.user),
    }
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Req() req: AuthenticatedRequest,
    @Body()
    { planId, successUrl, cancelUrl }: { planId: string; successUrl: string; cancelUrl: string },
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (!Object.values(SubscriptionPlanId).includes(planId as SubscriptionPlanId)) {
      throw new BadRequestException('No such plan')
    }
    const { user } = req
    const customerId = user.customerId || (await this.stripeClient.customers.create()).id

    if (!user.customerId) {
      await this.userService.updateById(user.id, {
        customerId,
      })
    }

    const currentSubscription = user.customerId
      ? await this.subscriptionService.getUserSubscription(user)
      : null

    if (!currentSubscription) {
      const session = await this.stripeClient.checkout.sessions.create({
        line_items: [{ price: planId, quantity: 1 }],
        payment_method_types: ['card'],
        customer: customerId,
        mode: 'subscription',
        client_reference_id: user.id,
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      })
      return session.id
    } else {
      const currentPlanSubscriptionItem = currentSubscription.items.data.find(
        x => x.price.id === user.subscriptionPlan,
      )

      if (!currentPlanSubscriptionItem) {
        throw new Error('No subscription item corresponding to current plan')
      }

      await this.stripeClient.subscriptions.update(currentSubscription.id, {
        payment_behavior: 'error_if_incomplete',
        proration_behavior: 'always_invoice',
        items: [
          {
            id: currentPlanSubscriptionItem.id,
            price: planId,
          },
        ],
      })

      await this.userService.updateById(user.id, {
        subscriptionPlan: planId as SubscriptionPlanId,
      })
    }
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get('info')
  @UseGuards(JwtAuthGuard)
  async getSubscriptionInfo(@Req() req: AuthenticatedRequest) {
    const { user } = req

    const extraEntitiesUsage = await this.subscriptionService.getUserInvoicedExtraItems(user)

    if (!user.customerId || !user.subscriptionPlan) {
      return { extraEntitiesUsage }
    }

    try {
      const subscription = await this.subscriptionService.getUserSubscription(user)

      if (!subscription) {
        return { extraEntitiesUsage }
      }

      return {
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end,
        extraEntitiesUsage,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  @Post('hook')
  async handleStripeHook(@Req() request: Request & { rawBody: Buffer }, @Res() response: Response) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const sig = request.headers['stripe-signature']

    const sendVerificationError = (err: any) =>
      response
        .status(HttpStatus.BAD_REQUEST)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .send(`Webhook Event Verification Error: ${err.message}`)

    if (!sig) {
      sendVerificationError(new Error('No signature'))
      return
    }

    let event: Stripe.Event & any
    try {
      event = this.stripeClient.webhooks.constructEvent(
        request.rawBody,
        sig,
        STRIPE_ENDPOINT_SECRET,
      )
    } catch (err) {
      sendVerificationError(err)
      return
    }

    try {
      switch (event.type) {
        case StripeEvent.checkoutSessionCompleted:
          await this.subscriptionService.handleCheckout(event)
          break
        case StripeEvent.customerSubscriptionUpdated:
          await this.subscriptionService.handlePaymentSucceeded(event)
          break
        case StripeEvent.customerSubscriptionDeleted:
          await this.subscriptionService.handleSubscriptionDeleted(event)
          break
        default: {
          response
            .status(HttpStatus.NOT_IMPLEMENTED)
            .send(`Webhook event handle error: not supported event type`)
        }
      }
    } catch (err: any) {
      console.error(err)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .send(`Webhook event handle error: ${err?.message}`)
      return
    }

    response.status(HttpStatus.OK).send()
  }

  @Put('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (!req.user.customerId) {
      res.status(HttpStatus.NOT_MODIFIED).send()
      return
    }

    await this.subscriptionService.cancelUserSubscription(req.user)
    res.send()
  }

  @Put('reactivate')
  @UseGuards(JwtAuthGuard)
  async reactivateSubscription(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (!req.user.customerId) {
      res.status(HttpStatus.NOT_MODIFIED).send()
      return
    }

    await this.subscriptionService.reactivateUserSubscription(req.user)
    res.send()
  }

  // @Post('update')
  // @UseGuards(JwtAuthGuard)
  // async updateSubscription(
  //   @Req() req: AuthenticatedRequest,
  //   @Body() { planId }: { planId: string }
  // ) {
  //   if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')
  //
  //   if (!planId) {
  //     throw new BadRequestException('No planId provided')
  //   }

  //   const { customerId } = req.user

  //   if (!customerId) {
  //
  //     return
  //   }

  //   const customer = await this.stripeClient.customers.retrieve(customerId)
  //   if ('deleted' in customer) {
  //     console.error(
  //       `Upgrading customerId: ${customerId} exception. Customer deleted`
  //     )
  //     throw new BadRequestException('Customer is deleted')
  //   }

  //   const subscription = customer.subscriptions?.data[0]

  //   if (!subscription) {
  //     throw new BadRequestException('No existing subscriptions')
  //   }

  //   if (
  //     !Object.values(SubscriptionPlanId).includes(planId as SubscriptionPlanId)
  //   ) {
  //     throw new BadRequestException('No such plan')
  //   }

  //   try {
  //     await this.stripeClient.subscriptions.update(subscription.id, {
  //       cancel_at_period_end: false,
  //       proration_behavior: 'none',
  //       items: [
  //         {
  //           id: subscription.items.data[0].id,
  //           price: planId,
  //         },
  //       ],
  //     })
  //   } catch (e) {
  //     console.error(e)
  //     throw new InternalServerErrorException(`Plan upgrade stripe error`)
  //   }

  //   await this.userService.updateById(req.user.id, {
  //     subscriptionPlan: planId as SubscriptionPlanId,
  //   })
  // }

  // @Get('upcoming-invoice')
  // @UseGuards(JwtAuthGuard)
  // async getUpcomingInvoice (
  //   @Req() req: Request & { user: User }
  // ) {
  //   const { customerId } = req.user
  //   if (!customerId) {
  //     return null
  //   }

  //   const invoice = await this.stripeClient.invoices.retrieveUpcoming({ customer: customerId })

  //   return {
  //     nextPaymentDate: invoice.next_payment_attempt,
  //     amount: invoice.total / 100
  //   }
  // }
}