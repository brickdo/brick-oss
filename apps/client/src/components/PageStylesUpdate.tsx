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

import { PageView } from '@brick-shared/types'
import clsx from 'clsx'
import { ReactElement, useEffect, useState } from 'react'
import { useMountedState } from 'react-use'
import apiRequest from '@brick-shared/api'
import { pageStyleSelectors } from '../constants/pageStyleSelectors'
import { useActions, useAppState } from '../store'
import { openSupportChat } from '../support-chat'
import { ActionText } from './ActionText'

interface Props {
  pageId: PageView['id']
  onAfterUpdate?: Function
  className?: string
}

function PageStylesUpdate({ pageId, onAfterUpdate, className }: Props): ReactElement {
  const { updatePageStyles } = useActions()
  const { pages } = useAppState()
  const pageStylesValue = pages[pageId].stylesScss
  const [stylesEdit, setStylesEdit] = useState<string | null>(null)
  const [sassError, setSassError] = useState<string | null>(null)
  const isMounted = useMountedState()

  const isLoaded = stylesEdit !== null

  useEffect(() => {
    const loadStyles = async () => {
      const initialStyles = await apiRequest.get(`page/${pageId}/styles`)
      // Sometimes the component will be unmounted before this async function was finished
      // and calling setState (setStylesEdit) results in react error
      if (isMounted()) {
        setStylesEdit(initialStyles || pageStyleSelectors)
      }
    }
    loadStyles()
  }, [pageId, isMounted])

  useEffect(() => {
    if (isLoaded) {
      setStylesEdit(pageStylesValue || pageStyleSelectors)
    }
  }, [isLoaded, pageStylesValue])

  const processSassError = (message: string) =>
    message
      .replace(/ {2}(╷|╵)\n/g, '')
      .split('\n')
      .slice(0, -1)
      .join('\n')

  const save = async () => {
    try {
      await updatePageStyles({ pageId, stylesScss: stylesEdit })
      setSassError(null)
    } catch (e) {
      const responseStatus = e?.response?.status
      if (responseStatus === 400) {
        setSassError(processSassError(e?.response?.data?.message))
      } else {
        throw e
      }
    }
    onAfterUpdate && onAfterUpdate()
  }

  return (
    <div className={clsx(className)}>
      <div className='text-gray-500'>
        <p className='mt-0'>
          We support <a href='https://sass-lang.com/documentation'>SCSS</a> — a superset of CSS with
          a few extra features. <ActionText onClick={openSupportChat}>Contact support</ActionText>{' '}
          if you need help with custom styles.
        </p>
      </div>

      <textarea
        rows={12}
        style={{
          minWidth: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          minHeight: '200px',
          fontFamily: 'monospace',
          fontSize: '90%',
          resize: 'none',
        }}
        value={isLoaded ? (stylesEdit as string) : 'Loading...'}
        disabled={!isLoaded}
        onChange={e => setStylesEdit(e.target.value)}
        className='p-2 border rounded'
        onKeyDown={e => e.key === 'Enter' && (e.metaKey || e.ctrlKey) && save()}
      />

      <div className='flex flex-row items-start'>
        {sassError && (
          <pre className='text-red-600 mt-2 text-sm flex-shrink-1 overflow-x-scroll'>
            <code>{sassError}</code>
          </pre>
        )}
        <button
          onClick={save}
          className='mt-1 ml-auto block flex-grow-0 flex-shrink-0 font-semibold text-white py-2 px-4 rounded save-btn'
        >
          Apply
        </button>
      </div>

      <style jsx>{`
        .save-btn {
          background: rgb(var(--color-primary));
        }
        .save-btn:hover {
          background: hsl(339 86% 45% / 1);
        }
      `}</style>
    </div>
  )
}

export default PageStylesUpdate