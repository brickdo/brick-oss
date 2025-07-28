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
  SubscriptionPlan,
  StripeExtraPriceUsd,
  SubscriptionPlansNames,
  SubscriptionPlanEntityNames,
  SubscriptionExtrasUsage,
  UNLIMITED_ENTITY_LIMIT,
  SubscriptionPlanEntityName,
  DefaultSubscriptionPlanId,
  SaasMantraSubscriptionId,
} from '@brick/misc/constants/subscription'
import { LandingColors } from '@brick-shared/styles/landing'
import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { useAppState } from 'src/store'
import { ActionText } from './ActionText'

type SubscriptionPlanEntitiesDesc = Record<keyof SubscriptionPlan['entities'], string>

const subscriptionPlanEntitiesNames: SubscriptionPlanEntitiesDesc = {
  workspaces: 'Workspaces',
  collabWorkspaces: 'Collaboration workspaces',
  collabPagesUsers: "Collaboration pages' users",
  collabWorkspacesUsers: 'Collaboration workspaces users',
  domains: 'Custom domains',
  subdomains: 'Subdomains',
} as const

type PlanUsageItemProps = {
  label: string
  usedValue: number
  limit: number
  extraCostUsd: string | null
}

type Props = {
  extraEntitiesUsage: SubscriptionExtrasUsage
  cancelSubscription: () => void
  reactivateSubscription: () => void
  currentPeriodEndDate: string | null | undefined
  cancelAtPeriodEnd: boolean
}

const MobileMQ = `@media (max-width: 430px)`

const PlanUsageItemMeter = styled.meter`
  width: 100%;
  border: none;
  appearance: none; // required for safari to overwrite default styles
  height: 8px;

  // ::-webkit-meter-inner-element required for chrome when appearance is set to none
  ::-webkit-meter-inner-element,
  ::-webkit-meter-bar {
    display: block;
    position: relative;
    background: #f1f3f4;
    border-radius: 5px;
    border: 0;
    height: 8px;
  }

  ::-webkit-meter-optimum-value {
    background: none;
    border-radius: 5px;
    background-color: ${LandingColors.primary};
  }
`

const PlanUsageItem = ({ label, usedValue, limit, extraCostUsd }: PlanUsageItemProps) => {
  return (
    <div>
      <div
        css={css`
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        `}
      >
        <h3
          css={css`
            font-size: 1rem;
            font-weight: 400;
            margin: 0;

            ${MobileMQ} {
              font-size: 0.8rem;
            }
          `}
        >
          {label}
        </h3>
        <div
          css={css`
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            justify-content: flex-start;

            ${MobileMQ} {
              font-size: 0.8rem;
            }
          `}
        >
          {limit ? (
            <div>
              {usedValue} / {limit === UNLIMITED_ENTITY_LIMIT ? 'Unlimited' : limit}
            </div>
          ) : (
            <div css={css``}>
              <a href='/pricing'>Upgrade plan to unlock</a>
            </div>
          )}
        </div>
      </div>

      <div>
        <PlanUsageItemMeter min={0} max={limit} value={usedValue} />
        <div
          css={css`
            display: flex;
            justify-content: flex-end;
            font-size: 14px;
            color: ${LandingColors.textGrey};
            height: 21px;

            ${MobileMQ} {
              font-size: 0.8rem;
            }
          `}
        >
          {extraCostUsd ? (
            `each extra item: $${extraCostUsd} / day`
          ) : limit && usedValue >= limit ? (
            <>
              <a href='/pricing'>Upgrade plan to get more</a>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function UserSubscriptionInfo({
  extraEntitiesUsage,
  cancelAtPeriodEnd,
  cancelSubscription,
  currentPeriodEndDate,
  reactivateSubscription,
}: Props) {
  const { userSubscriptionPlan, userUsedSubscriptionEntries, maintenanceMode } = useAppState()
  const { entities } = userSubscriptionPlan

  const entitiesItems = SubscriptionPlanEntityNames.map(entityName => (
    <PlanUsageItem
      key={entityName}
      label={subscriptionPlanEntitiesNames[entityName]}
      usedValue={userUsedSubscriptionEntries[entityName]}
      limit={entities[entityName].limit}
      extraCostUsd={
        entities[entityName].exceedPerItemPriceId
          ? StripeExtraPriceUsd[entities[entityName].exceedPerItemPriceId as string]
          : null
      }
    />
  ))

  const extrasCostUsd = Object.entries(extraEntitiesUsage).reduce<
    [SubscriptionPlanEntityName, number][]
  >((acc, [entityName, entityUsed]) => {
    const extraPriceId = entities[entityName as SubscriptionPlanEntityName].exceedPerItemPriceId
    if (!extraPriceId) {
      return acc
    }
    const entityPrice = StripeExtraPriceUsd[extraPriceId]

    acc.push([entityName as SubscriptionPlanEntityName, entityUsed * Number(entityPrice)])
    return acc
  }, [])

  const extrasTotalValue = extrasCostUsd.reduce((acc, value) => acc + value[1], 0)

  const userPlanCostUsd = userSubscriptionPlan.priceCents / 100
  const currentMonthlyBillUsd = (userPlanCostUsd + extrasTotalValue).toFixed(2)

  const isLiftimeDeal = Object.values(SaasMantraSubscriptionId).some(
    x => x === userSubscriptionPlan.id,
  )

  return (
    <div className='overflow-auto'>
      <h1
        css={css`
          font-size: 1.2rem;
          text-align: left;
        `}
      >
        Plan details
      </h1>
      <TopCardGrid>
        <TopCard>
          <TopCardTitle>Current plan</TopCardTitle>
          <TopCardMainText>
            {SubscriptionPlansNames[userSubscriptionPlan.id]},
            {isLiftimeDeal ? ' lifetime' : ` $${userPlanCostUsd} / month`}
          </TopCardMainText>
          <a href='/pricing'>Change plan</a>
        </TopCard>
        <TopCard>
          <TopCardTitle>Current monthly bill</TopCardTitle>
          <TopCardMainText>{isLiftimeDeal ? 'N/A' : `$${currentMonthlyBillUsd}`}</TopCardMainText>
          {!isLiftimeDeal && (
            <>
              <TopCardBillingEntityInfo>Plan cost: ${userPlanCostUsd}</TopCardBillingEntityInfo>
              {extrasTotalValue > 0 && (
                <>
                  <div
                    css={css`
                      font-weight: 500;
                      font-size: 14px;
                      margin: 5px 0 2px;
                    `}
                  >
                    Over limit:
                  </div>

                  {extrasCostUsd.map(([entityName, entityCost]) => (
                    <TopCardBillingEntityInfo key={entityName}>
                      {subscriptionPlanEntitiesNames[entityName]}: ${entityCost.toFixed(2)}
                    </TopCardBillingEntityInfo>
                  ))}
                </>
              )}
            </>
          )}
        </TopCard>
        <TopCard>
          <TopCardTitle>Billing cycle</TopCardTitle>
          <TopCardMainText>
            {currentPeriodEndDate && !isLiftimeDeal ? currentPeriodEndDate : 'N/A'}
          </TopCardMainText>
          {!isLiftimeDeal && (
            <>
              <div
                css={css`
                  text-align: left;
                `}
              >
                {userSubscriptionPlan.id !== DefaultSubscriptionPlanId ? (
                  cancelAtPeriodEnd ? (
                    <div
                      css={css`
                        color: ${LandingColors.textGrey};
                        font-size: 14px;
                      `}
                    >
                      After that date you will no longer be able to use paid features of Brick.{' '}
                      <ActionText onClick={reactivateSubscription} disabled={maintenanceMode}>
                        Click here to reactivate subscription.
                      </ActionText>
                    </div>
                  ) : (
                    <ActionText onClick={cancelSubscription} disabled={maintenanceMode}>
                      Click here to cancel your subscription.
                    </ActionText>
                  )
                ) : null}
              </div>
            </>
          )}
        </TopCard>
      </TopCardGrid>
      <PlanUsageCard>
        <PlanUsageCardTitle>Plan usage</PlanUsageCardTitle>
        <div
          css={css`
            > *:not(:last-child) {
              margin-bottom: 20px;
            }
          `}
        >
          {entitiesItems}
        </div>
      </PlanUsageCard>
    </div>
  )
}

const TopCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 20px;
`

const TopCard = styled.div`
  border-radius: 5px;
  height: 200px;
  padding: 10px 20px;
  background: #f7f8fa;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  overflow-y: auto;
`

const TopCardTitle = styled.h3`
  text-align: left;
  color: ${LandingColors.textGrey};
  font-size: 16px;
  font-weight: 500;
`

const TopCardMainText = styled.div`
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 10px;
  text-align: left;
`

const TopCardBillingEntityInfo = styled.div`
  text-align: left;
  white-space: nowrap;
  color: #4b4b4b;
  font-size: 14px;
`

const PlanUsageCard = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  max-width: 552px;
  margin-top: 20px;
`

const PlanUsageCardTitle = styled.h2`
  font-size: 1rem;
  text-align: left;
`

export default UserSubscriptionInfo