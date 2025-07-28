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

import image from '../../assets/security.svg'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Btn } from '../Btn'
import { Card } from '../Card'
import { LineComponent } from '../Line'
import { useModalContext } from 'src/context/ModalContext'

export const Security = () => {
  const { setModalState } = useModalContext()

  return (
    <>
      <Container>
        <Gradient />
        <Column>
          <Image src={image} className='webImage' alt='security image web' />
          <LeftContent>
            <BlueTitle>Deep Focus on protection</BlueTitle>
            <LeftTitle>Privacy and security</LeftTitle>
            <LeftDesc>Learn what we do to ensure that you can use Brick safely</LeftDesc>
            <Image src={image} className='mobileImage' alt='security image mobile' />
            <BtnContainer>
              <Btn
                styleType='secondary'
                onClick={() => setModalState(state => ({ ...state, isSignUpModalOpen: true }))}
              >
                Sign up now
              </Btn>
            </BtnContainer>
          </LeftContent>
        </Column>
        <Column style={{ alignSelf: 'end' }}>
          <Info
            title={'Anonymous publishing'}
            desc={
              'Your pages cannot be traced back to you, or to each other. All your content stays perfectly separate, even while existing in a single workspace.'
            }
          />
          <Line />
          <Info
            title={'Safe and sound'}
            // re/ encryption: https://www.digitalocean.com/blog/announcing-managed-databases-for-postgresql
            desc={
              'Your pages are encrypted at rest and in transit. We make frequent backups and store them in two different locations. You can opt-in to receive a backup of all your data by email, every week.'
            }
          />
          <Line />
          <Info
            title={'EU-based and principled'}
            desc={
              "Brick is based in Estonia, and our servers are located in the Netherlands. We abide by the GDPR. We don't sell your data or inject ads. We don't censor anything beyond what is illegal. We are infrastructure, not a social network."
            }
          />
        </Column>
      </Container>
    </>
  )
}

const Info = (props: { title: string; desc: string }) => {
  return (
    <InfoBlock>
      <Title>{props.title}</Title>
      <Desc>{props.desc}</Desc>
    </InfoBlock>
  )
}

const Gradient = styled.div`
  position: absolute;
  width: 389px;
  height: 389px;
  left: -120px;
  top: -92px;

  background: linear-gradient(135.15deg, #ae80dc 1.17%, #dc83c3 31.88%, #8084dc 65.46%);
  mix-blend-mode: normal;
  opacity: 0.1;
  filter: blur(160px);

  ${LandingMediaQuery.smallDesktop} {
    display: none;
  }
`

const BtnContainer = styled.div`
  @media (max-width: 710px) {
    display: none;
  }
`

const LeftDesc = styled.div`
  font-size: 16px;
  line-height: 24px;

  color: ${LandingColors.textGrey};

  margin-bottom: 32px;

  @media (max-width: 985px) {
    max-width: 260px;
  }
`

const LeftTitle = styled.h1`
  margin-bottom: 24px;

  @media (max-width: 985px) {
    font-size: 36px;
    line-height: 44px;
  }

  @media (max-width: 710px) {
    max-width: 260px;
  }
`

const BlueTitle = styled.div`
  font-weight: 800;
  font-size: 12px;
  line-height: 16px;

  letter-spacing: 0.1em;
  text-transform: uppercase;

  color: ${LandingColors.lightBlue};

  margin-bottom: 16px;

  @media (max-width: 710px) {
    max-width: 260px;
    width: 100%;
    text-align: center;
  }
`

const LeftContent = styled.div`
  display: flex;
  flex-flow: column;

  align-items: start;
  align-self: start;

  max-width: 355px;

  @media (max-width: 710px) {
    align-self: center;
    align-items: center;
    text-align: center;
  }
`

const Image = styled.img`
  max-width: 345px;
  max-height: 295px;

  filter: drop-shadow(0px 12px 83px rgba(101, 122, 147, 0.18));

  width: 100%;
  height: 100%;

  display: flex;
  align-self: start;

  margin-bottom: 40px;

  @media (max-width: 985px) {
    max-width: 221px;
    max-height: 190px;
  }
`

const Line = styled(LineComponent)`
  height: 2px;
  max-width: 338px;

  margin: 40px 0;

  @media (max-width: 710px) {
    max-width: 100%;
  }
`

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;

  color: ${LandingColors.textGrey};
`

const Title = styled.h1`
  font-size: 20px;
  line-height: 24px;

  margin-bottom: 16px;
`

const InfoBlock = styled.div`
  display: flex;
  flex-flow: column;

  align-items: start;

  max-width: 338px;

  width: 100%;

  @media (max-width: 710px) {
    max-width: 100%;
    align-items: center;
  }
`

const Column = styled.div`
  display: flex;
  flex-flow: column;

  align-items: end;
  justify-content: center;

  width: 50%;

  & .mobileImage {
    display: none;
  }

  @media (max-width: 710px) {
    align-items: center;
    width: 100%;

    & .webImage {
      display: none;
    }

    & .mobileImage {
      display: block;
    }
  }
`

const Container = styled(Card)`
  max-width: 1120px;
  height: 100%;
  width: 100%;
  overflow: hidden;

  padding: 35px 80px 100px 64px;

  align-self: center;

  margin: 135px 0;

  @media (max-width: 710px) {
    flex-flow: column;
    max-width: 480px;
    padding: 40px 32px;

    justify-content: center;
  }

  ${LandingMediaQuery.smallDesktop} {
    margin: 112px 0;
  }

  ${LandingMediaQuery.tablet} {
    margin: 88px 0;
  }

  ${LandingMediaQuery.mobile} {
    margin: 48px 0;
  }
`