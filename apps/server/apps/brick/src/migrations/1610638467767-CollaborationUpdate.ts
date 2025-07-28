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

export class CollaborationUpdate1610638467767 implements MigrationInterface {
  name = 'CollaborationUpdate1610638467767'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "collaborationInviteId"`)
    await queryRunner.query(
      `ALTER TABLE "pages" ADD "collaborationInviteIds" text array NOT NULL DEFAULT array[]::text[]`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "collaborationInviteIds"`)
    await queryRunner.query(`ALTER TABLE "pages" ADD "collaborationInviteIds" character varying`)
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "UQ_573e6433b022f6ea993452e33e0" UNIQUE ("collaborationInviteIds")`,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" RENAME CONSTRAINT "UQ_573e6433b022f6ea993452e33e0" TO "UQ_293274e5b4a4561204fa585022b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" RENAME COLUMN "collaborationInviteIds" TO "collaborationInviteId"`,
    )
  }
}