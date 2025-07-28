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

export class Domains1592070380583 implements MigrationInterface {
  name = 'Domains1592070380583'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" DROP CONSTRAINT "PK_769ab58ccd2467caa56830f9ed1"`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" RENAME COLUMN "name" TO "subdomain"`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD CONSTRAINT "UQ_376a36c1797dbd1a15657b7c155" UNIQUE ("subdomain")`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD CONSTRAINT "PK_9c1b7c0bd429dd0ad096017f596" PRIMARY KEY ("id")`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD "externalDomain" character varying`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD CONSTRAINT "UQ_5a6ffbb207055d42488ed12f59c" UNIQUE ("externalDomain")`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ALTER COLUMN "ownerId" SET NOT NULL`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ALTER COLUMN "rootPageId" SET NOT NULL`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "workspaceId" SET NOT NULL`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET DEFAULT array[]::text[]`,
      undefined,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}