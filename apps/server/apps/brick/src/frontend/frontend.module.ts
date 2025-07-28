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
import { PageModule } from '../page/page.module'
import { WorkspaceModule } from '@brick/workspace/workspace.module'
import { FrontendService } from './frontend.service'
import { FrontendSocketGateway } from './frontend.socket.gateway'
import { UserModule } from '@brick/user/user.module'
import { AuthModule } from '@brick/auth/auth.module'
import { PublicAddressModule } from '@brick/public-address/public-address.module'

@Module({
  imports: [
    forwardRef(() => PageModule),
    forwardRef(() => WorkspaceModule),
    forwardRef(() => UserModule),
    PublicAddressModule,
    AuthModule,
  ],
  providers: [FrontendService, FrontendSocketGateway],
  exports: [FrontendService, FrontendSocketGateway],
})
export class FrontendModule {}