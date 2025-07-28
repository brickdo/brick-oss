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

import { FreeSubscriptionId, FreeSubscriptionPlans } from './free.subscription'
import { SaasMantraSubscriptionId, SaasMantraSubscriptionPlans } from './saasmantra.subscription'
import {
  StripePlanId,
  StripePlanIdDev,
  StripePlanIdProd,
  StripeSubscriptionPlans,
} from './stripe.subscription'
import { ObjectValues, SubscriptionPlan } from './types'

export const SubscriptionPlans: {
  [key in SubscriptionPlanId]?: SubscriptionPlan
} = {
  ...FreeSubscriptionPlans,
  ...SaasMantraSubscriptionPlans,
  ...StripeSubscriptionPlans,
} as const

export const SubscriptionPlanId = {
  ...FreeSubscriptionId,
  ...SaasMantraSubscriptionId,
  ...StripePlanId,
} as const

export const SubscriptionPlansNames: { [key in SubscriptionPlanId]: string } = {
  [SubscriptionPlanId.free]: 'Free',
  [SubscriptionPlanId.saasMantraCode1]: 'SaaS Mantra 1 code',
  [SubscriptionPlanId.saasMantraCode2]: 'SaaS Mantra 2 code',
  [SubscriptionPlanId.saasMantraCode3]: 'SaaS Mantra 3 code',
  [SubscriptionPlanId.saasMantraCode4]: 'SaaS Mantra 4 code',
  [SubscriptionPlanId.saasMantraCode5]: 'SaaS Mantra 5 code',
  [SubscriptionPlanId.saasMantraCode6]: 'SaaS Mantra 6 code',
  [SubscriptionPlanId.saasMantraCode7]: 'SaaS Mantra 7 code',
  [SubscriptionPlanId.saasMantraCode8]: 'SaaS Mantra 8 code',
  [SubscriptionPlanId.saasMantraCode9]: 'SaaS Mantra 9 code',
  [SubscriptionPlanId.saasMantraCode10]: 'SaaS Mantra 10 code',

  [StripePlanIdDev.business]: 'DEV Business',
  [StripePlanIdDev.hobby]: 'DEV Hobby',
  [StripePlanIdDev.monthly]: 'DEV Monthly legacy',
  [StripePlanIdDev.monthly0621]: 'DEV Monthly legacy',
  [StripePlanIdDev.yearly]: 'DEV Yearly legacy',
  [StripePlanIdDev.oldYearly]: 'DEV Yearly legacy',
  [StripePlanIdDev.yearly0621]: 'DEV Yearly legacy',

  [StripePlanIdProd.business]: 'Business',
  [StripePlanIdProd.hobby]: 'Hobby',
  [StripePlanIdProd.monthly]: 'Monthly legacy',
  [StripePlanIdProd.monthly0621]: 'Monthly legacy',
  [StripePlanIdProd.yearly]: 'Yearly legacy',
  [StripePlanIdProd.oldYearly]: 'Yearly legacy',
  [StripePlanIdProd.yearly0621]: 'Yearly legacy',
} as const

export type SubscriptionPlanId = ObjectValues<typeof SubscriptionPlanId>

export const DefaultSubscriptionPlanId = FreeSubscriptionId.free

export const DefaultSubscriptionPlan = FreeSubscriptionPlans.free