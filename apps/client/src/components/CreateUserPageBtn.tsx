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

import { PageView } from '@brick-shared/types'
import clsx from 'clsx'
import { ReactElement, CSSProperties } from 'react'
import { useActions } from '../store'
import CreatePageBtnCore from './CreatePageBtnCore'

interface Props {
  className?: string
  style?: CSSProperties
  parentId?: PageView['id']
  disabled?: boolean
  small?: boolean
  title?: string
}

function CreateUserPageBtn({
  className,
  style,
  small,
  title,
  parentId,
  disabled,
}: Props): ReactElement {
  const { createPage } = useActions()

  return (
    <CreatePageBtnCore
      disabled={disabled}
      className={clsx(className, 'create-user-page-btn')}
      style={style}
      title={title}
      small={small}
      onClick={() => createPage({ parentId })}
    />
  )
}

export default CreateUserPageBtn