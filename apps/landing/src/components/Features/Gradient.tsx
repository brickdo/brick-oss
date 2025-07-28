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
import { Btn } from '../Btn'
import { Card } from '../Card'
import { useModalContext } from 'src/context/ModalContext'

export const Gradient = () => {
  const { setModalState } = useModalContext()

  return (
    <Container>
      <Title>Start making sites with Brick</Title>
      <BtnContainer>
        <Btn
          styleType='primary'
          onClick={() => setModalState(state => ({ ...state, isSignUpModalOpen: true }))}
        >
          Try it free
        </Btn>
      </BtnContainer>
    </Container>
  )
}

const Container = styled(Card)`
  flex-flow: column;
  align-items: center;
  background: linear-gradient(
      75.18deg,
      rgba(255, 0, 90, 0.15) -6.51%,
      rgba(8, 67, 152, 0.15) 75.47%
    ),
    #ffffff;
  background-blend-mode: hard-light, normal;
  mix-blend-mode: normal;
  width: 100%;

  padding: 92px 20px;

  margin: 136px 0;

  ${LandingMediaQuery.smallDesktop} {
    padding: 64px 20px;
    margin: 112px 0;
  }

  ${LandingMediaQuery.tablet} {
    margin: 88px 0;
  }

  ${LandingMediaQuery.mobile} {
    margin: 45px 0;
    padding: 80px 20px;
  }
`

const Title = styled.h1`
  font-size: 56px;
  line-height: 64px;
  text-align: center;

  margin-bottom: 32px;

  max-width: 700px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 48px;
    line-height: 56px;
  }

  ${LandingMediaQuery.tablet} {
    font-size: 44px;
    line-height: 56px;
    margin-bottom: 24px;
  }

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: 48px;
    margin-bottom: 32px;
  }
`

const BtnContainer = styled.div`
  max-width: 220px;
  width: 100%;

  & button {
    width: 100%;
  }

  ${LandingMediaQuery.mobile} {
    max-width: 125px;
  }
`