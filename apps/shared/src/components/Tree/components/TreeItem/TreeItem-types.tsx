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
import {
  DraggableProvided,
  DraggableStateSnapshot,
  DraggableProvidedDragHandleProps,
  DraggableProvidedDraggableProps,
  DraggingStyle,
} from 'react-beautiful-dnd'
import { ItemId, Path, TreeItem } from '../../types'

export type TreeDraggingStyle = DraggingStyle & {
  paddingLeft: number
  transition: 'none' | string
}

export type DragActionType = null | 'mouse' | 'key' | 'touch'

export type RenderItemParams<T = {}> = {
  item: TreeItem<T>
  depth: number
  onExpand: (itemId: ItemId) => void
  onCollapse: (itemId: ItemId) => void
  provided?: TreeDraggableProvided
  snapshot?: DraggableStateSnapshot
}

export type TreeDraggableProvided = {
  draggableProps: DraggableProvidedDraggableProps
  // will be null if the draggable is disabled
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined
  // The following props will be removed once we move to react 16
  innerRef: (el: HTMLElement | null) => void
}

export type Props = {
  item: TreeItem
  path: Path
  onExpand: (itemId: ItemId, path: Path) => void
  onCollapse: (itemId: ItemId, path: Path) => void
  renderItem: (item: RenderItemParams) => ReactNode
  provided?: DraggableProvided
  snapshot?: DraggableStateSnapshot
  itemRef: (itemId: ItemId, element: HTMLElement | null) => void
  offsetPerLevel: number
}