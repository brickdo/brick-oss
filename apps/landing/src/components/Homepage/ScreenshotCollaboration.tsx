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
  border-radius: 8px;
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
`

const ScreenshotCollaboration = (props: Props) => {
  return (
    <div
      css={css`
        position: relative;
        background: linear-gradient(204.57deg, #ff8cfb -37.77%, #89d6e0 102.61%);
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
          width: 256px;
          height: auto;
          top: 65%;
          left: 70%;

          ${HomepageIllustrationsMediaQuery.smallDesktop} {
            left: 60%;
          }

          ${HomepageIllustrationsMediaQuery.tablet} {
            width: 220px;
            height: auto;
            left: 50%;
            top: 55%;
          }

          ${HomepageIllustrationsMediaQuery.mobile} {
            width: 180px;
            height: auto;
            left: 50%;
            top: 55%;
          }
        `}
        src='/landing-assets/collaboration-screenshot-manage.png'
        alt='Collaboration screenshot manage'
      />
    </div>
  )
}

export default ScreenshotCollaboration