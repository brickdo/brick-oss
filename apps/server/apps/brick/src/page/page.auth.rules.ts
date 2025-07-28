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

export enum UserPageRole {
  owner = 'owner',
  pageCollaborator = 'pageCollaborator',
  workspaceCollaborator = 'workspaceCollaborator',
  guest = 'guest',
}

export type PageAction =
  | 'getPage'
  | 'createPage'
  | 'deletePage'
  | 'movePage'
  | 'movePageToWorkspace'
  | 'setTitle'
  | 'setTheme'
  | 'setStyles'
  | 'setContent'
  | 'setCustomLink'
  | 'createPageInvite'
  | 'updatePublicAddress'
  | 'getPageHeadTags'
  | 'setPageHeadTags'

export type PageAuthRules = {
  [key in PageAction]: UserPageRole | readonly UserPageRole[]
}


export const PageAuthRules: PageAuthRules = {
  getPage: [UserPageRole.owner, UserPageRole.pageCollaborator, UserPageRole.workspaceCollaborator],
  /**
   * Should check access for parentId if exists or workspace
   */
  createPage: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  deletePage: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  movePage: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  movePageToWorkspace: UserPageRole.owner,
  setTitle: [UserPageRole.owner, UserPageRole.pageCollaborator, UserPageRole.workspaceCollaborator],
  setTheme: [UserPageRole.owner, UserPageRole.pageCollaborator, UserPageRole.workspaceCollaborator],
  setStyles: [
    UserPageRole.owner,
    UserPageRole.pageCollaborator,
    UserPageRole.workspaceCollaborator,
  ],
  setContent: [
    UserPageRole.owner,
    UserPageRole.pageCollaborator,
    UserPageRole.workspaceCollaborator,
  ],
  setCustomLink: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  updatePublicAddress: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  createPageInvite: [UserPageRole.owner, UserPageRole.workspaceCollaborator],
  getPageHeadTags: [
    UserPageRole.owner,
    UserPageRole.pageCollaborator,
    UserPageRole.workspaceCollaborator,
  ],
  setPageHeadTags: [
    UserPageRole.owner,
    UserPageRole.pageCollaborator,
    UserPageRole.workspaceCollaborator,
  ],
}

export const canRolePerformPageAction = (role: UserPageRole, action: PageAction) => {
  const rule = PageAuthRules[action]
  return Array.isArray(rule) ? rule.includes(role) : role === rule
}