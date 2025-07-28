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

import { isNumber } from 'lodash'
import { useState } from 'react'
import { useMount } from 'react-use'
import { User } from '../types'

const isProduction = process.env.NODE_ENV === 'production'

export async function setSupportChatUserInfo(user: User) {
  if (!isProduction || !window.HelpCrunch) {
    return
  }
  window.HelpCrunch('userAuth', {
    email: user.email,
    name: user.name,
    user_id: user.id,
  })
}

export function openSupportChat() {
  window.HelpCrunch?.('openChat')
}

export function useUnreadChats() {
  const [unreadChats, setUnreadChats] = useState(0)

  useMount(() => {
    window.HelpCrunch?.('onNewUnreadChat', (event: any) => {
      if (isNumber(event.unreadChats)) {
        setUnreadChats(event.unreadChats)
      }
    })

  })

  return unreadChats
}