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

import { Controller, Get, Res, UseGuards, Req, Next, NotFoundException } from '@nestjs/common'
import isUUID from 'validator/lib/isUUID'
import serialize from 'serialize-javascript'
import { resolve } from 'node:path'
import { Response, Request, NextFunction } from 'express'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { PageService } from '@brick/page/page.service'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { User, Workspace, Page } from '@app/db'
import { redirectHome } from '@brick/utils/redirectHome'
import { clientBuildPath } from '@brick/frontend/frontend.provider'
import { ServeService } from './serve.service'
import fs from 'node:fs'
import injectHTML from 'node-inject-html'
import { extractShortPageId } from '@brick/utils/randomId'
import { ClientAppInitialProps, FrontendService } from '@brick/frontend/frontend.service'
import { canRolePerformPageAction } from '@brick/page/page.auth.rules'
import { AuthenticatedRequest } from '@brick/types'



const appHost = process.env.PUBLICVAR_BRICK_HOST

const clientIndexHtmlName = 'index.html'
const clientPath = resolve(clientBuildPath, clientIndexHtmlName)
const clientHtml = fs.readFileSync(clientPath).toString()
const serveClientAppMiddleware = (
  req: Request,
  res: Response,
  props: ClientAppInitialProps | null,
) => {
  const html = injectHTML(clientHtml, {
    headEnd: `<script>window.__INITIAL_PROPS__ = ${serialize(props)} </script>`,
  })
  res.send(html)
}

/**
 * Serves client. Should be put in in AppModule Controllers parameter to
 */
@UseGuards(new JwtAuthGuard(false))
@Controller()
export class ServeController {
  constructor(
    private readonly serveService: ServeService,
    private readonly pageService: PageService,
    private readonly publicAddressService: PublicAddressService,
    private readonly frontendService: FrontendService,
  ) {}

  @Get('*')
  async getAppClient(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const requestHost = req.headers.host || ''

    const isAppRequest = requestHost === appHost
    const isSubdomainAppRequest = new RegExp(`.*\\.${appHost}$`).test(requestHost)
    const isPageSubdomainAppRequest = new RegExp(`page\\.${appHost}$`).test(requestHost)
    const isExternalHostRequest = !requestHost.endsWith(appHost)

    // "brick.do/*" requests
    if (isAppRequest) {
      console.log('isAppRequest')
      await this.handleAppRequest(req, res, next)
      return
    }

    // "page.brick.do/*"" requests
    if (isPageSubdomainAppRequest) {
      await this.handlePageSubdomainRequest(req, res, next)
      return
    }

    // "*.brick.do/*"" requests
    if (isSubdomainAppRequest) {
      await this.handleSubdomainRequest(req, res, next)
      return
    }

    // "somehost.com" (external) requests
    if (isExternalHostRequest) {
      await this.handleExternalHostRequest(req, res, next)
      return
    }
  }

  getPageIdFromRequest(req: Request): string | null {
    const requestPathParts = req.path.split('/').filter(Boolean)
    const part = requestPathParts[0]
    return requestPathParts.length === 1 ? (isUUID(part) ? part : extractShortPageId(part)) : null
  }

  // getPageLinkFromRequest('http://brick.do/blah?x=a#section-1', {scheme: 'keep'}) === 'http://brick.do/blah'
  // getPageLinkFromRequest('http://brick.do/blah?x=a#section-1', {scheme: 'forceHttps'}) === 'https://brick.do/blah'
  //
  // Use 'forceHttps' if TLS termination is done by the reverse proxy.
  getPageLinkFromRequest = (req: Request, options: { scheme: 'keep' | 'forceHttps' }) => {
    const protocol = options.scheme === 'forceHttps' ? 'https' : req.protocol
    return `${protocol}://${req.get('Host')!}${this.trimTrailingSlash(req.path)}`
  }

  trimTrailingSlash = (str: string) => str.replace(/\/$/, '')

  async handleAppRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const serveClientApp = (props: ClientAppInitialProps) =>
      serveClientAppMiddleware(req, res, props)
    const { user } = req
    const requestPageId = this.getPageIdFromRequest(req)
    const getAppInitalProps = () =>
      user.id ? this.frontendService.getAppInitialProps({ userId: user.id }) : null

    if (!requestPageId) {
      const props = await getAppInitalProps()
      serveClientApp(props)
      return
    }

    // Try catch is required because "getPageIdByShortId" throws NotFoundException
    // and we want to redirect user to home if page not found, but not send error message
    let requestPageFullId
    try {
      requestPageFullId = isUUID(requestPageId)
        ? requestPageId
        : await this.pageService.getPageIdByShortId(requestPageId).catch()
    } catch (e: any) {
      if (e?.status !== 404) {
        throw e
      }
    }

    const page =
      requestPageFullId &&
      (await this.pageService.getPageById(requestPageFullId, {
        relations: ['workspace'],
      }))

    if (!page) {
      redirectHome(res)
      return
    }

