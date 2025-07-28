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

import { PagesTree, PageView, PublicAddress } from '@brick-shared/types'
import slugify from '@sindresorhus/slugify'

const getPageIdWithSlug = (page: PageView) => {
  const pageSlug = slugify(page.name)
  return pageSlug + (pageSlug ? '-' : '') + page.shortId
}

const getPagePathItem = (page: PageView) => page.customLink || getPageIdWithSlug(page)

function getPageCanonicalLink(
  pageId: PageView['id'],
  pages: PagesTree['items'],
  pagePublicAddress?: PublicAddress,
) {
  const appHost = (globalThis.window && globalThis.window.location.host) || 'brick.do'
  const host = pagePublicAddress
    ? pagePublicAddress.externalDomain || `${pagePublicAddress.subdomain}.${appHost}`
    : `page.${appHost}`
  const path = getPageCanonicalPath(pageId, pages, pagePublicAddress)

  return `https://${host}${path ? `/${path}` : ''}`
}

function getPageCanonicalPath(
  pageId: PageView['id'],
  pages: PagesTree['items'],
  pagePublicAddress?: PublicAddress,
) {
  const page = pages[pageId]
  if (!page) {
    throw new Error(`Can't find page in tree to form canonical path`)
  }

  if (!pagePublicAddress) {
    return getPageIdWithSlug(page)
  }

  const ancestorsIds = page.mpath.split('.').filter(Boolean).slice(0, -1)
  const isPageRoot = !ancestorsIds.length
  if (isPageRoot) {
    return ''
  }

  const nonRootAncestors = ancestorsIds.slice(1).map(id => pages[id])

  if (!page.customLink && !nonRootAncestors.some(x => x.customLink)) {
    return getPageIdWithSlug(page)
  }

  const pathItems = [...nonRootAncestors, page].map(getPagePathItem)

  return pathItems.join('/')
}

export { getPageCanonicalLink, getPageCanonicalPath }