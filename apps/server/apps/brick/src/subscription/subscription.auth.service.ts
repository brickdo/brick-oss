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

import { Injectable } from '@nestjs/common'
import { User } from '@app/db'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { CollaborationService } from '@brick/collaboration/collaboration.service'
import { SubscriptionService } from './subscription.service'

@Injectable()
export class SubscriptionAuthService {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly publicAddressService: PublicAddressService,
    private readonly collaborationService: CollaborationService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canCreateWorkspace(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    const existingWorkspacesNumber = await this.workspaceService.countUserWorkspaces(user.id)

    const canExceedLimit = userSubscription.entities.workspaces.exceedPerItemPriceId != null

    if (canExceedLimit) {
      return true
    }

    return userSubscription.entities.workspaces.limit > existingWorkspacesNumber
  }

  async canCreateCollaborativeWorkspace(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    const existingWorkspacesNumber = await this.workspaceService.countUserCollaborativeWorkspaces(
      user.id,
    )

    const canExceedLimit = userSubscription.entities.collabWorkspaces.exceedPerItemPriceId != null

    if (canExceedLimit) {
      return true
    }

    return userSubscription.entities.collabWorkspaces.limit > existingWorkspacesNumber
  }

  async canInviteToWorkspace(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    const numberOfCollaborators = await this.workspaceService.countUserWorkspacesCollaborators(
      user.id,
    )

    const canExceedLimit =
      userSubscription.entities.collabWorkspacesUsers.exceedPerItemPriceId != null

    if (canExceedLimit) {
      return true
    }

    return userSubscription.entities.collabWorkspacesUsers.limit > numberOfCollaborators
  }

  async canCreateDomain(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)

    const existingDomains = await this.publicAddressService.getUserDomains(user)
    const existingDomainsNumber = existingDomains.length

    const canExceedLimit = userSubscription.entities.domains.exceedPerItemPriceId != null

    if (canExceedLimit) {
      return true
    }

    return userSubscription.entities.domains.limit > existingDomainsNumber
  }

  async canCreateSubdomain(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)

    const existingSubdomains = await this.publicAddressService.getUserSubdomains(user)
    const existingSubdomainsNumber = existingSubdomains.length

    const canExceedLimit = userSubscription.entities.subdomains.exceedPerItemPriceId != null

    if (canExceedLimit) {
      return true
    }

    return userSubscription.entities.subdomains.limit > existingSubdomainsNumber
  }

  canToggleWeeklyUpdates(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    return userSubscription.canWeeklyBackups
  }

  canHavePrivatePage(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    return userSubscription.privatePages
  }

  haveMandatoryAnalytics(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    return userSubscription.mandatoryAnalytics
  }

  haveFontSettings(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)
    return userSubscription.haveFontSettings
  }

  async canInviteToCollabPage(user: User) {
    const userSubscription = this.subscriptionService.getUserSubscriptionPlan(user)

    const existingCollabPageUsers = await this.collaborationService.countUniqCollabPageUsersOfUser(
      user.id,
    )

    return userSubscription.entities.collabPagesUsers.limit > existingCollabPageUsers
  }
}