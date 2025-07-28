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

import { IoMdPricetags } from '@react-icons/all-files/io/IoMdPricetags'
import { NavLink } from 'react-router-dom'
import { useAppState } from '../store'

interface Props {}

const SubscriptionUpgradeBadge = (props: Props) => {
  const { userSubscriptionPlan: userSubscription } = useAppState()
  const isPremiumUser = userSubscription?.id && !userSubscription.id.includes('free')

  if (isPremiumUser) {
    return null
  }

  return (
    <div className='flex items-center justify-center mt-4 mb-2'>
      <div
        className='flex justify-between text-lg bg-white rounded p-4'
        style={{
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 4px',
        }}
      >
        <span className='flex items-center'>
          {' '}
          <IoMdPricetags className='color-main inline-block mr-2' />
          Free Plan
        </span>
        <NavLink to='/settings/subscription' className='no-underline color-main font-medium ml-2'>
          Upgrade
        </NavLink>
      </div>
    </div>
  )
}

export default SubscriptionUpgradeBadge