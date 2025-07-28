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

import { User, Workspace } from '../types'
import { Context, RootState } from '.'
import { derived } from 'overmind'
import api from '@brick-shared/api'
import history from '../router/history'
import { is402 } from '@brick-shared/api/errorChecks'
import { toaster } from 'evergreen-ui'
import { Page, PageView } from '@brick-shared/types'

export const PageCollaboratorWorkspace: Workspace = {
  id: 'page_collaborator_workspace',
  name: 'Pages shared with me',
  userId: 'page_collaborator_workspace_user_id',
  collaborationInviteIds: [],
  acceptedCollaborationInvites: [],
  privateRootPageId: 'pages_shared_with_me',
  publicRootPageId: 'pages_shared_with_me',
}

type WorkspaceState = {
  workspaces: Workspace[]
  userOwnedWorkspaces: Workspace[]
  userOwnedCollabWorkspaces: Workspace[]
  workspace: null | Workspace
  workspaceId: null | string
  isCurrentWorkspaceOwnedByUser: boolean
}

const workspacesState: WorkspaceState = {
  workspaces: [],
  userOwnedWorkspaces: derived((state: WorkspaceState, rootState: RootState) =>
    state.workspaces.filter(w => !!(rootState.user && w.userId === rootState.user.id)),
  ),
  userOwnedCollabWorkspaces: derived((state: WorkspaceState) =>
    state.userOwnedWorkspaces.filter(
      w => w.collaborationInviteIds.length || w.acceptedCollaborationInvites.length,
    ),
  ),
  workspaceId: null,
  workspace: derived((state: WorkspaceState) => {
    return (state.workspaceId && state.workspaces.find(x => x.id === state.workspaceId)) || null
  }),
  isCurrentWorkspaceOwnedByUser: derived((state: WorkspaceState, rootState: RootState) => {
    return !!(state.workspace && rootState.user && state.workspace.userId === rootState.user.id)
  }),
}

const actions = {
  createWorkspaceCollaborationInvite,
  deleteWorkspaceCollaborationInvite,
  removeCollaboratorFromWorkspace,
  setWorkspaces,
  selectWorkspace,
  createWorkspace,
  updateWorkspaceName,
  deleteWorkspace,
  removeWorkspaceFromState,
}

export { actions, workspacesState as state }

async function createWorkspaceCollaborationInvite(
  { state }: Context,
  { workspaceId }: { workspaceId: Workspace['id'] },
) {
  const workspace = state.workspaces.find(x => x.id === workspaceId)
  if (!workspace) {
    return
  }
  const inviteId = await api.post(`workspace/${workspaceId}/create-collaboration-invite`)
  workspace.collaborationInviteIds.push(inviteId)
}

async function deleteWorkspaceCollaborationInvite(
  { state }: Context,
  { inviteId, workspaceId }: { workspaceId: Workspace['id']; inviteId: string },
) {
  const workspace = state.workspaces.find(x => x.id === workspaceId)
  if (!workspace) {
    return
  }
  await api.delete(`workspace/${workspaceId}/delete-collaboration-invite`, {
    data: { inviteId },
  })
  workspace.collaborationInviteIds = workspace.collaborationInviteIds.filter(x => x !== inviteId)
}
async function removeCollaboratorFromWorkspace(
  { state }: Context,
  { collaboratorId, workspaceId }: { collaboratorId: User['id']; workspaceId: Workspace['id'] },
) {
  const workspace = state.workspaces.find(x => x.id === workspaceId)
  if (!workspace) {
    return
  }
  await api.delete(`workspace/${workspaceId}/remove-collaborator`, {
    data: { collaboratorId },
  })
  if (workspace.acceptedCollaborationInvites) {
    workspace.acceptedCollaborationInvites = workspace.acceptedCollaborationInvites.filter(
      x => x.userId !== collaboratorId,
    )
  }
}

function setWorkspaces({ state }: Context, workspaces: Workspace[]) {
  state.workspaces = workspaces
}

function selectWorkspace({ state }: Context, { id }: { id: string }) {
  const workspace = state.workspaces.find(x => x.id === id)
  if (!workspace) {
    return
  }
  state.workspaceId = workspace.id
}

async function createWorkspace(
  { state, actions }: Context,
  { name }: { name?: string } | void = {},
) {
  if (!state.user) {
    return
  }
  let workspace
  try {
    workspace = await api.post('workspace', {
      name: name || `${state.user.name}'s workspace`,
    })
  } catch (e) {
    if (is402(e)) {
      toaster.danger(
        `You have exceeded your workspaces limit. Please contact support if you want to buy extra workspaces.`,
      )
      return
    } else {
      throw e
    }
  }
  state.workspaces.push(workspace)
  const newWorkspacePages = await api.get<Page[]>(`workspace/${workspace.id}/pages`)
  newWorkspacePages.forEach(x => (state.pages[x.id] = new PageView(x)))
  actions.selectWorkspace({ id: workspace.id })

  history.push('/workspace-settings')
}
async function updateWorkspaceName(
  { state }: Context,
  { id, name }: { id: Workspace['id']; name: Workspace['name'] },
) {
  await api.put(`workspace/${id}`, { name })
  const workspace = state.workspaces.find(x => x.id === id)
  if (workspace) {
    workspace.name = name
  }
}
async function deleteWorkspace({ state, actions }: Context, { id }: { id: Workspace['id'] }) {
  await api.delete(`workspace/${id}`)
  actions.removeWorkspaceFromState(id)
}

function removeWorkspaceFromState({ state, actions }: Context, id: Workspace['id']) {
  actions.removePagesOfWorkspaceFromState(id)
  state.workspaces = state.workspaces.filter(x => x.id !== id)
  if (state.workspaceId === id) {
    actions.selectWorkspace({ id: state.workspaces[0].id })
  }
}