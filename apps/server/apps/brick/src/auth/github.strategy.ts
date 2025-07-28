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

import { Strategy, Profile } from 'passport-github2'
import { PassportStrategy } from '@nestjs/passport'
import { BadRequestException, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { AuthProvider } from '@brick/user/AuthProvider'
import { UserService } from '@brick/user/user.service'
import passport from 'passport'
import { User } from '@app/db'

const { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } = process.env

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: OAUTH_GITHUB_CLIENT_ID,
      clientSecret: OAUTH_GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.PUBLICVAR_BRICK_URL}/api/auth/github/callback`,
      passReqToCallback: true,
      scope: ['user:email', 'read:user'],
    })
  }

  authenticate(req: Request, options?: passport.AuthenticateOptions) {
    // @ts-ignore
    return super.authenticate(req, {
      ...options,
      state: JSON.stringify(req.query),
    })
  }

  async validate(request: Request, accessToken: string, refreshToken: string, profile: Profile) {

    const requestState = request.query.state
    const requestParams: { referrer?: string } | undefined =
      typeof requestState === 'string' ? JSON.parse(requestState) : undefined

    if (!profile.emails) {
      throw new BadRequestException('No email found')
    }

    if (!profile.username) {
      throw new BadRequestException('No username found')
    }

    const user = {
      name: profile.username,
      email: profile.emails[0].value,
      provider: AuthProvider.github,
      githubId: profile.id,
    }
    let userModel = await this.userService.findOne({
      provider: user.provider,
      githubId: profile.id,
    })

    if (!userModel) {
      userModel = await this.userService.findOne({
        email: user.email,
        provider: user.provider,
      })
    }

    if (!userModel) {
      userModel = await this.authService.signUp({
        ...user,
        meta: {
          referrer: requestParams?.referrer,
        },
      })
    }

    if (user.name !== userModel.name) {
      await this.userService.updateById(userModel.id, { name: user.name })
      userModel = (await this.userService.getById(userModel.id)) as User
    }

    if (!userModel.githubId) {
      await this.userService.updateById(userModel.id, { githubId: profile.id })
      userModel = (await this.userService.getById(userModel.id)) as User
    }

    const token = await this.authService.signIn(userModel)

    return { ...userModel, accessToken: token }
  }
}