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

import { ClassNames, css, keyframes, SerializedStyles } from '@emotion/react'
import { PropsWithChildren } from 'react'
import ReactModal from 'react-modal'

export type DialogProps = {
  isOpen: boolean
  onClose: () => any
  contentCss?: SerializedStyles
  portalCss?: SerializedStyles
  overlayCss?: SerializedStyles
} & PropsWithChildren<{}>

const Dialog = ({ isOpen, onClose, children, contentCss, portalCss, overlayCss }: DialogProps) => {
  return (
    <ClassNames>
      {({ css: classNamesCss, cx }) => (
        <ReactModal
          isOpen={isOpen}
          onRequestClose={onClose}
          appElement={document.querySelector('.App') as HTMLElement}
          ariaHideApp={false}
          parentSelector={() => document.body}
          overlayElement={(props, contentEl) => (
            // Custom element to stop propagation for mouseOver and onClick events
            // because if dialog is used inside button all the events will propagate to it
            // https://github.com/facebook/react/issues/11387
            <div
              onMouseOver={e => e.stopPropagation()}
              onClick={e => {
                e.stopPropagation()
                if (e.currentTarget === e.target) {
                  onClose()
                }
              }}
              css={[overlayBasicCss, overlayCss]}
            >
              {contentEl}
            </div>
          )}
          css={[contentBasicCss, contentCss]}
          portalClassName={classNamesCss([portalBasicCss, portalCss])}
          overlayClassName={classNamesCss([overlayBasicCss, overlayCss])}
          closeTimeoutMS={100}
        >
          <div className='flex flex-1 flex-col items-center flex-grow-0 justify-between'>
            {children}
          </div>
        </ReactModal>
      )}
    </ClassNames>
  )
}

const dialogAnimOverlayOpen = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`

const dialogAnimOverlayClose = keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`

const dialogAnimContentOpen = keyframes`
  0% {
    opacity: 0;
    /* transform: translate3d(0, 50px, 0); */
  }

  100% {
    opacity: 1;
    /* transform: translate3d(0, 0, 0); */
  }
`

const dialogAnimContentClose = keyframes`
  0% {
    opacity: 1;
    /* transform: translate3d(0, 0, 0); */
  }

  100% {
    opacity: 0;
    /* transform: translate3d(0, 50px, 0); */
  }
`

const portalBasicCss = css``

const overlayBasicCss = css`
  background-color: rgba(0, 0, 0, 0.295);
  inset: 0;
  position: fixed;
  z-index: 2300;
  display: flex;
  align-items: center;
  justify-content: center;

  &.ReactModal__Overlay--after-open {
    animation: ${dialogAnimOverlayOpen} 0.2s forwards;
  }

  &.ReactModal__Overlay--before-close {
    animation: ${dialogAnimOverlayClose} 0.1s forwards;
  }
`

const contentBasicCss = css`
  max-width: 90vw;
  width: auto;
  max-height: 85vh;
  padding: 25px 35px;
  background: #fff;
  border-radius: 8px;
  outline: none;
  overflow: auto;
  width: 90vw;

  @media (max-width: 425px) {
    padding: 25px 20px;
  }

  &.ReactModal__Content--after-open {
    animation: ${dialogAnimContentOpen} 0.2s forwards;
  }

  &.ReactModal__Content--before-close {
    animation: ${dialogAnimContentClose} 0.1s forwards;
  }
`

export default Dialog