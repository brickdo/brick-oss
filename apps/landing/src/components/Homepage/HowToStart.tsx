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

import step1Image from '../../assets/step1.svg'
import step2Image from '../../assets/step2.svg'
import step3Image from '../../assets/step3.svg'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { FlexContainer } from '../FlexContainer'

export const HowToStart = () => {
  return (
    <>
      <Container>
        <h2>How to start?</h2>
        <Title>Fast, simple & effortless.</Title>
        <Steps>
          <Step image={step1Image} step={1} desc={'Open Brick'} />
          <Line />
          <Step image={step2Image} step={2} desc={'Create a new page'} />
          <Line />
          <Step image={step3Image} step={3} desc={'Share with people'} />
        </Steps>
      </Container>
    </>
  )
}

type StepType = {
  image: string
  step: number
  desc: string
}

const Step = (props: StepType) => {
  return (
    <StepBlock>
      <StepImage image={props.image} />
      <Number>Step {props.step}</Number>
      <Desc>{props.desc}</Desc>
    </StepBlock>
  )
}

const Line = styled.div`
  width: 4px;
  height: inherit;
  background: ${LandingColors.lightBlue};
  opacity: 0.1;

  @media (max-width: 555px) {
    width: 100%;
    height: 4px;
  }
`

const Steps = styled.div`
  display: flex;
  flex-flow: row;

  max-width: 836px;
  width: 100%;
  min-width: 500px;

  @media (max-width: 555px) {
    flex-flow: column;
    min-width: auto;
  }
`

const StepBlock = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  width: 100%;

  padding: 10px 0;
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;

  text-align: center;
`

const Number = styled.div`
  background: ${LandingColors.lightBlue};
  border-radius: 90px;

  font-weight: 900;
  font-size: 12px;
  line-height: 24px;

  padding: 2px 10px;
  color: rgba(255, 255, 255, 0.75);

  margin: 22px 0 16px;
`

const StepImage = styled.div<{ image: string }>`
  width: 64px;
  height: 64px;

  background-image: url(${props => props.image});
  background-size: cover;
  background-repeat: no-repeat;
`

const Title = styled.h1`
  text-align: center;

  margin-bottom: 48px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 40px;
    line-height: 48px;
  }

  ${LandingMediaQuery.tablet} {
    font-size: 36px;
    line-height: 44px;
  }

  ${LandingMediaQuery.mobile} {
    font-size: 32px;
    line-height: 40px;
  }
`

const Container = styled(FlexContainer)`
  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 125px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 110px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 50px;
  }
`