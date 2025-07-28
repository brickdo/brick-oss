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

import 'swiper/css'
import 'swiper/css/navigation'

import styled from '@emotion/styled'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import emptyStar from '../../assets/emptyStar.svg'
import navigation from '../../assets/navigation.svg'
import star from '../../assets/star.svg'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { IReview } from '../../types/types'
import { FlexContainer } from '../FlexContainer'
import { Image } from '../Image'

SwiperCore.use([Navigation])

export const Reviews = ({ data }: { data: IReview[] }) => {
  return (
    <Container>
      <Title>What people are saying</Title>
      <Swiper
        navigation={{
          nextEl: '.next',
          prevEl: '.prev',
        }}
        loop={true}
        slidesPerView={3}
        spaceBetween={1}
        breakpoints={{
          '935': {
            slidesPerView: 3,
          },
          '1': {
            slidesPerView: 1,
          },
        }}
        style={{ width: '100%', marginBottom: '100px' }}
        className='mySwiper'
      >
        {data.map((val, index) => (
          <SwiperSlide key={index}>
            <Review stars={val.stars} text={val.text} name={val.name} via={val.via} />
          </SwiperSlide>
        ))}
      </Swiper>
      <NavigationBlock>
        <Image
          height='14px'
          width='38px'
          src={navigation}
          className='prev rotate'
          alt='Navigation icon'
        />
        <Image height='14px' width='38px' src={navigation} className='next' alt='Navigation icon' />
      </NavigationBlock>
    </Container>
  )
}

const Review = (props: IReview) => {
  return (
    <ReviewBlock>
      <ReviewText>“ {props.text} “</ReviewText>
      <Stars count={props.stars} />
      <Name>{props.name}</Name>
      <Via>{props.via}</Via>
    </ReviewBlock>
  )
}

const Stars = ({ count }: { count: number }) => {
  return (
    <StarsBlock>
      {Array.from(Array(5).keys()).map((val, index) => {
        if (val < count) {
          return <Star key={index} />
        } else {
          return <EmptyStar key={index} />
        }
      })}
    </StarsBlock>
  )
}

const NavigationBlock = styled.div`
  display: flex;
  flex-flow: row;
  gap: 25px;

  & img {
    cursor: pointer;
  }

  & .rotate {
    transform: rotate(180deg);
  }
`

const Title = styled.h1`
  text-align: center;

  max-width: 370px;
  margin-bottom: 80px;
`

const Star = styled.div`
  background-image: url(${star});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;

  width: 23px;
  height: 23px;
`

const EmptyStar = styled(Star)`
  background-image: url(${emptyStar});
`

const StarsBlock = styled.div`
  display: flex;
  flex-flow: row;

  justify-content: center;
  align-items: center;

  gap: 16px;

  margin: 33px 0;
`

const Via = styled.div`
  font-size: 16px;
  line-height: 24px;

  text-align: center;

  color: ${LandingColors.textGrey};
`

const Name = styled.h1`
  font-size: 18px;
  line-height: 24px;

  text-align: center;

  margin-bottom: 4px;
`

const ReviewText = styled.div`
  font-size: 20px;
  line-height: 24px;

  text-align: center;

  max-width: 320px;

  ${LandingMediaQuery.smallDesktop} {
    max-width: 230px;
  }
`

const ReviewBlock = styled.div`
  display: flex;
  flex-flow: column;

  justify-content: center;
  align-items: center;
`

const Container = styled(FlexContainer)`
  margin-bottom: 150px;

  max-width: 1120px;
  width: 100%;
  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 125px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 100px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 60px;
  }
`