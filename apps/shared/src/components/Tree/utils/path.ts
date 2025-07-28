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

import { Path } from '../types'

/*
  Checking if two given path are equal
 */
export const isSamePath = (a: Path, b: Path): boolean => {
  if (a === b) {
    return true
  }
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/*
  Checks if the two paths have the same parent
 */
export const hasSameParent = (a: Path, b: Path): boolean =>
  isSamePath(getParentPath(a), getParentPath(b))

/*
  Calculates the parent path for a path
*/
export const getParentPath = (child: Path): Path => child.slice(0, child.length - 1)

/*
  It checks if the item is on top of a sub tree based on the two neighboring items, which are above or below the item.
*/
export const isTopOfSubtree = (belowPath: Path, abovePath?: Path) =>
  !abovePath || isParentOf(abovePath, belowPath)

const isParentOf = (parent: Path, child: Path): boolean => isSamePath(parent, getParentPath(child))

export const getIndexAmongSiblings = (path: Path): number => {
  const lastIndex = path[path.length - 1]
  return lastIndex
}

export const getPathOnLevel = (path: Path, level: number): Path => path.slice(0, level)

export const moveAfterPath = (after: Path, from: Path): Path => {
  const newPath: Path = [...after]
  const movedDownOnTheSameLevel = isLowerSibling(newPath, from)
  if (!movedDownOnTheSameLevel) {
    // not moved within the same subtree
    newPath[newPath.length - 1] += 1
  }
  return newPath
}

export const isLowerSibling = (a: Path, other: Path): boolean =>
  hasSameParent(a, other) && getIndexAmongSiblings(a) > getIndexAmongSiblings(other)