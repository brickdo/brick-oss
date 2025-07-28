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

import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode, useState } from 'react'
import { copyToClipboard } from '../utils'

type Props = {
  copyValue: any
  initialLabel?: string
  copiedLabel?: string
  children?: ReactNode
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

const CopyValueBtn = ({ copyValue, initialLabel, copiedLabel, ...props }: Props) => {
  initialLabel = initialLabel || 'Copy'
  copiedLabel = copiedLabel || 'Copied!'
  const [label, setLabel] = useState<any>(initialLabel)
  const copy = async () => {
    await copyToClipboard(copyValue)
    setLabel(copiedLabel)
    setTimeout(() => setLabel(initialLabel), 1100)
  }
  return (
    <button {...props} onClick={copy}>
      {label}
    </button>
  )
}

export default CopyValueBtn