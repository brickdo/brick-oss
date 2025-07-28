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

import { useState, useRef, useEffect } from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import SelectList from './SelectList'
import CustomInput from './CustomInput'
import { useAppState } from '../store'
import { PageView } from '@brick-shared/types'

type Props = {
  mountEl: HTMLElement
  /** Required to separate CKeditor's styles (which overwrite a lot of stuff) from React rendered elements  */
  pluginClasses: string[]
  onPageSelect: (page: PageView) => any
}

const PageLinkPluginBtn = ({ mountEl, pluginClasses, onPageSelect }: Props) => {
  const { currentWorkspaceTopPublicPages: topUserPages, pages } = useAppState()
  const defaultDisplayPages = topUserPages
  const [displayedPages, setDisplayedPages] = useState(defaultDisplayPages)
  const [searchInput, setSearchInput] = useState('')
  const isTippyMountedOnce = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const focusInput = () => inputRef.current?.focus()

  useEffect(() => {
    const getSearchPages = () => {
      return searchInput
        ? Object.values(pages || {})
            .filter(x => x.mpath)
            .filter(x => x.name.toLowerCase().includes(searchInput.toLowerCase().trim()))
        : defaultDisplayPages
    }
    setDisplayedPages(getSearchPages())
  }, [searchInput, defaultDisplayPages, pages])

  const content = (
    <div>
      <CustomInput
        value={searchInput}
        placeholder='Search for page...'
        onChange={val => setSearchInput(val)}
        ref={inputRef}
      />

      <SelectList items={displayedPages} onSelect={page => onPageSelect(page)} />
    </div>
  )


  const updateChildrenClasses = () => {
    const childElems = Array.from(mountEl.querySelectorAll('*'))
    childElems.forEach(async el => {
      el.classList.add(...pluginClasses)
    })
  }
  useEffect(updateChildrenClasses)

  return (
    <Tippy
      theme='light'
      trigger='click'
      className='options-tippy page-link-chooser'
      placement='bottom-start'
      appendTo='parent'
      content={content}
      zIndex={10}
      showOnCreate={true}
      onMount={instance => {
        updateChildrenClasses()
        if (!isTippyMountedOnce.current) {
          instance.hide()
        }
        isTippyMountedOnce.current = true
      }}
      onTrigger={() => setSearchInput('')}
      onShown={focusInput}
      interactive
    >
      <button className='ck ck-button ck-off'>Page link</button>
    </Tippy>
  )
}

export default PageLinkPluginBtn