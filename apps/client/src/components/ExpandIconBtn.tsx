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

import clsx from 'clsx'
import { IoIosArrowForward } from '@react-icons/all-files/io/IoIosArrowForward'

interface Props {
  isExpanded?: boolean
  onClick?: () => void
  className?: string
}

const ExpandIconBtn = ({ isExpanded, onClick, className }: Props) => {
  return (
    <button
      className={clsx(
        'border border-transparent bg-transparent hover:bg-gray-400 hover:bg-opacity-50 text-gray-700 rounded mr-2 self-start',
        isExpanded && 'caret-down',
        className,
      )}
      onClick={event => {
        event.preventDefault()
        event.stopPropagation()
        onClick && onClick()
      }}
    >
      <IoIosArrowForward className='p-1 caret-icon' size='22' />

      <style jsx>{`
        * :global(.caret-icon) {
          transition: transform 0.1s ease-in-out;
        }
        .caret-down :global(.caret-icon) {
          transform: rotate(90deg);
        }
      `}</style>
    </button>
  )
}

export default ExpandIconBtn