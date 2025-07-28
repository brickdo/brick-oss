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

import { User } from '@app/db'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  throwErrorOnUnauthorized: boolean = true
  constructor(throwErrorOnUnauthorized?: boolean) {
    super()
    if (throwErrorOnUnauthorized != null) {
      this.throwErrorOnUnauthorized = throwErrorOnUnauthorized
    }
  }

  handleRequest(err: any, user: any, info: any, context: any, status?: any) {
    if (err) {
      throw err
    }
    if (!user && this.throwErrorOnUnauthorized) {
      throw new UnauthorizedException()
    }
    return user
  }
}