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

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UploadedImage } from '@app/db'
import { S3Service } from './s3.service'
import { S3Controller } from './s3.controller'
import { WorkspaceModule } from '@brick/workspace/workspace.module'
import { PageModule } from '@brick/page/page.module'

@Module({
  imports: [TypeOrmModule.forFeature([UploadedImage]), WorkspaceModule, PageModule],
  providers: [S3Service],
  controllers: [S3Controller],
  exports: [S3Service],
})
export class S3Module {}