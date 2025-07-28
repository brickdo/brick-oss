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

import { PropsWithChildren } from 'react'
import clsx from 'clsx'

interface Props {
  className?: string
}

const HeaderContainer = (props: PropsWithChildren<Props>) => {
  return (
    <div className={clsx('flex items-start py-2 px-6 border-b border-gray-200', props.className)}>
      {props.children}
    </div>
  )
}

export default HeaderContainer