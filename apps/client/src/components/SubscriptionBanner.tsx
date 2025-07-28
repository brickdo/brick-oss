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

import { FC, useState } from 'react'
import clsx from 'clsx'
import { NavLink } from 'react-router-dom'
import { IoIosClose } from '@react-icons/all-files/io/IoIosClose'
import localStorageConnector from '../utils/localStorageConnector'

const SubscriptionBanner: FC = () => {
  const [isBannerClosedOnce, setIsBannerClosedOnce] = useState(
    localStorageConnector.get('isBannerClosedOnce'),
  )

  const close = () => {
    const value = '1'
    localStorageConnector.set('isBannerClosedOnce', value)
    setIsBannerClosedOnce(value)
  }

  return isBannerClosedOnce ? null : (
    <div
      className={clsx(
        'fixed subscription-banner bottom-0 left-0 w-screen px-6 py-4 text-lg text-white text-center',
      )}
    >
      Get more domains, map your own domain and get priority support with our{' '}
      <NavLink
        to='/settings/subscription'
        className='text-white underline font-bold subscription-banner__link'
        onClick={close}
      >
        paid plan
      </NavLink>
      <button className='subscription-banner__close-btn' onClick={close}>
        <IoIosClose className='p-1' size='34' />
      </button>
      <style jsx>{`
        .subscription-banner {
          z-index: 10000;
          background: #ff0163;
        }
        .subscription-banner__close-btn {
          position: absolute;
          top: 5px;
          right: 5px;
        }
      `}</style>
    </div>
  )
}

export default SubscriptionBanner