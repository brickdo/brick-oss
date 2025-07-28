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

import Tippy from '@tippyjs/react'
import { RiPaletteLine } from '@react-icons/all-files/ri/RiPaletteLine'
import clsx from 'clsx'
import PageDesignSettings from './PageDesignSettings'
import { useAppState } from 'src/store'

interface Props {
  pageId: string
  className?: string
}

const DesignSettingsBtn = ({ pageId, className }: Props) => {
  const { maintenanceMode } = useAppState()
  return (
    <>
      <Tippy
        theme='light'
        className='design-settings-popup'
        trigger='click'
        placement='bottom-start'
        arrow={false}
        zIndex={10}
        interactive
        appendTo={() => document.body}
        maxWidth={'initial'}
        content={<PageDesignSettings pageId={pageId} />}
      >
        <button
          className={clsx(
            className,
            ...(maintenanceMode ? ['text-gray-400', 'cursor-not-allowed'] : []),
          )}
          disabled={maintenanceMode}
        >
          <div className='flex items-center'>
            <RiPaletteLine className='mr-2' /> Design
          </div>
        </button>
      </Tippy>

      <style jsx>{`
        :global(.design-settings-popup) {
          padding: 5px 9px;
        }
      `}</style>
    </>
  )
}

export default DesignSettingsBtn