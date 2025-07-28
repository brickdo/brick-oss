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

import { Drawer } from '@material-ui/core'
import { useActions, useAppState } from '../store'
import SidebarCore from './SidebarCore'

interface Props {}

const SidebarMobile = (props: Props) => {
  const { isSidebarVisible } = useAppState()
  const { toggleSidebar } = useActions()

  return (
    <Drawer
      // without providing this prop elements inside drawer (inputs in pages options) are not getting focus and therefore not accessible
      disableEnforceFocus
      variant='temporary'
      open={isSidebarVisible}
      onClose={toggleSidebar}
      anchor='left'
      style={{
        zIndex: 5,
      }}
      PaperProps={{
        style: {
          width: '270px',
          zIndex: 4,
        },
      }}
    >
      <SidebarCore />
    </Drawer>
  )
}

export default SidebarMobile