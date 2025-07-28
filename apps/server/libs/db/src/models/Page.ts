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
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
  getRepository,
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  RelationId,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  EntityRepository,
  Repository,
  In,
  Like,
} from 'typeorm'
import { Workspace } from './Workspace'
import { PublicAddress } from './PublicAddress'
import { PageUserCollaboration } from './PageUserCollaboration'
import { BadRequestException } from '@nestjs/common'

@Entity({ name: 'pages' })
@Tree('materialized-path')
export class Page {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  shortId: string

  @Column()
  name: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  content?: string | null

  @ManyToOne(type => Workspace, workspace => workspace.pages)
  workspace: Workspace


  @RelationId((page: Page) => page.workspace)
  @Column()
  workspaceId: Workspace['id']

  @TreeChildren()
  children: Page[]

  @TreeParent()
  parent: Page

  @RelationId((page: Page) => page.parent)
  @Column({ type: 'varchar', nullable: true })
  parentId: Page['id'] | null

  @Column({ type: String, array: true, default: () => 'array[]::text[]' })
  childrenOrder: Page['id'][]

  @OneToMany(type => PublicAddress, publicAddress => publicAddress.rootPage)
  publicAddress?: PublicAddress

  @Column({ type: 'varchar', nullable: true })
  stylesScss: string | null

  @Column({ type: 'varchar', nullable: true })
  customLink?: string | null

  @Column('text', { array: true, default: () => 'array[]::text[]' })
  collaborationInviteIds: string[]

  @Column({ nullable: true })
  themeId?: string

  @CreateDateColumn({ select: false })
  createdAt: string

  @UpdateDateColumn({ select: false })
  updatedAt: string

  @OneToMany(type => PageUserCollaboration, pageUserCollaboration => pageUserCollaboration.page, {
    eager: true,
  })
  acceptedCollaborationInvites?: PageUserCollaboration[]

  isCollaborative?: boolean

  mpath: string

  @Column('jsonb', {
    select: false,
    array: true,
    default: () => 'array[]::jsonb[]',
  })
  history: { content: string; timestamp: Date }[]

  @Column('jsonb', { nullable: true })
  renderCustomizations: { headTags: PageCustomHeadTag[] }

  public get isTopLevelPage() {
    if (this.mpath == undefined) {
      throw new Error('isRootPage: mpath is undefined')
    }

    return this.mpath.split('.').filter(Boolean).length === 1
  }
}

@EventSubscriber()
export class PageSubscriber implements EntitySubscriberInterface<Page> {
  listenTo() {
    return Page
  }

  async afterInsert(event: InsertEvent<Page>) {
    const { entity } = event
    if (entity.parentId) {
      const repository = getRepository(Page)
      const parent = await repository.findOne(entity.parentId)

      if (!parent) {
        throw new Error(
          `
            Database erorr page has parentId but parent is not found
            page: ${JSON.stringify(entity)}
          `,
        )
      }
      parent.childrenOrder.push(entity.id)
      await repository.save(parent)
    }
  }
}

@EntityRepository(Page)
export class PageRepository extends Repository<Page> {
  async deletePage(id: Page['id']) {
    await this.manager.transaction(async manager => {
      const pageModel = manager.getRepository(Page)
      const publicAddress = manager.getRepository(PublicAddress)
      const pageUserCollaborationModel = manager.getRepository(PageUserCollaboration)
      const page = await pageModel.findOne(id, { select: ['id', 'parentId'] })
      if (!page) {
        throw new BadRequestException()
      }
      const parentId = page.parentId
      const pages = await pageModel.find({
        where: {
          mpath: Like(`%${id}%`),
        },
        select: ['id'],
      })
      const publicAddresses = await publicAddress.find({
        where: {
          rootPageId: In(pages.map(x => x.id)),
        },
      })
      const collaborations = await pageUserCollaborationModel.find({
        where: {
          pageId: In(pages.map(x => x.id)),
        },
      })
      await pageUserCollaborationModel.remove(collaborations)
      await publicAddress.remove(publicAddresses)
      await pageModel.remove(pages)
      if (parentId) {
        const parent = await pageModel.findOne(parentId)

        if (!parent) {
          throw new Error(
            `
              Database erorr page has parentId but parent is not found
              page: ${JSON.stringify(page)}
            `,
          )
        }

        const index = parent.childrenOrder.indexOf(id)
        parent.childrenOrder.splice(index, 1)
        await pageModel.save(parent)
      }
    })
  }
}

export interface PageCustomHeadTag {
  name: string
  content: string
  isInheritable: boolean
}