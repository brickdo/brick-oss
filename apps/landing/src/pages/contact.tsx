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
import Head from 'next/head'

import image from '../assets/contact.svg'
import { ContactForm } from '../components/Contact/ContactForm'
import { FlexContainer } from '../components/FlexContainer'
import { Image } from '../components/Image'
import { PageContainer } from '../components/PageContainer'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'

export default function Contact() {
  return (
    <>
      <Head>
        <title>Brick: Contact</title>
      </Head>
      <Container>
        <Image
          height='415px'
          width='445px'
          src={image}
          className='contact-image'
          alt='contact image'
        />
        <Form>
          <Title>Contact Us</Title>
          <Desc>Questions, bug reports, feedback.</Desc>
          <ContactForm />
        </Form>
      </Container>
    </>
  )
}

const Desc = styled.div`
  font-size: 16px;
  line-height: 24px;

  color: ${LandingColors.textGrey};

  margin: 12px 0 48px;

  ${LandingMediaQuery.mobile} {
    margin: 16px 0 40px;
  }
`

const Title = styled.h1`
  ${LandingMediaQuery.smallDesktop} {
    font-size: 40px;
    line-height: 48px;
  }

  ${LandingMediaQuery.tablet} {
    font-size: 36px;
    line-height: 44px;
  }

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: 48px;
  }
`

const Form = styled(FlexContainer)`
  align-items: start;

  max-width: 405px;
  width: 100%;

  ${LandingMediaQuery.smallDesktop} {
    max-width: 436px;
  }

  ${LandingMediaQuery.tablet} {
    max-width: 474px;
  }

  ${LandingMediaQuery.mobile} {
    max-width: 100%;
    align-items: center;
  }
`

const Container = styled(PageContainer)`
  flex-flow: row;
  align-items: center;
  justify-content: center;

  gap: 170px;

  margin: 120px 0px;

  ${LandingMediaQuery.smallDesktop} {
    gap: 90px;

    margin: 65px 0 120px;
  }

  @media (max-width: 940px) {
    & .contact-image {
      display: none;
    }
  }

  ${LandingMediaQuery.tablet} {
    margin: 65px 0 90px;
  }

  ${LandingMediaQuery.mobile} {
    margin: 35px 0 50px;
  }
`