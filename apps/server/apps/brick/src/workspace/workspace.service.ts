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
  forwardRef,
  Inject,
  ForbiddenException,
} from '@nestjs/common'
import { Workspace, User, WorkspaceUserCollaboration } from '@app/db'
import { PageService } from '@brick/page/page.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, FindOneOptions, In, Raw, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { CollaborationService } from '@brick/collaboration/collaboration.service'
import { v4 as uuidv4 } from 'uuid'
import { FrontendSocketGateway } from '@brick/frontend/frontend.socket.gateway'
import { UserService } from '@brick/user/user.service'

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceModel: Repository<Workspace>,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    private readonly collaborationService: CollaborationService,
    @Inject(forwardRef(() => FrontendSocketGateway))
    private readonly frontendSocketGateway: FrontendSocketGateway,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private dbConnection: Connection,
  ) {}

  async create({ name, userId }: { name: Workspace['name']; userId: User['id'] }) {

    // if this is wrapped into a transaction, but I don't know how to do it with pageService etc.
    const workspaceData = this.workspaceModel.create({ name, userId })
    const { id } = await this.workspaceModel.save(workspaceData)
    const workspace = (await this.workspaceModel.findOne(id)) as Workspace
    const privateRootPage = await this.pageService.createWorkspaceRootPage(workspace, 'private')
    const publicRootPage = await this.pageService.createWorkspaceRootPage(workspace, 'public')
    workspace.privateRootPage = privateRootPage
    workspace.publicRootPage = publicRootPage
    await this.workspaceModel.save(workspace)
    await this.pageService.addChildGuidePage(publicRootPage)
    return workspace
  }

  async createCollaborationInvite(workspace: Workspace) {
    const inviteId = uuidv4()
    workspace.collaborationInviteIds.push(inviteId)
    await this.workspaceModel.save(workspace)
    return inviteId
  }

  async deleteCollaborationInvite(
    workspace: Workspace,
    inviteId: Workspace['collaborationInviteIds'][number],
  ) {
    workspace.collaborationInviteIds = workspace.collaborationInviteIds.filter(x => x !== inviteId)
    await this.workspaceModel.save(workspace)
  }

  async removeCollaboratorFromWorkspace({
    workspace,
    collaboratorId,
  }: {
    workspace: Workspace
    collaboratorId: User['id']
  }) {
    await this.collaborationService.deleteWorkspaceUserCollaborationItem({
      workspaceId: workspace.id,
      userId: collaboratorId,
    })
    this.frontendSocketGateway
      .handleWorkspaceAccessRemoved({
        workspaceId: workspace.id,
        userId: collaboratorId,
      })
      .catch(console.error)
  }

  async getUserOwned(userId: User['id'], options?: FindOneOptions<Workspace>) {
    const params = {
      ...options,
      where: {
        userId,
        ...(typeof options?.where === 'object' ? options.where : {}),
      },
    }
    return this.workspaceModel.find(params)
  }

  async getCollabAndOwnByUserId(userId: User['id']) {
    const query = this.workspaceModel.createQueryBuilder('workspace')
    const userCollabWorkspacesId = (
      await this.collaborationService.findWorkspaceAcceptedInvitesByUserId(userId)
    ).map(x => x.workspaceId)

    if (userCollabWorkspacesId.length) {
      query.orWhere('workspace.id IN(:...userCollabWorkspacesId)', {
        userCollabWorkspacesId,
      })
    }

    const workspaces = await query
      .addSelect('acceptedCollaborationInvites')
      .addSelect('acceptedCollaborationInvites_user.id')
      .addSelect('acceptedCollaborationInvites_user.email')
      .addSelect('acceptedCollaborationInvites_user.name')
      .orWhere('workspace.userId = :userId', { userId })
      .leftJoin('workspace.acceptedCollaborationInvites', 'acceptedCollaborationInvites')
      .leftJoin('acceptedCollaborationInvites.user', 'acceptedCollaborationInvites_user')
      .getMany()
    return workspaces
  }

  async isWorkspaceCollaborative(workspace: Workspace) {
    const acceptedCollabInvites = await this.collaborationService.getWorkspaceAcceptedInvites({
      workspaceId: workspace.id,
    })

    const existingInvites = workspace.collaborationInviteIds
    return acceptedCollabInvites.length > 0 || !!existingInvites?.length
  }


  async getWorkspacePagesInfo(workspace: Workspace) {
    return this.pageService.getWorkspacePagesInfo(workspace)
  }

  async getById(id: Workspace['id'], options?: FindOneOptions<Workspace>) {
    return this.workspaceModel.findOne(id, options)
  }

  updateWorkspaceById(id: Workspace['id'], data: QueryDeepPartialEntity<Workspace>) {
    return this.workspaceModel.update(id, data)
  }

  async countUserWorkspaces(userId: User['id']) {
    return this.workspaceModel.count({ where: { userId: userId } })
  }

  async countUserCollaborativeWorkspaces(userId: User['id']) {
    const collabWorkspacesIds = await this.collaborationService.getUserCollabWorkspacesIds({
      userId,
    })
    return collabWorkspacesIds.length
  }

  async countUserWorkspacesCollaborators(userId: User['id']) {
    const uniqCollabWorkspacesUsersIds =
      await this.collaborationService.getUniqCollabWorkspacesUsersIdsByOwnerId(userId)
    return uniqCollabWorkspacesUsersIds.length
  }

  async deleteWorkspaceById(id: Workspace['id']) {
    await this.dbConnection.transaction(async manager => {
      const workspaceModel = manager.getRepository(Workspace)
      const workspace = await workspaceModel.findOne(id)
      if (!workspace) {
        throw new BadRequestException('Workspace not found')
      }
      const workspaceUserCollaborationModel = manager.getRepository(WorkspaceUserCollaboration)
      const workspaceCollaborations = await workspaceUserCollaborationModel.find({
        where: {
          workspaceId: workspace.id,
        },
      })
      // Null pages references to be able to delete pages
      workspace.privateRootPageId = null
      workspace.publicRootPageId = null
      await workspaceModel.save(workspace)
      await this.pageService.deleteAllPagesInWorkspace(id, manager)
      await workspaceUserCollaborationModel.remove(workspaceCollaborations)
      await workspaceModel.remove(workspace)
    })
    this.frontendSocketGateway.handleWorkspaceDeleted(id).catch(console.error)
  }

  async getWorkspaceByCollaborationInviteId(inviteId: string) {
    const workspace = await this.workspaceModel.findOne({
      where: {
        collaborationInviteIds: Raw(alias => `:inviteId = ANY(${alias})`, {
          inviteId,
        }),
      },
    })
    return workspace
  }

  async isUserAuthorizedForWorkspace(
    { workspaceId, userId }: { workspaceId: Workspace['id']; userId: User['id'] },
    onlyOwnerAuthorized?: boolean,
  ) {
    const workspace = await this.getById(workspaceId)
    if (!workspace) {
      throw new BadRequestException('Workspace not found')
    }
    const isWorkspaceOwner = workspace.userId === userId
    if (onlyOwnerAuthorized && !isWorkspaceOwner) {
      return false
    }
    const isWorkspaceCollaborator = await this.collaborationService.isUserWorkspaceCollaborator({
      workspaceId,
      userId: userId,
    })
    return !!(isWorkspaceOwner || isWorkspaceCollaborator)
  }

  async authorizeUserForWorkspace(
    { workspaceId, userId }: { workspaceId: Workspace['id']; userId: User['id'] },
    onlyOwnerAuthorized?: boolean,
    errorMessage?: string,
  ) {
    const isAuthorized = await this.isUserAuthorizedForWorkspace(
      { workspaceId, userId },
      onlyOwnerAuthorized,
    )
    if (!isAuthorized) {
      throw new ForbiddenException(errorMessage || 'Not authorized')
    }
  }

  async getWorkspaceOwner(workspaceId: Workspace['id']) {
    const workspace = await this.getById(workspaceId)
    if (!workspace) {
      throw new BadRequestException('Workspace not found')
    }
    return this.userService.getById(workspace.userId)
  }
}