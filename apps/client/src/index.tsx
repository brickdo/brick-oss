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

import 'tailwindcss/tailwind.css'
import '@brick-shared/styles/index.css'
import ReactDOM from 'react-dom'
import { Provider } from 'overmind-react'
import App from './components/App'
// @ts-ignore
import _JSXStyle from 'styled-jsx/style'
import { ClientAppProps } from './types'
import { store } from './store'
import { SearchProvider, Pipeline, ClickTracking } from '@sajari/react-search-ui'

if (typeof global !== 'undefined') {
  Object.assign(global, { _JSXStyle })
}

declare module 'react' {
  interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
    jsx?: boolean
    global?: boolean
  }
}

declare global {
  interface Window {
    HelpCrunch: any
    analytics: any
    __INITIAL_PROPS__?: ClientAppProps
  }
}

// Note that initial props might be absent if we are in development mode
export function getInitialProps(): ClientAppProps | null {
  return window.__INITIAL_PROPS__ || null
}
const pipeline = new Pipeline(
  {
    account: '1629754987286916333',
    collection: 'help',
  },
  'website',
  new ClickTracking(),
)

store.initialized.then(() => {
  store.actions.onStoreInit()
  store.actions
    .fetchUser()
    .catch(e => console.error(e))
    .finally(() => {
      const rootElement = document.getElementById('root')
      try {
        ReactDOM.render(
          <Provider value={store}>
            <SearchProvider
              search={{
                pipeline,
              }}
              searchOnLoad
            >
              <App />
            </SearchProvider>
          </Provider>,
          rootElement,
        )
      } catch (e) {
        console.error(e)
      }
    })
})