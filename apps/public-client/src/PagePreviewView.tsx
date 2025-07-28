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

import { CSSProperties, ReactElement } from 'react'
import clsx from 'clsx'

type Props = {
  style?: CSSProperties
  className?: string
  title: string | undefined | null
  content: string | undefined | null
}

function PagePreviewView({ style, title, content, className }: Props): ReactElement {
  return (
    <div
      className={clsx(className, 'page flex-1 w-full flex flex-col items-center pb-2')}
      style={style}
    >
      <h1 className='page-title page-preview-item'>{title}</h1>
      <div
        className='page-preview-item ck-content'
        dangerouslySetInnerHTML={{ __html: content || '' }}
      />
    </div>
  )
}

export default PagePreviewView