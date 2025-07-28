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

import { Module, forwardRef } from '@nestjs/common'
import { Page, PageRepository } from '@app/db'
import { PageController } from './page.controller'
import { PageService } from './page.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageGateway } from './page.socket.gateway'
import { AuthModule } from '@brick/auth/auth.module'
import { PublicAddressModule } from '@brick/public-address/public-address.module'
import { WorkspaceModule } from '@brick/workspace/workspace.module'
import { CollaborationModule } from '@brick/collaboration/collaboration.module'
import { UserModule } from '@brick/user/user.module'
import { FrontendModule } from '@brick/frontend/frontend.module'
import { SubscriptionModule } from '@brick/subscription/subscription.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageRepository]),
    // forwardRef because modules have circular dependency
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => CollaborationModule),
    forwardRef(() => PublicAddressModule),
    forwardRef(() => FrontendModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [PageController],
  providers: [PageService, PageGateway],
  exports: [PageService],
})
export class PageModule {}