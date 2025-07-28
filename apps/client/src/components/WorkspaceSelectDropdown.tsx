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
import { IoIosAdd } from '@react-icons/all-files/io/IoIosAdd'
import { GoPrimitiveDot } from '@react-icons/all-files/go/GoPrimitiveDot'
import { useActions, useAppState } from '../store'
import clsx from 'clsx'
import history from '../router/history'
import WorkspaceSettingsLinkBtn from './WorkspaceSettingsLinkBtn'
import { PageCollaboratorWorkspace } from '../store/workspaces'

type Props = {
  closeTippy?: () => void
}

function WorkspaceSelectDropdown({ closeTippy }: Props): ReactElement {
  const {
    workspaces,
    workspace,
    userSubscriptionPlan: userSubscription,
    user,
    maintenanceMode,
  } = useAppState()
  const { selectWorkspace, createWorkspace } = useActions()
  const numberOfWorkspaces = workspaces.filter(
    x => x.id !== PageCollaboratorWorkspace.id && x.userId === user?.id,
  ).length
  const isExceedWorkspacesLimit =
    !userSubscription || numberOfWorkspaces >= userSubscription.entities.workspaces.limit

  const workspaceItems = workspaces.map(x => {
    const isCurrent = x.id === workspace?.id
    return (
      <li key={x.id}>
        <button
          className={clsx(
            'w-full flex px-3 py-2 items-center justify-between hover:bg-gray-200 overflow-hidden overflow-ellipsis',
            isCurrent && 'font-medium',
          )}
          title={x.name}
          onClick={() => {
            closeTippy?.()
            history.push('/')
            selectWorkspace({ id: x.id })
          }}
        >
          <span className='truncate'>{x.name}</span>
          <div className='flex items-center h-full'>
            {!!x?.acceptedCollaborationInvites.length && (
              <span
                className='rounded ml-4 color-secondary'
                style={{
                  background: '#7067cf',
                  fontSize: '10px',
                  color: '#FFF',
                  lineHeight: 1,
                  padding: '2px 4px',
                  fontWeight: 700,
                }}
              >
                TEAM
              </span>
            )}
            {isCurrent && <GoPrimitiveDot className={clsx('color-main ml-4')} size='18' />}
          </div>
        </button>
      </li>
    )
  })

  return (
    <div className='text-base py-2'>
      <button
        className='flex items-center px-5 py-1.5 hover:bg-gray-200 text-gray-600 w-full disabled:text-gray-300 disabled:bg-opacity-0 disabled:cursor-default'
        disabled={isExceedWorkspacesLimit || maintenanceMode}
        title={
          isExceedWorkspacesLimit
            ? 'You have reached the limit of workspaces for your subscription plan'
            : undefined
        }
        onClick={() => {
          closeTippy?.()
          createWorkspace()
        }}
      >
        <IoIosAdd size='24' className='mr-1' />
        New workspace
      </button>
      <hr className='my-1.5 mx-3'></hr>
      <ul className='flex flex-col overflow-auto' style={{ maxHeight: '300px' }}>
        {workspaceItems}
      </ul>
      <hr className='my-1.5 mx-3'></hr>
      <WorkspaceSettingsLinkBtn onClick={() => closeTippy?.()} />
    </div>
  )
}

export default WorkspaceSelectDropdown