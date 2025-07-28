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

export class Workspaces1620913701369 implements MigrationInterface {
  name = 'Workspaces1620913701369'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "workspaceUserCollaboration" ("workspaceId" uuid NOT NULL, "userId" uuid NOT NULL, "inviteId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe817e3e4f3f74769fc95367a6b" PRIMARY KEY ("workspaceId", "userId"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD "collaborationInviteIds" text array NOT NULL DEFAULT array[]::text[]`,
    )
    await queryRunner.query(`COMMENT ON COLUMN "pages"."childrenOrder" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET DEFAULT array[]::text[]`,
    )
    await queryRunner.query(`COMMENT ON COLUMN "pages"."collaborationInviteIds" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "collaborationInviteIds" SET DEFAULT array[]::text[]`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaceUserCollaboration" ADD CONSTRAINT "FK_50aef2adfb57c0da9a0619cc4d6" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaceUserCollaboration" ADD CONSTRAINT "FK_034dcae8aabd2b6a0ea4835aba2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspaceUserCollaboration" DROP CONSTRAINT "FK_034dcae8aabd2b6a0ea4835aba2"`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaceUserCollaboration" DROP CONSTRAINT "FK_50aef2adfb57c0da9a0619cc4d6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "collaborationInviteIds" SET DEFAULT ARRAY[]`,
    )
    await queryRunner.query(`COMMENT ON COLUMN "pages"."collaborationInviteIds" IS NULL`)
    await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET DEFAULT ARRAY[]`)
    await queryRunner.query(`COMMENT ON COLUMN "pages"."childrenOrder" IS NULL`)
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "collaborationInviteIds"`)
    await queryRunner.query(`DROP TABLE "workspaceUserCollaboration"`)
  }
}