    const role = await this.pageService.getUserPageRole({
      userId: user.id,
      pageId: page.id,
    })
    const canEdit = canRolePerformPageAction(role, 'setContent')
    if (canEdit) {
      const props = await getAppInitalProps()
      serveClientApp(props)
    } else {
      const isPrivatePage = await this.pageService.checkIsPrivatePage(page.id)
      if (isPrivatePage) {
        redirectHome(res)
        return
      }
      res.redirect(await this.pageService.getPageCanonicalLink(page))
    }
  }

  async handlePageSubdomainRequest(req: Request, res: Response, next: NextFunction) {
    const requestPageId = this.getPageIdFromRequest(req)

    if (!requestPageId) {
      redirectHome(res)
      return
    }

    // Try catch is required because "getPageIdByShortId" throws NotFoundException
    // and we want to redirect user to home if page not found, but not send error message
    let requestPageFullId
    try {
      requestPageFullId = isUUID(requestPageId)
        ? requestPageId
        : await this.pageService.getPageIdByShortId(requestPageId).catch()
    } catch (e: any) {
      if (e?.status !== 404) {
        throw e
      }
    }

    const page =
      requestPageFullId &&
      (await this.pageService.getPageById(requestPageFullId, {
        relations: ['workspace'],
      }))
    if (!page) {
      redirectHome(res)
      return
    }

    const isPrivatePage = await this.pageService.checkIsPrivatePage(page.id)
    if (isPrivatePage) {
      redirectHome(res)
      return
    }

    const canonicalLink = await this.pageService.getPageCanonicalLink(page)
    // The reverse proxy does TLS termination for us, so we want to use 'forceHttps'.
    // Otherwise the page link will always start with 'http://' and we will always do a redirect.
    if (this.getPageLinkFromRequest(req, { scheme: 'forceHttps' }) !== canonicalLink) {
      res.redirect(canonicalLink)
      return
    }

    await this.serveService.renderPage(req, res, page)
  }

  async handleSubdomainRequest(req: Request, res: Response, next: NextFunction) {
    const requestHost = req.headers.host || ''
    const requestSubdomains = requestHost.split('.')
    const subdomainsNumber = requestSubdomains.length
    if (subdomainsNumber > 3) {
      redirectHome(res)
      return
    }

    const subdomainName = requestSubdomains[0]
    const publicAddress = await this.publicAddressService.findOne({
      subdomain: subdomainName,
    })

    const requestPathParts = req.path.split('/').filter(Boolean)
    const isRootRequest = !requestPathParts.length
    if (isRootRequest && !publicAddress) {
      redirectHome(res)
      return
    }

    const requestPagePath = requestPathParts.slice(-1)[0]

    const isRequestPagePathID =
      requestPagePath && (isUUID(requestPagePath) || extractShortPageId(requestPagePath))
    if (!isRequestPagePathID && !publicAddress) {
      redirectHome(res)
      return
    }

    const page = await this.pageService.findPublicAddressPageByPath(
      publicAddress!,
      this.trimTrailingSlash(req.path),
    )
    if (!page) {
      if (!publicAddress) {
        redirectHome(res)
        return
      }
      throw new NotFoundException()
    }
    const isPrivatePage = await this.pageService.checkIsPrivatePage(page.id)
    if (isPrivatePage) {
      redirectHome(res)
      return
    }
    const canonicalLink = await this.pageService.getPageCanonicalLink(page)
    // The reverse proxy does TLS termination for us, so we want to use 'forceHttps'.
    // Otherwise the page link will always start with 'http://' and we will always do a redirect.
    if (this.getPageLinkFromRequest(req, { scheme: 'forceHttps' }) !== canonicalLink) {
      res.redirect(canonicalLink)
      return
    }

    await this.serveService.renderPage(req, res, page)
  }

  async handleExternalHostRequest(req: Request, res: Response, next: NextFunction) {
    const requestHost = req.headers.host
    const publicAddress = await this.publicAddressService.findOne({
      externalDomain: requestHost,
    })

    if (!publicAddress) {
      redirectHome(res)
      return
    }

    const page = await this.pageService.findPublicAddressPageByPath(
      publicAddress,
      this.trimTrailingSlash(req.path),
    )
    if (!page) {
      throw new NotFoundException()
    }
    const isPrivatePage = await this.pageService.checkIsPrivatePage(page.id)
    if (isPrivatePage) {
      redirectHome(res)
      return
    }

    // We've decided we don't want to allow links like bobsite.com/<id> to ever redirect to
    // janesite.com/<id> — this could let Jane fool people into thinking Bob is hosting
    // objectionable content
    const pageRootAncestorId = page.mpath.split('.').filter(Boolean)[0]
    const isPageFromAnotherPublicAddress = publicAddress.rootPageId !== pageRootAncestorId
    if (isPageFromAnotherPublicAddress) {
      throw new NotFoundException()
    }

    const canonicalLink = await this.pageService.getPageCanonicalLink(page)
    // For external hosts, the reverse proxy doesn't do TLS termination so we don't want to use 'forceHttps'.
    if (this.getPageLinkFromRequest(req, { scheme: 'keep' }) !== canonicalLink) {
      res.redirect(canonicalLink)
      return
    }

    await this.serveService.renderPage(req, res, page)
  }
}