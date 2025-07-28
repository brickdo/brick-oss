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

import { User } from '@app/db'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { StripeClient } from '@brick/stripe/stripe-client.provider'
import { UserService } from '@brick/user/user.service'
import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { SubscriptionService } from './subscription.service'
import { SubscriptionPlan, StripeExtraPriceId } from '@brick/misc/constants/subscription'
import { v4 as uuidv4 } from 'uuid'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import Stripe from 'stripe'

type StripeUserSubscriptionItems = Stripe.Response<Stripe.ApiList<Stripe.SubscriptionItem>>

@Injectable()
export class SubscriptionCronService {
  constructor(
    private stripeClient: StripeClient,
    private subscriptionService: SubscriptionService,
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private publicAddressService: PublicAddressService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async reportUsageToStripe() {
    const users = await this.userService.findAll()
    await Promise.all(users.map(user => this.chargeUser(user)))
  }

  async chargeUser(user: User) {
    const subscriptionPlan = this.subscriptionService.getUserSubscriptionPlan(user)

    const subscription = await this.subscriptionService.getUserSubscription(user)

    if (!subscription) {
      return
    }

    const userSubscriptionItems = await this.stripeClient.subscriptionItems.list({
      subscription: subscription.id,
    })

    // Handle extra domains
    if (subscriptionPlan.entities.domains.exceedPerItemPriceId != null) {
      await this.chargeExtraDomains(user, subscriptionPlan, userSubscriptionItems)
    }

    // Handle extra team members
    if (subscriptionPlan.entities.collabWorkspacesUsers.exceedPerItemPriceId != null) {
      await this.chargeExtraTeamMembers(user, subscriptionPlan, userSubscriptionItems)
    }

    // Handle extra team workspaces
    if (subscriptionPlan.entities.collabWorkspaces.exceedPerItemPriceId != null) {
      await this.chargeExtraTeamWorkspaces(user, subscriptionPlan, userSubscriptionItems)
    }
  }

  async chargeExtraDomains(
    user: User,
    subscriptionPlan: SubscriptionPlan,
    userSubscriptionItems: StripeUserSubscriptionItems,
  ) {
    const userDomains = await this.publicAddressService.getUserDomains(user)
    const domainsLimit = subscriptionPlan.entities.domains.limit

    if (userDomains.length <= domainsLimit) {
      return
    }

    const extraDomainsNumber = userDomains.length - domainsLimit

    if (!extraDomainsNumber) {
      return
    }

    let extraDomainsSubscriptionItemId = userSubscriptionItems.data.find(
      x => x.price.id === StripeExtraPriceId.extraCustomDomainDay,
    )?.id

    if (!extraDomainsSubscriptionItemId) {
      const subscription = await this.subscriptionService.getUserSubscription(user)
      extraDomainsSubscriptionItemId = (
        await this.stripeClient.subscriptionItems.create({
          subscription: subscription!.id,
          price: StripeExtraPriceId.extraCustomDomainDay,
        })
      ).id
    }

    await this.stripeClient.subscriptionItems.createUsageRecord(
      extraDomainsSubscriptionItemId,
      {
        quantity: extraDomainsNumber,
        timestamp: this.genTimestamp(),
        action: 'set',
      },
      {
        idempotencyKey: this.genIdempotencyKey(),
      },
    )
  }

  async chargeExtraTeamMembers(
    user: User,
    subscriptionPlan: SubscriptionPlan,
    userSubscriptionItems: StripeUserSubscriptionItems,
  ) {
    const userTeamMembers = await this.workspaceService.countUserWorkspacesCollaborators(user.id)
    const teamMembersLimit = subscriptionPlan.entities.collabWorkspacesUsers.limit

    if (userTeamMembers <= teamMembersLimit) {
      return
    }

    const extraTeamMembersNumber = userTeamMembers - teamMembersLimit

    if (!extraTeamMembersNumber) {
      return
    }

    let extraTeamMembersSubscriptionItemId = userSubscriptionItems.data.find(
      x => x.price.id === StripeExtraPriceId.extraTeamMemberDay,
    )?.id

    if (!extraTeamMembersSubscriptionItemId) {
      const subscription = await this.subscriptionService.getUserSubscription(user)
      extraTeamMembersSubscriptionItemId = (
        await this.stripeClient.subscriptionItems.create({
          subscription: subscription!.id,
          price: StripeExtraPriceId.extraTeamMemberDay,
        })
      ).id
    }

    await this.stripeClient.subscriptionItems.createUsageRecord(
      extraTeamMembersSubscriptionItemId,
      {
        quantity: extraTeamMembersNumber,
        timestamp: this.genTimestamp(),
        action: 'set',
      },
      {
        idempotencyKey: this.genIdempotencyKey(),
      },
    )
  }

  async chargeExtraTeamWorkspaces(
    user: User,
    subscriptionPlan: SubscriptionPlan,
    userSubscriptionItems: StripeUserSubscriptionItems,
  ) {
    const userTeamWorkspaces = await this.workspaceService.countUserCollaborativeWorkspaces(user.id)

    const teamWorkspacesLimit = subscriptionPlan.entities.collabWorkspaces.limit

    if (userTeamWorkspaces <= teamWorkspacesLimit) {
      return
    }

    const extraTeamWorkspacesNumber = userTeamWorkspaces - teamWorkspacesLimit

    if (!extraTeamWorkspacesNumber) {
      return
    }

    let extraTeamWorkspacesSubscriptionItemId = userSubscriptionItems.data.find(
      x => x.price.id === StripeExtraPriceId.extraTeamWorkspaceDay,
    )?.id

    if (!extraTeamWorkspacesSubscriptionItemId) {
      const subscription = await this.subscriptionService.getUserSubscription(user)
      extraTeamWorkspacesSubscriptionItemId = (
        await this.stripeClient.subscriptionItems.create({
          subscription: subscription!.id,
          price: StripeExtraPriceId.extraTeamWorkspaceDay,
        })
      ).id
    }

    await this.stripeClient.subscriptionItems.createUsageRecord(
      extraTeamWorkspacesSubscriptionItemId,
      {
        quantity: extraTeamWorkspacesNumber,
        timestamp: this.genTimestamp(),
        action: 'set',
      },
      {
        idempotencyKey: this.genIdempotencyKey(),
      },
    )
  }

  genIdempotencyKey() {
    return uuidv4()
  }

  genTimestamp() {
    return parseInt((Date.now() / 1000).toString())
  }
}