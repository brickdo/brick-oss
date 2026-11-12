/**
 * Copyright (C) 2025 Monadfix OÜ
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import api from '@brick-shared/api'
import { Context } from '.'
import {
  DefaultSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionPlans,
} from '@brick/misc/constants/subscription'

const state: { userSubscriptionPlan: SubscriptionPlan } = {
  userSubscriptionPlan: DefaultSubscriptionPlan,
}

const actions = { loadUserSubscriptionInfo }

export { state, actions }

async function loadUserSubscriptionInfo({ state }: Context) {
  const { planId } = await api.get<{ planId: string }>('subscription/user-subscription')
  state.userSubscriptionPlan = SubscriptionPlans[planId] || DefaultSubscriptionPlan
}
