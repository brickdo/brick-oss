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

import { ReactElement } from 'react'
import PageLinkShareBtn from './PageLinkShareBtn'
import TreeBreadcrumbs from './TreeBreadcrumbs'
import { getPageCanonicalLink } from '../utils/pageLink'
import PageCollaborationSettingsBtn from './PageCollaborationSettingsBtn'
import DesignSettingsBtn from './DesignSettingsBtn'
import HeaderContainer from './HeaderContainer'
import { checkIsMobile } from './../utils/checkIsMobile'
import PagePreviewBtn from './PagePreviewBtn'
import ToggleSidebarBtn from './ToggleSidebarBtn'
import GreedyBar from './GreedyBar'
import { useAppState } from '../store'

function PageHeader(): ReactElement {
  const {
    currentPage,
    publicAddresses,
    currentWorkspacePublicPagesTree: userPagesTree,
    pages,
    userSubscriptionPlan: userSubscription,
  } = useAppState()
  const isMobile = checkIsMobile()

  if (!currentPage) {
    return <HeaderContainer />
  }

  const splittedMpath = currentPage.mpath.split('.').filter(Boolean)
  const topAncestorId = splittedMpath[0]
  const publicAddress = publicAddresses.find(x => x.rootPageId === topAncestorId)
  const pageCanonicalLink = userPagesTree
    ? getPageCanonicalLink(currentPage.id, pages, publicAddress)
    : ''

  const isFreeUser = !userSubscription || userSubscription.id?.includes('free')
  const shouldShowCollabBtn = !isFreeUser

  return (
    <HeaderContainer className='justify-between '>
      <div className='flex items-center'>
        <ToggleSidebarBtn />

        {userPagesTree && !isMobile && (
          <TreeBreadcrumbs pages={pages} currentPageId={currentPage.id} isApp />
        )}
      </div>

      <div className='flex flex-1 justify-end items-stretch text-sm ml-4 overflow-x-hidden'>
        <GreedyBar>
          <PageLinkShareBtn
            style={{
              width: '160px',
              maxWidth: '160px',
            }}
            value={pageCanonicalLink}
            text={pageCanonicalLink.replace('https://', '')}
            className='hover:bg-gray-200 rounded leading-none'
          />
          <PagePreviewBtn link={pageCanonicalLink} />
          {shouldShowCollabBtn && (
            <PageCollaborationSettingsBtn
              className='flex font-medium items-start py-2 px-3 hover:bg-gray-200 rounded leading-none'
              pageId={currentPage.id}
            />
          )}
          <DesignSettingsBtn
            pageId={currentPage.id}
            className='flex font-medium items-start py-2 px-3 hover:bg-gray-200 rounded leading-none'
          />
        </GreedyBar>
      </div>
    </HeaderContainer>
  )
}

export default PageHeader