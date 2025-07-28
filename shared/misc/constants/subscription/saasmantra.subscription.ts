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
import { UNLIMITED_ENTITY_LIMIT } from './utils'

export const SaasMantraSubscriptionId = {
  saasMantraCode1: 'saas_mantra_code1',
  saasMantraCode2: 'saas_mantra_code2',
  saasMantraCode3: 'saas_mantra_code3',
  saasMantraCode4: 'saas_mantra_code4',
  saasMantraCode5: 'saas_mantra_code5',
  saasMantraCode6: 'saas_mantra_code6',
  saasMantraCode7: 'saas_mantra_code7',
  saasMantraCode8: 'saas_mantra_code8',
  saasMantraCode9: 'saas_mantra_code9',
  saasMantraCode10: 'saas_mantra_code10',
} as const

export type SaasMantraSubscriptionId = ObjectValues<typeof SaasMantraSubscriptionId>

export const SaasMantraSubscriptionPlans: SubscriptionPlansList<SaasMantraSubscriptionId> = {
  [SaasMantraSubscriptionId.saasMantraCode1]: {
    id: SaasMantraSubscriptionId.saasMantraCode1,
    priceCents: 1900,
    entities: {
      workspaces: {
        limit: 2,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 2,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 2,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode2]: {
    id: SaasMantraSubscriptionId.saasMantraCode2,
    priceCents: 3800,
    entities: {
      workspaces: {
        limit: 3,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 3,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: 10,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: 10,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode3]: {
    id: SaasMantraSubscriptionId.saasMantraCode3,
    priceCents: 5700,
    entities: {
      workspaces: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 10,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: 20,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: 20,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode4]: {
    id: SaasMantraSubscriptionId.saasMantraCode4,
    priceCents: 7600,
    entities: {
      workspaces: {
        limit: 7,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 7,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 15,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: 30,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: 30,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode5]: {
    id: SaasMantraSubscriptionId.saasMantraCode5,
    priceCents: 9500,
    entities: {
      workspaces: {
        limit: 10,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 10,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 25,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode6]: {
    id: SaasMantraSubscriptionId.saasMantraCode6,
    priceCents: 11400,
    entities: {
      workspaces: {
        limit: 14,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 14,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 50,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode7]: {
    id: SaasMantraSubscriptionId.saasMantraCode7,
    priceCents: 13300,
    entities: {
      workspaces: {
        limit: 20,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 20,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 100,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode8]: {
    id: SaasMantraSubscriptionId.saasMantraCode8,
    priceCents: 13300,
    entities: {
      workspaces: {
        limit: 50,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 50,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 150,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode9]: {
    id: SaasMantraSubscriptionId.saasMantraCode9,
    priceCents: 13300,
    entities: {
      workspaces: {
        limit: 100,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 100,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 200,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [SaasMantraSubscriptionId.saasMantraCode10]: {
    id: SaasMantraSubscriptionId.saasMantraCode10,
    priceCents: 13300,
    entities: {
      workspaces: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabWorkspacesUsers: {
        limit: 200,
        exceedPerItemPriceId: null,
      },
      domains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      subdomains: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    canWeeklyBackups: true,
    haveFontSettings: true,
    mandatoryAnalytics: false,
    privatePages: true,
  },
} as const