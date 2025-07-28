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

import { derived } from 'overmind'
import isUUID from 'validator/lib/isUUID'
import api from '@brick-shared/api'
import history from '../router/history'
import { EditorService, Theme, Workspace } from '../types'
import { Page, PagesTree, PagesTreeItems, PageView, PublicAddress } from '@brick-shared/types'
import { callbackIfExecutesLong } from '../utils'
import { Context, RootState } from '.'
import { cloneDeep, keyBy, findKey, uniqueId, omitBy, pickBy } from 'lodash'
import { wrap } from 'comlink'
import PageSocketWorker from '../api/pageSocket.worker.ts'
import { is403, is404 } from '@brick-shared/api/errorChecks'
import debounce from 'lodash/debounce'

let socket: {
  setContent: (args: Pick<Page, 'id' | 'content'>) => any
  setTitle: (args: { id: string; title: string }) => any
} | null

let editorService: { current: EditorService | null } = {
  current: null,
}

type State = {
  pages: PagesTreeItems
  userOwnedPages: PageView[]
  arePrivatePagesEnabled: boolean
  currentWorkspacePublicPages: PagesTreeItems
  currentWorkspaceTopPublicPagesIds: Page['id'][]
  currentWorkspaceTopPublicPages: PageView[]
  currentWorkspacePublicPagesTree: null | PagesTree
  currentWorkspacePrivatePages: PagesTreeItems
  currentWorkspaceTopPrivatePagesIds: Page['id'][]
  currentWorksapceTopPrivatePages: PageView[]
  currentWorkspacePrivatePagesTree: null | PagesTree
  currentPage?: PageView | null
  prevPageId?: Page['id'] | null
  currentPageId?: Page['id'] | null
  workspacePublicRootPageId?: Page['id'] | null
  workspacePrivateRootPageId?: Page['id'] | null
  publicAddresses: PublicAddress[]
  isPageContentSaving: boolean
  isPageEditingReady: boolean
  pendingPageContentSavings: string[]
  themes: Theme[]
  isPagesInfoLoaded: boolean
  editorService: typeof editorService
}

