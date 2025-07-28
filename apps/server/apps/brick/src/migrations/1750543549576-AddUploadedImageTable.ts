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

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUploadedImageTable1750543549576 implements MigrationInterface {
  name = 'AddUploadedImageTable1750543549576'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "uploaded_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "filename" character varying NOT NULL, "originalName" character varying NOT NULL, "mimeType" character varying NOT NULL, "fileSize" integer NOT NULL, "s3Url" character varying NOT NULL, "uploadedByUserId" character varying NOT NULL, "workspaceId" character varying NOT NULL, "workspaceOwnerId" character varying NOT NULL, "pageId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_37f0f1866d702a0ac47830c2858" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "uploaded_images"`)
  }
}