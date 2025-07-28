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

// @ts-nocheck
import { MigrationInterface, QueryRunner, Not, IsNull, In } from 'typeorm'
import { Workspace } from '@app/db'
import { Page } from '@app/db'

export class DragNDrop1588514390123 implements MigrationInterface {
  name = 'DragNDrop1588514390123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.pages ADD COLUMN "childrenOrder" character varying[] DEFAULT array[]::text[]`,
      undefined,
    )
    const workspaceModel = queryRunner.manager.getRepository(Workspace)
    const pageModel = queryRunner.manager.getRepository(Page)
    const workspaces = await workspaceModel.find()
    const rootPagesValues = workspaces.map(workspace => ({
      name: `rootPage`,
      workspace,
      mpath: '',
    }))
    // Query builder to prevent automatic setting of mpath. For root page we want it to be empty string - ''
    const insertResults = await pageModel
      .createQueryBuilder()
      .insert()
      .values(rootPagesValues)
      .execute()

    const rootPagesIds = insertResults.identifiers.map(x => x.id)
    const rootPages = await pageModel.find({
      where: {
        id: In(rootPagesIds),
      },
    })
    const nonRootPages = await pageModel.find({
      where: {
        id: Not(In(rootPagesIds)),
      },
    })

    nonRootPages.forEach(page => {
      const parent = page.parentId
        ? nonRootPages.find(x => x.id === page.parentId)
        : rootPages.find(x => x.workspaceId === page.workspaceId)
      page.parent = parent
      parent.childrenOrder.push(page.id)
    })

    await pageModel.save([...nonRootPages, ...rootPages])
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const pageModel = queryRunner.manager.getRepository(Page)
    const rootPages = await pageModel.find({
      where: {
        parentId: IsNull(),
      },
    })
    const rootPagesIds = rootPages.map(x => x.id)
    await pageModel
      .createQueryBuilder()
      .update()
      .where('parentId IN (:...rootPagesIds)', { rootPagesIds })
      .set({ parentId: null })
      .execute()
    await pageModel.delete(rootPagesIds)
    await queryRunner.query(`ALTER TABLE public.pages DROP COLUMN "childrenOrder" `, undefined)
  }
}