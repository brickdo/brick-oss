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

import { Module, All, NotFoundException } from '@nestjs/common'
import { ApiController } from './api.controller'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { WorkspaceModule } from './workspace/workspace.module'
import { PageModule } from './page/page.module'
import { DatabaseModule, SaasMantraUsedCodes } from '@app/db'
import { PublicAddressModule } from './public-address/public-address.module'
import { SubscriptionModule } from './subscription/subscription.module'
import { ApiControllerDecorator } from './decorators/api-controller.decorator'
import { CollaborationModule } from './collaboration/collaboration.module'
import { ThemesModule } from './themes/themes.module'
import { FrontendModule } from './frontend/frontend.module'
import { EmailModule } from './email/email.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CertificatesModule } from './certificates/certificates.module'
import { S3Module } from './s3/s3.module'



// This controller is required to handle all '/api/*' requests which not handled by other api modules.
// It should be last in "Import" module array.
// If this fallback controller not provided all not matched '/api/*' routes
// will fallback to ServeController (because it has no route prefix) which is not desired behavior
@ApiControllerDecorator()
export class FallbackApiController {
  @All()
  notFound() {
    throw new NotFoundException()
  }
}

@Module({
  imports: [
    EmailModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    WorkspaceModule,
    PageModule,
    PublicAddressModule,
    SubscriptionModule,
    CollaborationModule,
    ThemesModule,
    FrontendModule,
    CertificatesModule,
    S3Module,
    FallbackApiController,
    TypeOrmModule.forFeature([SaasMantraUsedCodes]),
  ],
  controllers: [ApiController],
})
export class ApiModule {}