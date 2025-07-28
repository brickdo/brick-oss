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

import io, { Socket } from 'socket.io-client'
import { DeferredPromise } from '../utils'

class PageSocket {
  socket: Socket

  constructor() {
    this.socket = io('/api/pages', {
      path: '/api/socket.io',
      transports: ['websocket'],
    })
  }

  setContent = async (...args: any) => {
    const promise = new DeferredPromise()
    this.socket.emit('setContent', ...args, (response: any) => {
      if (response === 'ok') {
        promise.resolve(true)
      } else {
        promise.reject(response)
      }
    })

    return promise
  }
  setTitle = (...args: any) => {
    this.socket.emit('setTitle', ...args)
  }
}

export default PageSocket