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
import { PublicAddressService } from './public-address.service'
import { PublicAddress } from '@app/db'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@brick/user/user.module'
import { PublicAddressController } from './public-address.controller'
import { PageModule } from '@brick/page/page.module'
import { AcmeModule } from '@brick/acme/acme.module'
import { CertificatesModule } from '@brick/certificates/certificates.module'
import { SubscriptionModule } from '@brick/subscription/subscription.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicAddress]),
    forwardRef(() => PageModule),
    forwardRef(() => CertificatesModule),
    forwardRef(() => UserModule),
    forwardRef(() => SubscriptionModule),
    AcmeModule,
  ],
  providers: [PublicAddressService],
  exports: [PublicAddressService],
  controllers: [PublicAddressController],
})
export class PublicAddressModule {}