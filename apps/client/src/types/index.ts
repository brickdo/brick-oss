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

/// <reference types="@emotion/react/types/css-prop" />
import { Page, PublicAddress } from '@brick-shared/types'
import { Interpolation as EmotionInterpolation, Theme as EmotionTheme } from '@emotion/react'
import { Component, JSXElementConstructor, Ref } from 'react'
import { EditorProps } from '../components/Editor'

export * from './typesWithSchema'

export declare type ComponentRef<C> = C extends new (props: any) => Component
  ? C
  : (
        C extends JSXElementConstructor<{ ref?: infer R }>
          ? R
          : C extends keyof JSX.IntrinsicElements
            ? JSX.IntrinsicElements[C]['ref']
            : unknown
      ) extends Ref<infer T> | string | undefined
    ? T
    : unknown

export declare type ClientAppProps = {
  workspaces: Workspace[]
  pages: Page[]
  publicAddresses: PublicAddress[]
}

export const enum UserAuthProvider {
  github = 'github',
  google = 'google',
  demo = 'demo',
  local = 'local',
}

export type User = {
  id: string
  name: string
  email: string
  subscriptionPlan: string | null
  customerId: string | null
  isAgreedMailing: boolean
  periodicBackups: boolean
  provider: UserAuthProvider
}

export type Workspace = {
  name: string
  id: string
  collaborationInviteIds: string[]
  acceptedCollaborationInvites: {
    workspaceId: Workspace['id']
    userId: User['id']
    inviteId: string
    user: Pick<User, 'email' | 'id' | 'name'>
  }[]
  /**
   * Workspace owner id
   */
  userId: string
  ownerSubscriptionLimits?: {
    numberOfDomains: number
    numberOfSubdomains: number
  }
  publicRootPageId: string
  privateRootPageId: string
}

/**
 * This type corresponds to what we get from the server. It is not the same as the `@brick/themes` Theme type -- it also includes screenshot URLs.
 */
export type Theme = {
  id: string
  name: string
  content: string
  screenshotUrl?: string
}

export type Invoice = {
  nextPaymentDate: number
  amount: number
}

export type EditorService = {
  pageId?: Page['id']
  editorInstance: any
  getContent: () => string
  onChange: EditorProps['onChange']
}

export type EmotionCSS = EmotionInterpolation<EmotionTheme>