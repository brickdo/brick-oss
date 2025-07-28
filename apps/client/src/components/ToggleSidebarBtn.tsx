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
import { IoMdMenu } from '@react-icons/all-files/io/IoMdMenu'
import { useActions } from '../store'

interface Props {}

function ToggleSidebarBtn(_: Props): ReactElement {
  const { toggleSidebar } = useActions()

  return (
    <button title='Toggle sidebar' className='p-2' onClick={toggleSidebar}>
      <IoMdMenu size='24' />
    </button>
  )
}

export default ToggleSidebarBtn