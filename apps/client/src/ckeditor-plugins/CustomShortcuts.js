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

/**
 * Setup custom shortcuts
 */
export default class CustomShortcuts extends Plugin {
  init() {
    const { editor } = this
    // Notion and Google Docs: Ctrl+Alt+0 = disable heading
    editor.keystrokes.set('Ctrl+Alt+0', () => editor.execute('heading', { value: 'paragraph' }))
    // Notion and Google Docs: Ctrl+Alt+x = heading level x
    for (let i = 1; i <= 3; i++) {
      editor.keystrokes.set('Ctrl+Alt+' + i, () =>
        editor.execute('heading', { value: 'heading' + i }),
      )
    }
  }
}