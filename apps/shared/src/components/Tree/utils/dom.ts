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

export const getDraggedItemElement = (draggableId: string) => {
  const queryAttr = 'data-rbd-drag-handle-draggable-id'
  const domQuery = `[${queryAttr}='${draggableId}']`
  return document.querySelector(domQuery)
}

export const getDroppableElement = (droppableId: string) => {
  const queryAttr = 'data-rbd-droppable-id'
  const domQuery = `[${queryAttr}='${droppableId}']`
  return document.querySelector(domQuery)
}