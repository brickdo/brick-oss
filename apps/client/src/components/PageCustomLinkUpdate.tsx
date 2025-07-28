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
import { ReactElement, useRef, useState } from 'react'
import { useMount } from 'react-use'
import { useActions, useAppState } from '../store'
import CustomInput from './CustomInput'

interface Props {
  pageId: PageView['id']
  onAfterUpdate?: () => void
}

function PageCustomLinkUpdate({ pageId, onAfterUpdate }: Props): ReactElement {
  const { pages } = useAppState()
  const { updatePageCustomLink } = useActions()

  const existingLink = decodeURIComponent(pages?.[pageId].customLink || '')
  const [customLink, setCustomLink] = useState(existingLink)

  const inputRef = useRef<HTMLInputElement>(null)
  useMount(() => inputRef?.current?.focus())
  const notAllowedCharaters = /[^\p{L}\d.~_-]/gu
  const onInput = (newVal: string) =>
    setCustomLink(newVal.replace(notAllowedCharaters, '').toLowerCase())

  const save = async (newVal: string | null) => {
    await updatePageCustomLink({ pageId, customLink: newVal })
    onAfterUpdate && onAfterUpdate()
  }

  const removeCustomLink = () => save(null)

  return (
    <div className='p-2 page-custom-link-update'>
      <CustomInput ref={inputRef} value={customLink} onChange={onInput} />

      <div className='text-sm mt-2 italic text-gray-500'>
        Allowed symbols: letters, numbers, -, _, ., ~{' '}
      </div>

      <div className='mt-2 p-2 flex justify-end'>
        <button
          onClick={removeCustomLink}
          className='mr-2  bg-red-500 hover:bg-red-600 font-semibold text-white py-2 px-4 border border-red-500 hover:border-transparent rounded'
        >
          Remove
        </button>

        <button
          onClick={() => save(customLink)}
          className=' bg-blue-500 hover:bg-blue-600 font-semibold text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded'
        >
          Save
        </button>
      </div>

      <style jsx>{`
        .page-custom-link-update {
          width: 300px;
        }
      `}</style>
    </div>
  )
}

export default PageCustomLinkUpdate