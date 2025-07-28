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

import Tippy, { TippyProps } from '@tippyjs/react'
import { sticky } from 'tippy.js'
import { ReactNode } from 'react'
import styled from '@emotion/styled'
import { css } from '@emotion/react'

type Props = {
  content: ReactNode
  children: ReactNode
} & TippyProps

const borderRadius = css`
  border-radius: 11px;
`

const ContentWrapper = styled.div`
  padding: 12px 12px;
  border: 1px solid #ddd;
  ${borderRadius}
`

const Tooltip = ({ children, content, ...props }: Props) => {
  return (
    <Tippy
      theme='light'
      trigger='click mouseenter'
      placement={'top-start'}
      appendTo={() => document.body}
      content={<ContentWrapper>{content}</ContentWrapper>}
      arrow={false}
      zIndex={10}
      interactive
      sticky
      plugins={[sticky]}
      css={css`
        width: max-content;
        max-width: 400px !important;
        ${borderRadius}

        @media (max-width: 450px) {
          max-width: 310px !important;
        }
      `}
      {...props}
    >
      {children}
    </Tippy>
  )
}

export default Tooltip