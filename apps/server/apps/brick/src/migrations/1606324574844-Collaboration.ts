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

export class Collaboration1606324574844 implements MigrationInterface {
  name = 'Collaboration1606324574844'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "pageUserCollaboration" ("inviteId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "pageId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_e6413dc8602da89aab1673b3b52" PRIMARY KEY ("pageId", "userId"))`,
    )
    await queryRunner.query(`ALTER TABLE "pages" ADD "cloudDocumentVersion" integer`)
    await queryRunner.query(`ALTER TABLE "pages" ADD "collaborationInviteIds" character varying`)
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "UQ_293274e5b4a4561204fa585022b" UNIQUE ("collaborationInviteIds")`,
    )
    await queryRunner.query(
      `ALTER TABLE "pageUserCollaboration" ADD CONSTRAINT "FK_a8e6f9c35700bb3393175d448b8" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "pageUserCollaboration" ADD CONSTRAINT "FK_97990812fbffefb0d9e6b569a97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pageUserCollaboration" DROP CONSTRAINT "FK_97990812fbffefb0d9e6b569a97"`,
    )
    await queryRunner.query(
      `ALTER TABLE "pageUserCollaboration" DROP CONSTRAINT "FK_a8e6f9c35700bb3393175d448b8"`,
    )
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "UQ_293274e5b4a4561204fa585022b"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "collaborationInviteIds"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "cloudDocumentVersion"`)
    await queryRunner.query(`DROP TABLE "pageUserCollaboration"`)
  }
}