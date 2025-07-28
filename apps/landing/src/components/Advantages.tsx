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

import { LandingColors } from '@brick-shared/styles/landing'
import { IAdvantage } from '../types/types'
import { Image } from './Image'
import { LineComponent } from './Line'

export const Advantages = ({ data }: { data: IAdvantage[] }) => {
  return (
    <>
      <Container>
        {data.map((val, index) => (
          <Advantage image={val.image} title={val.title} desc={val.desc} key={index} />
        ))}
      </Container>
    </>
  )
}

const Advantage = (props: IAdvantage) => {
  return (
    <AdvantageBlock>
      <Image height='48px' width='48px' src={props.image} alt='advantage icon' />
      <Title>{props.title}</Title>
      <Line />
      <Desc>{props.desc}</Desc>
    </AdvantageBlock>
  )
}

const Line = styled(LineComponent)`
  width: 80px;
  height: 4px;

  margin: 24px 0;
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;
  text-align: center;

  color: ${LandingColors.textGrey};
`

const Title = styled.h1`
  font-size: 20px;
  line-height: 24px;
  margin-top: 24px;
`

const AdvantageBlock = styled.div`
  position: relative;
  display: flex;
  flex-flow: column;
  align-items: center;

  max-width: 262px;
  width: 100%;

  @media (max-width: 1120px) {
    min-width: 205px;
    max-width: 205px;
    z-index: -1;
  }
`

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;

  align-content: stretch;

  justify-self: center;
  align-self: center;
  justify-content: center;

  row-gap: 78px;
  column-gap: 24px;

  @media (max-width: 950px) {
    row-gap: 0;
    column-gap: 24px;
    flex-flow: row;
    overflow: scroll;
    justify-content: start;
  }
`