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
import { MouseEventHandler } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppState } from '../store'

interface Props {
  onClick?: () => void
}

function WorkspaceSettingsLinkBtn({ onClick }: Props) {
  const { workspace, user } = useAppState()
  if (!workspace || !user) {
    return null
  }

  const isDisabled = workspace.userId !== user.id

  const onClickWrapper: MouseEventHandler<HTMLAnchorElement> = e => {
    if (isDisabled) {
      e.preventDefault()
      return
    }
    onClick?.()
  }

  return (
    <NavLink
      to={'/workspace-settings'}
      className={clsx(
        'flex flex-1 items-center px-5 py-1.5 no-underline',
        isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-200 text-gray-600',
      )}
      title='Change workspace name, delete workspace'
      onClick={onClickWrapper}
    >
      Workspace settings
    </NavLink>
  )
}

export default WorkspaceSettingsLinkBtn