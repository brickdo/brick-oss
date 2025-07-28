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

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { BadRequestException, UseGuards } from '@nestjs/common'
import { WsJwtGuard } from '@brick/auth/ws.auth.guard'
import { PageService } from './page.service'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { User } from '@app/db'
import { Request, Response } from 'express'

@UseGuards(WsJwtGuard)
@WebSocketGateway(Number(process.env.WEBSOCKET_PORT), {
  path: '/api/socket.io',
  namespace: 'api/pages',
  transports: ['websocket'],
  handlePreflightRequest: function (req: Request, res: Response) {
    const headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-token',
      'Access-Control-Allow-Credentials': true,
    }
    // @ts-ignore

    res.writeHead(200, headers)
    res.send()
  },
})
export class PageGateway {
  @WebSocketServer()
  server: Server
  constructor(
    private readonly pageService: PageService,
    private logger: MyLoggerService,
  ) {
    logger.setContext('PageSocketGateway')
  }

  @SubscribeMessage('setContent')
  async setContent(@MessageBody() data: any, @ConnectedSocket() client: Socket & { user: User }) {
    try {
      const { id, content } = data
      const { user } = client
      try {
        await this.pageService.authorizePageAction(id, user.id, 'setContent')
      } catch (e) {
        this.logger.warn('Unauthorized set page content', { user, data })
        throw e
      }
      const isRootPage = await this.pageService.checkIsRootPage(id)
      if (isRootPage) {
        throw new BadRequestException('Root page does not have content')
      }
      await this.pageService.updatePageContent(id, content)
    } catch (e) {
      this.logger.error('Error updating page', { error: e })
      return e
    }
    return 'ok'
  }

  @SubscribeMessage('setTitle')
  async setTitle(@MessageBody() data: any, @ConnectedSocket() client: Socket & { user: User }) {
    const { id, title } = data
    const { user } = client
    try {
      await this.pageService.authorizePageAction(id, user.id, 'setTitle')
    } catch (e) {
      this.logger.warn('Unauthorized set page title', { user, data })
      throw e
    }
    const isRootPage = await this.pageService.checkIsRootPage(id)
    if (isRootPage) {
      throw new BadRequestException('Cant change root page titile')
    }
    await this.pageService.setPageTitle(id, title)
  }
}