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

import { css } from '@emotion/react'
import styled from '@emotion/styled'
import { loadStripe } from '@stripe/stripe-js/pure'

import { Price } from '../../components/Pricing/Price'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { IPlan, PlanTitle } from '@brick/misc/data/plans'
import { Btn } from '../Btn'
import { FeatureList } from './FeatureList'
import {
  DefaultSubscriptionPlanId,
  stripePublishableKey,
  SubscriptionPlanId,
} from '@brick/misc/constants/subscription'
import axios from 'axios'
import { useModalContext } from 'src/context/ModalContext'

export const MOST_POPULAR_PLAN_ADDITIONAL_PADDING = 15

export type MaxFeatureBlockItems = { [key in PlanTitle]: number }

type Props = {
  plan: IPlan
  maxFeatureBlockItems: MaxFeatureBlockItems
  currentUserPlan?: string
}

export const Plan = ({ plan, maxFeatureBlockItems, currentUserPlan }: Props) => {
  const isLoggedInUser = currentUserPlan != null
  const isCurrentPlan = isLoggedInUser && currentUserPlan === plan.id
  const { setModalState } = useModalContext()

  const switchToPlan = async () => {
    const stripe = await loadStripe(stripePublishableKey)
    if (!stripe) {
      throw new Error('Stripe not loaded')
    }
    if (isCurrentPlan) {
      return
    }
    const successUrlRelative = '/settings/subscription'
    const currentDomain = window.location.origin
    const successUrl = `${currentDomain}${successUrlRelative}`
    const cancelUrl = window.location.href
    if (plan.id === DefaultSubscriptionPlanId) {
      await axios.put('/api/subscription/cancel')
      window.location.href = successUrlRelative
    }
    const sessionId = (
      await axios.post(`/api/subscription/create-checkout-session`, {
        planId: plan.id,
        successUrl,
        cancelUrl,
      })
    ).data
    if (sessionId) {
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })
      if (error) {
        throw new Error(error.message)
      }
    } else {
      window.location.href = successUrlRelative
    }
  }

  const signUp = () => setModalState(state => ({ ...state, isSignUpModalOpen: true }))

  return (
    <Container {...plan}>
      <MostPopular {...plan}> MOST POPULAR </MostPopular>
      <Content {...plan}>
        <Title {...plan}>{plan._title}</Title>
        <Price price={plan.price} />
        <Desc>{plan.desc}</Desc>
      </Content>
      <FeatureList plan={plan} maxFeatureBlockItems={maxFeatureBlockItems} />
      <BtnContainer>
        <Btn
          styleType={plan.id === SubscriptionPlanId.free ? 'secondary' : 'primary'}
          onClick={() =>
            isCurrentPlan ? null : isLoggedInUser ? void switchToPlan() : void signUp()
          }
          css={css`
            margin-top: 24px;
          `}
          disabled={isCurrentPlan}
        >
          {isLoggedInUser ? (isCurrentPlan ? 'Current' : 'Switch') : 'Sign up'}
        </Btn>
      </BtnContainer>
    </Container>
  )
}

const BtnContainer = styled.div`
  display: flex;

  align-self: center;
  margin-top: auto;
  width: 220px;

  & button {
    width: 100%;
  }
`

const Container = styled.div<IPlan>`
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-flow: column;
  box-shadow: ${props =>
    props.mostPopular
      ? `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px`
      : `0px 5px 35px rgba(101, 122, 147, 0.05)`};
  background-color: ${LandingColors.white};
  ${props => props.mostPopular && `margin-top: -${MOST_POPULAR_PLAN_ADDITIONAL_PADDING}px;`}

  ${props => css`
    width: ${props.mostPopular ? '384px' : '368px'};
    z-index: ${props.mostPopular ? '2' : '1'};
    min-height: ${props.mostPopular ? '684px' : '668px'};
  `}

  padding: 0 40px 20px;
  border-radius: 24px;

  @media (max-width: 1105px) {
    padding: 0 24px 25px;
  }

  ${LandingMediaQuery.smallDesktop} {
    min-height: 701px;
    margin-top: 0;
  }

  @media (max-width: 1010px) {
    min-width: 319px;
  }

  ${LandingMediaQuery.mobile} {
    max-width: 343px;
    width: 100%;
    padding-bottom: 15px;
    min-height: 255px;
  }
`

const Title = styled.h1<IPlan>`
  font-size: 24px;
  line-height: 32px;
  margin-bottom: 24px;
`

const Content = styled.div<IPlan>`
  padding-top: ${props =>
    !props.mostPopular ? '57px' : `${57 + MOST_POPULAR_PLAN_ADDITIONAL_PADDING}px`};

  margin-bottom: 20px;

  ${LandingMediaQuery.smallDesktop} {
    padding-top: 72px;
  }

  ${LandingMediaQuery.mobile} {
    padding-top: 72px;
  }
`

const MostPopular = styled.div<IPlan>`
  display: ${props => (props.mostPopular ? 'flex' : 'none')};
  position: absolute;
  box-sizing: border-box;

  justify-content: center;
  align-items: center;
  height: 32px;
  width: max-content;

  font-size: 11px;
  font-weight: 800;
  line-height: 16px;
  color: ${LandingColors.white};

  padding: 8px 16px;

  top: 8px;
  right: 8px;

  background: ${LandingColors.lightBlue};
  border-radius: 100px;

  ${LandingMediaQuery.mobile} {
    top: 24px;
    left: 24px;
  }
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;
  height: 72px;
  color: ${LandingColors.textGrey};
`