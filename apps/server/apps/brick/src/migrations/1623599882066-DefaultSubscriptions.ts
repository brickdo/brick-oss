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

import { SubscriptionPlanId } from '@brick/misc/constants/subscription'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class DefaultSubscriptions1623599882066 implements MigrationInterface {
  name = 'DefaultSubscriptions1623599882066'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update "users" set "subscriptionPlan" = '${SubscriptionPlanId.free}' where "subscriptionPlan" IS NULL`,
    )
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" SET DEFAULT '${SubscriptionPlanId.free}'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "subscriptionPlan" DROP NOT NULL`)
    await queryRunner.query(
      `update "users" set "subscriptionPlan" = null where "subscriptionPlan" = '${SubscriptionPlanId.free}'`,
    )
  }
}