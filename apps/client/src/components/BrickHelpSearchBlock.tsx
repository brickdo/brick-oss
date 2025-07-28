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

import { Results } from '@sajari/react-search-ui'
import { css } from '@emotion/react'
import clsx from 'clsx'

interface Props {
  className?: string
}

const BrickHelpSearchBlock = ({ className }: Props) => {
  return (
    <div
      className={clsx(className)}
      css={css`
        display: flex;
        flex-direction: column;
        width: 400px;
        max-width: 100%;
        overflow: auto;
      `}
    >
      <div className='flex'>
        <div
          className='flex-1 pl-4'
          css={css`
            [class*='Results'] > article {
              margin-top: 10px;
            }
            [class*='Results'] > article > div > div:nth-of-type(2) {
              margin-bottom: 5px;
            }
            [class*='Results'] {
              font-size: 0.9rem;
            }
            [class*='Results'] [class*='TextComponent'] {
              font-size: 0.7rem;
            }
            [class*='HeadingComponent'] [class*='Link'] {
              color: #2b6cb0;
            }
            [class*='Message'] {
              padding: 0;
            }
          `}
        >
          <Results openNewTab />
        </div>
      </div>
    </div>
  )
}

export default BrickHelpSearchBlock