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

export class RemoveSaasmantraProvider1705239173020 implements MigrationInterface {
  name = 'RemoveSaasmantraProvider1705239173020'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "users" SET "provider" = 'local' WHERE "provider" = 'saasmantra'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Impossible to revert
  }
}