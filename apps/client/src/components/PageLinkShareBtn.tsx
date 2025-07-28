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

import { ReactElement, useState, CSSProperties } from 'react'
import { copyToClipboard } from '../utils/copyToClipboard'
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink'
import clsx from 'clsx'

interface Props {
  value: string
  text?: string
  style?: CSSProperties
  className?: string
}

function PageLinkShareBtn({ text, value, style, className }: Props): ReactElement {
  const [isCopied, setIsCopied] = useState(false)

  const onCopyBtnClick = async () => {
    await copyToClipboard(value)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1100)
  }

  return (
    <button
      className={clsx('font-medium py-2 px-3 page-link-share-btn', className)}
      title={value}
      onClick={onCopyBtnClick}
      style={style}
    >
      <div className='flex items-center'>
        <FiExternalLink className='flex-shrink-0 mr-2' />
        <span className='font-medium'>{isCopied ? 'Copied!' : 'Copy public link'}</span>
      </div>

      <div className='text-sm page-link-share-btn__value overflow-hidden truncate text-left'>
        {text || value}
      </div>

      <style jsx>{`
        .page-link-share-btn__value {
          white-space: nowrap !important;
          color: #585858;
          margin-left: calc(16px + 0.5rem);
        }
      `}</style>
    </button>
  )
}

export default PageLinkShareBtn