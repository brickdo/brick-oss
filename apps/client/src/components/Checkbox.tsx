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

import { useMemo } from 'react'
import styled from '@emotion/styled'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { ReactNode } from 'react'
import { BsCheck } from '@react-icons/all-files/bs/BsCheck'
import { css, Interpolation } from '@emotion/react'
import { uniqueId } from 'lodash'

export type CheckboxProps = {
  label?: ReactNode
  css?: Interpolation<any>
  className?: string
  iconSize?: string | number
} & CheckboxPrimitive.CheckboxProps

const checkboxCheckedHoverStyles = css`
  border-color: #797979;
  box-shadow:
    rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
    rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
`

const StyledCheckbox = styled(CheckboxPrimitive.Root)`
  background-color: 'white';
  width: 20px;
  height: 20px;
  border: 1px solid #acacac;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &[data-state='checked'] {
    ${checkboxCheckedHoverStyles}
  }
`

const StyledLabel = styled.label`
  padding-left: 10px;
  cursor: pointer;
`

const wrapperStyles = css`
  font-size: 0.8rem;
  display: flex;
  align-items: center;

  &:hover {
    ${StyledCheckbox} {
      background: #f8f8f8;
      ${checkboxCheckedHoverStyles}
    }
  }
`

const Checkbox = ({ label, className, iconSize, ...props }: CheckboxProps) => {
  const id = useMemo(() => uniqueId('checkbox-'), [])

  return (
    <div css={wrapperStyles} className={className}>
      <StyledCheckbox {...props} id={id}>
        <CheckboxPrimitive.Indicator>
          <BsCheck size={iconSize || 14} />
        </CheckboxPrimitive.Indicator>
      </StyledCheckbox>
      <StyledLabel htmlFor={id}>{label}</StyledLabel>
    </div>
  )
}

export default Checkbox