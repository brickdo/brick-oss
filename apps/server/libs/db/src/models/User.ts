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
  UpdateDateColumn,
  CreateDateColumn,
  EntityRepository,
  Repository,
  In,
} from 'typeorm'
import { AuthProvider } from '../../../../apps/brick/src/user/AuthProvider'
import { Workspace } from './Workspace'
import { PublicAddress } from './PublicAddress'
import { SubscriptionPlanId, DefaultSubscriptionPlanId } from '@brick/misc/constants/subscription'
import { Page } from './Page'
import { PageUserCollaboration } from './PageUserCollaboration'
import { WorkspaceUserCollaboration } from './WorkspaceUserCollaboration'
import { UserResetPassword } from './UserResetPassword'

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  email: string


  @Column()
  provider: AuthProvider

  @OneToMany(type => Workspace, workspace => workspace.user)
  workspaces?: Workspace[]

  @OneToMany(type => PublicAddress, publicAddress => publicAddress.owner)
  publicAddresses?: PublicAddress[]

  @Column({ default: DefaultSubscriptionPlanId })
  subscriptionPlan: SubscriptionPlanId

  @Column({ nullable: true })
  customerId?: string

  @Column({ nullable: true })
  githubId?: string

  @Column({ nullable: true, select: false, type: 'varchar' })
  password?: string | null

  @Column({ nullable: true, select: false, type: 'varchar' })
  finishSignUpId?: string | null

  @Column({ default: true })
  isAgreedMailing?: boolean

  @Column({ default: false })
  periodicBackups?: boolean

  @Column({ default: false })
  isEmailConfirmed?: boolean

  @Column({ select: false, type: 'jsonb', default: {} })
  meta?: { referrer?: string }

  @CreateDateColumn({ select: false })
  createdAt?: string

  @UpdateDateColumn({ select: false })
  updatedAt?: string
}

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async deleteUser(id: User['id']) {
    await this.manager.transaction(async manager => {
      const user = manager.getRepository(User)
      const workspace = manager.getRepository(Workspace)
      const page = manager.getRepository(Page)
      const publicAddress = manager.getRepository(PublicAddress)
      const pageUserCollaboration = manager.getRepository(PageUserCollaboration)
      const workspaceUserCollaboration = manager.getRepository(WorkspaceUserCollaboration)
      const userResetPassword = manager.getRepository(UserResetPassword)

      const userWorkspaces = await workspace.find({
        where: { userId: id },
        select: ['id'],
      })
      const userPages = await page.find({
        where: { workspaceId: In(userWorkspaces.map(x => x.id)) },
        select: ['id'],
      })
      const userPublicAddresses = await publicAddress.find({
        where: { ownerId: id },
        select: ['id'],
      })
      const userLinkedPageCollaborations = await pageUserCollaboration.find({
        where: [{ userId: id }, { pageId: In(userPages.map(x => x.id)) }],
      })
      const UserLinkedWorkspaceCollaborations = await workspaceUserCollaboration.find({
        where: [{ userId: id }, { workspaceId: In(userWorkspaces.map(x => x.id)) }],
      })

      await userResetPassword.delete({ userId: id })
      await pageUserCollaboration.remove(userLinkedPageCollaborations)
      await workspaceUserCollaboration.remove(UserLinkedWorkspaceCollaborations)
      await publicAddress.remove(userPublicAddresses)
      await page.remove(userPages)
      await workspace.remove(userWorkspaces)
      await user.delete({ id })
    })
  }
}