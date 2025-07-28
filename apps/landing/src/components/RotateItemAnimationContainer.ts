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

import styled from '@emotion/styled'

export const RotateItemAnimationContainer = styled.div<{
  isOpen: boolean
  closedOpacity?: number
}>`
  ${props =>
    props.isOpen
      ? `
    opacity: 1;
    transform: rotate(180deg);
  `
      : `
    opacity: ${props.closedOpacity ?? 1};
    transform: rotate(360deg);
  `}

  transition: transform .25s;
`