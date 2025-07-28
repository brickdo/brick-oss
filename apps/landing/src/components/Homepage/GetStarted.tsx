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

import image from '../../assets/getStarted.svg'
import { LandingMediaQuery } from '@brick-shared/styles/landing'
import { Btn } from '../Btn'
import { Card } from '../Card'
import { useModalContext } from 'src/context/ModalContext'

export const GetStarted = () => {
  const { setModalState } = useModalContext()

  return (
    <Container>
      <LeftColumn>
        <Title>Get started with Brick today</Title>
        <Btn
          styleType='primary'
          onClick={() => setModalState(state => ({ ...state, isSignUpModalOpen: true }))}
        >
          Try it free
        </Btn>
      </LeftColumn>
      <Image src={image} alt='get started image' />
    </Container>
  )
}

const Image = styled.img`
  display: flex;
  align-self: center;
  width: 100%;
  height: inherit;
  max-height: 531px;

  max-width: 574px;

  ${LandingMediaQuery.smallDesktop} {
    max-width: 374px;
    max-height: 350px;
  }
`

const Title = styled.h1`
  font-size: 72px;
  line-height: 80px;

  max-width: 455px;
  margin-bottom: 32px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 48px;
    line-height: 56px;
  }

  @media (max-width: 850px) {
    font-size: 40px;
    line-height: 48px;
  }
`

const LeftColumn = styled.div`
  display: flex;
  flex-flow: column;

  padding: 96px 0 180px 112px;

  ${LandingMediaQuery.smallDesktop} {
    padding: 115px 0 205px 64px;
  }

  @media (max-width: 710px) {
    padding: 70px 30px 50px;
    align-items: center;
    text-align: center;
  }
`

const Container = styled(Card)`
  margin-bottom: 140px;

  padding: 10px 10px 0 0px;

  @media (max-width: 710px) {
    flex-flow: column;
    padding: 10px 10px 65px 0px;
  }

  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 112px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 100px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 50px;
  }
`