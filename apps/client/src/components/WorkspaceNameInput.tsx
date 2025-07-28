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
import { motion } from 'framer-motion'
import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { BsCheck } from '@react-icons/all-files/bs/BsCheck'
import { useActions, useAppState } from '../store'
import CustomInput from './CustomInput'

function WorkspaceNameInput() {
  const { workspace, maintenanceMode } = useAppState()
  const { updateWorkspaceName } = useActions()

  const [workspaceNameInput, setWorkspaceNameInput] = useState<string | null>(
    workspace ? workspace.name : null,
  )
  const [isSavedBadgeVisible, setIsSavedBadgeVisible] = useState(false)
  const [workspaceNameError, setWorkspaceNameError] = useState<string | null>(null)

  useEffect(() => {
    setWorkspaceNameInput(workspace ? workspace.name : null)
  }, [workspace])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateWorkspaceNameThottled = useCallback(
    debounce(async (newName: string) => {
      if (!workspace) {
        return
      }
      try {
        await updateWorkspaceName({ id: workspace.id, name: newName })
        setIsSavedBadgeVisible(true)
      } catch (e) {
        setWorkspaceNameError(e.toString())
      }
    }, 500),
    [workspace],
  )

  useEffect(() => {
    if (isSavedBadgeVisible) {
      setTimeout(() => setIsSavedBadgeVisible(false), 1000)
    }
  }, [isSavedBadgeVisible])

  useEffect(() => {
    if (!workspace) {
      return
    }
    if (workspaceNameInput == null) {
      return
    }
    if (!workspaceNameInput) {
      setIsSavedBadgeVisible(false)
      setWorkspaceNameError('Workspace name cannot be empty')
      return
    }
    setWorkspaceNameError(null)
    if (workspace.name === workspaceNameInput) {
      return
    }
    updateWorkspaceNameThottled(workspaceNameInput)
  }, [updateWorkspaceNameThottled, workspace, workspaceNameInput])

  if (!workspace) {
    return null
  }

  return (
    <div className='flex items-center'>
      <div style={{ width: '300px' }}>
        <CustomInput
          value={workspaceNameInput || ''}
          disabled={maintenanceMode}
          onChange={setWorkspaceNameInput}
          className='p-0'
          error={workspaceNameError}
          afterInputSlot={
            <motion.span
              className='relative'
              initial={'closed'}
              animate={isSavedBadgeVisible ? 'open' : 'closed'}
              layout
              variants={{
                open: {
                  visibility: 'visible',
                  opacity: 1,
                  width: 'auto',
                },
                closed: {
                  opacity: 0,
                  transitionEnd: { visibility: 'hidden' },
                },
              }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            >
              <span className={clsx('saved-badge ml-2 flex items-center text-gray-700')}>
                <BsCheck className='mr-1.5' color='#15BF84' size={30} /> Saved
              </span>
            </motion.span>
          }
        />
      </div>
    </div>
  )
}

export default WorkspaceNameInput