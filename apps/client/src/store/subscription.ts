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

import api from '@brick-shared/api'
import { Invoice } from '../types'
import { Context, RootState } from '.'
import { loadStripe } from '@stripe/stripe-js/pure'
import { Stripe } from '@stripe/stripe-js'
import {
  DefaultSubscriptionPlan,
  stripePublishableKey,
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionPlans,
  SubscriptionPlanEntityName,
} from '@brick/misc/constants/subscription'
import { derived } from 'overmind'
import { uniq } from 'lodash'

type SubscriptionState = {
  upcomingInvoice: Invoice | null
  userSubscriptionPlan: SubscriptionPlan
  stripe: Stripe | null
  userUsedSubscriptionEntries: Record<SubscriptionPlanEntityName, number>
}

const state: SubscriptionState = {
  upcomingInvoice: null,
  userSubscriptionPlan: DefaultSubscriptionPlan,
  stripe: null,
  userUsedSubscriptionEntries: derived((state: SubscriptionState, rootState: RootState) => {
    const workspaces = rootState.userOwnedWorkspaces.length
    const collabWorkspaces = rootState.userOwnedCollabWorkspaces.length
    const userPublicAddresses = rootState.publicAddresses.filter(
      x => x.ownerId === rootState?.user?.id,
    )
    const domains = userPublicAddresses.filter(x => x.externalDomain).length
    const subdomains = userPublicAddresses.filter(x => x.subdomain).length
    const pagesCollabAcceptedInvites = rootState.userOwnedPages.flatMap(x =>
      x.acceptedCollaborationInvites ? x.acceptedCollaborationInvites : [],
    )

    const collabPagesUsers = uniq(pagesCollabAcceptedInvites.map(x => x.userId)).length
    const collabWorkspacesUsers = uniq(
      rootState.userOwnedCollabWorkspaces
        .flatMap(x => x.acceptedCollaborationInvites)
        .map(x => x.userId),
    ).length
    // const collabWorkspacesUsers = rootState.userOwnedCollabWorkspaces
    // console.log(`collabWorkspacesUsers`, collabWorkspacesUsers)

    return {
      domains,
      subdomains,
      workspaces,
      collabPagesUsers,
      collabWorkspaces,
      collabWorkspacesUsers,
    }
  }),
}

const actions = {
  initStripe,
  updateSubscription,
  cancelUserSubscription,
  reactivateUserSubscription,
  loadUpcomingInvoice,
  loadUserSubscriptionInfo,
}

export { state, actions }

async function loadUserSubscriptionInfo({ state }: Context) {
  const { planId }: { planId: SubscriptionPlanId | null } = await api.get(
    'subscription/user-subscription',
  )
  state.userSubscriptionPlan =
    planId && SubscriptionPlans[planId]
      ? (SubscriptionPlans[planId] as SubscriptionPlan)
      : DefaultSubscriptionPlan
}

async function initStripe({ state }: Context) {
  state.stripe = await loadStripe(stripePublishableKey)
}

async function updateSubscription({ state }: Context, planId: string) {
  const { stripe } = state
  if (!state.user || !stripe) {
    return
  }
  const sessionId = await api.post(`subscription/create-checkout-session`, {
    planId,
  })
  const { error } = await stripe.redirectToCheckout({
    sessionId,
  })

  console.error(error)
}

async function reactivateUserSubscription({ state }: Context) {
  if (!state.user || !state.user.customerId) {
    return
  }

  await api.put('subscription/reactivate')
}

async function cancelUserSubscription({ state, actions }: Context) {
  if (!state.user || !state.user.customerId) {
    return
  }

  await api.put('subscription/cancel')
}

async function loadUpcomingInvoice({ state }: Context) {
  state.upcomingInvoice = await api.get('subscription/upcoming-invoice')
}