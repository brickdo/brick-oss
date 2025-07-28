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

import { css } from '@emotion/react'
import { HomepageIllustrationsMediaQuery } from './Illustration'

import { Image } from './Image'

type Props = {}

const screenshotsCss = css`
  position: absolute;
  width: 545px;
  height: auto;
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    width: 450px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    width: 300px;
  }
`

const circleCss = css`
  position: absolute;
  width: 72px;
  height: 42px;
  border-radius: 8px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  top: 6px;
  left: 382px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    left: 315px;
    top: 5px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    left: 254px;
    top: 4px;
    width: 56px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    left: 224px;
    top: 4px;
    width: 56px;
  }
`

const arrowCss = css`
  position: absolute;
  width: 80px;
  height: 150px;
  border-radius: 8px;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
  top: 46px;
  left: 458px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    left: 390px;
    top: 42px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    left: 320px;
    top: 21px;
    width: 51px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    left: 286px;
    top: 7px;
    width: 65px;
    height: 170px;
  }
`

const ScreenshotPublishing = (props: Props) => {
  return (
    <div
      css={css`
        position: relative;
        background: linear-gradient(209.14deg, #a7ecfe -17.69%, #b2e67e 107.29%);
        box-shadow: 0px 5px 30px rgba(101, 122, 147, 0.15);
        border-radius: 8px;
        width: 100%;
        height: 100%;

        ${HomepageIllustrationsMediaQuery.tablet} {
          width: 450px;
          height: 350px;
          max-width: 100%;
          max-height: 100%;
        }

        ${HomepageIllustrationsMediaQuery.mobile} {
          width: 390px;
          height: 300px;
          max-width: 100%;
          max-height: 100%;
        }
      `}
    >
      <Image
        css={css`
          ${screenshotsCss}
          top: 18px;
          left: 18px;

          ${HomepageIllustrationsMediaQuery.smallDesktop} {
            top: 20px;
            left: 20px;
          }

          ${HomepageIllustrationsMediaQuery.smallerDesktop} {
            top: 18px;
            left: 18px;
          }

          ${HomepageIllustrationsMediaQuery.tablet} {
            top: 20px;
            left: 33px;
          }
        `}
        src='/landing-assets/publishing-screenshot-editor.png'
        alt='Publishing screenshot editor'
      />
      <Image
        css={css`
          ${screenshotsCss}
          bottom: -26px;
          right: -26px;

          ${HomepageIllustrationsMediaQuery.smallerDesktop} {
            bottom: -60px;
            right: -60px;
          }

          ${HomepageIllustrationsMediaQuery.tablet} {
            bottom: 20px;
            right: 20px;
          }
        `}
        src='/landing-assets/publishing-screenshot-preview.png'
        alt='Publishing screenshot preview'
      />
      <Image
        css={circleCss}
        src='/landing-assets/publising-screenshot-point-circle.svg'
        alt='Publising screenshot point circle'
      />
      <Image
        css={arrowCss}
        src='/landing-assets/publishing-screenshots-arrow.svg'
        alt='Publishing screenshots arrow'
      />
    </div>
  )
}

export default ScreenshotPublishing