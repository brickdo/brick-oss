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

import Tippy from '@tippyjs/react'
import { ReactElement, useCallback, useRef } from 'react'
import { MdKeyboardArrowDown } from '@react-icons/all-files/md/MdKeyboardArrowDown'
import { Instance } from 'tippy.js'
import { useAppState } from '../store'
import WorkspaceSelectDropdown from './WorkspaceSelectDropdown'

function WorkspaceSelectDropdownBtn(): ReactElement {
  const { workspace } = useAppState()
  const tippyInstance = useRef<Instance | null>(null)
  const closeTippy = useCallback(() => tippyInstance?.current?.hide(), [])
  return (
    <Tippy
      onMount={instance => {
        tippyInstance.current = instance
      }}
      theme='light'
      trigger='click'
      placement='bottom-end'
      arrow={false}
      zIndex={10}
      interactive
      appendTo={() => document.body}
      maxWidth={'initial'}
      hideOnClick={true}
      content={
        <div style={{ width: '290px' }}>
          <WorkspaceSelectDropdown closeTippy={closeTippy} />
        </div>
      }
    >
      <button
        className='px-3 py-2 no-underline w-full flex items-center justify-between hover:bg-gray-300'
        aria-label='Workspace selector and settings'
        title={workspace?.name}
      >
        <span className='truncate'>{workspace?.name}</span>
        <MdKeyboardArrowDown className='flex-shrink-0' size={24} />
      </button>
    </Tippy>
  )
}

export default WorkspaceSelectDropdownBtn