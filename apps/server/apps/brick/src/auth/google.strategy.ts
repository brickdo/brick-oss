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

import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-google-oauth20'
import { Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthProvider } from '@brick/user/AuthProvider'
import { AuthService } from './auth.service'
import { UserService } from '@brick/user/user.service'
import passport from 'passport'

const { OAUTH_GOOGLE_CLIENT_ID, OAUTH_GOOGLE_CLIENT_SECRET } = process.env

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: OAUTH_GOOGLE_CLIENT_ID,
      clientSecret: OAUTH_GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.PUBLICVAR_BRICK_URL}/api/auth/google/callback`,
      passReqToCallback: true,
      scope: ['email', 'profile'],
    })
  }

  authenticate(req: Request, options: passport.AuthenticateOptions) {
    // @ts-ignore
    return super.authenticate(req, {
      ...options,
      state: JSON.stringify(req.query),
    })
  }

  async validate(request: Request, accessToken: string, refreshToken: string, profile: any) {

    // if (!profile) {
    //   done(new BadRequestException(), null)
    // }
    const {
      name: { givenName, familyName },
      emails,
    } = profile


    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const name = `${givenName} ${familyName || ''}`.trim()
    const requestState = request.query.state
    const requestParams: { referrer?: string } | undefined =
      typeof requestState === 'string' ? JSON.parse(requestState) : undefined

    const user = {
      email: emails[0].value,
      name,
      provider: AuthProvider.google,

    }
    let userModel = await this.userService.findOne({
      email: user.email,
      provider: user.provider,
    })
    if (!userModel) {
      userModel = await this.authService.signUp({
        ...user,
        meta: {
          referrer: requestParams?.referrer,
        },
      })
    }

    if (name !== userModel.name) {
      await this.userService.updateById(userModel.id, { name })
    }

    const token = await this.authService.signIn(userModel)

    return { ...userModel, accessToken: token }
  }
}