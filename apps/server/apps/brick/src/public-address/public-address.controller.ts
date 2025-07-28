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
  Get,
  UseGuards,
  Req,
  Delete,
  Param,
  ForbiddenException,
  Put,
  Body,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { PublicAddressService } from './public-address.service'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { PublicAddress } from '@app/db'
import { PageService } from '@brick/page/page.service'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { omit } from 'lodash'
import { URL } from 'node:url'
import normalizeUrl from 'normalize-url'
import { AuthenticatedRequest } from '@brick/types'
import { SubscriptionAuthService } from '@brick/subscription/subscription.auth.service'
import { PaymentRequiredException } from '@brick/utils/httpExceptions'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

@ApiControllerDecorator('public-address')
@UseGuards(JwtAuthGuard)
export class PublicAddressController {
  constructor(
    private readonly publicAddressService: PublicAddressService,
    private readonly pageService: PageService,
    private readonly subscriptionAuthService: SubscriptionAuthService,
    private logger: MyLoggerService,
  ) {
    logger.setContext('PublicAddressController')
  }

  @Get()
  findUserAddresses(@Req() req: AuthenticatedRequest) {
    return this.publicAddressService.findByOwnerId(req.user.id)
  }

  @Put()
  async updateOrCreate(
    @Body()
    {
      rootPageId,
      subdomain,
      externalDomain,
    }: Pick<PublicAddress, 'subdomain' | 'externalDomain' | 'rootPageId'>,
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if ((!subdomain && !externalDomain) || !rootPageId) {
      this.logger.warn('Public address updateOrCreate request with wrong parameters', {
        rootPageId,
        subdomain,
        externalDomain,
      })
      throw new BadRequestException()
    }

    const page = await this.pageService.getPageById(rootPageId, {
      relations: ['workspace'],
    })

    if (!page || !page.isTopLevelPage) {
      throw new BadRequestException()
    }

    const userId = req.user.id
    const pageOwner = await this.pageService.getPageOwner(rootPageId)

    if (!pageOwner) {
      throw new BadRequestException('Page owner not found')
    }

    const pageOwnerId = pageOwner.id
    const isUserAuthorized = await this.pageService.isUserAuthorizedForPageAction(
      rootPageId,
      userId,
      'updatePublicAddress',
    )
    if (!isUserAuthorized) {
      this.logger.warn('Unauthorized public address create or update request', {
        user: req.user,
        ownerId: pageOwnerId,
        rootPage: omit(page, ['content', 'stylesScss']),
      })
      throw new ForbiddenException()
    }

    const existingPublicAddress = await this.publicAddressService.findOne({
      rootPageId,
    })
    try {
      externalDomain = externalDomain && new URL(normalizeUrl(externalDomain)).host
    } catch (e) {
      throw new BadRequestException('Wrong external domain format')
    }
    const publicAddressWithSuchDomain = await this.publicAddressService.findOne(
      subdomain ? { subdomain } : { externalDomain },
    )

    const isDomainTaken = !!publicAddressWithSuchDomain

    if (isDomainTaken) {
      throw new ConflictException()
    }

    const canCreateExternalDomain = await this.subscriptionAuthService.canCreateDomain(pageOwner)
    const canCreateSubdomain = await this.subscriptionAuthService.canCreateSubdomain(pageOwner)

    if (!existingPublicAddress) {
      if ((externalDomain && !canCreateExternalDomain) || (subdomain && !canCreateSubdomain)) {
        throw new PaymentRequiredException()
      }

      return this.publicAddressService.create({
        ownerId: pageOwnerId,
        rootPageId,
        externalDomain,
        subdomain,
      })
    }

    const isChangeFromSubdomainToExternalDomain =
      !!existingPublicAddress.subdomain && !!externalDomain

    const isChangeFromExternalDomainToSubdomain =
      !!existingPublicAddress.externalDomain && !!subdomain

    if (
      (isChangeFromSubdomainToExternalDomain && !canCreateExternalDomain) ||
      (isChangeFromExternalDomainToSubdomain && !canCreateSubdomain)
    ) {
      throw new PaymentRequiredException()
    }

    await this.publicAddressService.update(existingPublicAddress, {
      subdomain,
      externalDomain,
    })
    return this.publicAddressService.findOne({ rootPageId })
  }

  @Delete(':id')
  async deleteAddress(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const publicAddress = await this.publicAddressService.findOne({ id })
    if (!publicAddress) {
      throw new BadRequestException()
    }
    const isUserAuthorized = await this.pageService.isUserAuthorizedForPageAction(
      publicAddress.rootPageId,
      req.user.id,
      'updatePublicAddress',
    )
    if (!isUserAuthorized) {
      this.logger.warn('Unauthorized public address delete request', {
        publicAddressId: id,
        user: req.user,
        owner: publicAddress.ownerId,
      })
      throw new ForbiddenException()
    }
    this.logger.info('Public address delete', { user: req.user, publicAddress })
    await this.publicAddressService.deletePublicAddress(publicAddress)
  }

  @Put(':id/generate-ssl')
  async generateSsl(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const address = await this.publicAddressService.findOne({ id })
    if (!address || !address.externalDomain) {
      throw new BadRequestException()
    }

    const isUserAuthorized = await this.pageService.isUserAuthorizedForPageAction(
      address.rootPageId,
      req.user.id,
      'updatePublicAddress',
    )
    if (!isUserAuthorized) {
      this.logger.warn('Unauthorized generate ssl request', {
        publicAddress: address,
        ownerId: address.ownerId,
        user: req.user,
      })
      throw new ForbiddenException()
    }

    await this.publicAddressService.generateSsl(address)
  }
}