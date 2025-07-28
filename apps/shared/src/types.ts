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

import { TreeData } from './components/Tree'
export declare type PagesTree = TreeData<PageView>
export class Page {
  id: string
  shortId: string
  name: string
  content?: string
  parentId?: string
  mpath: string
  childrenOrder: Page['id'][]
  stylesScss?: string | null
  stylesCss?: string | null
  customLink?: string | null
  collaborationInviteIds: string[]
  themeId?: string | null
  isCollaborative?: boolean
  acceptedCollaborationInvites?: {
    pageId: string
    userId: string
    inviteId: string
  }[]
  workspaceId: string
  constructor({
    id,
    shortId,
    name,
    content,
    parentId,
    mpath,
    childrenOrder,
    stylesScss,
    stylesCss,
    customLink,
    collaborationInviteIds,
    themeId,
    acceptedCollaborationInvites,
    isCollaborative,
    workspaceId,
  }: Page) {
    this.id = id
    this.shortId = shortId
    this.name = name
    this.content = content
    this.parentId = parentId
    this.mpath = mpath
    this.childrenOrder = childrenOrder
    this.stylesScss = stylesScss
    this.stylesCss = stylesCss
    this.customLink = customLink
    this.collaborationInviteIds = collaborationInviteIds || []
    this.themeId = themeId
    this.acceptedCollaborationInvites = acceptedCollaborationInvites
    this.isCollaborative = isCollaborative
    this.workspaceId = workspaceId
  }
}

export interface IPageViewParams extends Page {
  children?: PageView['id'][]
  isExpanded?: boolean
}

export class PageView extends Page {
  children: PageView['id'][]
  isExpanded: boolean

  constructor(pageParams: IPageViewParams) {
    super(pageParams)
    this.children = pageParams.childrenOrder
    this.isExpanded = !!pageParams.isExpanded
  }
}

export type PagesTreeItems = Record<Page['id'], PageView>

export type PublicAddress = {
  id: string
  rootPageId: Page['id']
  ownerId: string
} & ({ externalDomain: string; subdomain?: never } | { externalDomain?: never; subdomain: string })

export declare type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys]