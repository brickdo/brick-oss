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

import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { uniq, uniqBy } from 'lodash'
import { PageUserCollaboration, WorkspaceUserCollaboration, Workspace, User, Page } from '@app/db'
import { PageService } from '@brick/page/page.service'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { In, Repository } from 'typeorm'

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(PageUserCollaboration)
    private readonly pageUserCollaborationModel: Repository<PageUserCollaboration>,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    @InjectRepository(WorkspaceUserCollaboration)
    private readonly workspaceUserCollaborationModel: Repository<WorkspaceUserCollaboration>,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
  ) {}

  async getUserCollabWorkspacesIds({ userId }: { userId: User['id'] }) {
    const invites = await this.workspaceUserCollaborationModel.find({
      where: {
        workspace: {
          userId,
        },
      },
      select: ['workspaceId'],
      relations: ['workspace'],
    })
    return uniq(invites.map(x => x.workspaceId))
  }

  async getUserCollabPagesIds({ userId }: { userId: User['id'] }) {
    const invites = await this.pageUserCollaborationModel.find({
      where: {
        page: {
          userId,
        },
      },
      select: ['pageId'],
      relations: ['page'],
    })
    return uniq(invites.map(x => x.pageId))
  }

  async countUniqCollabPageUsersOfUser(userId: User['id']) {
    const userInvites = await this.pageUserCollaborationModel.find({
      where: {
        page: {
          workspace: {
            userId,
          },
        },
      },
      relations: ['page', 'page.workspace'],
    })

    return uniqBy(userInvites, x => x.userId).length
  }

  async isUserPageCollaborator({ userId, pageId }: { userId: User['id']; pageId: Page['id'] }) {
    const page = await this.pageService.findOne(pageId, {
      select: ['id', 'mpath', 'workspaceId'],
    })

    if (!page) {
      throw new BadRequestException('Page not found')
    }

    const pageFamilyIds = page.mpath.split('.').filter(Boolean)
    const pageOrAncestorCollaborationRecord = await this.pageUserCollaborationModel.findOne({
      userId,
      pageId: In(pageFamilyIds),
    })
    return !!pageOrAncestorCollaborationRecord
  }

  async isUserWorkspaceCollaborator({
    userId,
    workspaceId,
  }: {
    userId: User['id']
    workspaceId: Workspace['id']
  }) {
    const isUserWorkspaceCollaborator = await this.workspaceUserCollaborationModel.findOne({
      userId,
      workspaceId: workspaceId,
    })
    return !!isUserWorkspaceCollaborator
  }

  async findPageAcceptedInvitesByUserId(userId: User['id']) {
    return this.pageUserCollaborationModel.find({ userId })
  }

  async findWorkspaceAcceptedInvitesByUserId(userId: User['id']) {
    return this.workspaceUserCollaborationModel.find({ userId })
  }

  async userAcceptPageInvite(user: User, inviteId: string) {
    const page = await this.pageService.getPageByCollaborationInviteId(inviteId)
    if (!page) {
      throw new BadRequestException()
    }

    const isAlreadyAccepted = await this.pageUserCollaborationModel.findOne({
      page,
      user,
    })

    if (isAlreadyAccepted) {
      return
    }

    await this.pageUserCollaborationModel.save(
      this.pageUserCollaborationModel.create({
        page,
        user,
        inviteId,
      }),
    )
  }

  async userAcceptWorkspaceInvite(user: User, inviteId: string) {
    const workspace = await this.workspaceService.getWorkspaceByCollaborationInviteId(inviteId)
    if (!workspace) {
      throw new BadRequestException()
    }

    const isAlreadyAccepted = await this.workspaceUserCollaborationModel.findOne({
      workspace,
      user,
    })

    if (isAlreadyAccepted) {
      return
    }

    await this.workspaceUserCollaborationModel.save(
      this.workspaceUserCollaborationModel.create({
        workspace,
        user,
        inviteId,
      }),
    )
  }

  async deleteWorkspaceUserCollaborationItem({
    workspaceId,
    userId,
  }: {
    workspaceId: Workspace['id']
    userId: User['id']
  }) {
    const collaboration = await this.workspaceUserCollaborationModel.findOne({
      userId,
      workspaceId,
    })
    if (!collaboration) {
      return
    }
    await this.workspaceUserCollaborationModel.remove(collaboration)
  }

  async getWorkspaceAcceptedInvites({ workspaceId }: { workspaceId: Workspace['id'] }) {
    return this.workspaceUserCollaborationModel.find({ workspaceId })
  }

  async getUniqCollabWorkspacesUsersIdsByOwnerId(ownerId: User['id']) {
    const acceptedInvites = await this.workspaceUserCollaborationModel.find({
      where: {
        workspace: {
          userId: ownerId,
        },
      },
      select: ['workspaceId', 'userId'],
      relations: ['workspace'],
    })

    const acceptedInvitesUsersIds = acceptedInvites.map(x => x.userId)

    return uniq(acceptedInvitesUsersIds)
  }
}