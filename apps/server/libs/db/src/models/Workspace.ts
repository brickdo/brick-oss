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
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm'
import { User } from './User'
import { Page } from './Page'
import { WorkspaceUserCollaboration } from './WorkspaceUserCollaboration'

@Entity({ name: 'workspaces' })
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(type => User, user => user.workspaces)
  user: User

  @Column()
  userId: User['id']

  @OneToMany(type => Page, page => page.workspace)
  pages: Page[]

  @Column('text', { array: true, default: () => 'array[]::text[]' })
  collaborationInviteIds: string[]

  @OneToMany(
    type => WorkspaceUserCollaboration,
    workspaceUserCollaboration => workspaceUserCollaboration.workspace,
    // {
    //   eager: true
    // }
  )
  acceptedCollaborationInvites?: WorkspaceUserCollaboration[]

  @ManyToOne(type => Page, page => page.id, { nullable: true })
  @JoinColumn()
  privateRootPage?: Page | null

  @RelationId((workspace: Workspace) => workspace.privateRootPage)
  @Column({ nullable: true })
  privateRootPageId?: Page['id'] | null

  @ManyToOne(type => Page, page => page.id, { nullable: true })
  @JoinColumn()
  publicRootPage?: Page | null

  @RelationId((workspace: Workspace) => workspace.publicRootPage)
  @Column({ nullable: true })
  publicRootPageId?: Page['id'] | null

  @CreateDateColumn({ select: false })
  createdAt?: string

  @UpdateDateColumn({ select: false })
  updatedAt?: string
}