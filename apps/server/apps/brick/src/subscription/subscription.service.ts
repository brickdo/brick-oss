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

import { BadRequestException, Injectable } from '@nestjs/common'
import { UserService } from '@brick/user/user.service'
import Stripe from 'stripe'
import { StripeClient } from '@brick/stripe/stripe-client.provider'
import { User } from '@app/db'
import {
  DefaultSubscriptionPlan,
  StripeExtraPriceId,
  StripePlanIds,
  SubscriptionExtrasUsage,
  SubscriptionPlanEntityName,
  SubscriptionPlanId,
  SubscriptionPlans,
} from '@brick/misc/constants/subscription'

type CheckoutSessionCompletedEvent = Stripe.Event & {
  data: { object: Stripe.Checkout.Session }
}

type InvoiceEvent = Stripe.Event & {
  data: { object: Stripe.Invoice }
}

type CustomerSubscriptionUpdatedEvent = Stripe.Event & {
  data: { object: Stripe.Subscription }
}

type CustomerSubscriptionDeletedEvent = Stripe.Event & {
  data: { object: Stripe.Subscription }
}

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly userService: UserService,
    private readonly stripeClient: StripeClient,
  ) {}

  async handleCheckout(event: CheckoutSessionCompletedEvent) {
    const userId = event.data.object.client_reference_id

    if (!userId) {
      throw new BadRequestException('No user id in checkout session')
    }

    const lineItems = await this.stripeClient.checkout.sessions.listLineItems(event.data.object.id)
    const planId = lineItems.data[0].price!.id
    await this.userService.updateById(userId, {
      subscriptionPlan: planId as SubscriptionPlanId,
    })
  }

  async handlePaymentFailed(event: InvoiceEvent) {
    const customerId = event.data.object.customer as string

    const user = await this.userService.findOne({ customerId })

    if (!user) {
      return
    }

    await this.userService.updateById(user.id, {
      subscriptionPlan: DefaultSubscriptionPlan.id,
    })
  }


  async handlePaymentSucceeded(event: CustomerSubscriptionUpdatedEvent) {
    const customerId = event.data.object.customer as string

    const user = await this.userService.findOne({ customerId })
    const priceId = event.data.object.items.data?.[0]?.price.id

    if (!user || !priceId) {
      return
    }

    await this.userService.updateById(user.id, {
      subscriptionPlan: priceId as SubscriptionPlanId,
    })
  }

  async handleSubscriptionDeleted(event: CustomerSubscriptionDeletedEvent) {
    const customerId = event.data.object.customer as string

    const user = await this.userService.findOne({ customerId })

    if (!user) {
      return
    }

    await this.userService.updateById(user.id, {
      subscriptionPlan: SubscriptionPlanId.free,
    })
  }

  async getUserSubscription(user: User): Promise<Stripe.Subscription | null> {
    if (!user.customerId) {
      return null
    }
    const subscriptionsResponse = await this.stripeClient.subscriptions.list({
      customer: user.customerId,
      limit: 1,
    })

    return subscriptionsResponse.data[0] || null
  }

  async cancelUserSubscription(user: User) {
    const userSubscription = await this.getUserSubscription(user)

    if (!userSubscription || userSubscription.cancel_at_period_end) {
      return
    }

    await this.stripeClient.subscriptions.update(userSubscription.id, {
      cancel_at_period_end: true,
    })
  }

  async reactivateUserSubscription(user: User) {
    const userSubscription = await this.getUserSubscription(user)

    if (!userSubscription || !userSubscription.cancel_at_period_end) {
      return
    }

    await this.stripeClient.subscriptions.update(userSubscription.id, {
      cancel_at_period_end: false,
    })
  }

  getUserSubscriptionPlan(user: User) {
    return SubscriptionPlans[user.subscriptionPlan] || DefaultSubscriptionPlan
  }

  async getUserInvoicedExtraItems(user: User): Promise<SubscriptionExtrasUsage> {
    const planId = user.subscriptionPlan

    const extraItems: SubscriptionExtrasUsage = {
      domains: 0,
      subdomains: 0,
      workspaces: 0,
      collabPagesUsers: 0,
      collabWorkspaces: 0,
      collabWorkspacesUsers: 0,
    }

    const isStripeSubscription = planId && StripePlanIds.includes(planId)

    if (!isStripeSubscription) {
      return extraItems
    }

    const subscription = await this.getUserSubscription(user)

    const userSubscriptionItems = subscription
      ? await this.stripeClient.subscriptionItems.list({
          subscription: subscription.id,
        })
      : null

    const extraDomains = await this.countExtraItems(
      userSubscriptionItems,
      StripeExtraPriceId.extraCustomDomainDay,
    )
    const extraTeamMembers = await this.countExtraItems(
      userSubscriptionItems,
      StripeExtraPriceId.extraTeamMemberDay,
    )
    const extraTeamWorkspaces = await this.countExtraItems(
      userSubscriptionItems,
      StripeExtraPriceId.extraTeamWorkspaceDay,
    )

    return {
      ...extraItems,
      domains: extraDomains,
      collabWorkspaces: extraTeamWorkspaces,
      collabWorkspacesUsers: extraTeamMembers,
    }
  }

  async countExtraItems(
    userSubscriptionItems: Stripe.Response<Stripe.ApiList<Stripe.SubscriptionItem>> | null,
    priceId: StripeExtraPriceId,
  ) {
    const extraSubscriptionItemId =
      userSubscriptionItems && userSubscriptionItems.data.find(x => x.price.id === priceId)?.id

    if (!extraSubscriptionItemId) {
      return 0
    }

    const exptraUsageRecords =
      await this.stripeClient.subscriptionItems.listUsageRecordSummaries(extraSubscriptionItemId)

    return exptraUsageRecords.data[0].total_usage
  }

  async getUserPlanInfo(user: User) {
    const userPlan = this.getUserSubscriptionPlan(user)
    const extraItems = await this.getUserInvoicedExtraItems(user)
  }
}