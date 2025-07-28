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

import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import Heading from '@ckeditor/ckeditor5-heading/src/heading'
import { enablePlaceholder, PlaceholderableElement } from '@ckeditor/ckeditor5-engine'

/**
 * Setup Notion - like heading placeholders
 */
export default class HeadingPlaceholders extends Plugin {
  static get requires() {
    return [Heading]
  }

  init() {
    const { editor } = this
    for (let i = 1; i <= 3; i++) {
      editor.editing.downcastDispatcher.on('insert:heading' + i, (evt, data, conversionApi) => {
        // Inspired by ckeditor5-heading/src/title.ts
        const element: PlaceholderableElement = conversionApi.mapper.toViewElement(data.item)
        element.placeholder = `Heading ${i}`
        enablePlaceholder({ view: editor.editing.view, element, keepOnFocus: true })
      })
    }
  }
}