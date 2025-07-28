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
import { DraggableProvidedDraggableProps, DraggableStateSnapshot } from 'react-beautiful-dnd'
import { isSamePath } from '../../utils/path'
import { sameProps } from '../../utils/react'
import { Props, TreeDraggableProvided } from './TreeItem-types'

export default class TreeItem extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    return (
      !sameProps(this.props, nextProps, [
        'item',
        'provided',
        'snapshot',
        'onCollapse',
        'onExpand',
      ]) || !isSamePath(this.props.path, nextProps.path)
    )
  }

  patchDraggableProps = (
    draggableProps: DraggableProvidedDraggableProps,
    snapshot: DraggableStateSnapshot,
  ): DraggableProvidedDraggableProps => {
    const { path, offsetPerLevel } = this.props

    const transitions =
      draggableProps.style && draggableProps.style.transition
        ? [draggableProps.style.transition]
        : []
    if (snapshot.dropAnimation) {
      transitions.push(
        // @ts-ignore
        `padding-left ${snapshot.dropAnimation.duration}s ${snapshot.dropAnimation.curve}`,
      )
    }
    const transition = transitions.join(', ')

    return {
      ...draggableProps,
      style: {
        ...draggableProps.style,
        // @ts-ignore
        paddingLeft: (path.length - 1) * offsetPerLevel,
        // @ts-ignore
        transition,
      },
    }
  }

  render() {
    const { item, path, onExpand, onCollapse, renderItem, provided, snapshot, itemRef } = this.props

    const innerRef = (el: HTMLElement | null) => {
      itemRef(item.id, el)
      provided && provided.innerRef(el)
    }

    const finalProvided: TreeDraggableProvided | undefined = provided &&
      snapshot && {
        draggableProps: this.patchDraggableProps(provided.draggableProps, snapshot),
        dragHandleProps: provided.dragHandleProps,
        innerRef,
      }

    return renderItem({
      item,
      depth: path.length - 1,
      onExpand: itemId => onExpand(itemId, path),
      onCollapse: itemId => onCollapse(itemId, path),
      provided: finalProvided,
      snapshot,
    })
  }
}