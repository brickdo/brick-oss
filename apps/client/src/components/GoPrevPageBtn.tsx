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
import { VscClose } from '@react-icons/all-files/vsc/VscClose'
import { goToPrevPageOrRoot } from '../router/history'

function GoPrevPageBtn(props: { label?: string }): ReactElement {
  const { label } = props
  return (
    <button onClick={goToPrevPageOrRoot} {...(label ? { 'aria-label': label } : {})}>
      <VscClose size={22} color='rgb(99, 99, 99)' />
    </button>
  )
}

export default GoPrevPageBtn