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
import { AuthModule } from '@brick/auth/auth.module'
import { EmailModule } from '@brick/email/email.module'
import { HelpCrunchModule } from '@brick/helpcrunch/helpcrunch.module'
import { WorkspaceModule } from '@brick/workspace/workspace.module'
import { forwardRef, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [
    forwardRef(() => HelpCrunchModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => AuthModule),
    forwardRef(() => EmailModule),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}