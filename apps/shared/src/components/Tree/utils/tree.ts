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

import {
  FlattenedItem,
  Path,
  TreeData,
  TreeItemData,
  ItemId,
  TreeItem,
  TreeSourcePosition,
  TreeDestinationPosition,
} from '../types'

import { getParentPath, getIndexAmongSiblings } from './path'

export type TreeItemMutation = {
  id?: ItemId
  children?: ItemId[]
  hasChildren?: boolean
  isExpanded?: boolean
  isChildrenLoading?: boolean
  data?: TreeItemData
}

/*
  Transforms tree structure into flat list of items for rendering purposes.
  We recursively go through all the elements and its children first on each level
 */
export const flattenTree = (tree: TreeData, path: Path = []): FlattenedItem[] => {
  return tree.items[tree.rootId]
    ? tree.items[tree.rootId].children.reduce<FlattenedItem[]>((accum, itemId, index) => {
        // iterating through all the children on the given level
        const item = tree.items[itemId]
        const currentPath = [...path, index]
        // we create a flattened item for the current item
        const currentItem = createFlattenedItem(item, currentPath)
        // we flatten its children
        const children = flattenChildren(tree, item, currentPath)
        // append to the accumulator
        return [...accum, currentItem, ...children]
      }, [])
    : []
}
/*
  Constructs a new FlattenedItem
 */
export const createFlattenedItem = (item: TreeItem, currentPath: Path): FlattenedItem => {
  return {
    item,
    path: currentPath,
  }
}

/*
  Flatten the children of the given subtree
*/
export const flattenChildren = (tree: TreeData, item: TreeItem, currentPath: Path) => {
  return item.isExpanded ? flattenTree({ rootId: item.id, items: tree.items }, currentPath) : []
}

/*
  Changes the tree data structure with minimal reference changes.
 */
export const mutateTree = <T extends TreeItem = TreeItem>(
  tree: TreeData<T>,
  itemId: ItemId,
  mutation: TreeItemMutation,
): TreeData<T> => {
  const itemToChange = tree.items[itemId]
  if (!itemToChange) {
    // Item not found
    return tree
  }
  // Returning a clone of the tree structure and overwriting the field coming in mutation
  return {
    // rootId should not change
    rootId: tree.rootId,
    items: {
      // copy all old items
      ...tree.items,
      // overwriting only the item being changed
      [itemId]: {
        ...itemToChange,
        ...mutation,
      },
    },
  }
}

export const getItem = (tree: TreeData, path: Path): TreeItem => {
  let cursor: TreeItem = tree.items[tree.rootId]

  for (const i of path) {
    cursor = tree.items[cursor.children[i]]
  }

  return cursor
}

export const getParent = (tree: TreeData, path: Path): TreeItem => {
  const parentPath: Path = getParentPath(path)
  return getItem(tree, parentPath)
}

export const getTreePosition = (tree: TreeData, path: Path): TreeSourcePosition => {
  const parent: TreeItem = getParent(tree, path)
  const index: number = getIndexAmongSiblings(path)
  return {
    parentId: parent.id,
    index,
  }
}

export const hasLoadedChildren = (item: TreeItem): boolean =>
  !!item.hasChildren && item.children.length > 0

export const isLeafItem = (item: TreeItem): boolean => !item.hasChildren

export const removeItemFromTree = <T extends TreeItem = TreeItem>(
  tree: TreeData<T>,
  position: TreeSourcePosition,
): { tree: TreeData<T>; itemRemoved: ItemId } => {
  const sourceParent = tree.items[position.parentId]
  const newSourceChildren = [...sourceParent.children]
  const itemRemoved = newSourceChildren.splice(position.index, 1)[0]
  const newTree = mutateTree(tree, position.parentId, {
    children: newSourceChildren,
    hasChildren: newSourceChildren.length > 0,
    isExpanded: newSourceChildren.length > 0 && sourceParent.isExpanded,
  })

  return {
    tree: newTree,
    itemRemoved,
  }
}

export const addItemToTree = <T extends TreeItem = TreeItem>(
  tree: TreeData<T>,
  position: TreeDestinationPosition,
  item: ItemId,
): TreeData<T> => {
  const destinationParent = tree.items[position.parentId]
  const newDestinationChildren = [...destinationParent.children]
  if (typeof position.index === 'undefined') {
    if (hasLoadedChildren(destinationParent) || isLeafItem(destinationParent)) {
      newDestinationChildren.push(item)
    }
  } else {
    newDestinationChildren.splice(position.index, 0, item)
  }
  return mutateTree(tree, position.parentId, {
    children: newDestinationChildren,
    hasChildren: true,
  })
}

export const moveItemOnTree = <T extends TreeItem = TreeItem>(
  tree: TreeData<T>,
  from: TreeSourcePosition,
  to: TreeDestinationPosition,
): TreeData<T> => {
  const { tree: treeWithoutSource, itemRemoved } = removeItemFromTree(tree, from)
  return addItemToTree(treeWithoutSource, to, itemRemoved)
}

export const moveItemOnDoubleTree = <T extends TreeItem = TreeItem>(
  sourceTree: TreeData<T>,
  destinationTree: TreeData<T>,
  from: TreeSourcePosition,
  to: TreeDestinationPosition,
): TreeData<T>['items'] => {
  const sourceParent = sourceTree.items[from.parentId]
  const newSourceChildren = [...sourceParent.children]
  const itemId = newSourceChildren.splice(from.index, 1)[0]
  const item = sourceTree.items[itemId]
  const newSourceParent = {
    ...sourceParent,
    children: newSourceChildren,
    childrenOrder: newSourceChildren,
    hasChildren: newSourceChildren.length > 0,
    isExpanded: newSourceChildren.length > 0 && sourceParent.isExpanded,
  }

  const destinationParent = destinationTree.items[to.parentId]
  const newDestinationChildren = [...destinationParent.children]
  if (typeof to.index === 'undefined') {
    if (hasLoadedChildren(destinationParent) || isLeafItem(destinationParent)) {
      newDestinationChildren.push(itemId)
    }
  } else {
    newDestinationChildren.splice(to.index, 0, itemId)
  }

  const newDestinationParent = {
    ...destinationParent,
    childrenOrder: newSourceChildren,
    children: newDestinationChildren,
    hasChildren: true,
  }

  const newItem = {
    ...item,
    parentId: newDestinationParent.id,
  }

  return {
    [newSourceParent.id]: newSourceParent,
    [newDestinationParent.id]: newDestinationParent,
    [itemId]: newItem,
  }
}