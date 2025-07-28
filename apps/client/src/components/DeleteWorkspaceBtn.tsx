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

import { toaster } from 'evergreen-ui'
import { useCallback } from 'react'
import { useActions, useAppState } from '../store'
import confirm from '../helpers/confirm'
import clsx from 'clsx'
import history from '../router/history'

interface Props {
  className?: string
}

function DeleteWorkspaceBtn({ className }: Props) {
  const { workspace, workspaces, maintenanceMode } = useAppState()
  const { deleteWorkspace } = useActions()

  const deleteCurrentWorkspace = useCallback(async () => {
    if (!workspace || !workspaces) {
      return
    }

    if (workspaces.length === 1) {
      toaster.warning(`Can't delete the only existing workspace.`, {
        duration: 5,
      })
      return
    }

    const isConfirmed = await confirm({
      text: 'Deleting the workspace will delete all pages inside it. Continue?',
    })
    if (!isConfirmed) {
      return
    }

    await deleteWorkspace({ id: workspace.id })
    history.push('/')
  }, [workspace, workspaces, deleteWorkspace])

  return (
    <button
      className={clsx(
        'block bg-red-500 hover:bg-red-600 font-semibold text-white py-2 px-4 border border-red-500 hover:border-transparent rounded',
        className,
      )}
      onClick={deleteCurrentWorkspace}
      disabled={maintenanceMode}
    >
      Delete this workspace
    </button>
  )
}

export default DeleteWorkspaceBtn