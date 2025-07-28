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

import { createBrowserHistory, Location } from 'history'
import { store } from '../store'

const history = createBrowserHistory()

let prevLocation: Location | null = null
let currentLocation = history.location

history.listen((newLocation, action) => {
  if (action !== 'REPLACE') {
    prevLocation = currentLocation
    currentLocation = newLocation
  }
})

const goToPrevPageOrRoot = () => {
  const { prevPageId } = store.state
  const location = `/${prevPageId || ''}`
  if (location === currentLocation.pathname) {
    return
  }
  history.push(location)
}

export default history

export { prevLocation, goToPrevPageOrRoot }