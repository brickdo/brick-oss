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

export class MetaColumns1596307569534 implements MigrationInterface {
  name = 'MetaColumns1596307569534'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "publicAddresses" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    )
    await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    )
    await queryRunner.query(`ALTER TABLE "pages" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(`ALTER TABLE "pages" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`)
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403"`,
    )
    await queryRunner.query(`ALTER TABLE "workspaces" ALTER COLUMN "userId" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET DEFAULT array[]::text[]`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403"`,
    )
    await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "childrenOrder" SET DEFAULT ARRAY[]`)
    await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "childrenOrder" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "workspaces" ALTER COLUMN "userId" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_dc53b3d0b16419a8f5f17458403" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "createdAt"`)
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "createdAt"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`)
    await queryRunner.query(`ALTER TABLE "publicAddresses" DROP COLUMN "updatedAt"`)
    await queryRunner.query(`ALTER TABLE "publicAddresses" DROP COLUMN "createdAt"`)
  }
}