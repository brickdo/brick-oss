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
import { NavLink, useHistory } from 'react-router-dom'
import { renderRoutes, RouteConfigComponentProps } from 'react-router-config'
import HeaderContainer from '../components/HeaderContainer'
import GoPrevPageBtn from '../components/GoPrevPageBtn'
import GenericSettings, { GenericSettingsProps } from '../components/GenericSettings'

type Props = {} & RouteConfigComponentProps

function Settings(props: Props): ReactElement {
  const { location } = useHistory()

  const tabsDescriptions: { title: string; to: string }[] = [
    {
      to: '/settings/account',
      title: 'Account',
    },
    {
      to: '/settings/backup',
      title: 'Export & backups',
    },
    {
      to: '/settings/subscription',
      title: 'Subscription',
    },
  ]

  const tabs: GenericSettingsProps['tabs'] = tabsDescriptions
    .map(x => ({ ...x, isActive: x.to === location.pathname }))
    .map(x => ({
      isActive: x.isActive,
      content: <NavLink to={x.to}>{x.title}</NavLink>,
    }))

  return (
    <GenericSettings
      title='Settings'
      header={
        <HeaderContainer>
          <GoPrevPageBtn label='Close settings' />
        </HeaderContainer>
      }
      tabs={tabs}
    >
      {renderRoutes(props.route?.routes)}
    </GenericSettings>
  )
}

export default Settings