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
  Entity,
  ManyToOne,
  Column,
  JoinColumn,
  RelationId,
  PrimaryGeneratedColumn,
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  CreateDateColumn,
  UpdateDateColumn,
  InsertEvent,
  RemoveEvent,
} from 'typeorm'
import { User } from './User'
import { Page } from './Page'
import { certificatesStorage, allowedDomainsStorage } from '@app/storages'

@Entity({ name: 'publicAddresses' })
export class PublicAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  subdomain?: string | null

  @ManyToOne(type => User, user => user.publicAddresses)
  owner: User

  @RelationId((publicAddress: PublicAddress) => publicAddress.owner)
  @Column()
  ownerId: User['id']

  @ManyToOne(type => Page, page => page.id)
  @JoinColumn()
  rootPage?: Page

  @RelationId((publicAddress: PublicAddress) => publicAddress.rootPage)
  @Column()
  rootPageId: Page['id']

  @Column({
    nullable: true,
    unique: true,
    type: 'varchar',
  })
  externalDomain?: string | null

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  cert?: string | null

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  key?: string | null

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  wwwCert?: string | null

  @Column({
    select: false,
    nullable: true,
    type: 'varchar',
  })
  wwwKey?: string | null

  @CreateDateColumn({ select: false })
  createdAt?: string

  @UpdateDateColumn({ select: false })
  updatedAt?: string
}

@EventSubscriber()
export class PublicAddressSubscriber implements EntitySubscriberInterface<PublicAddress> {
  listenTo() {
    return PublicAddress
  }

  afterInsert(event: InsertEvent<PublicAddress>) {
    const { externalDomain } = event.entity
    if (externalDomain) {
      allowedDomainsStorage.add(externalDomain)
      allowedDomainsStorage.add(`www.${externalDomain}`)
    }
  }


  beforeUpdate(event: UpdateEvent<PublicAddress>) {
    if (!event.entity) {
      return
    }

    const { externalDomain } = event.entity
    const prevExternalDomain = event.databaseEntity.externalDomain

    if (!externalDomain || prevExternalDomain !== externalDomain) {
      event.entity.cert = null
      event.entity.key = null
      event.entity.wwwCert = null
      event.entity.wwwKey = null
    }
  }

  afterUpdate(event: UpdateEvent<PublicAddress>) {
    if (!event.entity) {
      return
    }

    const { cert, key, wwwCert, wwwKey, externalDomain } = event.entity
    const prevExternalDomain = event.databaseEntity.externalDomain
    const wwwExternalDomain = `www.${externalDomain as string}`

    const isExternalDomainChanged = prevExternalDomain !== externalDomain
    if (prevExternalDomain && (!externalDomain || isExternalDomainChanged)) {
      const wwwPrevExternalDomain = `www.${prevExternalDomain}`
      certificatesStorage.removeDomainFromStorage(prevExternalDomain)
      certificatesStorage.removeDomainFromStorage(wwwPrevExternalDomain)
      allowedDomainsStorage.delete(prevExternalDomain)
      allowedDomainsStorage.delete(wwwPrevExternalDomain)
    }

    if (cert && key && externalDomain) {
      certificatesStorage.setCertificate(externalDomain, { cert, key })
    }

    if (wwwCert && wwwKey && externalDomain) {
      certificatesStorage.setCertificate(wwwExternalDomain, {
        cert: wwwCert,
        key: wwwKey,
        isWww: true,
      })
    }

    if (externalDomain && (!cert || !key)) {
      certificatesStorage.removeDomainFromStorage(externalDomain)
    }

    if (externalDomain && (!wwwCert || !wwwKey)) {
      certificatesStorage.removeDomainFromStorage(wwwExternalDomain)
    }

    if (externalDomain) {
      allowedDomainsStorage.add(externalDomain)
      allowedDomainsStorage.add(wwwExternalDomain)
    }
  }

  afterRemove(event: RemoveEvent<PublicAddress>) {
    if (!event.entity) {
      return
    }

    const { externalDomain } = event.entity

    if (externalDomain) {
      const wwwDomain = `www.${externalDomain}`
      certificatesStorage.removeDomainFromStorage(externalDomain)
      certificatesStorage.removeDomainFromStorage(wwwDomain)
      allowedDomainsStorage.delete(externalDomain)
      allowedDomainsStorage.delete(wwwDomain)
    }
  }
}