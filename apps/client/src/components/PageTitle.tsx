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

import { Component, createRef, FormEvent, KeyboardEvent, RefObject } from 'react'
import css from 'styled-jsx/css'
import { KEY_RETURN } from 'keycode-js'

type Props = {
  value: string
  onInput: any
  className?: string
  onEnter?: () => any
  readonly?: boolean
}

class PageTitle extends Component<Props> {
  el: RefObject<HTMLHeadingElement>

  constructor(props: Props) {
    super(props)
    this.el = createRef()
  }

  shouldComponentUpdate(nextProps: Props) {
    const element = this.el.current
    const shouldUpdate = nextProps.value !== element?.innerText
    if (shouldUpdate && element) {
      element.innerHTML = nextProps.value
    }
    return shouldUpdate
  }

  onInput(event: FormEvent<HTMLHeadingElement>) {
    const target = event.target as HTMLElement
    this.props.onInput(target.innerText)
  }

  render() {
    let classes = 'inline-block w-full page-title focus:border-0 outline-none'
    if (this.props.className) {
      classes += ` ${this.props.className}`
    }
    const readonly = this.props.readonly === true
    return (
      <>
        <h1
          className={classes}
          contentEditable={!readonly}
          suppressContentEditableWarning={true}
          onInput={event => this.onInput(event)}

          onKeyDown={(event: KeyboardEvent) => {
            if (readonly) return
            if (event.keyCode === KEY_RETURN) {
              event.preventDefault()
              this.props.onEnter && this.props.onEnter()
            }
          }}
          ref={this.el}
          placeholder='Untitled'
          dangerouslySetInnerHTML={{ __html: this.props.value }}
          onPasteCapture={e => {
            if (readonly) return
            e.stopPropagation()
            e.preventDefault()
            const pastedText = e.clipboardData.getData('Text')
            document.execCommand('inserttext', false, pastedText)
          }}
        />
        <style jsx>{style}</style>
      </>
    )
  }
}

const style = css`
  .page-title:empty::before {
    content: attr(placeholder);
    display: block;
    cursor: text;
    color: #555;
  }
`

export default PageTitle