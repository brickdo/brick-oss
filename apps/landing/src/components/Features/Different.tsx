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

import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Btn } from '../Btn'
import { FlexContainer } from '../FlexContainer'
import { useModalContext } from 'src/context/ModalContext'

export const Different = () => {
  const { setModalState } = useModalContext()

  return (
    <Container>
      <Title>What makes Brick different?</Title>
      <Desc>The easiest way to make sites.</Desc>
      <BtnsContainer>
        <Btn
          styleType='primary'
          style={{ minWidth: '220px' }}
          onClick={() => setModalState(state => ({ ...state, isSignUpModalOpen: true }))}
        >
          Try it free
        </Btn>
      </BtnsContainer>
    </Container>
  )
}

const Title = styled.h1`
  font-size: 56px;
  line-height: 70px;

  text-align: center;

  max-width: 500px;

  margin-bottom: 20px;

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
  font-size: 20px;
  line-height: 24px;
  text-align: center;
  color: ${LandingColors.textGrey};

  margin-bottom: 32px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 16px;
  }

  ${LandingMediaQuery.mobile} {
    max-width: 260px;
  }
`

const BtnsContainer = styled.div`
  display: flex;
  flex-flow: row;

  gap: 24px;

  margin-bottom: 115px;

  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 75px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 64px;
  }

  ${LandingMediaQuery.mobile} {
    flex-flow: column;
    margin-bottom: 56px;

    & button {
      width: 100%;
    }
  }
`

const ImageContainer = styled.div`
  display: flex;

  max-width: 570px;
  max-height: 375px;

  width: 100%;
  height: 100%;

  justify-content: center;
  align-items: center;

  ${LandingMediaQuery.tablet} {
    max-width: 475px;
    max-height: 310px;
  }

  ${LandingMediaQuery.mobile} {
    max-width: 295px;
    max-height: 195px;
  }
`

const Container = styled(FlexContainer)`
  margin: 72px 0 100px;

  ${LandingMediaQuery.smallDesktop} {
    margin: 64px 0 185px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 150px;
  }

  ${LandingMediaQuery.mobile} {
    margin: 36px 0 110px;
  }
`