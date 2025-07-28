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
import { Workspace } from './Workspace'

@Entity({ name: 'workspaceUserCollaboration' })
export class WorkspaceUserCollaboration {
  @ManyToOne(type => Workspace, workspace => workspace.id, { primary: true })
  workspace: Workspace

  @RelationId(
    (workspaceUserCollaboration: WorkspaceUserCollaboration) =>
      workspaceUserCollaboration.workspace,
  )
  @PrimaryColumn()
  workspaceId?: Workspace['id']

  @ManyToOne(type => User, user => user.id, { primary: true })
  user: User

  @RelationId(
    (workspaceUserCollaboration: WorkspaceUserCollaboration) => workspaceUserCollaboration.user,
  )
  @PrimaryColumn()
  userId?: User['id']

  @Column()
  inviteId: string

  @CreateDateColumn({ select: false })
  createdAt?: string

  @UpdateDateColumn({ select: false })
  updatedAt?: string
}