const state: State = {
  isPagesInfoLoaded: false,
  isPageEditingReady: false,
  pages: {},
  themes: [],
  currentPageId: null,
  prevPageId: null,
  // Derived and variable which declared outside of state is used to prevent making this property reactive
  // and rerendering components using it
  editorService: derived(() => editorService),
  publicAddresses: [],
  pendingPageContentSavings: [],
  isPageContentSaving: derived((state: State) => !!state.pendingPageContentSavings.length),
  workspacePublicRootPageId: derived(
    (state: State, rootState: RootState) => rootState.workspace?.publicRootPageId,
  ),
  workspacePrivateRootPageId: derived(
    (state: State, rootState: RootState) => rootState.workspace?.privateRootPageId,
  ),
  userOwnedPages: derived((state: State, rootState: RootState) => {
    const { user } = rootState
    if (!user) {
      return []
    }

    const pages = Object.values(state.pages)
    const userWorkspacesIds = rootState.userOwnedWorkspaces.map(x => x.id)
    return pages.filter(x => userWorkspacesIds.includes(x.workspaceId))
  }),
  currentWorkspaceTopPublicPagesIds: derived((state: State, rootState: RootState) => {
    if (!rootState.workspaceId) {
      return []
    }
    const pagesArray = Object.values(state.pages)
    return pagesArray
      .filter(
        x =>
          x.workspaceId === rootState.workspaceId && x.parentId === state.workspacePublicRootPageId,
      )
      .map(x => x.id)
  }),
  currentWorkspaceTopPublicPages: derived((state: State) => {
    const pagesArray = Object.values(state.pages)
    return pagesArray.filter(x => state.currentWorkspaceTopPublicPagesIds.includes(x.id))
  }),
  currentWorkspacePublicPages: derived((state: State, rootState: RootState) => {
    if (!rootState.workspaceId) {
      return {}
    }
    return pickBy(
      state.pages,
      x =>
        x.workspaceId === rootState.workspaceId &&
        (state.currentWorkspaceTopPublicPagesIds.some(p => x.mpath.includes(p)) ||
          x.id === state.workspacePublicRootPageId),
    )
  }),
  arePrivatePagesEnabled: derived((state: State, rootState: RootState) => {
    return !!(
      rootState.workspaceId &&
      rootState.user?.id &&
      (!rootState.isCurrentWorkspaceOwnedByUser || rootState.userSubscriptionPlan?.privatePages)
    )
  }),
  currentWorkspacePublicPagesTree: derived((state: State) => {
    if (!state.currentWorkspacePublicPages) {
      return null
    }
    const pagesArray = Object.values(state.currentWorkspacePublicPages)
    const rootPage = pagesArray.find(x => !x.parentId)
    if (!rootPage) {
      return null
    }
    const items: any = {
      ...cloneDeep(state.currentWorkspacePublicPages),
      [rootPage.id]: {
        ...rootPage,
        isExpanded: true,
      },
    }
    return {
      rootId: rootPage.id,
      items,
    }
  }),
  currentWorkspaceTopPrivatePagesIds: derived((state: State, rootState: RootState) => {
    if (!state.arePrivatePagesEnabled) {
      return []
    }
    const pagesArray = Object.values(state.pages)
    return pagesArray
      .filter(
        x =>
          x.workspaceId === rootState.workspaceId &&
          x.parentId === state.workspacePrivateRootPageId,
      )
      .map(x => x.id)
  }),
  currentWorksapceTopPrivatePages: derived((state: State) => {
    const pagesArray = Object.values(state.pages)
    return pagesArray.filter(x => state.currentWorkspaceTopPrivatePagesIds.includes(x.id))
  }),
  currentWorkspacePrivatePages: derived((state: State, rootState: RootState) => {
    if (!rootState.workspaceId) {
      return {}
    }
    const isPageFromCurrentWorkspace = (page: Page) => page.workspaceId === rootState.workspaceId
    const isRootPrivatePage = (page: Page) => page.id === state.workspacePrivateRootPageId
    const isNonRootPrivatePage = (page: Page) =>
      state.currentWorkspaceTopPrivatePagesIds.some(p => page.mpath.includes(p))
    return pickBy(
      state.pages,
      x => isPageFromCurrentWorkspace(x) && (isRootPrivatePage(x) || isNonRootPrivatePage(x)),
    )
  }),
  currentWorkspacePrivatePagesTree: derived((state: State) => {
    if (!state.currentWorkspacePrivatePages) {
      return null
    }
    const pagesArray = Object.values(state.currentWorkspacePrivatePages)
    const rootPage = pagesArray.find(x => !x.parentId)
    if (!rootPage) {
      return null
    }
    const items: any = {
      ...cloneDeep(state.currentWorkspacePrivatePages),
      [rootPage.id]: {
        ...rootPage,
        isExpanded: true,
      },
    }
    return {
      rootId: rootPage.id,
      items,
    }
  }),
  currentPage: derived((state: State) => {
    const { currentPageId, pages } = state
    if (!currentPageId) {
      return null
    }
    return pages?.[currentPageId]
  }),
}

const actions = {
  createPageCollaborationInvite,
  deletePageCollaborationInvite,
  updatePageStyles,
  setPageStyles,
  setPageStylesCurrentPage,
  setIsPageEditingReady,
  updatePageCustomLink,
  updateOrCreatePublicAddress,
  deletePublicAddress,
  generatePublicAddressSsl,
  ensureCorrectWorkspaceSelected,
  expandPageAncestors,
  setPagesData,
  replaceSomePagesPreservingCurrentState,
  createPage,
  addNewPageToState,
  setCurrentPageId,
  resolveFullPageId,
  findPageByAnyId,
  loadCurrentPage,
  setPageTitle,
  updateCurrentPageTitle,
  loadThemes,
  setPageTheme,
  updatePageTheme,
  updatePageContent,
  pushPendingPageContentSavings,
  updateCurrentPageContent,
  togglePageExpanded,
  toggleCollaborationPageExpanded,
  movePage,
  movePageToWorkspace,
  deletePage,
  removePageFromState,
  fetchStylesProviderAncestor,
  resetIsPageContentSaving,
  removePagesOfWorkspaceFromState,
  setEditorService,
}

