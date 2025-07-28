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

import { DragState } from './Tree-types'
import { getTreePosition } from '../../utils/tree'
import { getDestinationPath, getSourcePath } from '../../utils/flat-tree'
import {
  Path,
  TreeSourcePosition,
  TreeDestinationPosition,
  TreeData,
  FlattenedTree,
} from '../../types'


export enum DOUBLE_TREE_DROPPABLE_ID {
  one = 'tree1',
  two = 'tree2',
}

/*
    Translates a drag&drop movement from an index based position to a relative (parent, index) position
*/
export const calculateFinalDropPositions = (
  tree: TreeData,
  flattenedTree: FlattenedTree,
  dragState: DragState,
): {
  sourcePosition: TreeSourcePosition
  destinationPosition?: TreeDestinationPosition
} => {
  const { source, destination, combine, horizontalLevel } = dragState
  const sourcePath: Path = getSourcePath(flattenedTree, source.index)
  const sourcePosition: TreeSourcePosition = getTreePosition(tree, sourcePath)

  if (combine) {
    return {
      sourcePosition,
      destinationPosition: {
        parentId: combine.draggableId,
      },
    }
  }

  if (!destination) {
    return { sourcePosition, destinationPosition: undefined }
  }

  const destinationPath: Path = getDestinationPath(
    flattenedTree,
    source.index,
    destination.index,
    horizontalLevel,
  )
  const destinationPosition: TreeDestinationPosition = {
    ...getTreePosition(tree, destinationPath),
  }
  return { sourcePosition, destinationPosition }
}

/*
    Translates a drag&drop movement from an index based position to a relative (parent, index) position
*/
export const calculateFinalDropPositionsForDoubleTree = (
  tree1: TreeData,
  tree2: TreeData,
  flattenedTree1: FlattenedTree,
  flattenedTree2: FlattenedTree,
  dragState: DragState,
): {
  sourcePosition: TreeSourcePosition
  destinationPosition?: TreeDestinationPosition
  destinationPath?: Path
} => {
  const { source, destination, combine, horizontalLevel } = dragState
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
  const sourceTree = source.droppableId === DOUBLE_TREE_DROPPABLE_ID.one ? tree1 : tree2
  const sourceFlattenedTree =
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    source.droppableId === DOUBLE_TREE_DROPPABLE_ID.one ? flattenedTree1 : flattenedTree2
  const sourcePath: Path = getSourcePath(sourceFlattenedTree, source.index)
  const sourcePosition: TreeSourcePosition = getTreePosition(sourceTree, sourcePath)

  if (combine) {
    return {
      sourcePosition,
      destinationPosition: {
        parentId: combine.draggableId,
      },
    }
  }

  if (!destination) {
    return { sourcePosition, destinationPosition: undefined }
  }

  const isSameTree = source.droppableId === destination?.droppableId
  const destinationTree = destination.droppableId === DOUBLE_TREE_DROPPABLE_ID.one ? tree1 : tree2
  const destinationFlattenedTree =
    destination.droppableId === DOUBLE_TREE_DROPPABLE_ID.one ? flattenedTree1 : flattenedTree2

  let destinationPath: Path
  if (isSameTree) {
    destinationPath = getDestinationPath(
      destinationFlattenedTree,
      source.index,
      destination.index,
      horizontalLevel,
    )
  } else {
    const upperItemPath = destinationFlattenedTree[destination.index - 1]?.path
    const lowerItemPath = destinationFlattenedTree[destination.index]?.path
    const { path } = calculateDropPathAndNestingLevels({
      horizontalLevel,
      upperItemPath,
      lowerItemPath,
    })
    destinationPath = path
  }
  const destinationPosition: TreeDestinationPosition = {
    ...getTreePosition(destinationTree, destinationPath),
  }
  return { sourcePosition, destinationPosition, destinationPath }
}

export const normalizeHorizontalLevel = (
  minLevel: number,
  maxLevel: number,
  horizontalLevel: number,
): number => {
  return Math.min(Math.max(minLevel, horizontalLevel), maxLevel)
}

export const calculateDropPathAndNestingLevels = ({
  horizontalLevel,
  upperItemPath,
  lowerItemPath,
  originalItemPath,
  isItemNotMovedVertically,
}: {
  horizontalLevel?: number
  upperItemPath?: Path
  lowerItemPath?: Path
  originalItemPath?: Path
  isItemNotMovedVertically?: boolean
}): { maxLevel: number; minLevel: number; path: Path } => {
  // First item in the tree
  if (!upperItemPath) {
    return {
      maxLevel: 1,
      minLevel: 1,
      path: [0],
    }
  }

  // Last item in tree, it can have paths from 1 to upperItemPath.length or originalItemPath.length if not moved vertically
  if (!lowerItemPath) {
    const maxLevel =
      originalItemPath && isItemNotMovedVertically
        ? Math.max(originalItemPath.length, upperItemPath.length)
        : upperItemPath.length
    const minLevel = 1
    if (!horizontalLevel) {
      return {
        minLevel,
        maxLevel,
        path: upperItemPath,
      }
    }
    const horizontalLevelNormalized = normalizeHorizontalLevel(minLevel, maxLevel, horizontalLevel)
    const horizontalLevelPaths = upperItemPath.slice(0, horizontalLevelNormalized)
    const path = [
      ...horizontalLevelPaths.slice(0, -1),
      horizontalLevelPaths[horizontalLevelPaths.length - 1] + 1,
    ]
    return {
      minLevel,
      maxLevel,
      path,
    }
  }

  // Item in the middle of the tree items on the same level
  const isBetweenSameLevel = lowerItemPath.length === upperItemPath.length

  // Upper item is parent and lower item is child
  const isLowerMoreNestedThanUpper = lowerItemPath.length > upperItemPath.length

  // In this cases item can only child as lowerItem
  if ((isBetweenSameLevel && !isItemNotMovedVertically) || isLowerMoreNestedThanUpper) {
    return {
      minLevel: lowerItemPath.length,
      maxLevel: lowerItemPath.length,
      path: lowerItemPath,
    }
  }

  // Upper item is more nested than lower item
  // In this case path can take values from lowerItemPath.length to upperItemPath.length

  const minLevel = lowerItemPath.length
  const maxLevel =
    originalItemPath && isItemNotMovedVertically
      ? Math.max(originalItemPath.length, upperItemPath.length)
      : upperItemPath.length

  if (!horizontalLevel) {
    return {
      minLevel,
      maxLevel,
      path: lowerItemPath,
    }
  }

  const horizontalLevelNormalized = normalizeHorizontalLevel(minLevel, maxLevel, horizontalLevel)
  const isOnSameLevelAsLowerChild = horizontalLevelNormalized === lowerItemPath.length
  if (isOnSameLevelAsLowerChild) {
    return {
      minLevel,
      maxLevel,
      path: lowerItemPath,
    }
  } else {
    const horizontalLevelPaths = upperItemPath.slice(0, horizontalLevelNormalized)
    const path = [
      ...horizontalLevelPaths.slice(0, -1),
      horizontalLevelPaths[horizontalLevelPaths.length - 1] + 1,
    ]
    return {
      minLevel,
      maxLevel,
      path,
    }
  }
}