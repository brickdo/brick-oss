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

import { SubscriptionPlanId } from './subscriptionPlans'

export type PricingEntityOptions = {
  limit: number
  exceedPerItemPriceId: string | null
}

export const SubscriptionPlanEntityNames = [
  'workspaces',
  'domains',
  'subdomains',
  'collabWorkspaces',
  'collabWorkspacesUsers',
  'collabPagesUsers',
] as const

export type SubscriptionPlanEntityName = (typeof SubscriptionPlanEntityNames)[number]
export type SubscriptionPlan = {
  id: SubscriptionPlanId
  priceCents: number
  entities: { [key in SubscriptionPlanEntityName]: PricingEntityOptions }
  canWeeklyBackups: boolean
  haveFontSettings: boolean
  mandatoryAnalytics: boolean
  privatePages: boolean
}

export type SubscriptionPlansList<T extends string> = {
  [key in T]: SubscriptionPlan
}

export type ObjectValues<T extends {}> = T[keyof T]