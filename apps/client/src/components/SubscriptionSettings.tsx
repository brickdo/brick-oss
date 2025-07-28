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

import { throttle } from 'lodash'
import { ReactElement, useCallback, useEffect, useState } from 'react'
import apiRequest from '@brick-shared/api'
import { useActions } from '../store'
import UserSubscriptionInfo from './UserSubscriptionInfo'
import { SubscriptionExtrasUsage } from '@brick/misc/constants/subscription'

type SubscriptionInfo = {
  extraEntitiesUsage: SubscriptionExtrasUsage
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number
}

function SubscriptionSettings(): ReactElement {
  const { cancelUserSubscription, reactivateUserSubscription } = useActions()

  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)

  const fetchSubscriptionInfo = useCallback(async () => {
    const subscription = await apiRequest.get<SubscriptionInfo | null>('subscription/info')
    setSubscriptionInfo(subscription)
  }, [])

  useEffect(() => {
    console.log('fetch')
    fetchSubscriptionInfo()
  }, [fetchSubscriptionInfo])

  const cancelSubscription = throttle(async () => {
    await cancelUserSubscription()
    fetchSubscriptionInfo()
  }, 1000)

  const reactivateSubscription = throttle(async () => {
    await reactivateUserSubscription()
    fetchSubscriptionInfo()
  }, 1000)

  const currentPeriodEndDate = subscriptionInfo?.currentPeriodEnd
    ? new Date(subscriptionInfo.currentPeriodEnd * 1000).toLocaleDateString()
    : null

  return (
    <div className='flex flex-col overflow-x-hidden flex-1 pt-2 pb-8'>
      <div className='w-full'>
        {subscriptionInfo && (
          <UserSubscriptionInfo
            extraEntitiesUsage={subscriptionInfo?.extraEntitiesUsage}
            cancelSubscription={cancelSubscription}
            reactivateSubscription={reactivateSubscription}
            currentPeriodEndDate={currentPeriodEndDate}
            cancelAtPeriodEnd={subscriptionInfo.cancelAtPeriodEnd}
          />
        )}
      </div>
    </div>
  )
}

export default SubscriptionSettings