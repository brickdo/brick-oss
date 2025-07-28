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

import { FAQ } from '../components/FAQ'
import { PageContainer } from '../components/PageContainer'
import { Plans } from '../components/Pricing/Plans'
import { plans } from '@brick/misc/data/plans'
import { pricingFAQdata } from '../data/pricingFAQ'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import axios from 'axios'
import { NextPageContext } from 'next'
import { useUser } from './_app'
import { useEffect } from 'react'

export type User = {
  id: string
  name: string
  email: string
  subscriptionPlan: string | null
  customerId: string | null
  isAgreedMailing: boolean
  periodicBackups: boolean
}

export default function Pricing({ user }: { user?: User }) {
  const { setUser } = useUser()

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return (
    <>
      <Containter>
        <Title>Choose the plan</Title>
        <Desc>Pay by month or the year, and cancel at any time.</Desc>
        <Plans user={user} plans={plans} />
        <FAQ data={pricingFAQdata} />
      </Containter>
    </>
  )
}

export async function getServerSideProps(context: NextPageContext) {
  let user
  try {
    const response = await axios.get(`https://${process.env.PUBLICVAR_BRICK_HOST!}/api/profile`, {
      headers: {
        cookie: context?.req?.headers.cookie || '',
      },
    })
    user = response?.data || user
  } catch (error) {
    console.log(error)
  }
  return {
    props: {
      user,
    },
  }
}

const Title = styled.h1`
  font-size: 56px;
  line-height: 70px;

  text-align: center;
  margin-bottom: 16px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 48px;
    line-height: 56px;
  }

  ${LandingMediaQuery.tablet} {
    font-size: 44px;
  }

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: 48px;
  }
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;

  text-align: center;

  color: ${LandingColors.textGrey};

  margin-bottom: 56px;

  ${LandingMediaQuery.mobile} {
    margin-bottom: 48px;
    max-width: 265px;
  }
`

const Containter = styled(PageContainer)`
  position: relative;
  margin: 72px 0 135px;

  ${LandingMediaQuery.smallDesktop} {
    margin: 64px 0 72px;
  }

  ${LandingMediaQuery.tablet} {
    margin: 64px 0 90px;
  }

  ${LandingMediaQuery.mobile} {
    margin: 35px 0 90px;
  }
`