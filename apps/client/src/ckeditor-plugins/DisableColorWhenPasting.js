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

import ClipboardPipeline from '@ckeditor/ckeditor5-clipboard/src/clipboardpipeline'
import Plugin from '@ckeditor/ckeditor5-core/src/plugin'
import { UpcastWriter } from '@ckeditor/ckeditor5-engine'

/**
 * When copying from a web page, the copied content often inherits text color
 * and background color. This is super annoying. This function strips text color,
 * unless we detect that we are copying from Brick.
 */
export default class CustomShortcuts extends Plugin {
  static get requires() {
    return [ClipboardPipeline]
  }

  init() {
    const { editor } = this
    editor.editing.view.document.on('clipboardOutput', (evt, data) => {
      if (!data.content.isEmpty) {
        data.dataTransfer.setData('text/x.brick', editor.data.htmlProcessor.toData(data.content))
      }
    })
    editor.plugins.get('ClipboardPipeline').on('inputTransformation', (evt, data) => {
      if (!data.content.isEmpty && !data.dataTransfer.getData('text/x.brick')) {
        // Strip all 'color' and 'background' attributes. Inspired by 'mswordnormalizer.js' in the CKEditor source
        const writer = new UpcastWriter(editor.editing.view.document)
        const range = writer.createRangeIn(data.content)
        for (const value of range) {
          value.item.is('element') && writer.removeStyle(['color', 'background'], value.item)
        }
      }
    })
  }
}