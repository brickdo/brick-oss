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

import { CSSProperties, ElementRef, useEffect, useRef, useState } from 'react'
import css from 'styled-jsx/css'
import PageTitle from './PageTitle'
import Editor, { EditorProps } from './Editor'
import PageSavingIndicator from './PageSavingIndicator'

import { useAppState } from '../store'
import LoadingSpinner from './LoadingSpinner'

type Props = {
  style?: CSSProperties
  isPageContentSaving?: boolean
  onContentChange: EditorProps['onChange']
  onTitleInput: (x: string) => any
  isFontSettingsEnabled?: boolean
}

const PageEditorView = ({
  style,
  isPageContentSaving,
  onContentChange,
  onTitleInput,
  isFontSettingsEnabled,
}: Props) => {
  const { currentPage, maintenanceMode } = useAppState()
  const [, setEditorKey] = useState(0)
  const editorRef = useRef<ElementRef<typeof Editor> | null>(null)
  const prevPageId = useRef<string | null | undefined>(currentPage?.id)
  const isPageChanged = currentPage?.id !== prevPageId.current
  const shouldReinitEditor = isPageChanged

  // If navigating to page with collaboration update Editor key, for reinitialization of component for proper plugins load of CkEditor
  useEffect(() => {
    setEditorKey(val => val + 1)
  }, [shouldReinitEditor])

  const pageTitle = currentPage?.name
  const pageTitleValue = pageTitle && pageTitle !== 'Untitled' ? pageTitle : ''
  prevPageId.current = currentPage?.id

  if (shouldReinitEditor) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className='flex flex-col overflow-auto relative flex-1' style={style}>
      {isPageContentSaving && (
        <PageSavingIndicator
          style={{
            position: 'absolute',
            top: '20px',
            right: '40px',
          }}
          title='Page content is saving.'
        />
      )}

      <div className='page flex-1 flex flex-col items-center overflow-auto pb-2'>
        <PageTitle
          className='page-title'
          value={pageTitleValue}
          onInput={onTitleInput}
          onEnter={editorRef.current?.focus}
          readonly={maintenanceMode}
        />

        <Editor
          page={currentPage}
          isFontSettingsEnabled={isFontSettingsEnabled}
          onChange={onContentChange}
          ref={editorRef}
        />
        <style jsx>{componentStyles}</style>
      </div>
    </div>
  )
}

const componentStyles = css`
  :global(html) {
    overflow: hidden;
  }
  :global(.page-title) {
    max-width: 100%;
    max-width: 900px;
  }
  :global(.ck.ck-content),
  :global(.ck.ck-editor__editable_inline) {
    outline: 0;
    border: 0 !important;
    box-shadow: none !important;
    padding-bottom: 30vh !important;
    max-width: 100%;
    margin-bottom: 0;
    max-width: 900px;
    overflow: visible;
    flex: 1;
  }
  :global(.page-title),
  :global(.ck.ck-content),
  :global(.ck.ck-editor__editable_inline) {
    word-break: break-word;
    padding-left: 96px;
    padding-right: 96px;
  }
  :global(.ck.ck-block-toolbar-button) {
    // A bit less than 96px so that there's room between the button and the editor.
    margin-left: 90px;
  }
  @media screen and (max-width: 640px) {
    :global(.page-title),
    :global(.ck.ck-content),
    :global(.ck.ck-editor__editable_inline) {
      padding-left: 60px;
      padding-right: 60px;
    }

    :global(.ck.ck-block-toolbar-button) {
      margin-left: 54px;
    }
  }

  @media screen and (max-width: 500px) {
    :global(.page-title),
    :global(.ck.ck-content),
    :global(.ck.ck-editor__editable_inline) {
      padding-left: 40px;
      padding-right: 40px;
    }

    :global(.ck.ck-block-toolbar-button) {
      margin-left: 34px;
    }
  }
`
export default PageEditorView