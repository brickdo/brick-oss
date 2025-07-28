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

import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { FlexContainer } from '../FlexContainer'
import { Image } from '../Image'
import { LineComponent } from '../Line'

export interface IFeatureDescriptionItem {
  image: string
  _title: string
  desc: string
}

export const Description = ({ data }: { data: IFeatureDescriptionItem[] }) => {
  return (
    <Container>
      {data.map((val, index) => {
        return <Item {...val} isLast={index === data.length - 1} key={index} />
      })}
    </Container>
  )
}

const Item = (props: IFeatureDescriptionItem & { isLast: boolean }) => {
  return (
    <>
      <ItemContainer key={props._title.length}>
        <div
          css={css`
            background: #e8135c;
            width: 80px;
            height: 80px;
            border-radius: 9999px;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <Image height='40px' width='40px' src={props.image} alt='desc item' />
        </div>
        <Title>{props._title}</Title>
        <Desc>{props.desc}</Desc>
      </ItemContainer>
      {!props.isLast ? <Line /> : null}
    </>
  )
}

const Container = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;

  height: 290px;

  justify-content: center;
  align-items: start;

  gap: 82px;
  width: 100%;

  margin-bottom: 135px;

  @media (max-width: 1360px) {
    margin-bottom: 110px;
    gap: 40px;
  }

  @media (max-width: 1000px) {
    overflow: scroll;
    justify-content: start;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 90px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom:;
  }
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;
  color: ${LandingColors.textGrey};

  width: 265px;
`

const Title = styled.h1`
  font-size: 20px;
  line-height: 24px;
  width: 265px;
  margin: 48px 0 24px;
`

const ItemContainer = styled(FlexContainer)`
  align-items: start;
`
const Line = styled(LineComponent)`
  min-width: 4px;
  width: 4px;
  height: 100%;
`