export { state, actions }

function setEditorService({ state }: Context, val: EditorService | null) {
  editorService.current = val
}

async function createPageCollaborationInvite(
  { state }: Context,
  { pageId }: { pageId: Page['id'] },
) {
  const inviteId = await api.post(`page/${pageId}/create-page-invite`)
  if (!state.pages[pageId]) {
    return
  }
  state.pages[pageId].collaborationInviteIds.push(inviteId)
}

async function deletePageCollaborationInvite(
  { state }: Context,
  { pageId, inviteId }: { pageId: Page['id']; inviteId: string },
) {
  await api.delete(`page/${pageId}/delete-page-invite`, { data: { inviteId } })
  if (!state.pages[pageId]) {
    return
  }
  state.pages[pageId].collaborationInviteIds = state.pages[pageId].collaborationInviteIds.filter(
    x => x !== inviteId,
  )
}
async function updatePageStyles(
  { actions }: Context,
  { pageId, stylesScss }: { pageId: Page['id']; stylesScss: Page['stylesScss'] },
) {
  stylesScss = !stylesScss?.trim() ? null : stylesScss

  const stylesResponse = await api.put(`page/${pageId}/styles`, { stylesScss })

  actions.setPageStyles({ pageId, css: stylesResponse.css, scss: stylesScss })
}

function setPageStyles(
  { state }: Context,
  { pageId, css, scss }: { pageId: Page['id']; css: Page['stylesCss']; scss: Page['stylesScss'] },
) {
  if (!state.pages || !state.pages[pageId]) {
    return
  }

  state.pages[pageId].stylesScss = scss
  state.pages[pageId].stylesCss = css
}

/**
 * Used in the collaborative mode if someone in the workspace changes styles we don't want to store it in memory if it can't be used right
 */
function setPageStylesCurrentPage(
  { state, actions }: Context,
  { pageId, css, scss }: { pageId: Page['id']; css: Page['stylesCss']; scss: Page['stylesScss'] },
) {
  const { currentPage } = state
  if (!currentPage || currentPage.id !== pageId) {
    return
  }

  actions.setPageStyles({ pageId, css, scss })
}

async function updatePageCustomLink(
  { state }: Context,
  { pageId, customLink }: { pageId: Page['id']; customLink: Page['customLink'] },
) {
  customLink = customLink || null

  await api.put(`page/${pageId}/custom-link`, { customLink })

  if (!state.pages || !state.pages[pageId]) {
    return
  }

  state.pages[pageId].customLink = customLink
}

async function updateOrCreatePublicAddress(
  { state }: Context,
  data: Pick<PublicAddress, 'rootPageId' | 'subdomain' | 'externalDomain'>,
) {
  const { rootPageId, externalDomain, subdomain } = data
  const updatedPublicAddress = await api.put<PublicAddress>('public-address', {
    rootPageId,
    externalDomain,
    subdomain,
  })
  const existingAddress = state.publicAddresses.find(x => x.id === updatedPublicAddress.id)
  if (existingAddress) {
    const index = state.publicAddresses.indexOf(existingAddress)
    state.publicAddresses.splice(index, 1, updatedPublicAddress)
  } else {
    state.publicAddresses.push(updatedPublicAddress)
  }
}

async function deletePublicAddress({ state }: Context, id: PublicAddress['id']) {
  await api.delete(`public-address/${id}`)
  state.publicAddresses = state.publicAddresses.filter(x => x.id !== id)
}

async function generatePublicAddressSsl({ state }: Context, id: PublicAddress['id']) {
  await api.put(`public-address/${id}/generate-ssl`)
}

function ensureCorrectWorkspaceSelected({ state, actions }: Context) {
  if (!state.currentPage || !state.workspaceId) {
    return
  }

  const pageWorkspace = state.currentPage.workspaceId
  if (pageWorkspace !== state.workspaceId) {
    actions.selectWorkspace({ id: pageWorkspace })
  }
}

