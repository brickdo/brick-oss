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

import { SubscriptionPlanEntityName } from './types'

const isProduction = process.env.NODE_ENV === 'production'
export const StripeExtraPriceIdProd = {
  extraTeamMemberDay: 'REDACTED',
  extraTeamWorkspaceDay: 'REDACTED',
  extraCustomDomainDay: 'REDACTED',
} as const

export const StripeExtraPriceIdDev = {
  extraTeamMemberDay: 'REDACTED',
  extraTeamWorkspaceDay: 'price_1L0XL6CmvB9XZhX8eCo2eNCv',
  extraCustomDomainDay: 'REDACTED',
} as const

export const StripeExtraPriceId = isProduction ? StripeExtraPriceIdProd : StripeExtraPriceIdDev

export type StripeExtraPriceId =
  | (typeof StripeExtraPriceIdProd)[keyof typeof StripeExtraPriceIdProd]
  | (typeof StripeExtraPriceIdDev)[keyof typeof StripeExtraPriceIdDev]

export type SubscriptionExtrasUsage = Record<SubscriptionPlanEntityName, number>

export const StripeExtraPriceUsd: {
  [key in StripeExtraPriceId | string]: string
} = {
  [StripeExtraPriceIdProd.extraTeamMemberDay]: '0.16129',
  [StripeExtraPriceIdProd.extraTeamWorkspaceDay]: '0.32258',
  [StripeExtraPriceIdProd.extraCustomDomainDay]: '0.09677',
  [StripeExtraPriceIdDev.extraTeamMemberDay]: '0.16129',
  [StripeExtraPriceIdDev.extraTeamWorkspaceDay]: '0.32258',
  [StripeExtraPriceIdDev.extraCustomDomainDay]: '0.09677',
}