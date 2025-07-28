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
  Param,
  Body,
  UseGuards,
  Get,
  Delete,
  Req,
  ForbiddenException,
  Put,
  BadRequestException,
  Header,
  NotFoundException,
} from '@nestjs/common'
import { IMovePage, PageService } from './page.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { Page, PageCustomHeadTag, Workspace } from '@app/db'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { AuthenticatedRequest } from '@brick/types'
import { themes } from '@brick/themes'
import { renderScss } from '@brick/lib/scss'
import isUUID from 'validator/lib/isUUID'
import {
  PageCollaboratorPagesRoot,
  PageCollaboratorWorkspace,
} from '@brick/frontend/frontend.service'
import { UserPageRole } from './page.auth.rules'
import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator'
import { PaymentRequiredException } from '@brick/utils/httpExceptions'
import { SubscriptionAuthService } from '@brick/subscription/subscription.auth.service'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

interface ICreatePage {
  name: Page['name']
  parentId: Page['parentId']
  workspaceId: Workspace['id']
}

class PageCustomHeadTagValidator implements PageCustomHeadTag {
  @IsString()
  name: string

  @IsString()
  content: string

  @IsBoolean()
  isInheritable: boolean
}

class PageHeadTagsValidator {
  @IsArray()
  @ValidateNested({ each: true })
  headTags: PageCustomHeadTagValidator[]
}

