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

import { Page } from '@app/db'
import { generateShortPageId } from '@brick/utils/randomId'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class ShortIds1619701017362 implements MigrationInterface {
  name = 'ShortIds1619701017362'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`START TRANSACTION`)
    await queryRunner.query(`ALTER TABLE "pages" ADD "shortId" character varying`)
    await queryRunner.query(
      `ALTER TABLE "pages" ADD CONSTRAINT "UQ_cfeb79a0f4bc87ba87a3df17fec" UNIQUE ("shortId")`,
    )
    await queryRunner.query(`COMMIT TRANSACTION`)

    const pageRepo = queryRunner.connection.getRepository(Page)
    const ids = (await pageRepo.createQueryBuilder().select(['id']).getRawMany()).map(x => x.id)
    const promises = ids.map(id => {
      return pageRepo
        .createQueryBuilder()
        .update()
        .set({ shortId: generateShortPageId() })
        .where({ id })
        .execute()
    })
    await Promise.all(promises)

    await queryRunner.query(`ALTER TABLE "pages" ALTER COLUMN "shortId" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pages" DROP CONSTRAINT "UQ_cfeb79a0f4bc87ba87a3df17fec"`)
    await queryRunner.query(`ALTER TABLE "pages" DROP COLUMN "shortId"`)
  }
}