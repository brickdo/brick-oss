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

import api from '@brick-shared/api'
import { setSupportChatUserInfo } from '../support-chat'
import history from '../router/history'
import { User } from '../types'
import { Context } from '.'

type UserState = {
  user: null | User
}

const state: UserState = {
  user: null,
}

const actions = {
  fetchUser,
  requestEmailChange,
  updateUser,
  logout,
}

export { state, actions }

async function fetchUser({ state, actions }: Context) {
  try {
    state.user = await api.get<User>('profile')
    await setSupportChatUserInfo(state.user)
    await actions.loadUserSubscriptionInfo()
    await actions.initializeWorkspacesAndPages()
    await actions.initGeneralSocket()
  } catch (e) {
    if (e?.response?.status !== 401) {
      throw e
    }
  }
}

async function updateUser({ state }: Context, updateParams: Partial<User>) {
  if (!state.user) {
    return
  }
  const previousValues = { ...state.user }
  Object.assign(state.user, updateParams)
  try {
    await api.put('profile/update', updateParams)
  } catch (e) {
    console.error(e)
    state.user = previousValues
  }
}

async function logout() {
  await api.get('auth/logout')
  window.HelpCrunch?.('logout', (data: any) => {
    if (!data || !data.success) {
      console.error('Live chat logout error:', data)
    }
  })
  history.push('/')
  window.location.reload()
}

async function requestEmailChange({ state }: Context, newEmail: string) {
  await api.post('profile/request-email-change', { email: newEmail })
}