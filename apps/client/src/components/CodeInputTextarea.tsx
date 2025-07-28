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

import { css, SerializedStyles } from '@emotion/react'
import CodeMirror, { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { keymap, highlightSpecialChars, drawSelection, dropCursor } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { history, historyKeymap } from '@codemirror/history'
import { indentOnInput } from '@codemirror/language'
import { defaultKeymap } from '@codemirror/commands'
import { bracketMatching } from '@codemirror/matchbrackets'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import { rectangularSelection } from '@codemirror/rectangular-selection'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { lintKeymap } from '@codemirror/lint'

type Props = {
  wrapperCss: SerializedStyles
  value: string
  placeholder?: string
  onChange?: (newValue: string) => void
} & Omit<ReactCodeMirrorProps, 'onChange'>

const CodeInputTextarea = ({ value, wrapperCss, placeholder, onChange, ...props }: Props) => {
  return (
    <div css={[wrapperBasicCss, wrapperCss]}>
      <CodeMirror
        basicSetup={false}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        extensions={[
          html({}),
          highlightSpecialChars(),
          history(),
          drawSelection(),
          dropCursor(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          defaultHighlightStyle.fallback,
          bracketMatching(),
          closeBrackets(),
          autocompletion(),
          rectangularSelection(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...commentKeymap,
            ...completionKeymap,
            ...lintKeymap,
          ]),
        ]}
        autoFocus
        {...props}
      />
    </div>
  )
}

const wrapperBasicCss = css`
  border: 1px solid #e7e7e7;
  border-radius: 4px;
  font-size: 90%;
  flex: 1;
  max-height: 100px;
  min-height: 52px;
  cursor: text;

  &:focus-within {
    border-color: #9e9e9e;
  }

  .cm-theme-light,
  .cm-editor {
    height: 100%;
  }

  .cm-placeholder {
    color: #bbbbbb;
  }
`

export default CodeInputTextarea