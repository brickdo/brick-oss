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

export class FixNullable1648232845838 implements MigrationInterface {
  name = 'FixNullable1648232845838'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_174db7da7dac8fda57628482f93"`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_e78d2c2b4dbac6667a14c7dfcde"`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ALTER COLUMN "privateRootPageId" DROP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ALTER COLUMN "publicRootPageId" DROP NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_174db7da7dac8fda57628482f93" FOREIGN KEY ("privateRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_e78d2c2b4dbac6667a14c7dfcde" FOREIGN KEY ("publicRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_e78d2c2b4dbac6667a14c7dfcde"`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" DROP CONSTRAINT "FK_174db7da7dac8fda57628482f93"`,
    )
    await queryRunner.query(`ALTER TABLE "workspaces" ALTER COLUMN "publicRootPageId" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "workspaces" ALTER COLUMN "privateRootPageId" SET NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_e78d2c2b4dbac6667a14c7dfcde" FOREIGN KEY ("publicRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_174db7da7dac8fda57628482f93" FOREIGN KEY ("privateRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}