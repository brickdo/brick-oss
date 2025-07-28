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

import { Component, ReactNode } from 'react'
import { Props as DraggableTreeProps, State as DraggableTreeState } from './Tree-types'
import { noop } from '../../utils/handy'
import { flattenTree, mutateTree } from '../../utils/tree'
import { FlattenedItem, ItemId, TreeData } from '../../types'
import TreeItem from '../TreeItem'

type Props<T> = Omit<
  DraggableTreeProps<T>,
  'isDragEnabled' | 'isNestingEnabled' | 'onDragStart' | 'onDragEnd'
>
type State = Omit<DraggableTreeState, 'draggedItemId'>

export default class TreeStatic<T> extends Component<Props<T>, State> {
  static defaultProps = {
    tree: { children: [] },
    onExpand: noop,
    onCollapse: noop,
    renderItem: noop,
    offsetPerLevel: 35,
  }

  state: State = {
    flattenedTree: [],
  }

  // HTMLElement for each rendered item
  itemsElement: Record<ItemId, HTMLElement | undefined> = {}

  static getDerivedStateFromProps(props: Props<{}>, state: State) {
    const { tree } = props
    const flattenedTree = flattenTree(tree)

    return {
      ...state,
      flattenedTree,
    }
  }

  static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData {
    if (draggedItemId) {
      // Closing parent internally during dragging, because visually we can only move one item not a subtree
      return mutateTree(tree, draggedItemId, {
        isExpanded: false,
      })
    }
    return tree
  }

  renderItems = (): Array<ReactNode> => {
    const { flattenedTree } = this.state
    return flattenedTree.map(this.renderItem)
  }

  renderItem = (flatItem: FlattenedItem, index: number): ReactNode => {
    const { renderItem, onExpand, onCollapse, offsetPerLevel } = this.props

    return (
      <TreeItem
        key={flatItem.item.id}
        item={flatItem.item}
        path={flatItem.path}
        onExpand={onExpand}
        onCollapse={onCollapse}
        // @ts-ignore
        renderItem={renderItem}
        offsetPerLevel={offsetPerLevel}
      />
    )
  }

  render() {
    const renderedItems = this.renderItems()
    return <div>{renderedItems}</div>
  }
}