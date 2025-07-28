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

import { resolve, join } from 'node:path'


type PageProps = {
  id: string
  canonicalLink: string
  title?: string
  content?: string
  stylesCss?: string
  themeCss?: string | null
}

export type AppProps = {
  tree: any
  content: string
  publicAddress?: any
  isMobileInitial?: boolean
} & Pick<PageProps, 'id' | 'title'>

const { CLIENT_BUILD_PATH, PUBLIC_CLIENT_BUILD_PATH } = process.env


const rootPath = resolve(__dirname, '../../../../../../../')

const clientBuildPath = resolve(rootPath, CLIENT_BUILD_PATH)
const publicClientBuildPath = resolve(rootPath, PUBLIC_CLIENT_BUILD_PATH)

type PublicClientServerEntry = {
  renderApp: (props: AppProps) => {
    app: string
    styles: string
    materialUiCss: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const publicClientServerEntry: PublicClientServerEntry = require(
  join(publicClientBuildPath, './server-bundle.js'),
)

export { clientBuildPath, publicClientBuildPath, publicClientServerEntry }