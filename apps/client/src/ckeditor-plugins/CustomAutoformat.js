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

import { Plugin } from '@ckeditor/ckeditor5-core'
import { Autoformat } from '@ckeditor/ckeditor5-autoformat'
import blockAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/blockautoformatediting'

/**
 * Teach the editor our custom autoformat settings.
 */
export default class CustomShortcuts extends Plugin {
  static get requires() {
    return [Autoformat]
  }

  init() {
    const { editor } = this
    // Allow inserting a horizontal line by typing three hyphens. The regex is "em-dash, hyphen".
    blockAutoformatEditing(editor, editor.plugins.get('Autoformat'), /^\u2014-$/, 'horizontalLine')
  }
}