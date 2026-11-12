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

import { useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import { renderRoutes, RouteConfigComponentProps } from 'react-router-config'

type Props = {} & RouteConfigComponentProps

const AppPage = (props: Props) => {
  useEffect(() => {
    // Empty event listener for unload to prevent "Back-Forward Cache"
    window.addEventListener('unload', () => {})
  }, [])

  return (
    <div className='flex relative h-full'>
      <Sidebar />

      <main className='flex flex-col flex-1 h-full max-h-full overflow-auto'>
        {renderRoutes(props.route?.routes)}
      </main>
    </div>
  )
}

export default AppPage
