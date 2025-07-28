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

import { forwardRef, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { GithubStrategy } from './github.strategy'
import { UserModule } from '@brick/user/user.module'
import { JwtModule } from '@nestjs/jwt'
import { jwtConstants } from './constants'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './jwt.strategy'
import { GoogleStrategy } from './google.strategy'
import { WsJwtGuard } from './ws.auth.guard'
import { LocalStrategy } from './local.strategy'
import { EmailModule } from '@brick/email/email.module'
import { UserResetPassword } from '@app/db'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: jwtConstants.expiresIn,
      },
    }),
    forwardRef(() => UserModule),
    EmailModule,
    TypeOrmModule.forFeature([UserResetPassword]),
  ],
  providers: [AuthService, GithubStrategy, LocalStrategy, GoogleStrategy, JwtStrategy, WsJwtGuard],
  controllers: [AuthController],
  exports: [AuthService, WsJwtGuard],
})
export class AuthModule {}