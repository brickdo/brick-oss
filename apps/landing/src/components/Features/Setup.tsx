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

import { LandingMediaQuery } from '@brick-shared/styles/landing'
import { FlexContainer } from '../FlexContainer'
import { Image } from '../Image'

export const Setup = () => {
  return (
    <Container>
      <BlueTitle>INSTANT SETUP</BlueTitle>
      <Title>Fast, simple & effortless.</Title>
      <ImageContainer>
        <Image
          src='/landing-assets/interface-features-screenshot.png'
          alt='interface screenshot'
          css={DesktopScreenshot}
        />
        <Image
          src='/landing-assets/interface-features-screenshot-mobile.png'
          alt='interface screenshot mobile'
          css={MobileScreenshot}
        />
      </ImageContainer>
    </Container>
  )
}

const BlueTitle = styled.h2``

const Title = styled.h1`
  margin-bottom: 45px;
  text-align: center;

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

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  max-width: 995px;
  max-height: 570px;

  width: 100%;
  height: 100%;

  ${LandingMediaQuery.smallDesktop} {
    max-height: 515px;
  }
`

const Container = styled(FlexContainer)`
  margin-bottom: 240px;

  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 200px;
  }

  ${LandingMediaQuery.tablet} {
    margin-bottom: 100px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 80px;
  }
`

const DesktopScreenshot = css`
  height: 100%;
  width: 100%;

  ${LandingMediaQuery.mobile} {
    display: none;
  }
`

const MobileScreenshot = css`
  height: 450px;
  width: auto;
  position: absolute;
  right: 30px;
  bottom: -130px;

  ${LandingMediaQuery.tablet} {
    display: none;
  }

  ${LandingMediaQuery.mobile} {
    height: 500px;
    display: block;
    position: static;
  }
`