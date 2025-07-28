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

import { normalizeHorizontalLevel } from './Tree-utils'
import styled from '@emotion/styled'

const TreeItemDropPlaceholderDiv = styled.div`
  color: rgb(var(--color-primary));
  border: 1px dashed transparent;
  font-weight: 500;
  position: absolute;
  animation: 1s cubic-bezier(0, 0.55, 0.45, 1) 0.03s 1 borderTransition forwards;

  @keyframes borderTransition {
    0% {
      border-color: transparent;
    }
    100% {
      border-color: rgb(var(--color-primary));
    }
  }
`

export type TreeItemDropPlaceholderProps = {
  top: number
  left: number
  height: number
  width: number
  horizontalLevel?: number
  offsetPerLevel: number
  maxHorizontalLevel: number
  minHorizontalLevel: number
}

export const TreeItemDropPlaceholder = ({
  horizontalLevel,
  width,
  height,
  left,
  top,
  offsetPerLevel,
  maxHorizontalLevel,
  minHorizontalLevel,
}: TreeItemDropPlaceholderProps) => {
  const horizontalLevelNormalised =
    horizontalLevel != null
      ? normalizeHorizontalLevel(minHorizontalLevel, maxHorizontalLevel, horizontalLevel)
      : minHorizontalLevel

  const leftMargin =
    horizontalLevelNormalised && horizontalLevelNormalised > 1
      ? horizontalLevelNormalised * offsetPerLevel
      : 0
  width = width - leftMargin
  left = left + leftMargin

  return (
    <TreeItemDropPlaceholderDiv
      style={{
        top: top,
        left: left,
        height: height,
        width: width,
      }}
    />
  )
}