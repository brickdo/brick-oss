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
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
  Req,
  Logger,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { S3Service } from './s3.service'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { PageService } from '@brick/page/page.service'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'

@ApiControllerDecorator('upload')
@UseGuards(JwtAuthGuard) // Ensure only authenticated users can upload
export class S3Controller {
  private readonly logger = new Logger(S3Controller.name)

  constructor(
    private readonly s3Service: S3Service,
    private readonly workspaceService: WorkspaceService,
    private readonly pageService: PageService,
  ) {}

  /**
   * Fetch the actual workspace owner from database using workspaceId
   */
  private async getWorkspaceOwner(workspaceId: string): Promise<string> {
    try {
      const workspace = await this.workspaceService.getById(workspaceId, {
        select: ['userId'],
      })

      if (!workspace) {
        throw new BadRequestException('Workspace not found')
      }

      return workspace.userId
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }

      this.logger.error('Failed to fetch workspace owner', {
        workspaceId,
        error: error instanceof Error ? error.message : String(error),
      })

      throw new BadRequestException('Invalid workspace ID')
    }
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('upload', {
      limits: {

        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    // Validate file upload
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }

    // Get pageId from headers (sent by CKEditor)
    const pageId = req.headers['x-page-id'] as string

    // Validate required header parameters
    if (!pageId) {
      throw new BadRequestException('pageId is required in headers')
    }

    // Get user info from JWT token
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedException('User not authenticated')
    }

    // Get workspace ID from the page
    const workspaceId = await this.pageService.getPageWorkspaceId(pageId)
    if (!workspaceId) {
      throw new BadRequestException('Page not found')
    }

    // Check if user has permission to edit this page (upload images = modify content)
    const canEditPage = await this.pageService.isUserAuthorizedForPageAction(
      pageId,
      userId,
      'setContent',
    )
    if (!canEditPage) {
      throw new UnauthorizedException('User does not have permission to upload images to this page')
    }

    // Fetch the actual workspace owner from database
    const workspaceOwnerId = await this.getWorkspaceOwner(workspaceId)

    const result = await this.s3Service.uploadFile(
      file,
      userId,
      workspaceId,
      workspaceOwnerId, // Use actual workspace owner
      pageId,
    )

    return {
      uploaded: 1,
      url: result.url,
    }
  }
}