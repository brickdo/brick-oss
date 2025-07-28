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

import { CSSProperties } from 'react'
import Breadcrumbs, { BreadcrubItemProps } from './Breadcrumbs'
import { getPageCanonicalPath } from '../utils/pageLink'
import { PagesTreeItems, PublicAddress, PageView } from '@brick-shared/types'

interface Props {
  pages: PagesTreeItems
  currentPageId: string
  publicAddresses?: PublicAddress[]
  isApp?: boolean
  breadcrumbsContainerStyle?: CSSProperties
}

function TreeBreadcrumbs({
  pages,
  currentPageId,
  isApp,
  publicAddresses,
  breadcrumbsContainerStyle,
}: Props) {
  const currentPage = pages[currentPageId]
  if (!currentPage) {
    return null
  }
  const currentPageMpathItems = currentPage.mpath.split('.').filter(Boolean)
  const isCurrentPageTopLevel = currentPageMpathItems.length <= 1
  if (isCurrentPageTopLevel) {
    return null
  }

  const currentPageAncestors = getPageAncestors(pages, currentPageId)
  const breadcrumbPages = [...currentPageAncestors, currentPage]
  const breadcrumbItems: BreadcrubItemProps[] = breadcrumbPages.map((x, index) => {
    const topLevelAncestorId = x.mpath.split('.').filter(Boolean)[0]
    const pagePublicAddress =
      publicAddresses && publicAddresses.find(x => x.rootPageId === topLevelAncestorId)
    return {
      id: x.id,
      text: x.name,
      link:
        x.id === currentPageId
          ? undefined
          : isApp
            ? `/${x.shortId}`
            : `/${getPageCanonicalPath(x.id, pages, pagePublicAddress)}`,
    }
  })

  return (
    <Breadcrumbs
      items={breadcrumbItems}
      isApp={isApp}
      style={breadcrumbsContainerStyle}
      className='p-2'
    />
  )
}

export default TreeBreadcrumbs

function getPageAncestors(pages: PagesTreeItems, itemId: string): PageView[] {
  const result = []

  let currentItem: PageView | undefined | '' = pages[itemId]
  while (currentItem) {
    const { parentId } = currentItem as PageView
    currentItem = parentId && pages[parentId]
    if (currentItem && currentItem.mpath) {
      result.unshift(currentItem)
    }
  }

  return result
}