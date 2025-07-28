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

import { useAppState } from '../store'
import DeleteWorkspaceBtn from './DeleteWorkspaceBtn'
import GenericSettingsSectionTitle from './GenericSettingsSectionTitle'
import WorkspaceNameInput from './WorkspaceNameInput'

function WorkspaceSettingsGeneral() {
  const { workspaceId } = useAppState()

  return (
    <div className='flex flex-col text-left'>
      <div className='flex flex-col items-start'>
        <GenericSettingsSectionTitle>Workspace name</GenericSettingsSectionTitle>
        <WorkspaceNameInput key={workspaceId} />

        <DeleteWorkspaceBtn className='mt-8' />
      </div>
    </div>
  )
}

export default WorkspaceSettingsGeneral