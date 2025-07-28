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
import { Page, Workspace } from '@app/db'
import { In, MigrationInterface, QueryRunner } from 'typeorm'

export class PrivatePages1635849926270 implements MigrationInterface {
  name = 'PrivatePages1635849926270'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workspaces" ADD "privateRootPageId" uuid`)
    await queryRunner.query(`ALTER TABLE "workspaces" ADD "publicRootPageId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_174db7da7dac8fda57628482f93" FOREIGN KEY ("privateRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "workspaces" ADD CONSTRAINT "FK_e78d2c2b4dbac6667a14c7dfcde" FOREIGN KEY ("publicRootPageId") REFERENCES "pages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    const workspaceModel = queryRunner.manager.getRepository(Workspace)
    const pageModel = queryRunner.manager.getRepository(Page)
    const workspaces = await workspaceModel.find()
    const publicRootPagesData = await pageModel.find({
      where: {
        parentId: null,
      },
      select: ['workspaceId', 'id'],
    })
    const privateRootPagesValues = workspaces.map(workspace => ({
      name: `private_root_page`,
      shortId: `private_root_page_workspace_${workspace.id}`,
      workspace,
      mpath: '',
    }))

    // Query builder to prevent automatic setting of mpath. For root page we want it to be empty string - ''
    const privateRootPagesInsertResults = await pageModel
      .createQueryBuilder()
      .insert()
      .values(privateRootPagesValues)
      .execute()

    const privateRootPagesData = await pageModel
      .createQueryBuilder()
      .select(['id', '"workspaceId"'])
      .where({
        id: In(privateRootPagesInsertResults.identifiers.map(x => x.id)),
      })
      .execute()

    workspaces.forEach(w => {
      w.publicRootPageId = publicRootPagesData.find(x => x.workspaceId === w.id)?.id
      w.privateRootPageId = privateRootPagesData.find(x => x.workspaceId === w.id)?.id
    })
    await workspaceModel.save(workspaces)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "publicRootPageId"`)
    await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "privateRootPageId"`)
  }
}