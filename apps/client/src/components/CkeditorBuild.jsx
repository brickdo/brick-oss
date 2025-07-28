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

import { BalloonEditor as BalloonEditorBase } from '@ckeditor/ckeditor5-editor-balloon'

import { Essentials } from '@ckeditor/ckeditor5-essentials'
import { Autoformat } from '@ckeditor/ckeditor5-autoformat'
import { Alignment } from '@ckeditor/ckeditor5-alignment'
import { BlockToolbar } from '@ckeditor/ckeditor5-ui'
import { Bold } from '@ckeditor/ckeditor5-basic-styles'
import { Italic } from '@ckeditor/ckeditor5-basic-styles'
import { Subscript } from '@ckeditor/ckeditor5-basic-styles'
import { Superscript } from '@ckeditor/ckeditor5-basic-styles'
import { Underline } from '@ckeditor/ckeditor5-basic-styles'
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote'
import { SimpleUploadAdapter } from '@ckeditor/ckeditor5-upload'
import { Heading } from '@ckeditor/ckeditor5-heading'
import { Image } from '@ckeditor/ckeditor5-image'
import { ImageCaption } from '@ckeditor/ckeditor5-image'
import { ImageStyle } from '@ckeditor/ckeditor5-image'
import { ImageToolbar } from '@ckeditor/ckeditor5-image'
import { ImageUpload } from '@ckeditor/ckeditor5-image'
import { Indent } from '@ckeditor/ckeditor5-indent'
import { IndentBlock } from '@ckeditor/ckeditor5-indent'
import { Link } from '@ckeditor/ckeditor5-link'
import { LinkImage } from '@ckeditor/ckeditor5-link'
import { List } from '@ckeditor/ckeditor5-list'
import { ListProperties } from '@ckeditor/ckeditor5-list'
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed'
import { Paragraph } from '@ckeditor/ckeditor5-paragraph'
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office'
import { Table } from '@ckeditor/ckeditor5-table'
import { TableToolbar } from '@ckeditor/ckeditor5-table'
import { TableColumnResize } from '@ckeditor/ckeditor5-table'
import { TextTransformation } from '@ckeditor/ckeditor5-typing'
import { Autosave } from '@ckeditor/ckeditor5-autosave'
import { Code } from '@ckeditor/ckeditor5-basic-styles'
import { CodeBlock } from '@ckeditor/ckeditor5-code-block'
import { Highlight } from '@ckeditor/ckeditor5-highlight'
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line'
import { TableCellProperties } from '@ckeditor/ckeditor5-table'
import { TableProperties } from '@ckeditor/ckeditor5-table'
import { ImageResize } from '@ckeditor/ckeditor5-image'
import { HtmlEmbed } from '@ckeditor/ckeditor5-html-embed'
import { TodoList } from '@ckeditor/ckeditor5-list'
import { Strikethrough } from '@ckeditor/ckeditor5-basic-styles'
import { SpecialCharacters } from '@ckeditor/ckeditor5-special-characters'
import { SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters'
import { Font } from '@ckeditor/ckeditor5-font'
import PageLink from '../ckeditor-plugins/PageLink'
import CustomAutoformat from '../ckeditor-plugins/CustomAutoformat'
import CustomShortcuts from '../ckeditor-plugins/CustomShortcuts'
import DisableColorWhenPasting from '../ckeditor-plugins/DisableColorWhenPasting'
import HeadingPlaceholders from '../ckeditor-plugins/HeadingPlaceholders'

class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
  Essentials,
  Autoformat,
  Alignment,
  CustomAutoformat,
  CustomShortcuts,
  DisableColorWhenPasting,
  HeadingPlaceholders,
  BlockToolbar,
  Bold,
  Italic,
  BlockQuote,
  SimpleUploadAdapter,
  Heading,
  Image,
  ImageResize,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  Table,
  TableToolbar,
  TableColumnResize,
  TextTransformation,
  Autosave,
  Code,
  CodeBlock,
  Highlight,
  HorizontalLine,
  TableCellProperties,
  TableProperties,
  PageLink,
  Subscript,
  Superscript,
  Underline,
  HtmlEmbed,
  TodoList,
  Strikethrough,
  SpecialCharacters,
  SpecialCharactersEssentials,
  Font,
]

// Editor configuration.
BalloonEditor.defaultConfig = {
  blockToolbar: [
    'heading',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'indent',
    'outdent',
    '|',
    'imageUpload',
    'blockQuote',
    'insertTable',
    'mediaEmbed',
    '|',
    'undo',
    'redo',
  ],
  toolbar: {
    items: ['bold', 'italic', 'link'],
  },
  codeBlock: {
    languages: [
      { label: 'Plain text', language: 'plaintext' },
      { label: 'Agda', language: 'agda' },
      { label: 'Bash', language: 'bash' },
      { label: 'C', language: 'c' },
      { label: 'C#', language: 'cs' },
      { label: 'C++', language: 'cpp' },
      { label: 'Clojure', language: 'clojure' },
      { label: 'CSS', language: 'css' },
      { label: 'Dhall', language: 'dhall' },
      { label: 'Diff', language: 'diff' },
      { label: 'Dockerfile', language: 'docker' },
      { label: 'Elm', language: 'elm' },
      { label: 'Go', language: 'go' },
      { label: 'Haskell', language: 'haskell' },
      { label: 'HTML', language: 'html' },
      { label: 'Java', language: 'java' },
      { label: 'JavaScript', language: 'javascript' },
      { label: 'JSON', language: 'json' },
      { label: 'Julia', language: 'julia' },
      { label: 'Kotlin', language: 'kotlin' },
      { label: 'LaTeX', language: 'latex' },
      { label: 'Lisp', language: 'lisp' },
      { label: 'Lua', language: 'lua' },
      { label: 'Nix', language: 'nix' },
      { label: 'OCaml', language: 'ocaml' },
      { label: 'Perl', language: 'perl' },
      { label: 'PHP', language: 'php' },
      { label: 'PowerShell', language: 'powershell' },
      { label: 'PureScript', language: 'purescript' },
      { label: 'Python', language: 'python' },
      { label: 'R', language: 'r' },
      { label: 'Ruby', language: 'ruby' },
      { label: 'Rust', language: 'rust' },
      { label: 'Scala', language: 'scala' },
      { label: 'SQL', language: 'sql' },
      { label: 'Swift', language: 'swift' },
      { label: 'TOML', language: 'toml' },
      { label: 'TypeScript', language: 'typescript' },
      { label: 'XML', language: 'xml' },
      { label: 'YAML', language: 'yaml' },
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: 'en',
}

export default BalloonEditor