function expandPageAncestors({ state, actions }: Context, { pageId }: { pageId: Page['id'] }) {
  if (!state.pages[pageId]) {
    return
  }
  const ancestors = state.pages[pageId].mpath.split('.').filter(Boolean).slice(0, -1)
  for (const ancestorsId of ancestors) {
    if (state.pages[ancestorsId] && !state.pages[ancestorsId].isExpanded) {
      actions.togglePageExpanded(ancestorsId)
    }
  }
}

function setPagesData({ state, actions }: Context, pages: Page[]) {
  const pageViews = pages.map(x => ({
    ...new PageView(x),
    // Without this line if current page loads faster  its content will be overwritten to empty string,
    // because api request above returns only pages info, without content
    ...(state?.pages?.[x.id] || {}),
  }))
  state.pages = { ...state.pages, ...keyBy(pageViews, 'id') }

  if (state.currentPageId) {
    actions.expandPageAncestors({ pageId: state.currentPageId })
    actions.fetchStylesProviderAncestor(state.currentPageId)
  }
  state.isPagesInfoLoaded = true
}

function replaceSomePagesPreservingCurrentState({ state, actions }: Context, pages: Page[]) {
  const pageViewsArray = pages.map(x => {
    const existingPage = state.pages[x.id]
    const preserveExisingValues = !existingPage
      ? {}
      : {
          isExpanded: existingPage.isExpanded,
          content: existingPage.content,
        }
    return {
      ...new PageView(x),
      ...preserveExisingValues,
    }
  })
  state.pages = { ...state.pages, ...keyBy(pageViewsArray, 'id') }

  const { currentPageId } = state

  const isPageUnavailable = currentPageId && !state.pages[currentPageId]
  if (isPageUnavailable) {
    history.push('/')
    return
  }

  if (currentPageId) {
    actions.expandPageAncestors({ pageId: currentPageId })
    actions.fetchStylesProviderAncestor(currentPageId)
  }
}

async function createPage(
  { state, actions }: Context,
  { parentId }: { parentId?: Page['id'] } = {},
) {
  if (!state.workspace || !state.pages || !state.currentWorkspacePublicPagesTree) {
    return
  }
  parentId = parentId || state.currentWorkspacePublicPagesTree?.rootId
  const newPage = await api.post<Page>(`page`, {
    name: 'Untitled',
    parentId: parentId,
  })
  state.pages[newPage.id] = { ...new PageView(newPage) }
  actions.addNewPageToState(newPage)
  const parent = state.pages[parentId]
  if (parent && !parent.isExpanded) {
    actions.togglePageExpanded(parentId)
  }
  history.push(`/${newPage.shortId}`)

}

function addNewPageToState({ state, actions }: Context, newPage: Page) {
  state.pages[newPage.id] = { ...new PageView(newPage) }
  const parentId = newPage.parentId
  const parent = parentId && state.pages[parentId]
  if (parent && !parent.children.includes(newPage.id)) {
    parent.children.push(newPage.id)
  }
}

async function setCurrentPageId({ state }: Context, id: State['currentPageId']) {
  if (id === state.currentPageId) {
    return
  }
  state.prevPageId = state.currentPageId
  state.currentPageId = id
  if (state.prevPageId && state.pages[state.prevPageId]) {
    state.pages[state.prevPageId].content = undefined
  }
}

function findPageByAnyId(
  { state }: Context,
  pageId: Page['id'] | Page['shortId'],
): PageView | undefined {
  if (!state.pages) {
    return
  }

  return isUUID(pageId)
    ? state.pages[pageId]
    : Object.values(state.pages).find(x => x.shortId === pageId)
}

async function resolveFullPageId(
  { state }: Context,
  pageId: Page['id'] | Page['shortId'],
): Promise<Page['id']> {
  if (isUUID(pageId)) {
    return pageId
  }
  const localId = state.pages && findKey(state.pages, x => x.shortId === pageId)
  if (localId) {
    return localId
  }
  const resolvedId = await api.get<Page['id']>(`page/${pageId}/full-id`)
  return resolvedId
}

