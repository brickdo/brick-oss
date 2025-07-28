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

/*
  Portions of this file are based on CKEditor 5 code, originally licensed under the GPL-2.0-or-later license.
  This file is relicensed under the GPL-3.0-or-later license.

  Original code:

  @copyright (c) 2003-2023 CKSource Holding sp. z o.o. All rights reserved.
  @license GPL-2.0-or-later

  Modifications:

  @copyright (C) 2023-2025 Monadfix OÜ
  @license GPL-3.0-or-later
*/

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import BalloonBlockEditor from './CkeditorBuild'
import { CKEditor } from '@ckeditor/ckeditor5-react'

import { useLatest, useMount, useUnmount } from 'react-use'
import history from '../router/history'
import { useActions, useAppState } from '../store'
import { PageView } from '@brick-shared/types'

import { appDebugEvent } from '@brick/lib/debug-event'

export interface EditorProps {
  page?: PageView | null
  onChange: (params: { content: string; pageId: string }) => void
  isFontSettingsEnabled?: boolean
  onReady?: () => void
}

type EditorRef = {
  focus: () => void
}

const contentLoadingLockId = Symbol('content-loading')

const Editor = forwardRef<EditorRef, EditorProps>((props, ref) => {
  const { isPageEditingReady, maintenanceMode } = useAppState()
  const isPageEditingReadyRef = useLatest(isPageEditingReady)
  const { setEditorService } = useActions()
  const { page, isFontSettingsEnabled, onChange, onReady } = props
  const safeOnChange = useCallback(
    async (...params: Parameters<EditorProps['onChange']>) => {
      if (isPageEditingReadyRef.current) {
        await onChange(...params)
      }
    },
    [isPageEditingReadyRef, onChange],
  )
  const [isEditorReady, setIsEditorReady] = useState(false)
  const isContentLoading = page?.content === undefined
  const content = page?.content || ''
  const pageId = page?.id

  // Prevent navigation before editor has been initalized (see "onReady") to ensure it will be properly destroy
  // Fast navigation, before "onReady" was called leads to memory leaks
  const unblock = useRef<(() => void) | null>(null)
  useMount(() => {
    unblock.current = history.block()
  })

  const editorInstance = useRef<any | null>(null)
  const isAutosaveOnceTriggered = useRef<boolean>(false)
  // Using plain prop value inside an asynchronous function (here we use pageId in the autosave and tokenUrl in config of editor) results in stale value
  const latestPageId = useLatest(pageId)
  const prevPageId = useRef<string | null | undefined>(null)

  const getContent = (editor: any) => {
    return editor.getData()
  }

  if (editorInstance.current) {
    if (isContentLoading) {
      editorInstance.current.enableReadOnlyMode(contentLoadingLockId)
    } else {
      editorInstance.current.disableReadOnlyMode(contentLoadingLockId)
    }
  }

  useImperativeHandle(ref, () => ({
    focus: () => {
      editorInstance.current?.editing?.view?.focus()
    },
  }))

  const isPageChanged = prevPageId.current && pageId && prevPageId.current !== pageId

  // Checking "prevPageId.current" one more time because otherwise typescript does not narrow it's type to non nullish value

  if (prevPageId.current && isPageChanged) {
    safeOnChange({
      content: getContent(editorInstance.current),
      pageId: prevPageId.current,
    })
    isAutosaveOnceTriggered.current = false
  }

  useEffect(() => {
    if (isEditorReady && !isContentLoading) {
      editorInstance?.current?.setData(content)
    }
  }, [isEditorReady, content, isContentLoading, pageId])

  useUnmount(() => {
    setEditorService(null)
  })

  prevPageId.current = pageId

  // editorService is used in router (router/index.tsx) for saving data on page change and unmount.
  // Previously it was done in this component
  setEditorService(
    editorInstance.current
      ? {
          editorInstance: editorInstance.current,
          getContent: () => getContent(editorInstance.current),
          onChange: safeOnChange,
          pageId,
        }
      : null,
  )

  return (
    <div className='brick-editor'>
      <div
        style={{
          ...(isEditorReady && !isContentLoading ? { display: 'none' } : {}),
          paddingLeft: '96px',
          paddingRight: '96px',
          marginTop: 'var(--ck-spacing-large)',
        }}
      >
        <em>Loading...</em>
      </div>
      <div
        style={{
          ...(isEditorReady && !isContentLoading ? {} : { display: 'none' }),
        }}
      >
        <CKEditor
          onReady={(editor: any) => {
            editorInstance.current = editor
            setIsEditorReady(true)
            onReady?.()
            unblock?.current!()
          }}
          editor={BalloonBlockEditor}
          disabled={maintenanceMode}
          // If collaboration enabled we should pass the content from the beginning,
          // because "editor.setContent" which executes inside CKEditor component
          // when "data" props changes is prohibited in collaboration mode
          data={content}
          config={{
            placeholder: 'Write here...',
            toolbar: {
              items: [
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'code',
                'link',
                '|',
                'highlight',
                'subscript',
                'superscript',
                '|',
                ...(isFontSettingsEnabled
                  ? ['fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|']
                  : []),
                'undo',
                'redo',
              ],
            },
            autosave: {
              save: async (editor: any) => {
                const pageId = latestPageId.current
                // isAutosaveOnceTriggered is fix for autosave trigered after mount when content is not changed. Ideally we shouldn't need this, see https://github.com/brickdo/brick/issues/71
                if (isAutosaveOnceTriggered.current && pageId && isPageEditingReadyRef.current) {
                  const content = getContent(editor)
                  appDebugEvent(() => ({ type: 'page-autosave', pageId, content }))
                  await safeOnChange({ content, pageId })
                } else {
                  isAutosaveOnceTriggered.current = true
                }
              },
              waitingTime: 1000,
            },
            language: 'en',
            blockToolbar: [
              'heading',
              '|',
              'pageLink',
              '|',
              'bulletedList',
              'numberedList',
              'todoList',
              '|',
              'blockQuote',
              'codeBlock',
              '|',
              'outdent',
              'indent',
              'alignment',
              '|',
              'htmlEmbed',
              'imageUpload',
              'mediaEmbed',
              'insertTable',
              'specialCharacters',
              'horizontalLine',
            ],
            image: {
              toolbar: [
                'linkImage',
                '|',
                'imageStyle:breakText',
                'imageStyle:wrapText',
                'imageStyle:inline',
                '|',
                'toggleImageCaption',
                'imageTextAlternative',
              ],
            },
            list: {
              properties: {
                styles: true,
                startIndex: true,
                reversed: true,
              },
            },
            table: {
              contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableCellProperties',
                'tableProperties',
              ],
            },
            typing: {
              transformations: {
                include: [
                  // Disabled for now because they are not implemented well
                  // 'quotes',
                  // {from: '<-', to: '←' },
                  // {from: '->', to: '→' },
                  { from: '--', to: '—' },
                ],
              },
            },
            link: {
              decorators: {
                openInNewTab: {
                  mode: 'manual',
                  label: 'Open in a new tab',
                  attributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  },
                },
              },
              defaultProtocol: 'https://',
            },
            mediaEmbed: {
              previewsInData: true,
              providers: [
                /**
                 * Many of the providers below are based on https://github.com/ckeditor/ckeditor5/blob/v39.0.2/packages/ckeditor5-media-embed/src/mediaembedediting.ts,
                 *
                 * @copyright (c) 2003-2023 CKSource Holding sp. z o.o. All rights reserved.
                 * @license GPL-2.0-or-later
                 *
                 * @copyright (c) 2023-2025 Monadfix OÜ
                 * @license GPL-3.0-or-later
                 */
                {
                  name: 'dailymotion',
                  url: [/^dailymotion\.com\/video\/(\w+)/, /^dai.ly\/(\w+)/],
                  html: match => {
                    const id = match[1]
                    return (
                      '<div style="position: relative; padding-bottom: 100%; height: 0; ">' +
                      `<iframe src="https://www.dailymotion.com/embed/video/${id}" ` +
                      'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                      'frameborder="0" width="480" height="270" allowfullscreen allow="autoplay">' +
                      '</iframe>' +
                      '</div>'
                    )
                  },
                },
                {
                  name: 'spotify',
                  url: [
                    /^open\.spotify\.com\/(artist\/\w+)/,
                    /^open\.spotify\.com\/(album\/\w+)/,
                    /^open\.spotify\.com\/(track\/\w+)/,
                  ],
                  html: (match: any[]) => {
                    const id = match[1]
                    return (
                      '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 126%;">' +
                      `<iframe src="https://open.spotify.com/embed/${id}" ` +
                      'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                      'frameborder="0" allowtransparency="true" allow="encrypted-media">' +
                      '</iframe>' +
                      '</div>'
                    )
                  },
                },
                {
                  name: 'youtube',
                  url: [
                    // Modified for Brick to also handle links with ?si, see https://github.com/ckeditor/ckeditor5/issues/15610
                    /^(?:m\.)?youtube\.com\/watch\?v=([\w-]+)(?:.*&t=(\d+))?/,
                    /^(?:m\.)?youtube\.com\/v\/([\w-]+)(?:.*[&?]t=(\d+))?/,
                    /^youtube\.com\/embed\/([\w-]+)(?:.*[&?]start=(\d+))?/,
                    /^youtu\.be\/([\w-]+)(?:.*[&?]t=(\d+))?/,
                  ],
                  html: match => {
                    const id = match[1]
                    const time = match[2]
                    return (
                      '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
                      `<iframe src="https://www.youtube.com/embed/${id}${
                        time ? `?start=${time}` : ''
                      }" ` +
                      'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                      'frameborder="0" allow="autoplay; encrypted-media" allowfullscreen>' +
                      '</iframe>' +
                      '</div>'
                    )
                  },
                },
                {
                  name: 'vimeo',
                  url: [
                    /^vimeo\.com\/(\d+)/,
                    /^vimeo\.com\/[^/]+\/[^/]+\/video\/(\d+)/,
                    /^vimeo\.com\/album\/[^/]+\/video\/(\d+)/,
                    /^vimeo\.com\/channels\/[^/]+\/(\d+)/,
                    /^vimeo\.com\/groups\/[^/]+\/videos\/(\d+)/,
                    /^vimeo\.com\/ondemand\/[^/]+\/(\d+)/,
                    /^player\.vimeo\.com\/video\/(\d+)/,
                  ],
                  html: match => {
                    const id = match[1]
                    return (
                      '<div style="position: relative; padding-bottom: 100%; height: 0; padding-bottom: 56.2493%;">' +
                      `<iframe src="https://player.vimeo.com/video/${id}" ` +
                      'style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;" ' +
                      'frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen>' +
                      '</iframe>' +
                      '</div>'
                    )
                  },
                },
                {
                  name: 'embedly',
                  url: /.+/,
                  disableAutoEmbed: true,
                  // Add this to get previews inside the editor. It almost works, but sometimes after a reload the
                  // embeds don't render and I don't know why.
                  //
                  // html: (match: any) => {
                  //   const url = match[0]
                  //   return `<a
                  //       data-card-chrome="0"
                  //       data-card-controls="0"
                  //       href="${encodeURI(url)}"
                  //       class="embedly-card"
                  //     />`
                  // }
                },
              ],
            },
            simpleUpload: {
              // Use our custom upload endpoint
              uploadUrl: '/api/upload/image',
              // JWT authentication is handled automatically via cookies/headers
              // Send required pageId as header using patched function support
              headers: () => {
                const pageId = latestPageId.current || ''

                return {
                  'X-Page-Id': pageId,
                }
              },
            },
            licenseKey: 'GPL',
          }}
        />
      </div>

      <style jsx>{`
        .brick-editor {
          width: 100%;
          max-width: 900px;
        }
      `}</style>
    </div>
  )
})

export default Editor