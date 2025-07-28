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
import { IoMdEye } from '@react-icons/all-files/io/IoMdEye'

interface Props {
  link: string
}

function PagePreviewBtn({ link }: Props): ReactElement {
  return (
    <button
      onClick={() => window.open(link)}
      className='flex font-medium items-start py-2 px-3  hover:bg-gray-200 rounded leading-none whitespace-nowrap text-left'
      title='Preview in new tab'
    >
      <div className='flex items-start'>
        <span className='mr-2'>
          <IoMdEye />
        </span>
        Preview in new tab
      </div>
    </button>
  )
}

export default PagePreviewBtn