async function loadCurrentPage({ state, actions }: Context) {
  const { currentPageId, pages } = state
  if (!currentPageId) {
    return
  }
  state.isPageEditingReady = false
  const page = await api.get<Page>(`page/${currentPageId}`)
  const currentValue = pages[page.id]
  const newValue = { ...new PageView({ ...currentValue, ...page }) }
  state.pages[page.id] = newValue
  actions.expandPageAncestors({ pageId: page.id })
  // To prevent memory leak clear content data of previous page
  if (state.prevPageId) {
    state.pages[state.prevPageId].content = undefined
  }
  actions.ensureCorrectWorkspaceSelected()
  if (!socket) {
    const worker = new PageSocketWorker()
    const wrapped = wrap<import('../api/pageSocket.worker').PageSocketWorker>(worker)
    await wrapped.init()
    socket = wrapped
  }
  state.isPageEditingReady = true
}

const _setTitleCache = new Map<string, (title: string) => void>()


function updateCurrentPageTitle({ state, actions }: Context, title: Page['name']) {
  const { currentPageId } = state
  if (!currentPageId || !state.pages) {
    return
  }
  // We want to debounce title changes, but debouncing should be separate for each page. So we remember the debouncing function for each page ID
  if (!_setTitleCache.has(currentPageId)) {
    _setTitleCache.set(
      currentPageId,
      debounce((title: string) => {
        if (socket) socket.setTitle({ id: currentPageId, title })
      }, 500),
    )
  }
  _setTitleCache.get(currentPageId)!(title)
  actions.setPageTitle({ pageId: currentPageId, title })
}

function setPageTitle(
  { state }: Context,
  { title, pageId }: { title: string; pageId: Page['id'] },
) {
  const page = state.pages[pageId]
  if (!page) {
    return
  }
  page.name = title
}

async function loadThemes({ state }: Context) {
  state.themes = await api.get<Theme[]>('themes')
}

async function updatePageTheme(
  { actions }: Context,
  { pageId, themeId }: { pageId: Page['id']; themeId: Page['themeId'] },
) {
  await api.put(`page/${pageId}/set-theme`, { themeId })
  actions.setPageTheme({ pageId, themeId })
}

function setPageTheme(
  { state }: Context,
  { pageId, themeId }: { pageId: Page['id']; themeId: Page['themeId'] },
) {
  const page = state.pages[pageId]
  if (page) {
    page.themeId = themeId
  }
}

function setIsPageEditingReady({ state }: Context, value: boolean) {
  state.isPageEditingReady = value
}

async function updatePageContent(
  { state, actions }: Context,
  { pageId, content }: { content: Page['content']; pageId: Page['id'] },
) {
  console.log('updatePageContent', pageId, content)
  if (!socket || !state.pages) {
    return
  }
  // This method is called on editor unmount but the page can be deleted already
  if (!state.pages[pageId]) {
    return
  }
  const updateTimeThreshold = 3000
  const socketEmit = () => socket && socket.setContent({ id: pageId, content })
  const savingId = uniqueId()
  try {
    await callbackIfExecutesLong(
      socketEmit,
      () => actions.pushPendingPageContentSavings(savingId),
      updateTimeThreshold,
    )
  } catch (e) {

    if (is404(e) || is403(e)) {
      actions.removePageFromState(pageId)
    } else {
      throw e
    }
  }
  if (state.isPageContentSaving) {
    state.pendingPageContentSavings = state.pendingPageContentSavings.filter(x => x !== savingId)
  }
}

function pushPendingPageContentSavings({ state }: Context, savingId: string) {
  state.pendingPageContentSavings.push(savingId)
}

async function updateCurrentPageContent(
  { state, actions }: Context,
  { content }: { content: Page['content'] },
) {
  const { currentPageId } = state
  if (!currentPageId) {
    return
  }
  actions.updatePageContent({ content, pageId: currentPageId })
}

