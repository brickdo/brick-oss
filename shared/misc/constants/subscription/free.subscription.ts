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

import { ObjectValues, SubscriptionPlansList } from './types'

export const FreeSubscriptionId = {
  free: 'free',
} as const

export type FreeSubscriptionId = ObjectValues<typeof FreeSubscriptionId>

export const FreeSubscriptionPlans: SubscriptionPlansList<FreeSubscriptionId> = {
  [FreeSubscriptionId.free]: {
    id: FreeSubscriptionId.free,
    priceCents: 0,
    entities: {
      workspaces: {
        limit: 1,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: 2,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: false,
    haveFontSettings: false,
    mandatoryAnalytics: true,
    privatePages: false,
  },
} as const