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
import Link from 'next/link'

import facebook from '../assets/fb.svg'
import instagram from '../assets/ig.svg'
import logo from '../assets/logo.svg'
import twitter from '../assets/tw.svg'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Image } from './Image'
import { LineComponent } from './Line'

const Socials = () => {
  const socialsArr = [
    {
      icon: facebook,
      url: 'https://www.facebook.com/groups/895188158043540',
      alt: 'Facebook',
    },
    {
      icon: twitter,
      url: 'https://twitter.com/trybrick',
      alt: 'Twitter',
    },
    {
      icon: instagram,
      url: 'https://www.instagram.com/brickdo_/',
      alt: 'Instagram',
    },
  ]
  return (
    <SocialIconContainer>
      {socialsArr.map((val, index) => (
        // eslint-disable-next-line react/jsx-no-target-blank
        <a key={index} href={val.url} target='_blank'>
          <Image height='16px' width='16px' src={val.icon} alt={val.alt} />
        </a>
      ))}
    </SocialIconContainer>
  )
}

export const Footer = () => {
  return (
    <footer>
      <Container>
        <Content>
          <BrickAppContainer>
            <LogoAndDesc>
              <Link href='/'>
                <a>
                  <Image height='41px' width='101px' src={logo} alt='Logo' />
                </a>
              </Link>
              {/* <AppDesc>
                Join millions of people who organize work and life with Brick App.
              </AppDesc> */}
            </LogoAndDesc>
          </BrickAppContainer>
        </Content>
        <Line />
        <SocialsAndContributorContainer>
          <Contributor>
            © 2020—2022 <a href='https://monadfix.com'>Monadfix OÜ</a>
          </Contributor>
          <Socials />
        </SocialsAndContributorContainer>
      </Container>
    </footer>
  )
}

const Container = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: start;

  padding: 0 80px 80px;

  width: 100%;

  position: relative;
  bottom: 0px;

  @media (max-width: 1240px) {
    padding: 0 64px 30px;
  }

  ${LandingMediaQuery.tablet} {
    padding: 0 32px 25px;
  }

  ${LandingMediaQuery.mobile} {
    padding: 0 20px 25px;
  }
`

const Content = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  width: 100%;

  @media (max-width: 1240px) {
    flex-flow: row;
  }

  @media (max-width: 850px) {
    flex-flow: column;
    gap: 24px;
  }

  ${LandingMediaQuery.mobile} {
    align-items: center;
  }
`

const BrickAppContainer = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: start;
`

const NavAndAppsContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  @media (max-width: 1240px) {
    width: auto;
    align-items: start;
  }
`

const LogoAndDesc = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: start;

  ${LandingMediaQuery.mobile} {
    align-items: center;
  }
`

const Apps = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;

  gap: 12px;
`

const AppDesc = styled.div`
  font-size: 16px;
  line-height: 24px;

  color: ${LandingColors.textGrey};

  max-width: 345px;
  margin-top: 30px;

  margin-bottom: 24px;

  @media (max-width: 1240px) {
    margin-bottom: 0;
  }

  ${LandingMediaQuery.mobile} {
    text-align: center;
    max-width: 229px;
  }
`

const NavContainer = styled.div`
  @media (max-width: 1240px) {
    display: none;
  }
`

const Line = styled(LineComponent)`
  margin: 5px 0 24px;

  @media (max-width: 1240px) {
    margin: 24px 0;
  }
`

const SocialIconContainer = styled.div`
  display: flex;
  flex-flow: row;
  gap: 24px;

  & img {
    &:hover {
      filter: brightness(70%);
      transition: filter 0.5s;
    }
  }
`

const SocialsAndContributorContainer = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  ${LandingMediaQuery.mobile} {
    flex-flow: column;
    gap: 24px;
  }
`

const Contributor = styled.div`
  font-weight: 600;
  font-size: 13px;
  line-height: 24px;

  color: ${LandingColors.textGrey};
  & a {
    text-decoration: none;
  }
`