function togglePageExpanded({ state }: Context, id: Page['id']) {
  if (!state.pages) {
    return
  }
  state.pages[id].isExpanded = !state.pages[id].isExpanded
}

function toggleCollaborationPageExpanded({ state }: Context, id: Page['id']) {
  if (!state.pages || !state.pages[id]) {
    return
  }
  state.pages[id].isExpanded = !state.pages[id].isExpanded
}

async function movePage(
  { state, actions }: Context,
  {
    pageId,
    newParentId,
    newPosition,
    updatedItems,
  }: {
    pageId: Page['id']
    newParentId?: Page['id']
    newPosition?: number
    updatedItems?: PagesTree['items']
  },
) {
  if (
    (!newParentId && newPosition == null) ||
    !state.currentWorkspacePublicPagesTree ||
    !state.pages
  ) {
    return
  }
  const prevStatePages = state.pages
  if (updatedItems) {
    state.pages = { ...state.pages, ...updatedItems }
  }
  try {
    const updatedPage = await api.post(`page/${pageId}/move`, {
      parentId: newParentId || state.pages[pageId].parentId,
      position: newPosition,
    })
    state.pages[pageId] = new PageView({ ...state.pages[pageId], ...updatedPage })
  } catch (e) {
    console.error('Error moving tree item', e)
    state.pages = prevStatePages
    return
  }
  if (state.currentPageId === pageId && newParentId && !state.pages[newParentId].isExpanded) {
    actions.expandPageAncestors({ pageId })
    actions.fetchStylesProviderAncestor(state.currentPageId)
  }
}

async function movePageToWorkspace(
  { state, actions }: Context,
  { pageId, workspaceId }: { pageId: Page['id']; workspaceId: Workspace['id'] },
) {
  const page = state.pages[pageId]
  if (!page) {
    return
  }
  const { newParent, oldParent, updatedPage } = await api.post<{
    newParent: Page
    updatedPage: Page
    oldParent: Page
  }>(`page/${pageId}/move-to-workspace`, { workspaceId })
  if (state.currentPage?.mpath.includes(pageId)) {
    history.push('/')
  }

  state.pages[oldParent.id] = new PageView(oldParent)
  state.pages[newParent.id] = new PageView(newParent)
  state.pages[pageId] = new PageView(updatedPage)
}

async function deletePage({ state, actions }: Context, pageId: Page['id']) {
  await api.delete(`page/${pageId}`)
  actions.removePageFromState(pageId)
}

function removePageFromState({ state }: Context, pageId: Page['id']) {
  if (!state.pages) {
    return
  }
  const isCurrentPage = state.currentPageId === pageId
  const currentPage = state.currentPage
  const deletingPage = state.pages[pageId]
  if (!deletingPage) {
    return
  }
  const isCurrentPageParentDeleting =
    !isCurrentPage && currentPage && deletingPage && currentPage.mpath.includes(deletingPage.id)
  if (isCurrentPage || isCurrentPageParentDeleting) {
    history.replace('/')
  }
  const { parentId } = state.pages[pageId]
  if (parentId) {
    state.pages[parentId].children = state.pages[parentId].children.filter(x => x !== pageId)
  }
  delete state.pages[pageId]
}

async function fetchStylesProviderAncestor({ state }: Context, pageId: Page['id']) {
  if (!state.pages) {
    return
  }
  const ancestor = await api.get<Page | null>(`page/${pageId}/styles-provider-ancestor`)

  if (!ancestor) {
    return
  }

  state.pages[ancestor.id] = {
    ...(state.pages[ancestor.id] || {}),
    ...ancestor,
  }
}

function resetIsPageContentSaving({ state }: Context) {
  state.pendingPageContentSavings = []
}

function removePagesOfWorkspaceFromState({ state }: Context, workspaceId: Workspace['id']) {
  if (state.currentPage && state.currentPage.workspaceId === workspaceId) {
    history.push('/')
  }
  state.pages = omitBy(state.pages, x => x.workspaceId === workspaceId)
}