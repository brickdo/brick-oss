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
  Get,
  UseGuards,
  Request as Req,
  Response as Res,
  Post,
  Body,
  Param,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response, Request } from 'express'
import { AuthService, RequestWithAccessToken } from './auth.service'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { AuthenticatedRequest } from '@brick/types'
import { IsBoolean, IsEmail, IsIn, IsString, IsUUID, MinLength } from 'class-validator'
import { AuthProvider } from '@brick/user/AuthProvider'
import { EmailService } from '@brick/email/email.service'
import { redirectHome } from '@brick/utils/redirectHome'
import { UserService } from '@brick/user/user.service'
import { authCookieName } from '@brick/misc/constants/authCookieName'
import _ from 'lodash'
import {
  SubscriptionPlanId,
  SubscriptionPlans,
} from '@brick/misc/constants/subscription/subscriptionPlans'

const isProduction = process.env.NODE_ENV === 'production'
const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

export const authCookieOptions = {
  httpOnly: true,
  domain: process.env.PUBLICVAR_BRICK_DOMAIN,
}

class PasswordValidator {
  @MinLength(8)
  @IsString({})
  password: string
}

class SignUpLocalBodyParams extends PasswordValidator {
  @IsString()
  name: string

  @IsEmail()
  email: string

  /** Only enabled in dev mode. Skips email verification */
  @IsBoolean()
  devSkipVerification?: boolean

  /** Only enabled in dev mode. Sets a specific subscription plan instead of the default (free) one */
  @IsIn(Object.keys(SubscriptionPlans))
  devSubscriptionPlan?: SubscriptionPlanId
}

class RequestResetPasswordBodyParams {
  @IsEmail()
  email: string
}

class ResetPasswordBodyParams extends PasswordValidator {
  @IsUUID()
  tokenId: string
}

class FinishSignUpParams {
  @IsUUID()
  id: string

  @IsString()
  password: string
}

@ApiControllerDecorator('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private logger: MyLoggerService,
    private emailService: EmailService,
    private userService: UserService,
  ) {
    logger.setContext('AuthController')
  }

  @UseGuards(AuthGuard('github'))
  @Get('github')
  authGithub() {
    // passport will initialize oauth flow automatically
  }

  @UseGuards(AuthGuard('github'))
  @Get('github/callback')
  authGithubCallback(@Req() req: RequestWithAccessToken, @Res() res: Response) {
    this.oauthCallback(req, res)
  }

  @UseGuards(AuthGuard('google'))
  @Get('google')
  authGoogle() {
    // passport will initialize oauth flow automatically
  }

  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  authGoogleCallback(@Req() req: RequestWithAccessToken, @Res() res: Response) {
    this.oauthCallback(req, res)
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async authLocal(@Req() req: RequestWithAccessToken, @Res() res: Response) {
    this.localAuthCallback(req, res)
  }

  @Get('logout')
  logout(@Res() res: Response, @Req() req: AuthenticatedRequest) {
    res.clearCookie(authCookieName, authCookieOptions)
    res.status(200).redirect('/')
  }

  // @Get('demo')
  // async demoLogin (@Res() res) {
  //   const demoToken = await this.authService.demoLogin()
  //   const dateAfter30Days = new Date(Date.now() + (1000 * 60 * 60 * 24 * 30))
  //
  //   res.cookie(authCookieName, demoToken, {
  //     expires: dateAfter30Days,
  //     ...authCookieOptions
  //   })
  //   res.send()
  // }

  @Post('sign-up/local')
  async signUpLocal(
    @Body()
    { email, name, password, devSkipVerification, devSubscriptionPlan }: SignUpLocalBodyParams,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const passHash = await this.authService.hashPassword(password)
    const user = await this.authService.signUp({
      name: name.trim(),
      email,
      password: passHash,
      provider: AuthProvider.local,
    })

    // Email verification
    if (!isProduction && devSkipVerification) {
      await this.userService.updateById(user.id, { isEmailConfirmed: true })
    } else {
      const confirmEmailToken = await this.authService.generateConfirmEmailJwt({
        userId: user.id,
      })
      await this.emailService.sendConfirmEmailLink({
        email,
        token: confirmEmailToken,
        userName: name,
      })
    }

    // Plan assignment
    if (!isProduction && devSubscriptionPlan) {
      await this.userService.updateById(user.id, { subscriptionPlan: devSubscriptionPlan })
    }
  }

  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string, @Res() res: Response) {
    const isValidToken = this.authService.validateConfirmEmailJwt(token)
    if (!isValidToken) {
      redirectHome(res)
      return
    }
    const decodedToken = this.authService.decodeConfirmEmailJwt(token)

    if (!decodedToken) {
      redirectHome(res)
      return
    }

    if (typeof decodedToken !== 'object' || !decodedToken.userId) {
      redirectHome(res)
      return
    }
    await this.userService.updateById(decodedToken.userId, {
      isEmailConfirmed: true,
    })

    redirectHome(res, '/?success-email-confirmed')
  }

  @Post('request-reset-password')
  async requestResetPassword(
    @Req() req: AuthenticatedRequest,
    @Body() { email }: RequestResetPasswordBodyParams,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.authService.requestResetPassword(email)
  }

  @Get('reset-password/:tokenId')
  async resetPasswordRedirect(@Res() res: Response, @Param('tokenId') tokenId: string) {
    const isTokenValid = await this.authService.checkIsResetPasswordTokenValid(tokenId)

    if (!isTokenValid) {
      redirectHome(res, '/?reset-password-invalid')
    } else {
      redirectHome(res, `/?reset-password-token=${tokenId}`)
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() { tokenId, password }: ResetPasswordBodyParams) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.authService.resetPassword({ tokenId, password })
  }

  @Get('get-finish-signup-email/:id')
  async getFinishSignUpEmail(@Param('id') id: string) {
    if (typeof id !== 'string') {
      throw new BadRequestException()
    }

    const user = await this.userService.findOne({ finishSignUpId: id })
    if (!user) {
      return null
    }

    return user.email
  }

  @Post('finish-signup')
  async finishSignUp(@Body() { id, password }: FinishSignUpParams) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const user = await this.userService.findOne({
      where: {
        finishSignUpId: id,
      },
      select: ['id', 'finishSignUpId'],
    })

    if (!user) {
      throw new BadRequestException('No such finish sign up id')
    }

    const passHash = await this.authService.hashPassword(password)

    await this.userService.updateById(user.id, {
      password: passHash,
      finishSignUpId: null,
    })
  }

  setAuthCookie(req: RequestWithAccessToken, res: Response) {
    // This line is for old cookie options, if some old user still have it login will break
    res.clearCookie(authCookieName, _.omit(authCookieOptions, 'domain'))
    res.clearCookie(authCookieName, authCookieOptions)
    const dateAfter10Years = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)

    res.cookie(authCookieName, req.user.accessToken, {
      expires: dateAfter10Years,
      ...authCookieOptions,
    })
  }

  localAuthCallback(req: RequestWithAccessToken, res: Response) {
    this.setAuthCookie(req, res)
    res.send()
  }

  oauthCallback(req: RequestWithAccessToken, res: Response) {
    this.setAuthCookie(req, res)

    // Used for authentication with google and github. Grep for 'backendAnswerMessage' to see where
    // this message is handled.
    const script = `
      <script>
        window.opener.postMessage('ok', '${process.env.PUBLICVAR_BRICK_URL}');
        window.close()
      </script>
    `
    res.send(script)
  }
}