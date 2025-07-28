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

import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { PageService } from '@brick/page/page.service'
import { User, Page, Workspace } from '@app/db'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { cloneDeep } from 'lodash'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { UserService } from '@brick/user/user.service'
import { SubscriptionPlans } from '@brick/misc/constants/subscription'

export type ClientAppInitialProps = Awaited<
  ReturnType<FrontendService['getAppInitialProps']>
> | null

export const PageCollaboratorWorkspace = {
  id: 'page_collaborator_workspace',
  name: 'Pages shared with me',
  userId: 'page_collaborator_workspace_user_id',
  collaborationInviteIds: [],
  acceptedCollaborationInvites: [],
  privateRootPageId: 'page_collaborator_workspace_private_root_page_id',
  publicRootPageId: 'page_collaborator_workspace_public_root_page_id',
} as const

export const PageCollaboratorPagesRoot: Pick<
  Page,
  'childrenOrder' | 'id' | 'mpath' | 'workspaceId'
> & {
  isExpanded: boolean
} = {
  childrenOrder: [],
  id: PageCollaboratorWorkspace.publicRootPageId,
  isExpanded: true,
  mpath: '',
  workspaceId: PageCollaboratorWorkspace.id,
}

const getCollaboratorWorkspace = () => cloneDeep(PageCollaboratorWorkspace)
const getCollaboratorPagesRoot = () => cloneDeep(PageCollaboratorPagesRoot)

const filterNonTopLevelPages = (x: Page) => x.isTopLevelPage

@Injectable()
export class FrontendService {
  constructor(
    private readonly userService: UserService,
    private readonly pageService: PageService,
    private readonly workspaceService: WorkspaceService,
    private readonly publicAddressService: PublicAddressService,
  ) {}

  async getAppInitialProps({ userId }: { userId: User['id'] }) {
    const workspaces = await this.workspaceService.getCollabAndOwnByUserId(userId)
    const workspacesWithCollabLimits = await Promise.all(
      workspaces.map(async w => {
        if (w.userId === userId) {
          return w
        } else {
          const workspaceOwnerUser = await this.userService.getById(w.userId)
          if (!workspaceOwnerUser) {
            throw new InternalServerErrorException('Workspace owner user not found')
          }
          const ownerSubscriptionPlan = SubscriptionPlans[workspaceOwnerUser.subscriptionPlan]

          if (!ownerSubscriptionPlan) {
            throw new InternalServerErrorException('Workspace owner subscription plan not found')
          }

          return {
            ...w,
            ownerSubscriptionLimits: {
              numberOfDomains: ownerSubscriptionPlan.entities.subdomains.limit,
              numberOfSubdomains: ownerSubscriptionPlan.entities.subdomains.limit,
            },
          }
        }
      }),
    )
    const workspacesPages = await this.pageService.getAllPagesInfoInWorkspaces(
      workspaces.map(x => x.id),
    )
    const publicAddresses = await this.publicAddressService.findByRootPagesIds(
      workspacesPages.filter(filterNonTopLevelPages).map(x => x.id),
    )
    const workspacesPagesIds = workspacesPages.map(x => x.id)
    const collaboratorPages = (await this.pageService.getPagesSharedToUser(userId))
      .map(x => ({ ...x, workspaceId: PageCollaboratorWorkspace.id }))
      .filter(x => !workspacesPagesIds.includes(x.id))

    const collaboratorPagesRoot = getCollaboratorPagesRoot()


    collaboratorPages.forEach(x => {
      const isParentAvailable = x.parentId && collaboratorPages.find(y => y.id === x.parentId)
      if (!isParentAvailable) {
        x.parentId = collaboratorPagesRoot.id
        collaboratorPagesRoot.childrenOrder.push(x.id)
      }
    })

    return {
      // Order of destructering pages here is important. "workspacesPages" should come after "collaboratorPages"
      // If the same page exists in both "collaboratorPages" and "workspacesPages" arrays, "workspacesPages" has
      // more info about the page including workspacePage
      pages: [...collaboratorPages, ...workspacesPages, collaboratorPagesRoot],
      workspaces: [...workspacesWithCollabLimits, getCollaboratorWorkspace()],
      publicAddresses,
    }
  }
}