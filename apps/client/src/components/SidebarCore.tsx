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

import { UserBadge } from './UserBadge'
import { LogoutBtn } from './LogoutBtn'
import css from 'styled-jsx/css'
import { FiSettings } from '@react-icons/all-files/fi/FiSettings'
import { NavLink } from 'react-router-dom'
import SubscriptionUpgradeBadge from './SubscriptionUpgradeBadge'
import { checkIsMobile } from '../utils'
import WorkspaceSelectDropdownBtn from './WorkspaceSelectDropdownBtn'
import { useActions } from '../store'
import DoubleTreePages from './DoubleTreePages'

const SidebarCore = () => {
  const { toggleSidebar } = useActions()
  const settingsOnClick = () => {
    if (checkIsMobile()) toggleSidebar()
  }
  return (
    <div className='sidebar flex flex-col pt-4 max-h-full'>
      {
        <div className='mb-4'>
          <div className='flex items-center px-3 mb-4'>
            <UserBadge />

            <LogoutBtn />
          </div>
          <WorkspaceSelectDropdownBtn />

          <NavLink
            to='/settings'
            className='px-3 no-underline color-inherit w-full flex items-center hover:bg-gray-300 py-1'
            activeClassName='bg-gray-400'
            onClick={settingsOnClick}
          >
            <FiSettings size={18} className='mr-1.5' /> Settings
          </NavLink>
        </div>
      }

      <div className='text-left overflow-auto flex flex-1 flex-col'>
        <div className='max-h-full overflow-auto flex-1 mb-10'>
          <DoubleTreePages />
        </div>

        <SubscriptionUpgradeBadge />
      </div>
      <style jsx>{style}</style>
    </div>
  )
}

const style = css`
  .color-gray-for-btns {
    color: #636363;
  }
  .sidebar {
    width: 100%;
    height: 100%;
    min-width: 270px;
    background: #f9f9fa;
    border-right: 1px solid rgba(230, 230, 230, 0.47);
  }
  :global(.sidebar-resizable-handle-wrapper div) {
    z-index: 3;
  }
`
export default SidebarCore