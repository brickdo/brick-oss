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

import { CSSProperties, ReactElement, ReactNode } from 'react'
import clsx from 'clsx'
import OptionsTippy from './OptionsTippy'
import { css } from '@emotion/react'

export type BreadcrubItemProps = {
  text: string
  id: string
  link?: string
  isApp?: boolean
  className?: string
}

const breadcrumbItemCss = css`
  font-size: 1em;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const BreadcrumbSplit = () => <span className='text-gray-500 text-sm'>/</span>

interface Props {
  items: BreadcrubItemProps[]
  className?: string
  isApp?: boolean
  style?: CSSProperties
  renderItem: (item: BreadcrubItemProps) => ReactNode
}

function Breadcrumbs({ items, className, style, isApp, renderItem }: Props): ReactElement {
  const maxItemsNumber = 3
  const hiddenItems = items.slice(1, items.length - maxItemsNumber + 1)
  const hiddenItemsOptions = hiddenItems.map(x => (
    <span css={breadcrumbItemCss} key={x.id}>
      {renderItem({
        ...x,
        isApp,
        className: 'text-base w-full px-2 py-1 truncate hover:bg-gray-200',
      })}
    </span>
  ))
  const hiddenItemsMenu = (
    <OptionsTippy
      key='breadcrumbs-menu'
      appendTo='parent'
      customOptions={hiddenItemsOptions}
      contentWrapStyle={{
        width: '208px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <button className='mx-1 px-1 hover:bg-gray-300 rounded'>...</button>
    </OptionsTippy>
  )

  const breadcrumbItems = items.map(item => (
    <span css={breadcrumbItemCss} key={item.id}>
      {renderItem({ ...item, isApp })}
    </span>
  ))

  if (hiddenItems.length) {
    breadcrumbItems.splice(1, breadcrumbItems.length - maxItemsNumber, hiddenItemsMenu)
  }

  const splitted = breadcrumbItems
    .map((item, i) => [item, <BreadcrumbSplit key={i} />])
    .flat()
    .slice(0, -1)

  return (
    <div className={clsx(className, 'flex items-start')} style={style}>
      {splitted}
    </div>
  )
}

export default Breadcrumbs