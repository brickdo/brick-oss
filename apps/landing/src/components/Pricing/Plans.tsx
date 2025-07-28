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

import styled from '@emotion/styled'

import { LandingMediaQuery } from '@brick-shared/styles/landing'
import { IPlan, PlanTitle } from '@brick/misc/data/plans'
import { Plan } from './Plan'
import { User } from 'src/pages/pricing'
import { DefaultSubscriptionPlanId } from '@brick/misc/constants/subscription'

type Props = { plans: IPlan[]; user?: User }

export const Plans = ({ plans, user }: Props) => {
  const maxFeatureBlockItems = plans.reduce(
    (acc, plan) => {
      const featuresArray = Object.entries(plan.features)
      featuresArray.forEach(([featureBlockTitle, features]) => {
        acc[featureBlockTitle as PlanTitle] = Math.max(
          acc[featureBlockTitle as PlanTitle] || 0,
          features.length,
        )
      })
      return acc
    },
    {} as { [key in PlanTitle]: number },
  )

  const currentUserPlan = user ? user?.subscriptionPlan || DefaultSubscriptionPlanId : undefined

  return (
    <>
      <Container>
        {plans.map((plan, index) => (
          <Plan
            currentUserPlan={currentUserPlan}
            plan={plan}
            key={index}
            maxFeatureBlockItems={maxFeatureBlockItems}
          />
        ))}
      </Container>
      <TabletContainer>
        {[...plans].map((plan, index) => (
          <Plan
            currentUserPlan={currentUserPlan}
            plan={plan}
            key={index}
            maxFeatureBlockItems={maxFeatureBlockItems}
          />
        ))}
      </TabletContainer>
    </>
  )
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;
  align-items: stretch;
  justify-content: center;
  width: 100%;

  padding-bottom: 20px;

  margin-bottom: 60px;

  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 40px;
  }

  @media (max-width: 1010px) {
    display: none;
  }

  ${LandingMediaQuery.mobile} {
    display: flex;
    flex-flow: column;
    gap: 24px;
    align-items: center;
    margin-bottom: 70px;
  }
`

const TabletContainer = styled(Container)`
  position: relative;
  display: none;
  align-items: stretch;
  justify-content: start;
  gap: 16px;
  overflow: scroll;

  padding-bottom: 20px;

  @media (max-width: 1010px) {
    display: flex;
  }

  ${LandingMediaQuery.mobile} {
    display: none;
  }
`