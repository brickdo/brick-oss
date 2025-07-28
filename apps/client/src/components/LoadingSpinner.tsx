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

import { SpinnerCircular, SpinnerCircularProps } from 'spinners-react'

type Props = {} & SpinnerCircularProps

const LoadingSpinner = ({ size, thickness, speed, ...props }: Props) => {
  return (
    <SpinnerCircular
      size={size || 70}
      thickness={thickness || 100}
      speed={speed || 100}
      color='rgb(var(--color-primary), 0.6)'
      secondaryColor='rgba(0, 0, 0, 0)'
      {...props}
    />
  )
}

export default LoadingSpinner