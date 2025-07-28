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

import clsx from 'clsx'
import { CSSProperties, ReactElement } from 'react'

interface Props {
  color?: CSSProperties['color']
  size?: number
  rippleSize?: number
  title?: string
  className?: string
  style?: CSSProperties
}

function PageSavingIndicator({
  color = 'rgb(253 195 54)',
  size = 20,
  rippleSize = 40,
  title,
  className,
  style,
}: Props): ReactElement {
  return (
    <div className='page-saving-indicator select-none' style={style} title={title}>
      <div
        className={clsx('indicator__icon indicator-bg inline-block align-middle mr-2', className)}
      >
        <span className='indicator__icon__ripple indicator-bg' />
      </div>

      <span className='inline-block align-middle'>Saving...</span>

      <style jsx>{`
        .page-saving-indicator {
          color: rgb(102, 102, 102);
          background: #f9f9f9cc;
          font-size: 1rem;
          border: 1px solid #dfdfdf;
          border-radius: 5px;
          width: 120px;
          padding: 4px 12px;
          font-weight: 400;
          z-index: 1;
        }

        .indicator-bg {
          background-color: ${color};
        }

        .indicator__icon {
          position: relative;
          height: ${size}px;
          width: ${size}px;
          border-radius: 999999px;
          z-index: 1;
        }

        .indicator__icon .indicator__icon__ripple {
          position: absolute;
          width: ${rippleSize}px;
          height: ${rippleSize}px;
          z-index: -1;
          left: 50%;
          top: 50%;
          opacity: 0;
          transform: translate(-50%, -50%);
          border-radius: 999999px;
          animation: ripple 1s infinite;
        }

        @keyframes ripple {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default PageSavingIndicator