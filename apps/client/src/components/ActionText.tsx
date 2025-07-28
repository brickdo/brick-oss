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

/* eslint-disable jsx-a11y/anchor-is-valid */

import { ReactElement, ReactNode } from 'react'

interface Props {
  onClick: () => void
  href?: string
  disabled?: boolean
  children: ReactNode
}

export function ActionText(props: Props): ReactElement {
  const onKeyPress = (e: any) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      props.onClick()
    }
  }

  const onMouseDown = (e: any) => {
    e.preventDefault()
  }


  return props.disabled ? (
    <a tabIndex={0} role='button'>
      {props.children}
    </a>
  ) : (
    <a
      tabIndex={0}
      href={props.href ?? '#'}
      role='button'
      onClick={props.onClick}
      onKeyPress={onKeyPress}
      onMouseDown={onMouseDown}
    >
      {props.children}
    </a>
  )
}