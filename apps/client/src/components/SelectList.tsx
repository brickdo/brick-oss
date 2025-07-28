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

import { Component } from 'react'
import css from 'styled-jsx/css'
import clsx from 'clsx'

type Item = {
  id: number | string
  name: string
}

type Props<T> = {
  onSelect: (item: T) => any
  items: T[]
  className?: string
}

class SelectList<T extends Item> extends Component<Props<T>> {
  render() {
    const itemsElements = this.props.items.map(x => (
      <li key={x.id}>
        <button
          className='max-w-full w-full text-left truncate p-1 hover:bg-gray-200 pl-2'
          title={x.name}
          onClick={() => this.props.onSelect(x)}
        >
          {x.name}
        </button>
      </li>
    ))

    return (
      <div className={clsx('pages-select', this.props.className)}>
        <ul className='pages-select__list overflow-y-auto overflow-x-hidden'>{itemsElements}</ul>
        <style jsx>{style}</style>
      </div>
    )
  }
}

const style = css`
  .pages-select {
    width: 250px;
    overflow: auto;
  }
  .pages-select__list {
    max-height: 300px;
  }
`

export default SelectList