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

import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  ForwardRefRenderFunction,
  RefObject,
} from 'react'
import { Dialog } from 'evergreen-ui'
import { NavLink } from 'react-router-dom'

interface Handles {
  show: () => void
  hide: () => void
}

const OutOfDomainsDialog: ForwardRefRenderFunction<Handles> = (props, ref) => {
  const dialogRef: RefObject<Dialog> = useRef(null)
  const [isShown, setIsShown] = useState(false)
  const show = () => setIsShown(true)
  const hide = () => setIsShown(false)

  useImperativeHandle(ref, () => ({
    show,
    hide,
  }))

  return (
    <Dialog
      isShown={isShown}
      ref={dialogRef}
      onCloseComplete={() => setIsShown(false)}
      hasHeader={false}
      hasFooter={false}
      topOffset='45vh'
      width='500px'
      containerProps={{
        style: {
          maxHeight: 'unset',
          borderRadius: '0.25rem',
        },
      }}
      contentContainerProps={{
        style: {
          paddingTop: '12px',
        },
      }}
      preventBodyScrolling
    >
      <div className='text-2xl'>
        You are out of available domains.
        <br />
        Delete some or{' '}
        <NavLink onClick={hide} to='/settings/subscription'>
          upgrade subscription plan
        </NavLink>{' '}
        to get more.
        <div className='flex justify-end mt-2'>
          <button
            className='border border-gray-300 py-1 px-2 rounded hover:bg-gray-300'
            onClick={hide}
          >
            Ok
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default forwardRef(OutOfDomainsDialog)