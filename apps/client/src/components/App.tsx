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

import React, { FC } from 'react'
import Router from '../router'
import styledJsxCss from 'styled-jsx/css'
import OverlayFixedHelpBtn from './OverlayFixedHelpBtn'

window.React = React

const App: FC = () => {
  return (
    <div className='App'>
      {process.env.PUBLICVAR_BRICK_CLIENT_BANNER && (
        <div
          id='__announcement-banner'
          dangerouslySetInnerHTML={{ __html: process.env.PUBLICVAR_BRICK_CLIENT_BANNER }}
        />
      )}
      <Router />
      <OverlayFixedHelpBtn />
      <style jsx>{style}</style>
    </div>
  )
}

const style = styledJsxCss`
  .App {
    text-align: center;
    width: 100%;
  }
  .App-header {
    background-color: #282c34;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: calc(10px + 2vmin);
    color: white;
  }
`

export default App