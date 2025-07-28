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
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common'
import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { UserService } from '@brick/user/user.service'
import { jwtConstants } from './constants'
import { User } from '@app/db'

@Injectable()
export class WsJwtGuard implements CanActivate {
  // logger = new MyLogger('WsJwtGuatd')
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const client = context.switchToWs().getClient()
      const isVerified = await this.authClient(client)
      return !!isVerified
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async authClient(client: Socket & { user: User }) {
    const authCookieName = 'authToken'
    const authCookie = (client.handshake.headers.cookie || '')
      .split('; ')
      .find(x => x.startsWith(authCookieName))
    const authToken = authCookie && authCookie.split('=')[1]
    if (!authToken) {
      return false
    }
    const jwtPayload = jwt.verify(authToken, jwtConstants.secret) as string | { id: string }
    if (typeof jwtPayload !== 'object' || !jwtPayload.id) {
      return
    }
    const user = await this.userService.getById(jwtPayload.id)
    if (!user) {
      return false
    }
    client.user = user
    return true
  }
}