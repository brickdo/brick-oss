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
import styled from '@emotion/styled'
import { HomepageIllustrationsMediaQuery } from './Illustration'

import { Image } from './Image'

type Props = {}

const screenshotCss = css`
  width: auto;
  height: 304px;
  border-radius: 13px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    height: 280px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    height: 200px;
  }

  ${HomepageIllustrationsMediaQuery.mobile} {
    height: 150px;
  }
`

const ScreenshotTitle = styled.h1`
  font-weight: 600;
  font-size: 32px;
  color: #272e35;
  line-height: 40px;
  position: absolute;

  ${HomepageIllustrationsMediaQuery.tablet} {
    display: none;
  }
`

const ScreenshotCustomization = (props: Props) => {
  return (
    <div
      css={css`
        position: relative;
        background: linear-gradient(215.58deg, #ff986c -15.74%, #ff7dfa 129.68%);
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
      <div
        css={css`
          position: absolute;
          top: 23px;
          left: 33px;
          width: fit-content;

          ${HomepageIllustrationsMediaQuery.smallerDesktop} {
            top: 16px;
            left: 16px;
          }
        `}
      >
        <Image
          css={css`
            ${screenshotCss}
          `}
          src='/landing-assets/customization-screenshot-javascript.png'
          alt='Customizaiton screenshot javascript'
        />
        <ScreenshotTitle
          css={css`
            top: 23px;
            right: -62px;
            transform: translateX(100%);

            ${HomepageIllustrationsMediaQuery.mobile} {
            }
          `}
        >
          JavaScript
        </ScreenshotTitle>
      </div>
      <div
        css={css`
          position: absolute;
          top: 117px;
          left: 98px;
          width: fit-content;

          ${HomepageIllustrationsMediaQuery.smallerDesktop} {
            top: 80px;
            left: 100px;
          }
        `}
      >
        <Image
          css={css`
            ${screenshotCss}
          `}
          src='/landing-assets/customization-screenshot-themes.png'
          alt='Customizaiton screenshot themes'
        />
        <ScreenshotTitle
          css={css`
            top: 17px;
            right: -44px;
            transform: translateX(100%);
          `}
        >
          Themes
        </ScreenshotTitle>
      </div>
      <div
        css={css`
          position: absolute;
          top: 218px;
          left: 190px;
          width: fit-content;

          ${HomepageIllustrationsMediaQuery.smallerDesktop} {
            top: 144px;
            left: 196px;
          }
        `}
      >
        <Image
          css={css`
            ${screenshotCss}
          `}
          src='/landing-assets/customization-screenshot-css.png'
          alt='Customizaiton screenshot css'
        />
        <ScreenshotTitle
          css={css`
            top: 16px;
            right: -18px;
            transform: translateX(100%);
          `}
        >
          CSS
        </ScreenshotTitle>
      </div>
    </div>
  )
}

export default ScreenshotCustomization