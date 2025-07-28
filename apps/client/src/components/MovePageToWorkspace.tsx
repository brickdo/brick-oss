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

import { useCallback } from 'react'
import confirm from '../helpers/confirm'
import { useActions, useAppState } from '../store'
import { PageCollaboratorWorkspace } from '../store/workspaces'
import { Workspace } from '../types'
import SelectList from './SelectList'

type Props = {
  pageId: string
  onAfterSelect?: () => void
}

const MovePageToWorkspace = ({ pageId, onAfterSelect }: Props) => {
  const { workspaces, workspace, user } = useAppState()
  const { movePageToWorkspace } = useActions()
  const availableWorkspaces = workspace
    ? workspaces.filter(x => ![workspace.id, PageCollaboratorWorkspace.id].includes(x.id))
    : []

  const onSelect = useCallback(
    async (w: Workspace) => {
      if (!user) return
      onAfterSelect?.()
      const isSomeoneElsesWorkspace = w.userId !== user.id
      if (isSomeoneElsesWorkspace) {
        const isConfirmed = await confirm({
          text: `You are moving this page to somebody else's workspace. The ownership of the page will be transferred to the other user and you will not be able to move it back.`,
          confirmBtnLabel: 'Move it',
          cancelBtnLabel: 'Cancel',
        })
        if (!isConfirmed) return
      }
      await movePageToWorkspace({ pageId, workspaceId: w.id })
    },
    [user, pageId, onAfterSelect, movePageToWorkspace],
  )

  return (
    <div>
      <h2 className='text-base m-0 px-2 font-normal text-center mb-1 text-gray-600'>
        {' '}
        Move page to workspace{' '}
      </h2>
      <SelectList items={availableWorkspaces} onSelect={onSelect} />
    </div>
  )
}

export default MovePageToWorkspace