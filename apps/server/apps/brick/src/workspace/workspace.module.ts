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
import { Workspace } from '@app/db'
import { WorkspaceController } from './workspace.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PageModule } from '@brick/page/page.module'
import { WorkspaceService } from './workspace.service'
import { CollaborationModule } from '@brick/collaboration/collaboration.module'
import { FrontendModule } from '@brick/frontend/frontend.module'
import { SubscriptionModule } from '@brick/subscription/subscription.module'
import { UserModule } from '@brick/user/user.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace]),
    CollaborationModule,
    forwardRef(() => UserModule),
    forwardRef(() => PageModule),
    forwardRef(() => FrontendModule),
    forwardRef(() => SubscriptionModule),
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}