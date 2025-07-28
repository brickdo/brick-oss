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

import { FormControlLabel, Radio } from '@material-ui/core'
import clsx from 'clsx'
import { ReactElement, ReactNode } from 'react'

interface Props {
  value: string | null
  label: string
  onClick: () => void
  screenshotSlot?: ReactNode
  width?: string
  isSelected?: boolean
}

function ThemeSelectionItem({
  label,
  onClick,
  value,
  screenshotSlot,
  width,
  isSelected,
}: Props): ReactElement {
  width = width || '200px'
  return (
    <div
      className={clsx(
        'rounded border border-gray-300 hover:border-gray-400 flex flex-col hover:shadow-md cursor-pointer theme-selection-item',
        isSelected && 'theme-selection-item_selected',
      )}
      style={{ width }}
      onClick={onClick}
    >
      {screenshotSlot && <div className='overflow-hidden'> {screenshotSlot} </div>}
      <div className='flex items-center px-2'>
        <FormControlLabel value={value} control={<Radio />} label={label} />
      </div>

      <style jsx>{`
        .theme-selection-item_selected {
          box-shadow: 0px 0px 4px 0px rgb(var(--color-primary));
          border-color: rgb(var(--color-primary));
        }
        .theme-selection-item :global(img) {
          transition: all 0.3s;
        }
        .theme-selection-item:hover :global(img) {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  )
}

export default ThemeSelectionItem