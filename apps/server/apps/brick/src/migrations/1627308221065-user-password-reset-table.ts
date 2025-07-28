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

export class userPasswordResetTable1627308221065 implements MigrationInterface {
  name = 'userPasswordResetTable1627308221065'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "userResetPassword" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_4e632a2ff622d7e273afe329a2" UNIQUE ("userId"), CONSTRAINT "PK_4e632a2ff622d7e273afe329a26" PRIMARY KEY ("userId"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "userResetPassword" ADD CONSTRAINT "FK_4e632a2ff622d7e273afe329a26" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "userResetPassword" DROP CONSTRAINT "FK_4e632a2ff622d7e273afe329a26"`,
    )
    await queryRunner.query(`DROP TABLE "userResetPassword"`)
  }
}