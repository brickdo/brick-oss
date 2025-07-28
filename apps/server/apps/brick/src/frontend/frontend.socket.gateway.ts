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
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { forwardRef, Inject, UseGuards } from '@nestjs/common'
import { WsJwtGuard } from '@brick/auth/ws.auth.guard'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { Page, User, Workspace } from '@app/db'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { PageService } from '@brick/page/page.service'
import { Request, Response } from 'express'

export type FrontendSocketClient = {
  socket: Socket
  user: User
  workspaces: Workspace[]
}

export enum FrontendSocketEvent {
  pageCreated = 'page created',
  pageDeleted = 'page deleted',
  pageTitleUpdated = 'page title updated',
  pageStylesUpdated = 'page styles updated',
  pageThemeUpdated = 'page theme updated',
  pageAccessRemoved = 'page access removed',
  workspacePagesStructureChanged = 'workspace pages structure changed',
  workspaceDeleted = 'workspace deleted',
  workspaceAccessRemoved = 'workspace access removed',
}

const getWorkspaceRoom = (workspaceId: Workspace['id']) => `workspace/${workspaceId}`

@UseGuards(WsJwtGuard)
@WebSocketGateway(Number(process.env.WEBSOCKET_PORT), {
  path: '/api/socket.io',
  namespace: 'api/frontend',
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
export class FrontendSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server
  clients: FrontendSocketClient[] = []

  constructor(
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => PageService))
    private readonly pageService: PageService,
    private readonly wsJwtGuard: WsJwtGuard,
    private logger: MyLoggerService,
  ) {
    logger.setContext('FrontendSocketGateway')
  }

  emitToWorkspaceRoom<T extends string>(workspaceId: Workspace['id'], event: T, ...args: any[]) {
    this.server.to(getWorkspaceRoom(workspaceId)).emit(event, ...args)
  }

  async handleConnection(@ConnectedSocket() socket: Socket & { user: User }) {
    const isUserVerified = await this.wsJwtGuard.authClient(socket)
    if (!isUserVerified) {

      // https://github.com/nestjs/nest/issues/882
      socket.disconnect(true)
      return
    }
    const { user } = socket
    const userWorkspaces = await this.workspaceService.getCollabAndOwnByUserId(socket.user.id)
    this.clients.push({
      socket,
      user,
      workspaces: userWorkspaces,
    })
    await Promise.all(userWorkspaces.map(w => socket.join(getWorkspaceRoom(w.id))))
    console.log('Client connect')
    socket.emit('Connection', 'Succesfull connection')
  }

  async handleDisconnect(@ConnectedSocket() socket: Socket & { user: User }) {
    // Handle connection does not support AuthGuards so socket will not have user property. We should execute auth manually
    this.clients = this.clients.filter(x => x.socket !== socket)
    console.log('Client disconnect')
    socket.emit('Connection', 'Succesfull disconnection')
  }

  async handleCreatePage({ page }: { page: Page; workspace: Workspace }) {
    this.emitToWorkspaceRoom(page.workspaceId, FrontendSocketEvent.pageCreated, page)
  }

  async handlePageTitleUpdated({
    pageId,
    workspaceId,
    title,
  }: {
    pageId: Page['id']
    title: string
    workspaceId: Workspace['id']
  }) {
    this.emitToWorkspaceRoom(workspaceId, FrontendSocketEvent.pageTitleUpdated, {
      pageId,
      title,
    })
  }

  async handleDeletePage({
    pageId,
    workspaceId,
  }: {
    pageId: Page['id']
    workspaceId: Workspace['id']
  }) {
    this.emitToWorkspaceRoom(workspaceId, FrontendSocketEvent.pageDeleted, pageId)
  }

  // Used when page is moved. Including the case when page is moved to another workspace,
  // in that case not simply delete page for user but change structure because user can have access to new workspace too
  async handleWorkspacesPagesStructureChanged({
    workspaceIds,
  }: {
    workspaceIds: Workspace['id'][]
  }) {
    const workspaces = (
      await Promise.all(workspaceIds.map(async id => await this.workspaceService.getById(id)))
    ).filter(Boolean) as Workspace[]

    if (!workspaces.length) {
      return
    }
    await Promise.all(
      workspaces.map(async w => {
        const newPagesStructure = await this.pageService.getWorkspacePagesInfo(w)
        this.emitToWorkspaceRoom(
          w.id,
          FrontendSocketEvent.workspacePagesStructureChanged,
          newPagesStructure,
        )
      }),
    )
  }

  async handleWorkspaceDeleted(workspaceId: Workspace['id']) {
    this.emitToWorkspaceRoom(workspaceId, FrontendSocketEvent.workspaceDeleted, workspaceId)
  }

  async handleWorkspaceAccessRemoved({
    workspaceId,
    userId,
  }: {
    workspaceId: Workspace['id']
    userId: User['id']
  }) {
    const client = this.clients.find(x => x.user.id === userId)
    if (!client) {
      return
    }

    client.socket.emit(FrontendSocketEvent.workspaceAccessRemoved, workspaceId)
  }

  async handlePageAccessRemoved({ pageId, userId }: { pageId: Page['id']; userId: User['id'] }) {
    const client = this.clients.find(x => x.user.id === userId)
    if (!client) {
      return
    }

    client.socket.emit(FrontendSocketEvent.pageAccessRemoved, pageId)
  }

  async handleStylesUpdate({
    pageId,
    workspaceId,
    css,
    scss,
  }: {
    pageId: Page['id']
    workspaceId: Workspace['id']
    css: string
    scss: Page['stylesScss'] | null
  }) {
    this.emitToWorkspaceRoom(workspaceId, FrontendSocketEvent.pageStylesUpdated, {
      pageId,
      css,
      scss,
    })
  }

  async handleThemeUpdate({
    pageId,
    workspaceId,
    themeId,
  }: {
    pageId: Page['id']
    workspaceId: Workspace['id']
    themeId: Page['themeId']
  }) {
    this.emitToWorkspaceRoom(workspaceId, FrontendSocketEvent.pageThemeUpdated, {
      pageId,
      themeId,
    })
  }




}