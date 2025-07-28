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

import { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { AppProps } from './types'
// import createCache from '@emotion/cache'
// import { CacheProvider } from '@emotion/react'

declare module 'react' {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

declare global {
  interface Window {
    __INITIAL_PROPS__: any
  }
}
// const key = 'custom'
// const cache = createCache({ key })

const render = (props: AppProps) => {
  const rootElement = document.getElementById('root')
  ReactDOM.hydrate(
    // <CacheProvider value={cache}>
    <App {...props} />,
    // {/* </CacheProvider>, */ }
    rootElement,
  )
}
const getProps = async () => {
  return window.__INITIAL_PROPS__ as unknown as AppProps
}
getProps().then(props => render(props))