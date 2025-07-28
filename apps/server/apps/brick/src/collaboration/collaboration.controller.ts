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
  Get,
  Param,
  UseGuards,
  UseFilters,
  Req,
  NotFoundException,
  Res,
  HttpStatus,
  Header,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { UnauthorizedExceptionFilter } from '@brick/exception-filters/UnauthorizedException'
import { PageService } from '@brick/page/page.service'
import { AuthenticatedRequest } from '@brick/types'
import { UserService } from '@brick/user/user.service'
import { PaymentRequiredException } from '@brick/utils/httpExceptions'
import { redirectHome } from '@brick/utils/redirectHome'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { CollaborationService } from './collaboration.service'
import { SubscriptionAuthService } from '@brick/subscription/subscription.auth.service'
import { Response } from 'express'

@ApiControllerDecorator('collaboration')
export class CollaborationController {
  constructor(
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    private readonly userService: UserService,
    private readonly workspaceService: WorkspaceService,
    private readonly collaborationService: CollaborationService,
    private readonly subscriptionAuthService: SubscriptionAuthService,
  ) {}

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get('invite/:id')
  @UseFilters(new UnauthorizedExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async acceptInvite(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const page = await this.pageService.getPageByCollaborationInviteId(id)
    if (!page) {
      throw new NotFoundException()
    }

    if (page.workspace.userId === req.user.id) {
      redirectHome(res)
      return
    }

    const pageOwner = await this.userService.getById(page.workspace.userId)

    if (!pageOwner) {
      throw new BadRequestException('Page owner not found')
    }

    const canInviteToPage = await this.subscriptionAuthService.canInviteToCollabPage(pageOwner)
    if (!canInviteToPage) {
      throw new PaymentRequiredException()
    }

    await this.collaborationService.userAcceptPageInvite(req.user, id)
    redirectHome(res, `/${page.shortId}`)
    res.status(HttpStatus.OK).send()
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get('invite-workspace/:id')
  @UseFilters(new UnauthorizedExceptionFilter())
  @UseGuards(JwtAuthGuard)
  async acceptWorkspaceInvite(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { user } = req
    const workspace = await this.workspaceService.getWorkspaceByCollaborationInviteId(id)
    if (!workspace) {
      throw new NotFoundException()
    }

    if (workspace.userId === user.id) {
      redirectHome(res)
      return
    }
    const workspaceOwner = await this.userService.getById(workspace.userId)

    if (!workspaceOwner) {
      throw new BadRequestException('Workspace owner not found')
    }

    const canInviteToWorkspace =
      await this.subscriptionAuthService.canInviteToWorkspace(workspaceOwner)

    const isAlreadyCollaborativeWorkspace =
      await this.workspaceService.isWorkspaceCollaborative(workspace)
    const canCreateCollaborativeWorkspace =
      await this.subscriptionAuthService.canCreateCollaborativeWorkspace(workspaceOwner)

    if (
      !canInviteToWorkspace ||
      (!isAlreadyCollaborativeWorkspace && !canCreateCollaborativeWorkspace)
    ) {
      throw new PaymentRequiredException()
    }

    await this.collaborationService.userAcceptWorkspaceInvite(req.user, id)
    redirectHome(res, `/`)
    res.status(HttpStatus.OK).send()
  }
}