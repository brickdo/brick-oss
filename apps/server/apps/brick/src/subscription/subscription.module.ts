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
import { UserModule } from '@brick/user/user.module'
import { SubscriptionController } from './subscription.controller'
import { SubscriptionService } from './subscription.service'
import { SubscriptionAuthService } from './subscription.auth.service'
import { PublicAddressModule } from '@brick/public-address/public-address.module'
import { CollaborationModule } from '@brick/collaboration/collaboration.module'
import { WorkspaceModule } from '@brick/workspace/workspace.module'

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => PublicAddressModule),
    forwardRef(() => CollaborationModule),
    forwardRef(() => WorkspaceModule),
  ],
  providers: [SubscriptionService, SubscriptionAuthService],
  controllers: [SubscriptionController],
  exports: [SubscriptionService, SubscriptionAuthService],
})
export class SubscriptionModule {}
