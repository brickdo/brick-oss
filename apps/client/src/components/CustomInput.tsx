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

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import css from 'styled-jsx/css'
import { KEY_RETURN } from 'keycode-js'
import clsx from 'clsx'

type ICustomInputProps = {
  value: string
  onChange: (value: string) => any
  onEnter?: () => any
  className?: string
  error?: string | null
  postfix?: string
  afterInputSlot?: ReactNode
  placeholder?: string
  disabled?: boolean
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'onEnter'>

export type Ref = HTMLInputElement

const CustomInput = forwardRef<Ref, ICustomInputProps>((props, ref) => {
  const {
    value,
    onChange,
    onEnter,
    className = '',
    error,
    postfix,
    placeholder,
    afterInputSlot,
    disabled,
    ...inputProps
  } = props

  return (
    <div className={clsx('p-2', className)}>
      <div className='flex items-center'>
        <input
          className='custom-input leading-normal flex-1'
          type='text'
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.keyCode === KEY_RETURN && onEnter && onEnter()}
          ref={ref}
          disabled={disabled}
          {...inputProps}
        />
        {postfix && <span className='custom-input__postfix leading-normal'>{postfix}</span>}
        {afterInputSlot}
      </div>

      {error && (
        <div className='text-red-600 mt-2' role='alert'>
          {error}
        </div>
      )}

      <style jsx>{style}</style>
    </div>
  )
})

const style = css`
  .custom-input {
    font-size: 1rem;
    font-size: 1rem;
    padding: 4px 10px;
    position: relative;
    border-radius: 3px 0 0 3px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    background: white;
    height: 44px;
  }
  .custom-input__postfix {
    font-size: 1rem;
    padding: 4px;
    background-color: #eceeef;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-left: none;
    border-radius: 0 3px 3px 0;
    display: flex;
    align-items: center;
    align-self: stretch;
  }
  .custom-input:disabled {
    background: #f5f5f5;
  }
`

export default CustomInput