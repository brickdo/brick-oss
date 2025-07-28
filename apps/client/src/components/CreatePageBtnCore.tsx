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

import { ReactElement, CSSProperties, ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { IoIosAdd } from '@react-icons/all-files/io/IoIosAdd'
import clsx from 'clsx'

type Props = {
  className?: string
  style?: CSSProperties
  small?: boolean
  onClick?: () => void
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

function CreatePageBtnCore({ className, small, style, onClick, ...props }: Props): ReactElement {
  const basicClasses = 'flex items-center border border-dashed border-gray-500 rounded'
  return (
    <button
      className={clsx(basicClasses, !small && 'mt-1 mb-2', className)}
      style={style}
      onClick={e => {
        e.preventDefault()
        onClick && onClick()
      }}
      {...props}
    >
      <IoIosAdd size={small ? '22' : '28'} className={clsx(!small && 'mr-1 ml-2')} />
      {small ? '' : 'New page'}

      <style jsx>{`
        button {
          color: rgb(var(--color-primary));
          border-color: rgb(var(--color-primary));
          font-weight: 500;
          background: transparent;
        }
        button:hover {
          background: rgb(232 18 92 / 12%);
        }

        button:disabled {
          cursor: default;
          background: rgb(234 234 234);
          color: rgb(142 142 142);
          border-color: rgb(142 142 142);
        }
      `}</style>
      <style jsx>{`
        button {
          ${small
            ? ''
            : `
            padding-top: 2px;
            padding-bottom: 2px;
          `}
        }
      `}</style>
    </button>
  )
}

export default CreatePageBtnCore