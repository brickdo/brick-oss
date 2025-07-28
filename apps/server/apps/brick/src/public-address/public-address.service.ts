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
  Injectable,
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOneOptions, Not, IsNull, In } from 'typeorm'
import { User, Page, PublicAddress } from '@app/db'
import { UserService } from '@brick/user/user.service'
import _ from 'lodash'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { CertificatesService } from '@brick/certificates/certificates.service'
import { InternalServerErrorException } from '@nestjs/common'
import { NonNullableFields } from '@brick/types'

export type PublicAddressWithExternalDomain = PublicAddress &
  NonNullableFields<Required<Pick<PublicAddress, 'externalDomain'>>>

@Injectable()
export class PublicAddressService {
  constructor(
    @InjectRepository(PublicAddress)
    private readonly publicAddressModel: Repository<PublicAddress>,
    private readonly userService: UserService,
    @Inject(forwardRef(() => CertificatesService))
    private readonly certificatesService: CertificatesService,
    private logger: MyLoggerService,
  ) {
    logger.setContext('PublicAddressController')
  }

  async create({
    subdomain,
    externalDomain,
    ownerId,
    rootPageId,
  }: Pick<PublicAddress, 'subdomain' | 'externalDomain' | 'rootPageId' | 'ownerId'>) {
    const owner = await this.userService.findOne({ id: ownerId })
    if (!owner) {
      throw new BadRequestException()
    }

    this.logger.info('Public address create request', {
      subdomain,
      externalDomain,
      ownerId,
      rootPageId,
    })

    const domainData = externalDomain ? { externalDomain } : { subdomain }
    const publicAddress = this.publicAddressModel.create({
      owner,
      rootPageId,
      ...domainData,
    })
    await this.publicAddressModel.save(publicAddress)

    return this.publicAddressModel.findOne(publicAddress.id)
  }

  async update(publicAddress: PublicAddress, updatedData: Partial<PublicAddress>) {
    const { externalDomain, subdomain } = updatedData

    if (!externalDomain && !subdomain) {
      throw new BadRequestException()
    }

    const owner = await this.userService.findOne({ id: publicAddress.ownerId })

    const domainData = {
      externalDomain: externalDomain || null,
      subdomain: externalDomain ? null : updatedData.subdomain,
    }

    this.logger.info('Public address update', {
      publicAddress,
      externalDomain,
      subdomain,
      owner,
    })

    const update = {
      ...updatedData,
      ...domainData,
      cert: null,
      key: null,
    }

    await this.publicAddressModel.save({ ...publicAddress, ...update })
  }

  async findOne(params: FindOneOptions<PublicAddress>['where']) {
    return this.publicAddressModel.findOne({
      where: params,
    })
  }

  async findByOwnerId(id: User['id']) {
    const owner = await this.userService.findOne({ id })
    if (!owner) {
      throw new BadRequestException()
    }
    const addresses = await this.publicAddressModel.find({ owner })
    return addresses
  }

  async findByRootPagesIds(pagesIds: Page['id'][]) {
    return this.publicAddressModel.find({ where: { rootPageId: In(pagesIds) } })
  }

  async findByRootPagesId(pagesId: Page['id']) {
    return this.publicAddressModel.find({ where: { rootPageId: pagesId } })
  }

  async getOwner(id: PublicAddress['id']) {
    const address = await this.publicAddressModel.findOne({
      where: { id },
      relations: ['owner'],
    })
    if (!address) {
      throw new BadRequestException()
    }
    return address.owner
  }

  async deletePublicAddress(publicAddress: PublicAddress) {

    await this.publicAddressModel.remove(publicAddress)
  }

  async getExternalDomainsAndCertificates(): Promise<PublicAddressWithExternalDomain[]> {
    return (await this.publicAddressModel.find({
      where: {
        externalDomain: Not(IsNull()),
      },
      select: ['id', 'externalDomain', 'cert', 'key', 'wwwCert', 'wwwKey'],
    })) as PublicAddressWithExternalDomain[]
  }

  async generateSsl(address: PublicAddress) {
    if (!address || !address.externalDomain) {
      throw new BadRequestException()
    }

    const { cert, key, wwwCert, wwwKey } =
      (await this.certificatesService.generateCertsForPublicAddress(address)) || {}

    if (!cert || !key) {
      throw new InternalServerErrorException()
    }

    if (cert && key) {
      address.cert = cert
      address.key = key
    }
    if (wwwCert && wwwKey) {
      address.wwwCert = wwwCert
      address.wwwKey = wwwKey
    }

    await this.publicAddressModel.save(address)
  }

  async updateExternalDomainCertAndKey({
    externalDomain,
    cert,
    key,
  }: Pick<PublicAddress, 'externalDomain' | 'cert' | 'key'>) {
    const publicAddress = await this.publicAddressModel.findOne({
      externalDomain,
    })

    if (!publicAddress) {
      throw new BadRequestException()
    }

    publicAddress.cert = cert
    publicAddress.key = key

    await this.publicAddressModel.save(publicAddress)
  }

  async updateExternalDomainWwwCertAndKey({
    externalDomain,
    wwwCert,
    wwwKey,
  }: Pick<PublicAddress, 'externalDomain' | 'wwwCert' | 'wwwKey'>) {
    const publicAddress = await this.publicAddressModel.findOne({
      externalDomain,
    })

    if (!publicAddress) {
      throw new BadRequestException()
    }

    publicAddress.wwwCert = wwwCert
    publicAddress.wwwKey = wwwKey

    await this.publicAddressModel.save(publicAddress)
  }

  async getUserDomains(user: User) {
    const addresses = await this.publicAddressModel.find({ owner: user })
    return addresses.filter(x => x.externalDomain)
  }

  async getUserSubdomains(user: User) {
    const addresses = await this.publicAddressModel.find({ owner: user })
    return addresses.filter(x => x.subdomain)
  }
}