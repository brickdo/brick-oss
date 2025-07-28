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

import { ReactElement, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { renderRoutes, RouteConfigComponentProps } from 'react-router-config'
import HeaderContainer from '../components/HeaderContainer'
import GoPrevPageBtn from '../components/GoPrevPageBtn'
import GenericSettings, { GenericSettingsTabProps } from '../components/GenericSettings'
import { useAppState } from '../store'
import history from '../router/history'
import PremiumBadge from '../components/PremiumBadge'

type Props = {} & RouteConfigComponentProps

type TabDescription = {
  to: string
  title: string
} & Pick<GenericSettingsTabProps, 'disabled' | 'showPremiumBadge'>

function Settings(props: Props): ReactElement {
  const { location } = useHistory()
  const { user, workspace, userSubscriptionPlan: userSubscription } = useAppState()

  const isLoaded = user && workspace
  const isWorkspaceOwner = user?.id === workspace?.userId
  const canHaveCollabWorkspace =
    userSubscription?.entities.collabWorkspaces.limit != null &&
    userSubscription?.entities.collabWorkspaces.limit !== 0
  const isThisCollabWorkspace =
    workspace?.collaborationInviteIds.length || workspace?.acceptedCollaborationInvites.length
  const isCollabTabDisabled = !isThisCollabWorkspace && !canHaveCollabWorkspace
  useEffect(() => {
    if (isLoaded && !isWorkspaceOwner) {
      history.push('/')
    }
  }, [isLoaded, isWorkspaceOwner])

  const tabsDescriptions: TabDescription[] = [
    {
      to: '/workspace-settings/general',
      title: 'General',
    },
    {
      to: '/workspace-settings/collaboration',
      title: 'Collaboration',
      showPremiumBadge: isCollabTabDisabled,
      disabled: isCollabTabDisabled,
    },
  ]

  const tabs: GenericSettingsTabProps[] = tabsDescriptions
    .map(x => ({ ...x, isActive: x.to === location.pathname }))
    .map(x => ({
      isActive: x.isActive,
      content: (
        <NavLink
          to={x.to}
          onClick={e => x.disabled && e.preventDefault()}
          style={
            x.disabled
              ? {
                  cursor: 'default',
                  color: 'rgb(153, 153, 153)',
                }
              : undefined
          }
        >
          {x.title}
          {x.showPremiumBadge && <PremiumBadge />}
        </NavLink>
      ),
    }))

  return (
    <GenericSettings
      title='Workspace settings'
      header={
        <HeaderContainer>
          <GoPrevPageBtn label='Close workspace settings' />
        </HeaderContainer>
      }
      tabs={tabs}
    >
      {renderRoutes(props.route?.routes)}
    </GenericSettings>
  )
}
export default Settings