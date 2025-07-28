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
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  RelationId,
  PrimaryColumn,
} from 'typeorm'
import { User } from './User'
import { Page } from './Page'

@Entity({ name: 'pageUserCollaboration' })
export class PageUserCollaboration {
  @ManyToOne(type => Page, Page => Page.id, { primary: true })
  page: Page

  @RelationId((pageUserCollaboration: PageUserCollaboration) => pageUserCollaboration.page)
  @PrimaryColumn()
  pageId?: Page['id']

  @ManyToOne(type => User, user => user.id, { primary: true })
  user: User

  @RelationId((pageUserCollaboration: PageUserCollaboration) => pageUserCollaboration.user)
  @PrimaryColumn()
  userId?: User['id']

  @Column()
  inviteId: string

  @CreateDateColumn({ select: false })
  createdAt?: string

  @UpdateDateColumn({ select: false })
  updatedAt?: string
}