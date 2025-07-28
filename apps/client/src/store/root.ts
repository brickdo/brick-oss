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

import { getInitialProps } from '..'
import api from '@brick-shared/api'
import { ClientAppProps, Workspace } from '../types'
import { checkIsMobile } from '../utils'
import localStorageConnector from '../utils/localStorageConnector'
import { Context } from '.'
import io, { Socket } from 'socket.io-client'
import { getMatchedRoutePageId } from '../router'
import history from '../router/history'
import { Page } from '@brick-shared/types'

export enum FrontendSocketEvent {
  pageCreated = 'page created',
  pageDeleted = 'page deleted',
  pageTitleUpdated = 'page title updated',
  pageStylesUpdated = 'page styles updated',
  pageThemeUpdated = 'page theme updated',
  pageAccessRemoved = 'page access removed',
  workspacePagesStructureChanged = 'workspace pages structure changed',
  workspaceDeleted = 'workspace deleted',
  workspaceAccessRemoved = 'workspace access removed',
}

/**
 * Global state, accessible to all components in the app via `useAppState()`.
 */
type State = {
  isSidebarVisible: boolean
  /** If true, Brick will be readonly */
  maintenanceMode: boolean
  generalSocket: Socket | null
}

const state: State = {
  isSidebarVisible: !checkIsMobile(),
  maintenanceMode: process.env.PUBLICVAR_MAINTENANCE_MODE === 'true',
  generalSocket: null,
}

const actions = {
  initializeWorkspacesAndPages,
  toggleSidebar,
  onStoreInit,
  initGeneralSocket,
}

const effects = {}

export { actions, effects, state }

function initGeneralSocket({ state, actions }: Context) {
  if (state.generalSocket) {
    state.generalSocket?.disconnect()
    state.generalSocket = null
  }

  const socket = io('/api/frontend', {
    path: '/api/socket.io',
    transports: ['websocket'],
  })

  socket.on(FrontendSocketEvent.pageCreated, (newPage: Page) => {
    actions.addNewPageToState(newPage)
  })

  socket.on(
    FrontendSocketEvent.pageTitleUpdated,
    ({ pageId, title }: { pageId: Page['id']; title: string }) => {
      actions.setPageTitle({ pageId, title })
    },
  )

  socket.on(FrontendSocketEvent.pageDeleted, (pageId: string) => {
    actions.removePageFromState(pageId)
  })

  socket.on(FrontendSocketEvent.workspacePagesStructureChanged, (pages: Page[]) => {
    actions.replaceSomePagesPreservingCurrentState(pages)
  })

  socket.on(FrontendSocketEvent.workspaceDeleted, (workspaceId: Workspace['id']) => {
    actions.removeWorkspaceFromState(workspaceId)
  })

  socket.on(FrontendSocketEvent.workspaceAccessRemoved, (workspaceId: Workspace['id']) => {
    actions.removeWorkspaceFromState(workspaceId)
  })

  socket.on(FrontendSocketEvent.pageAccessRemoved, (pageId: Page['id']) => {
    actions.removePageFromState(pageId)
  })

  socket.on(
    FrontendSocketEvent.pageStylesUpdated,
    ({
      css,
      pageId,
      scss,
    }: {
      pageId: Page['id']
      css: string
      scss: Page['stylesScss'] | null
    }) => {
      actions.setPageStylesCurrentPage({ pageId, css, scss })
    },
  )

  socket.on(
    FrontendSocketEvent.pageThemeUpdated,
    ({ pageId, themeId }: { pageId: Page['id']; themeId: Page['themeId'] }) => {
      actions.setPageTheme({ pageId, themeId })
    },
  )
  state.generalSocket = socket
}

async function initializeWorkspacesAndPages({ state, actions }: Context) {
  const initialProps = getInitialProps()
  const { pages, workspaces, publicAddresses } =
    initialProps || (await api.get<ClientAppProps>('app-initial-props'))
  actions.setWorkspaces(workspaces)
  actions.setPagesData(pages)
  state.publicAddresses = publicAddresses
  const pageIdFromRoute = getMatchedRoutePageId()
  const fullPageId = pageIdFromRoute && (await actions.resolveFullPageId(pageIdFromRoute))
  const page = fullPageId && state.pages[fullPageId]
  const isWorkspaceAvailable =
    page && page.workspaceId && workspaces.find(x => x.id === page.workspaceId)
  if (pageIdFromRoute && (!page || !isWorkspaceAvailable)) {
    history.replace('/')
  }
  if (page && isWorkspaceAvailable) {
    state.workspaceId = page.workspaceId
  } else {
    const lastWorkspaceId = localStorageConnector.get('lastWorkspaceId')
    const isLastWorkspaceIdExists =
      lastWorkspaceId && state.workspaces.find(x => x.id === lastWorkspaceId)
    state.workspaceId = isLastWorkspaceIdExists ? lastWorkspaceId : state.workspaces[0].id
    actions.ensureCorrectWorkspaceSelected()
  }
}

// Naming function "onInitialize" leads to bug, when this function is not called. Looks like function named "onInitialize" is used internally in overmind so we never should name any actions like that.
function onStoreInit({ actions, reaction }: Context) {
  reaction(
    ({ currentPageId }) => currentPageId,
    async currentPageId => {
      actions.resetIsPageContentSaving()
      if (currentPageId) {
        await actions.fetchStylesProviderAncestor(currentPageId)
      }
      actions.loadCurrentPage()
    },
  )
  reaction(
    ({ workspaceId }) => workspaceId,
    workspaceId => {
      if (workspaceId) {
        localStorageConnector.set('lastWorkspaceId', workspaceId)
      }
    },
  )
}

function toggleSidebar({ state }: Context) {
  state.isSidebarVisible = !state.isSidebarVisible
}