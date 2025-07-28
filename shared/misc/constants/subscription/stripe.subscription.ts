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

import { UNLIMITED_ENTITY_LIMIT } from './utils'
import { StripeExtraPriceIdProd, StripeExtraPriceIdDev } from './stripe-extra.subscription'
import { ObjectValues, SubscriptionPlansList } from './types'

const isProduction = process.env.NODE_ENV === 'production'

export const StripePlanIdProd = {
  oldYearly: 'REDACTED',
  monthly: 'REDACTED',
  yearly: 'REDACTED',
  monthly0621: 'REDACTED',
  yearly0621: 'REDACTED',
  hobby: 'REDACTED',
  business: 'REDACTED',
} as const

export const StripePlanIdDev = {
  oldYearly: 'REDACTED',
  yearly: 'REDACTED',
  monthly: 'REDACTED',
  monthly0621: 'REDACTED',
  yearly0621: 'REDACTED',
  hobby: 'REDACTED',
  business: 'REDACTED',
} as const

export const StripePlanId = isProduction ? StripePlanIdProd : StripePlanIdDev

export type StripePlanIdDev = ObjectValues<typeof StripePlanIdDev>
export type StripePlanIdProd = ObjectValues<typeof StripePlanIdProd>
export type StripePlanId = ObjectValues<typeof StripePlanId>

export const StripePlanIds: string[] = Object.values(StripePlanId)

export const StripeSubscriptionPlansProd: SubscriptionPlansList<StripePlanIdProd> = {
  [StripePlanIdProd.oldYearly]: {
    id: StripePlanIdProd.oldYearly,
    priceCents: 1999,
    entities: {
      workspaces: {
        limit: 2,
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
        limit: 2,
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
  [StripePlanIdProd.monthly]: {
    id: StripePlanIdProd.monthly,
    priceCents: 499,
    entities: {
      workspaces: {
        limit: 2,
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
        limit: 2,
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
  [StripePlanIdProd.yearly]: {
    id: StripePlanIdProd.yearly,
    priceCents: 3999,
    entities: {
      workspaces: {
        limit: 2,
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
        limit: 2,
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
  [StripePlanIdProd.monthly0621]: {
    id: StripePlanIdProd.monthly,
    priceCents: 499,
    entities: {
      workspaces: {
        limit: 2,
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
        limit: 2,
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
  [StripePlanIdProd.yearly0621]: {
    id: StripePlanIdProd.yearly,
    priceCents: 3999,
    canWeeklyBackups: true,
    haveFontSettings: true,
    entities: {
      workspaces: {
        limit: 2,
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
        limit: 2,
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
    mandatoryAnalytics: false,
    privatePages: true,
  },
  [StripePlanIdProd.hobby]: {
    id: StripePlanIdProd.hobby,
    priceCents: 500,
    canWeeklyBackups: false,
    haveFontSettings: true,
    entities: {
      workspaces: {
        limit: 3,
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
        limit: 1,
        exceedPerItemPriceId: StripeExtraPriceIdProd.extraCustomDomainDay,
      },
      subdomains: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
    },
    mandatoryAnalytics: true,
    privatePages: true,
  },
  [StripePlanIdProd.business]: {
    id: StripePlanIdProd.business,
    priceCents: 3900,
    canWeeklyBackups: true,
    haveFontSettings: true,
    entities: {
      workspaces: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 3,
        exceedPerItemPriceId: StripeExtraPriceIdProd.extraTeamWorkspaceDay,
      },
      collabWorkspacesUsers: {
        limit: 5,
        exceedPerItemPriceId: StripeExtraPriceIdProd.extraTeamMemberDay,
      },
      domains: {
        limit: 3,
        exceedPerItemPriceId: StripeExtraPriceIdProd.extraCustomDomainDay,
      },
      subdomains: {
        limit: 15,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    mandatoryAnalytics: true,
    privatePages: true,
  },
} as const

export const StripeSubscriptionPlansDev: SubscriptionPlansList<StripePlanIdDev> = {
  [StripePlanIdDev.oldYearly]: {
    ...StripeSubscriptionPlansProd[StripePlanIdProd.oldYearly],
    id: StripePlanIdDev.oldYearly,
  },

  [StripePlanIdDev.monthly]: {
    ...StripeSubscriptionPlansProd[StripePlanIdProd.monthly],
    id: StripePlanIdDev.monthly,
  },

  [StripePlanIdDev.yearly]: {
    ...StripeSubscriptionPlansProd[StripePlanIdProd.yearly],
    id: StripePlanIdDev.yearly,
  },

  [StripePlanIdDev.monthly0621]: {
    ...StripeSubscriptionPlansProd[StripePlanIdProd.monthly0621],
    id: StripePlanIdDev.monthly0621,
  },

  [StripePlanIdDev.yearly0621]: {
    ...StripeSubscriptionPlansProd[StripePlanIdProd.yearly0621],
    id: StripePlanIdDev.yearly0621,
  },

  [StripePlanIdDev.hobby]: {
    id: StripePlanIdDev.hobby,
    priceCents: 500,
    canWeeklyBackups: false,
    haveFontSettings: true,
    entities: {
      workspaces: {
        limit: 3,
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
        limit: 1,
        exceedPerItemPriceId: StripeExtraPriceIdDev.extraCustomDomainDay,
      },
      subdomains: {
        limit: 5,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: 0,
        exceedPerItemPriceId: null,
      },
    },
    mandatoryAnalytics: true,
    privatePages: true,
  },

  [StripePlanIdDev.business]: {
    id: StripePlanIdDev.business,
    priceCents: 3900,
    canWeeklyBackups: true,
    haveFontSettings: true,
    entities: {
      workspaces: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
      collabWorkspaces: {
        limit: 3,
        exceedPerItemPriceId: StripeExtraPriceIdDev.extraTeamWorkspaceDay,
      },
      collabWorkspacesUsers: {
        limit: 5,
        exceedPerItemPriceId: StripeExtraPriceIdDev.extraTeamMemberDay,
      },
      domains: {
        limit: 3,
        exceedPerItemPriceId: StripeExtraPriceIdDev.extraCustomDomainDay,
      },
      subdomains: {
        limit: 15,
        exceedPerItemPriceId: null,
      },
      collabPagesUsers: {
        limit: UNLIMITED_ENTITY_LIMIT,
        exceedPerItemPriceId: null,
      },
    },
    mandatoryAnalytics: true,
    privatePages: true,
  },
} as const

export const StripeSubscriptionPlans = isProduction
  ? StripeSubscriptionPlansProd
  : StripeSubscriptionPlansDev