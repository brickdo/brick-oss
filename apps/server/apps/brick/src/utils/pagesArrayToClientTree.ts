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

import { orderBy, keyBy, Dictionary, omit } from 'lodash'
import { Page } from '@app/db'

const treeRootId = '1' as const

const splitPageMpaths = (mpath: Page['mpath']) => mpath.split('.').filter(Boolean)

type ClientPageView = Omit<Page, 'children' | 'isTopLevelPage'> & {
  children: string[]
  isExpanded: boolean
}

type ClientTree = {
  1: { id: '1'; children: string[]; isExpanded: boolean }
  [id: string]: Partial<ClientPageView>
}

// Clear page data which should not be provided during public client render
const clearSensitivePageData = (page: ClientPageView) => {
  const isRootPage = splitPageMpaths(page.mpath).length === 1

  return omit(
    {
      ...page,
      parentId: isRootPage ? treeRootId : page.parentId,
      history: [],
    },
    ['history', 'collaborationInviteIds', 'acceptedCollaborationInvites', 'workspaceId'],
  )
}

export function pagesArrayToClientTree(dataset: Page[], selectedPage: Page['id']) {
  const rootPageId = orderBy(dataset, x => x.mpath.length)[0].id
  const datasetHash = keyBy(dataset, 'id')
  // We don't want to expand all pages — the tree would be too huge. We expand the root page and *fully* expand the
  // immediate child of the root page that the 'selectedPage' belongs to.
  const childToExpand = splitPageMpaths(datasetHash[selectedPage].mpath)[1]
  const shouldBeExpanded = (id: Page['id']) =>
    id === rootPageId || !!(childToExpand && datasetHash[id].mpath.includes(childToExpand))
  const pages = dataset
    .map(x => ({
      ...x,
      children: x.childrenOrder,
      isExpanded: shouldBeExpanded(x.id),
    }))
    .map(clearSensitivePageData)

  const pagesHash = keyBy(pages, 'id')

  const items: ClientTree = {
    [treeRootId]: {
      id: treeRootId,
      children: [rootPageId],
      isExpanded: true,
    },
    ...pagesHash,
  }

  return {
    rootId: treeRootId,
    items,
  }
}