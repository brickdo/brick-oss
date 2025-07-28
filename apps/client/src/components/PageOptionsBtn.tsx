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
import { useState } from 'react'
import { IoIosMore } from '@react-icons/all-files/io/IoIosMore'
import PageOptionsTippy from './PageOptionsTippy'
import { PageView } from '@brick-shared/types'

interface Props {
  page: PageView
  className?: string
  isVisible?: boolean
  onOpen?: () => void
  onClose?: () => void
}

const PageOptionsBtn = ({ page, isVisible, className, onClose, onOpen }: Props) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <PageOptionsTippy
      onOpen={() => {
        setIsOpen(true)
        onOpen?.()
      }}
      onClose={() => {
        setIsOpen(false)
        onClose?.()
      }}
      page={page}
    >
      {tippyInstance => (
        <button
          className={clsx(
            'page-options-btn bg-transparent hover:bg-gray-400 hover:bg-opacity-50 rounded text-gray-500',
            !isVisible && !isOpen && 'hidden',
            className,
          )}
          title='Add nested page, delete, change domain and more'
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <IoIosMore className='p-1' size='22' />
        </button>
      )}
    </PageOptionsTippy>
  )
}

export default PageOptionsBtn