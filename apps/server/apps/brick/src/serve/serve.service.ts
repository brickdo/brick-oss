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

import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common'
import { Response, Request } from 'express'
import { JSDOM } from 'jsdom'
import serialize from 'serialize-javascript'
import Bowser from 'bowser'
import { escape, pick } from 'lodash'
import { highlightAllUnder } from 'prismjs'
import { Cache } from 'cache-manager'
import { Page, PageCustomHeadTag } from '@app/db'
import { PageService } from '@brick/page/page.service'
import { pagesArrayToClientTree } from '@brick/utils/pagesArrayToClientTree'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { themes } from '@brick/themes'
import { publicClientServerEntry, AppProps } from '@brick/frontend/frontend.provider'
import ua from 'universal-analytics'
import { renderScss } from '@brick/lib/scss'
import { PageAnalyticsStatus } from '@brick/page/page.analytics'
import * as NodeHtmlParser from 'node-html-parser'
import loadLanguages from 'prismjs/components/'
loadLanguages([
  'markup',
  'css',
  'clike',
  'js',
  'ts',
  'ruby',
  'python',
  'diff',
  'java',
  'php',
  'c',
  'cs',
  'cpp',
  'haskell',
  'json',
  'bash',
  'yaml',
  'sql',
  'agda',
  'clojure',
  'dhall',
  'docker',
  'elm',
  'go',
  'julia',
  'kotlin',
  'latex',
  'lisp',
  'lua',
  'nix',
  'ocaml',
  'perl',
  'powershell',
  'purescript',
  'r',
  'rust',
  'scala',
  'swift',
  'toml',
])

const { renderApp } = publicClientServerEntry

const isDesktop = (userAgent?: string) => {
  if (!userAgent) return true
  return Bowser.getParser(userAgent).getPlatformType() === 'desktop'
}

@Injectable()
export class ServeService {
  private analytics: ua.Visitor

  constructor(
    private readonly pageService: PageService,
    private readonly publicAddressService: PublicAddressService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.analytics = ua('REDACTED')
  }

