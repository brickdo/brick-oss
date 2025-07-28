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

import { UserService } from './user.service'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import {
  BadRequestException,
  Body,
  ForbiddenException,
  Get,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { Request, Response } from 'express'
import { User } from '@app/db'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { IsBoolean } from 'class-validator'
import { AuthenticatedRequest } from '@brick/types'
import { SubscriptionPlans } from '@brick/misc/constants/subscription'
import { EmailService } from '@brick/email/email.service'
import { AuthProvider } from './AuthProvider'
import jwt from 'jsonwebtoken'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

export const CHANGE_EMAIL_SECRET =
  'REDACTED'
export const CHANGE_EMAIL_EXPIRES_IN = '15m'

const encodeChangeEmailToken = (data: object) => {
  return jwt.sign(data, CHANGE_EMAIL_SECRET)
}

const decodeChangeEmailToken = <T extends {}>(token: string) => {
  return jwt.verify(token, CHANGE_EMAIL_SECRET) as T
}

export type ChangeEmailOldConfirmTokenPayload = {
  userId: string
  newEmail: string
  oldEmail: string
}

export type ChangeEmailNewVerifyTokenPayload = ChangeEmailOldConfirmTokenPayload & {
  isOldEmailConfirmed: boolean
}

class UpdateUserParams {
  @IsBoolean()
  isAgreedMailing?: User['isAgreedMailing']

  @IsBoolean()
  periodicBackups?: User['periodicBackups']
}

@ApiControllerDecorator('profile')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private logger: MyLoggerService,
  ) {
    logger.setContext('UserController')
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getUser(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    res.send(req.user)
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ skipMissingProperties: true, whitelist: true }))
  async updateUser(@Req() req: AuthenticatedRequest, @Body() params: UpdateUserParams) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const { user } = req
    this.logger.info('User update request', { user, params })
    const isAuthorizedForBackups = SubscriptionPlans[user.subscriptionPlan]?.canWeeklyBackups
    if (params.periodicBackups != null && !isAuthorizedForBackups) {
      throw new UnauthorizedException('Non-premium users cannot enable periodic backups')
    }
    await this.userService.updateById(user.id, params)
  }

  @Post('request-email-change')
  @UseGuards(JwtAuthGuard)
  async requestEmailChange(@Req() req: AuthenticatedRequest, @Body() { email }: { email: string }) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const { user } = req

    if (user.provider !== AuthProvider.local) {
      throw new UnauthorizedException('Cannot change email for non-local users')
    }

    if (!email) {
      throw new BadRequestException('Email is required')
    }

    if (user.email === email) {
      throw new BadRequestException('Email is the same')
    }

    const existingUser = await this.userService.findOne({
      where: { email },
    })

    if (existingUser) {
      throw new BadRequestException('Email is already taken')
    }

    this.logger.info('User email change request', { user, email })

    const token = encodeChangeEmailToken({
      userId: user.id,
      oldEmail: user.email,
      newEmail: email,
    })
    await this.emailService.sendConfirmChangeEmailOldEmail(user, email, token)
  }

  @Get('confirm-change-email/:token')
  async confirmChangeEmail(@Req() req: Request, @Res() res: Response) {
    const token = req.params.token

    if (!token) {
      throw new BadRequestException('Token not found')
    }

    let tokenData
    try {
      tokenData = decodeChangeEmailToken<ChangeEmailOldConfirmTokenPayload>(token)
    } catch (e: any) {
      throw new BadRequestException(e.message)
    }

    const { userId, oldEmail, newEmail } = tokenData

    const user = await this.userService.getById(userId)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const isEmailPassProvider = user.provider === AuthProvider.local

    if (!isEmailPassProvider) {
      throw new BadRequestException('Cannot change email for non-local users')
    }

    const newToken = encodeChangeEmailToken({
      userId,
      oldEmail,
      newEmail,
      isOldEmailConfirmed: true,
    })
    await this.emailService.sendVerifyNewEmailAfterChange(user, newEmail, newToken)
    res.send('Please check your new email to verify it')
  }

  @Get('change-email-verify/:token')
  async changeEmailVerifyNew(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const token = req.params.token

    if (!token) {
      throw new BadRequestException('Token not found')
    }

    let tokenData
    try {
      tokenData = decodeChangeEmailToken<ChangeEmailNewVerifyTokenPayload>(token)
    } catch (e: any) {
      throw new BadRequestException('Token is invalid')
    }

    const { userId, oldEmail, newEmail, isOldEmailConfirmed } = tokenData

    const user = await this.userService.getById(userId)

    if (!user) {
      throw new BadRequestException('User not found')
    }

    const isEmailPassProvider = user.provider === AuthProvider.local

    if (!isEmailPassProvider) {
      throw new BadRequestException('Cannot change email for non-local users')
    }

    if (!isOldEmailConfirmed) {
      throw new BadRequestException('Old email did not confirm change')
    }

    await this.userService.updateById(user.id, { email: newEmail })

    res.send('Email changed successfully')
  }
}