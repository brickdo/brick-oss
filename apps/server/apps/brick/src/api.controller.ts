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

import {
  Body,
  ForbiddenException,
  Get,
  MethodNotAllowedException,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { IsEmail, IsString } from 'class-validator'
import { invert, mapValues } from 'lodash'
import { JwtAuthGuard } from './auth/auth.jwt.guard'
import { SubscriptionPlanId } from '@brick/misc/constants/subscription'
import { ApiControllerDecorator } from './decorators/api-controller.decorator'
import { FrontendService } from './frontend/frontend.service'
import { AuthenticatedRequest } from '@brick/types'
import { AuthProvider } from './user/AuthProvider'
import { UserService } from './user/user.service'
import { v4 as uuidv4 } from 'uuid'
import { EmailService } from './email/email.service'
import { Request, Response } from 'express'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { User, SaasMantraUsedCodes } from '@app/db'
import { CertificatesService } from './certificates/certificates.service'
import { PublicAddressService } from './public-address/public-address.service'

const adminAuthHeader =
  'Basic REDACTED'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

class SaasMantraWebhookParams {
  @IsEmail()
  email: string
  @IsString()
  firstName: string
  @IsString({ each: true })
  tokensAdded: string[]
  @IsString({ each: true })
  tokensRemoved: string[]
}

const SaasMantraTokensLengthToPlan = {
  1: SubscriptionPlanId.saasMantraCode1,
  2: SubscriptionPlanId.saasMantraCode2,
  3: SubscriptionPlanId.saasMantraCode3,
  4: SubscriptionPlanId.saasMantraCode4,
  5: SubscriptionPlanId.saasMantraCode5,
  6: SubscriptionPlanId.saasMantraCode6,
  7: SubscriptionPlanId.saasMantraCode7,
  8: SubscriptionPlanId.saasMantraCode8,
  9: SubscriptionPlanId.saasMantraCode9,
  10: SubscriptionPlanId.saasMantraCode10,
}

export type SaasMantraPlanCodeNumber = keyof typeof SaasMantraTokensLengthToPlan

const PlanToSaasMantraTokensLength = mapValues(invert(SaasMantraTokensLengthToPlan), x => Number(x))

@ApiControllerDecorator()
export class ApiController {
  constructor(
    private readonly frontendServive: FrontendService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly certificatesService: CertificatesService,
    @InjectRepository(SaasMantraUsedCodes)
    private readonly saasMantraUsedCodesModel: Repository<SaasMantraUsedCodes>,
    private readonly publicAddressService: PublicAddressService,
  ) {}

  @Get()
  async healthcheck() {
    return 'Ok'
  }

  @UseGuards(JwtAuthGuard)
  @Get('app-initial-props')
  async getAppInitialProps(@Req() req: AuthenticatedRequest) {
    return this.frontendServive.getAppInitialProps({ userId: req.user.id })
  }

  @Post('saasmantra')
  async saasMantraHook(
    @Body()
    { email, firstName, tokensAdded, tokensRemoved }: SaasMantraWebhookParams,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    // Such https codes and json content is required by SaaS Mantra specificaitons
    const sendSuccessRes = (message?: string) => res.status(200).json({ status: 'ok', message })
    const sendErrorRes = (message: string) => res.status(405).json({ status: 'error', message })

    const saasMantraAuthHeader = 'Basic REDACTED'
    const authHeaders = [req.headers['authorization'], req.headers['Authorization']]
    const isAuthorized = authHeaders.includes(saasMantraAuthHeader)
    if (!isAuthorized) {
      sendErrorRes('Unauthorized')
      return
    }

    const user = await this.userService.findOne({
      email,
      provider: AuthProvider.local,
    })

    if (!user) {
      if (!tokensAdded?.length) {
        sendErrorRes('Tokens added empty and account does not exist')
        return
      }

      const existingTokens = await this.saasMantraUsedCodesModel.find({
        code: In(tokensAdded),
      })
      if (existingTokens.length) {
        sendErrorRes(`Tokens ${existingTokens.map(x => `"${x.code}"`).join(' ')} were already used`)
        return
      }

      const subscriptionPlan =
        SaasMantraTokensLengthToPlan[tokensAdded.length as SaasMantraPlanCodeNumber]
      const user = await this.userService.create({
        email,
        name: firstName,
        subscriptionPlan,
        isEmailConfirmed: true,
        provider: AuthProvider.local,
      })

      const finishSignUpId = uuidv4()
      await this.userService.updateById(user.id, { finishSignUpId })
      await this.emailService.sendSaasMantraCompleteSignUpEmail({
        userName: firstName,
        email,
        userFinishSignUpId: finishSignUpId,
      })
      await this.saasMantraUsedCodesModel.save(
        this.saasMantraUsedCodesModel.create(tokensAdded.map(x => ({ code: x }))),
      )
      sendSuccessRes()
      return
    }

    if (
      (!tokensAdded?.length && !tokensRemoved?.length) ||
      (tokensAdded.length && tokensRemoved.length)
    ) {
      sendErrorRes(
        'Account exists, but provided data is ambiguous. Both "tokensAdded" and "tokensRemoved" properties exist or both empty.',
      )
      return
    }

    const { subscriptionPlan: currentSubscription } = user

    // Upgrade user subscription
    if (tokensAdded.length) {
      const existingTokes = await this.saasMantraUsedCodesModel.find({
        code: In(tokensAdded),
      })
      if (existingTokes.length) {
        sendErrorRes(`Tokens ${existingTokes.map(x => `"${x.code}"`).join(' ')} were already used`)
        return
      }

      const newTokensLength =
        (PlanToSaasMantraTokensLength[currentSubscription] || 0) + tokensAdded.length
      const maxSaasMantraTokensLength = Math.max(
        ...Object.keys(SaasMantraTokensLengthToPlan).map(x => Number(x)),
      )
      if (maxSaasMantraTokensLength < newTokensLength) {
        sendErrorRes(
          'User exists. tokensAdded property is too hight. There is no subscription for sum of current user subscription and tokesAdded.',
        )
        return
      }
      const newSubscriptionPlan =
        SaasMantraTokensLengthToPlan[newTokensLength as SaasMantraPlanCodeNumber]
      await this.userService.updateById(user.id, {
        subscriptionPlan: newSubscriptionPlan,
      })
      await this.saasMantraUsedCodesModel.save(
        this.saasMantraUsedCodesModel.create(tokensAdded.map(x => ({ code: x }))),
      )
      sendSuccessRes('Successfully updated user subscription')
      return
    }

    // Downgrade user subscription
    if (tokensRemoved.length) {
      const newTokensLength =
        PlanToSaasMantraTokensLength[currentSubscription] - tokensRemoved.length
      let newSubscriptionPlan
      if (!newTokensLength) {
        newSubscriptionPlan = SubscriptionPlanId['free']
      } else {
        newSubscriptionPlan =
          SaasMantraTokensLengthToPlan[newTokensLength as SaasMantraPlanCodeNumber]
      }
      await this.userService.updateById(user.id, {
        subscriptionPlan: newSubscriptionPlan,
      })
      sendSuccessRes('Successfully downgraded user subscription')
      return
    }
  }

  @Post('resend-saasmantra-finish-email')
  async resendSaasmantraFinishEmail(
    @Body() { userId }: { userId: User['id'] },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const authHeaders = [req.headers['authorization'], req.headers['Authorization']]
    const isAuthorized = authHeaders.includes(adminAuthHeader)
    if (!isAuthorized) {
      res.status(403).send('Forbidden')
      return
    }

    const user = await this.userService.findOne(userId)

    if (!user) {
      res.status(404).send('User not found')
      return
    }

    const finishSignUpId = uuidv4()
    await this.userService.updateById(user.id, {
      finishSignUpId,
      password: null,
    })
    await this.emailService.sendSaasMantraCompleteSignUpEmail({
      userName: user.name,
      email: user.email,
      userFinishSignUpId: finishSignUpId,
    })
    res.send(`Successfully send email to ${user.email}`)
  }

  // Get Api controller with path "renew-certs" that renews certificates
  // from certificates storage and authorized by authroization header with adminAuthHeader
  @Get('renew-certs')
  async renewCerts(@Req() req: Request, @Res() res: Response) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const authHeaders = [req.headers['authorization'], req.headers['Authorization']]
    const isAuthorized = authHeaders.includes(adminAuthHeader)
    if (!isAuthorized) {
      res.status(403).send('Forbidden')
      return
    }

    await this.certificatesService.checkCertsExpire()
    res.send()
  }

  // Get Api controller with path "renew-certs" that renews certificates
  // from certificates storage and authorized by authroization header with adminAuthHeader
  @Get('renew-certs/:domain')
  async renewCert(
    @Param('domain') domain: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const authHeaders = [req.headers['authorization'], req.headers['Authorization']]
    const isAuthorized = authHeaders.includes(adminAuthHeader)
    if (!isAuthorized) {
      res.status(403).send('Forbidden')
      return
    }

    const publicAddress = await this.publicAddressService.findOne({
      externalDomain: domain,
    })

    if (!publicAddress) {
      res.status(404).send('Domain not found')
      return
    }

    await this.certificatesService.generateCertsForPublicAddress(publicAddress)
    res.send()
  }
}