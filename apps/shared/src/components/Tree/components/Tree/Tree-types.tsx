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

import { ReactNode } from 'react'
import { DraggableLocation, DraggableId, DroppableId } from 'react-beautiful-dnd'
import {
  TreeData,
  Path,
  ItemId,
  FlattenedTree,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '../../types'
import { RenderItemParams } from '../TreeItem/TreeItem-types'

export type Props<T = {}> = {
  /** The tree data structure. */
  tree: TreeData
  /** Function that will be called when a parent item needs to be expanded. */
  onExpand: (itemId: ItemId, path: Path) => void
  /** Function that will be called when a parent item needs to be collapsed. */
  onCollapse: (itemId: ItemId, path: Path) => void
  /** Function that will be called when the user starts dragging. */
  onDragStart: (itemId: ItemId) => void
  /** Function that will be called when the user finishes dragging. */
  onDragEnd: (
    sourcePosition: TreeSourcePosition,
    destinationPosition?: TreeDestinationPosition,
  ) => void
  /** Function that will be called to render a single item. */
  renderItem: (item: RenderItemParams<T>) => ReactNode
  /** Number of pixel is used to scaffold the tree by the consumer. */
  offsetPerLevel: number
  /** Boolean to turn on drag&drop re-ordering on the tree */
  isDragEnabled: boolean
  /** Boolean to turn on hovering while dragging */
  isNestingEnabled: boolean
}

export type State = {
  /** The flattened tree data structure transformed from props.tree */
  flattenedTree: FlattenedTree
  // Id of the currently dragged item
  draggedItemId?: ItemId
}

export type Combine = {
  draggableId: DraggableId
  droppableId: DroppableId
}

export type DragState = {
  // Source location
  source: DraggableLocation
  // Dragging mode
  mode: string
  // Pending destination location
  destination?: DraggableLocation | null
  // Last level, while the user moved an item horizontally
  horizontalLevel?: number
  // Combine for nesting operation
  combine?: Combine | null
}