  async renderPage(req: Request, res: Response, page: Page) {
    const cache = await this.cacheManager.get(page.id)
    if (cache) {
      res.send(cache)
      return
    }
    const pageAndRelatives = await this.pageService.getPageAndRelatives(page.id, {
      excludeColumns: ['workspaceId', 'content'],
    })
    const tree = pagesArrayToClientTree(pageAndRelatives, page.id)
    const ancestors = page.mpath.split('.').filter(Boolean).slice(0, -1)
    const pagePublicAddress = await this.publicAddressService.findOne({
      rootPageId: ancestors[0] || page.id,
    })
    const ancestorsStyles = ancestors.map(id => tree.items[id]?.stylesScss).filter(Boolean)
    const firstFoundAncestorStyle = ancestorsStyles.slice(-1)[0]
    const pageStylesScss = page.stylesScss || firstFoundAncestorStyle || null
    const pageStylesCss = renderScss(pageStylesScss)
    const ancestorsThemeId = ancestors.map(id => tree.items[id]?.themeId).filter(Boolean)[0]
    const themeId = page.themeId || ancestorsThemeId
    const themeCss = (themeId && themes.find(x => x.id === themeId)?.content) || null

    // Ancestors comes in order from distant to closest, so html tags come in right order too
    const ancestorsHeadTags = ancestors
      .map(id => tree.items[id]?.renderCustomizations?.headTags)
      .filter(Boolean)
      .flat()
      .filter(tag => tag!.isInheritable) as PageCustomHeadTag[]

    const pageHeadTags = [...ancestorsHeadTags, ...(page?.renderCustomizations?.headTags || [])]
      .map(tag => tag.content)
      .filter(Boolean)
      .filter(x => NodeHtmlParser.valid(x))

    const pageHeadTagsString = pageHeadTags.join('')

    let content = page.content
    if (content) {
      const dom = new JSDOM(content)
      highlightAllUnder.call(dom, dom.window.document.body)
      content = dom.window.document.body.innerHTML.toString()
    }
    const props: AppProps = {
      id: page.id,
      title: page.name,
      tree,
      content: content || '',
      publicAddress:
        pagePublicAddress && pick(pagePublicAddress, ['externalDomain', 'subdomain', 'rootPageId']),
      isMobileInitial: !isDesktop(req.headers['user-agent']),
    }
    const { app, materialUiCss } = renderApp(props)
    const pageContentDescription = await this.pageService.pageContentToText(page.content)
    const canonicalLink = await this.pageService.getPageCanonicalLink(page)
    const analyticsStatus = await this.pageService.getPageAnalyticsStatus(page.id)
    if (analyticsStatus === PageAnalyticsStatus.serverSide) {
      // All available params: https://github.com/peaksandpies/universal-analytics/blob/HEAD/AcceptableParams.md
      this.analytics
        .pageview(
          {
            documentLocationUrl: canonicalLink,
            documentTitle: page.name,
            ...(req.headers.referer && {
              documentReferrer: req.headers.referer,
            }),
          },
          err => {
            if (err) console.error('Google Analytics call failed', err)
          },
        )
        .send()
    }
    const twitterSocialCard = `
      <meta name="twitter:card" content="summary">
      <meta name="twitter:title" content="${escape(page.name)}">
      <meta name="twitter:description" content="${escape(pageContentDescription)}">
    `
    const openGraphSocialCard = `
      <meta name="og:title" content="${escape(page.name)}">
      <meta name="og:description" content="${escape(pageContentDescription)}">
    `

    const originaLinkTags = `
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/logo192.png" />
      <link rel="manifest" href="/manifest.json" />
    `

    const metaTags = `
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      ${twitterSocialCard}
      ${openGraphSocialCard}
      <meta name="description" content="${escape(pageContentDescription)}" />
    `

    const userReplacableTags = `
      ${originaLinkTags}
      ${metaTags}
      <title>${escape(page.name)}</title>
    `

    const tagsMergedWithPageTags = this.mergeTags(userReplacableTags, pageHeadTagsString)

    res.render(
      'index',
      {
        head: `
        <link rel="canonical" href="${canonicalLink}" />
        ${tagsMergedWithPageTags}
        <style id="material-ui-server-side"> ${materialUiCss} </style>
        ${themeCss ? `<style> ${themeCss} </style>` : ''}
        ${pageStylesCss ? `<style> ${pageStylesCss} </style>` : ''}
        <script>window.__INITIAL_PROPS__ = ${serialize(props)} </script>
      `,
        enableAnalytics: analyticsStatus === PageAnalyticsStatus.clientSide,
        prerendered: app,
      },
      (err, html) => {
        if (err) {
          throw err
        }
        res.send(html)
        this.cacheManager.set(page.id, html, { ttl: 2.5 }).catch(e => {
          throw e
        })
      },
    )
  }

  mergeTags(original: string, merge: string) {
    const originalDom = NodeHtmlParser.parse(original)
    const mergeDom = NodeHtmlParser.parse(merge)

    const replaceTagsOnSameAttribute = (tagName: string, attributeName: string) => {
      const mergeTags = mergeDom.querySelectorAll(tagName)
      mergeTags.forEach(mergeTag => {
        const attributeValue = mergeTag.getAttribute(attributeName)!
        const originalSameTag = originalDom.querySelector(
          `${tagName}[${attributeName}="${attributeValue}"]`,
        )
        if (originalSameTag) {

          originalSameTag.replaceWith(mergeTag)
          // Removes from mergeDom but does not change mergeTags array
          mergeTag.remove()
        }
      })
    }
    // Merge meta tags with same "name" attribute
    replaceTagsOnSameAttribute('meta', 'name')
    // Merge meta tags with same "rel" attribute
    replaceTagsOnSameAttribute('link', 'rel')

    // Merge title tag
    const mergeTitle = mergeDom.querySelector('title')
    const originalTitle = originalDom.querySelector('title')
    if (mergeTitle && originalTitle) {
      originalTitle.replaceWith(mergeTitle)
      mergeTitle.remove()
    }

    originalDom.appendChild(mergeDom)

    return originalDom.toString()
  }
}