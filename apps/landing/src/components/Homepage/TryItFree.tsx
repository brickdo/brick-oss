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
import { useModalContext } from 'src/context/ModalContext'
import image from '../../assets/tryItFree.svg'
import { Btn } from '../Btn'

export const TryItFree = () => {
  const { setModalState } = useModalContext()

  return (
    <>
      <Container>
        <Content>
          <Title>From documents to websites</Title>
          <Desc>Website builder, team wiki, personal notes — all in one.</Desc>
          <Buttons>
            <Btn
              styleType='primary'
              onClick={() => setModalState(state => ({ ...state, isSignUpModalOpen: true }))}
            >
              Try it free
            </Btn>
          </Buttons>
        </Content>
        <BlockImage src={image} />
      </Container>
    </>
  )
}

const BlockImage = styled.img`
  background-image: url(${image});
  background-size: cover;
  background-repeat: no-repeat;

  max-width: 600px;
  height: inherit;
  width: 100%;

  @media (max-width: 970px) {
    max-width: 350px;
  }
`

const Buttons = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: center;

  gap: 24px;

  @media (max-width: 970px) {
    flex-flow: column;
    align-items: start;
  }

  @media (max-width: 710px) {
    align-items: center;
  }
`

const Desc = styled.div`
  font-weight: normal;
  font-size: 20px;
  line-height: 24px;
  font-weight: 500;

  color: ${LandingColors.textGrey};

  margin-bottom: 40px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 16px;
    line-height: 24px;
    max-width: 290px;
  }

  @media (max-width: 710px) {
    text-align: center;
    width: 100%;
  }
`

const Title = styled.h1`
  font-size: 72px;
  line-height: 80px;

  margin-bottom: 20px;

  ${LandingMediaQuery.smallDesktop} {
    font-size: 48px;
    line-height: 56px;
  }

  @media (max-width: 710px) {
    text-align: center;
    width: 100%;
  }
`

const Content = styled.div`
  display: flex;
  flex-flow: column;
  align-items: start;
  justify-content: center;

  max-width: 652px;

  @media (max-width: 710px) {
    align-items: center;
  }
`

const Container = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: start;
  width: 100%;

  margin-top: 185px;

  width: 100%;

  margin-bottom: 200px;

  ${LandingMediaQuery.smallDesktop} {
    margin-top: 100px;
    margin-bottom: 150px;
  }

  @media (max-width: 970px) {
    align-items: center;
  }

  @media (max-width: 710px) {
    flex-flow: column;
    gap: 50px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 90px;
  }
`