@ApiBearerAuth()
@ApiControllerDecorator('page')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(
    private readonly pageService: PageService,
    private readonly workspaceService: WorkspaceService,
    private readonly subscriptionAuthService: SubscriptionAuthService,
    private logger: MyLoggerService,
  ) {
    this.logger.setContext('PageController')
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get('collaborations')
  async getPagesSharedToUser(@Req() req: AuthenticatedRequest) {
    return this.pageService.getPagesSharedToUser(req.user.id)
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':pageId')
  async getPage(
    @Param('pageId') pageId: Page['id'] | Page['shortId'],
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.info('Page requested', { pageId, user: req.user })
    const pageFullId = isUUID(pageId) ? pageId : await this.pageService.getPageIdByShortId(pageId)

    const role = await this.pageService.authorizePageAction(pageFullId, req.user.id, 'getPage')
    const page: ({ stylesCss?: string | null } & Page) | undefined =
      await this.pageService.getPageById(pageFullId)

    if (!page) {
      throw new NotFoundException('Page not found')
    }

    const collaboratorPages = (await this.pageService.getPagesSharedToUser(req.user.id)).map(x => ({
      ...x,
      workspaceId: PageCollaboratorWorkspace.id,
    }))

    const isPageOnlyCollaborator = role === UserPageRole.pageCollaborator
    if (isPageOnlyCollaborator) {
      page.workspaceId = PageCollaboratorWorkspace.id
      const isParentAvailable = page.parentId && collaboratorPages.find(y => y.id === page.parentId)
      if (!isParentAvailable) {
        page.parentId = PageCollaboratorPagesRoot.id
      }

    }

    const isCollaborator = [
      UserPageRole.pageCollaborator,
      UserPageRole.workspaceCollaborator,
    ].includes(role)

    page.collaborationInviteIds = isCollaborator ? [] : page.collaborationInviteIds
    page.stylesCss = renderScss(page.stylesScss)
    return page
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':pageId/content')
  async getPageContent(@Param('pageId') pageId: Page['id'], @Req() req: AuthenticatedRequest) {
    this.logger.info('Page content requested', { pageId, user: req.user })
    await this.pageService.authorizePageAction(pageId, req.user.id, 'getPage')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page does not have content')
    }
    return this.pageService.getPageContent(pageId)
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':pageId/full-id')
  async getPageId(
    @Param('pageId') pageId: Page['id'] | Page['shortId'],
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.info('Page ID requested', { pageId })
    const pageFullId = isUUID(pageId) ? pageId : await this.pageService.getPageIdByShortId(pageId)
    return pageFullId
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':pageId/styles')
  async getPageStyles(@Param('pageId') pageId: Page['id'], @Req() req: AuthenticatedRequest) {
    this.logger.info('Page styles requested', { pageId, user: req.user })
    await this.pageService.authorizePageAction(pageId, req.user.id, 'getPage')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page does not have styles')
    }
    return this.pageService.getPageStyles(pageId)
  }

  @Header('Cache-Control', 'no-store, max-age=0')
  @Get(':pageId/styles-provider-ancestor')
  async getPageCalculatedStyles(
    @Param('pageId') pageId: Page['id'],
    @Req() req: AuthenticatedRequest,
  ) {
    await this.pageService.authorizePageAction(pageId, req.user.id, 'getPage')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page does not have styles')
    }
    return this.pageService.getStylesProviderAncestor(pageId)
  }

  @Post()
  async createPage(@Body() { name, parentId }: ICreatePage, @Req() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (!name) {
      throw new BadRequestException('Please provide page name')
    }
    if (!parentId) {
      throw new BadRequestException('Please provide parentId')
    }
    const { user } = req
    const workspaceId = await this.pageService.getPageWorkspaceId(parentId)


    this.logger.info('Page creation request', {
      name,
      parentId,
      workspaceId,
      user,
    })

    await this.pageService.authorizePageAction(parentId, user.id, 'createPage')

    const workspaceOwner = await this.workspaceService.getWorkspaceOwner(workspaceId)

    if (!workspaceOwner) {
      throw new BadRequestException('Workspace owner not found')
    }

    const isPrivatePageCreation = await this.pageService.checkIsPrivatePage(parentId)
    const canUsePrivatePages = this.subscriptionAuthService.canHavePrivatePage(workspaceOwner)

    if (isPrivatePageCreation && !canUsePrivatePages) {
      throw new PaymentRequiredException('Private pages is premium only feature')
    }

    const workspace = await this.workspaceService.getById(workspaceId)

    if (!workspace) {
      throw new BadRequestException('Workspace not found')
    }

    return this.pageService.create({ name, parentId, workspace })
  }

  @Post(':pageId/move')
  async movePage(
    @Param('pageId') pageId: string,
    @Body() { parentId, position }: Pick<IMovePage, 'parentId' | 'position'>,
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const workspaceId = await this.pageService.getPageWorkspaceId(pageId)
    const newParentWorkspaceId = await this.pageService.getPageWorkspaceId(parentId)

    if (workspaceId !== newParentWorkspaceId) {
      throw new BadRequestException('Page can be moved only to the same workspace in this endpoint')
    }

    if (!parentId) {
      throw new BadRequestException('Please provide parentId')
    }
    const prevParentId = await this.pageService.getPageParentId(pageId)
    const isSameParent = prevParentId === parentId
    if (isSameParent && position == null) {
      throw new BadRequestException('Please provide position for moving within the same parent')
    }
    await this.pageService.authorizePageAction(pageId, req.user.id, 'movePage')

    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Cannot move root page')
    }

    const isNewParentPrivatePage = await this.pageService.checkIsPrivatePage(parentId)
    if (!isSameParent && isNewParentPrivatePage) {
      const workspaceId = await this.pageService.getPageWorkspaceId(parentId)
      const workspaceOwner = await this.workspaceService.getWorkspaceOwner(workspaceId)

      if (!workspaceOwner) {
        throw new BadRequestException('Workspace owner not found')
      }

      const canUsePrivatePages = this.subscriptionAuthService.canHavePrivatePage(workspaceOwner)
      if (!canUsePrivatePages) {
        throw new PaymentRequiredException('Private pages is premium only feature')
      }
    }
    return this.pageService.movePage({ pageId, parentId, position })
  }

  @Delete(':pageId')
  async deletePage(@Param('pageId') pageId: string, @Req() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    this.logger.info('Page delete request', { pageId, user: req.user })
    await this.pageService.authorizePageAction(pageId, req.user.id, 'deletePage')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Cannot delete root page')
    }
    return this.pageService.deletePage(pageId)
  }

  @Put(':pageId/styles')
  async updatePageStyles(
    @Param('pageId') pageId: string,
    @Body() { stylesScss }: { stylesScss: Page['stylesScss'] | null },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.pageService.authorizePageAction(pageId, req.user.id, 'setStyles')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page cannot have styles')
    }
    if (!stylesScss) {
      await this.pageService.setPageStyles(pageId, null)
      return {}
    }
    let stylesCss: string | null
    try {
      stylesCss = renderScss(stylesScss)
    } catch (e: any) {
      throw new BadRequestException(e?.toString())
    }
    await this.pageService.setPageStyles(pageId, stylesScss)
    return { css: stylesCss }
  }

  @Put(':pageId/custom-link')
  async updatePageCustomLink(
    @Param('pageId') pageId: string,
    @Body() { customLink }: { customLink: Page['customLink'] },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.pageService.authorizePageAction(pageId, req.user.id, 'setCustomLink')
    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page cannot have custom link')
    }
    if (typeof customLink !== 'string' && customLink !== null) {
      this.logger.warn('Page custom-link update request with wrong type values', {
        pageId,
        user: req.user,
        customLink,
      })
      return new BadRequestException()
    }
    await this.pageService.setPageCustomLink(pageId, customLink)
  }

  @Post(':pageId/create-page-invite')
  async createPageInvite(@Param('pageId') pageId: string, @Req() req: AuthenticatedRequest) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.pageService.authorizePageAction(pageId, req.user.id, 'createPageInvite')

    const canCreateInvite = await this.subscriptionAuthService.canInviteToCollabPage(req.user)
    if (!canCreateInvite) {
      throw new PaymentRequiredException(
        `Current subscription plan does not include collaboration pages`,
      )
    }

    const isRootPage = await this.pageService.checkIsRootPage(pageId)
    if (isRootPage) {
      throw new BadRequestException('Root page cannot be collaborated')
    }

    return this.pageService.createCollaborationInvite(pageId)
  }

  @Delete(':pageId/delete-page-invite')
  async deletePageInvite(
    @Param('pageId') pageId: string,
    @Body() { inviteId }: { inviteId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    if (!inviteId) {
      throw new BadRequestException('Please provide correct "inviteId" in request body')
    }
    const page = await this.pageService.findOne(pageId, {
      where: { id: pageId },
      select: ['id'],
    })
    if (!page) {
      throw new BadRequestException()
    }
    await this.pageService.authorizePageAction(pageId, req.user.id, 'createPageInvite')
    await this.pageService.deleteCollaborationInvite({ pageId, inviteId })
  }

  @Put(':pageId/set-theme')
  async setPageTheme(
    @Param('pageId') pageId: string,
    @Body() { themeId }: { themeId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    await this.pageService.authorizePageAction(pageId, req.user.id, 'setTheme')
    if (themeId !== null && !themes.find(x => x.id === themeId)) {
      throw new BadRequestException('Theme not found')
    }
    await this.pageService.setTheme({ pageId, themeId })
  }

  @Post(':pageId/move-to-workspace')
  async moveToWorkspace(
    @Param('pageId') pageId: string,
    @Body() { workspaceId }: { workspaceId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const userId = req.user.id
    await this.pageService.authorizePageAction(pageId, userId, 'movePageToWorkspace')
    const page = await this.pageService.getPageById(pageId, {
      select: ['mpath'],
    })

    if (!page) {
      throw new BadRequestException('Page not found')
    }

    const isRoot = !page.mpath
    if (isRoot) {
      throw new BadRequestException(`Can't move root page`)
    }
    const newWorkspace = await this.workspaceService.getById(workspaceId)
    if (!newWorkspace) {
      throw new BadRequestException('Workspace not found')
    }
    const hasAccessToNewWorkspace = await this.workspaceService.isUserAuthorizedForWorkspace({
      userId,
      workspaceId: newWorkspace.id,
    })
    if (!hasAccessToNewWorkspace) {
      throw new ForbiddenException(`No access to new workspace`)
    }
    const { newParent, oldParent, updatedPage } = await this.pageService.movePageToWorkspace({
      pageId,
      workspaceId,
    })

    return { newParent, oldParent, updatedPage }
  }

  @Get(':pageId/head-tags')
  async getPageHeadTags(@Param('pageId') pageId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id
    await this.pageService.authorizePageAction(pageId, userId, 'getPageHeadTags')
    return this.pageService.getPageHeadTags(pageId)
  }

  @Put(':pageId/update-head-tags')
  async setPageHeadTags(
    @Param('pageId') pageId: string,
    @Body() { headTags }: PageHeadTagsValidator,
    @Req() req: AuthenticatedRequest,
  ) {
    if (maintenanceMode) throw new ForbiddenException('Brick is under maintenance')

    const userId = req.user.id
    await this.pageService.authorizePageAction(pageId, userId, 'setPageHeadTags')
    await this.pageService.setPageHeadTags(pageId, headTags)
  }
}