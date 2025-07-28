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
  Post,
  Body,
  Get,
  Request,
  Param,
  UseGuards,
  Delete,
  BadRequestException,
  Req,
  ForbiddenException,
  Header,
  Put,
  PreconditionFailedException,
  forwardRef,
  Inject,
} from '@nestjs/common'
import { WorkspaceService } from './workspace.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { AuthenticatedRequest } from '@brick/types'
import { PageService } from '@brick/page/page.service'
import { User, Workspace } from '@app/db'
import { PaymentRequiredException } from '@brick/utils/httpExceptions'
import { SubscriptionAuthService } from '@brick/subscription/subscription.auth.service'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

@ApiBearerAuth()
@ApiControllerDecorator('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,

    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    private readonly subscriptionAuthService: SubscriptionAuthService,
  ) {}

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get()
  async getAll(@Request() req: AuthenticatedRequest) {
    return this.workspaceService.getCollabAndOwnByUserId(req.user.id)
  }


  @Post()
  async createWorkspace(@Body() { name }: { name: string }, @Request() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const { user } = req

    const canCreateWorkspace = await this.subscriptionAuthService.canCreateWorkspace(user)
    if (!canCreateWorkspace) {
      throw new PaymentRequiredException()
    }

    const { id } = await this.workspaceService.create({
      name,
      userId: user.id,
    })
    return this.workspaceService.getById(id, {
      relations: ['acceptedCollaborationInvites'],
    })
  }

  @Post(':id/create-collaboration-invite')
  async createCollaborationInvite(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const { user } = req
    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }
    this.authorizeUserIsWorkspaceOwner({ workspace, user })

    const canInviteToWorkspace = await this.subscriptionAuthService.canInviteToWorkspace(user)

    const isAlreadyCollaborativeWorkspace =
      await this.workspaceService.isWorkspaceCollaborative(workspace)
    const canCreateCollaborativeWorkspace =
      await this.subscriptionAuthService.canCreateCollaborativeWorkspace(user)

    if (
      !canInviteToWorkspace ||
      (!isAlreadyCollaborativeWorkspace && !canCreateCollaborativeWorkspace)
    ) {
      throw new PaymentRequiredException()
    }

    return this.workspaceService.createCollaborationInvite(workspace)
  }

  @Delete(':id/delete-collaboration-invite')
  async deleteCollaborationInvite(
    @Param('id') id: string,
    @Body() { inviteId }: { inviteId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }
    this.authorizeUserIsWorkspaceOwner({ workspace, user: req.user })
    return this.workspaceService.deleteCollaborationInvite(workspace, inviteId)
  }

  @Delete(':id/remove-collaborator')
  async removeCollaboratorFromWorkspace(
    @Param('id') id: string,
    @Body() { collaboratorId }: { collaboratorId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }
    this.authorizeUserIsWorkspaceOwner({ workspace, user: req.user })
    return this.workspaceService.removeCollaboratorFromWorkspace({
      workspace,
      collaboratorId,
    })
  }

  @Put(':id')
  async updateWorkspaceName(
    @Param('id') id: string,
    @Body() { name }: { name: string },
    @Request() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (typeof name !== 'string') {
      throw new BadRequestException('Name is not string')
    }
    if (!name) {
      throw new BadRequestException('Name cannot be an empty string')
    }
    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }
    this.authorizeUserIsWorkspaceOwner({ workspace, user: req.user })
    await this.workspaceService.updateWorkspaceById(id, { name })
  }

  @Delete(':id')
  async deleteWorkspace(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }

    this.authorizeUserIsWorkspaceOwner({ workspace, user: req.user })
    const allUserWorkspaces = await this.workspaceService.countUserWorkspaces(req.user.id)
    if (allUserWorkspaces <= 1) {
      throw new PreconditionFailedException(`Can't delete the only existing workspace.`)
    }
    await this.workspaceService.deleteWorkspaceById(id)
  }


  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':id/pages')
  async getWorkspacePagesInfo(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const workspace = await this.workspaceService.getById(id)
    if (!workspace) {
      throw new BadRequestException()
    }
    this.authorizeUserIsWorkspaceOwner({ workspace, user: req.user })
    const workspacePages = await this.pageService.getWorkspacePagesInfo(workspace)
    return workspacePages
  }

  authorizeUserIsWorkspaceOwner({ user, workspace }: { user: User; workspace: Workspace }) {
    if (workspace.userId !== user.id) {
      throw new ForbiddenException()
    }
  }
}