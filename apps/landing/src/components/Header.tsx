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
import { Slant as Hamburger } from 'hamburger-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'
import 'large-small-dynamic-viewport-units-polyfill'

import logo from '../assets/logo.svg'
import menuImage from '../assets/menu.svg'
import { IModalContext, initialModalState, useModalContext } from '../context/ModalContext'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Btn } from './Btn'
import { Image } from './Image'
import { CheckInboxModal } from './Modals/CheckInbox'
import { SignInModal } from './Modals/SignIn'
import { SignUpModal } from './Modals/SignUp'
import { Nav } from './Nav'
import { useUser } from 'src/pages/_app'
import { RequestResetPasswordModal } from './Modals/RequestResetPasswordModal'
import { CompleteResetPasswordModal } from './Modals/CompleteResetPasswordModal'

const AuthButtonsContainer = ({
  onClick,
}: {
  onClick: Dispatch<SetStateAction<IModalContext>>
}) => {
  return (
    <AuthButtons>
      <Btn
        styleType='text'
        className='login'
        onClick={() =>
          onClick(prev => ({
            ...prev,
            ...initialModalState,
            isSignInModalOpen: true,
          }))
        }
      >
        Log in
      </Btn>
      <Btn
        styleType='primary'
        onClick={() =>
          onClick(prev => ({
            ...prev,
            ...initialModalState,
            isSignUpModalOpen: true,
          }))
        }
      >
        Sign up
      </Btn>
    </AuthButtons>
  )
}

type Props = {}

export const Logo = () => (
  <Link href='/'>
    <a id='logo'>
      <Image height='55px' src={logo} alt='Brick logo' />
    </a>
  </Link>
)

export const Header = (props: Props) => {
  const { user } = useUser()
  const { modalState, setModalState } = useModalContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isAnyModalOpen = Object.values(modalState).some(Boolean)

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  })

  const router = useRouter()

  useEffect(() => {
    setModalState(initialModalState)
  }, [setModalState, router.pathname])

  useEffect(() => {
    if ('success-email-confirmed' in router.query) {
      setModalState(state => ({ ...state, isVerifiedModalOpen: true }))
    }
  }, [setModalState, router.query])

  // Hide the menu when the modal state changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [modalState])

  const toggleMenu = () => {
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden'

    setIsMenuOpen(!isMenuOpen)
  }

  const animProps = useSpring({
    height: isMenuOpen ? '100vh' : '0',
    opacity: isMenuOpen ? 1 : 0,
    display: isMenuOpen ? 'flex' : 'none',
  })

  const goToApp = () => {
    window.location.href = `https://${process.env.PUBLICVAR_BRICK_HOST!}`
  }

  return (
    <>
      <header>
        <Container>
          <Logo />
          <WebNav>
            <Nav />
            <AuthButtonsContainer onClick={user ? goToApp : setModalState} />
          </WebNav>

          <MobileNav>
            <Hamburger toggled={isMenuOpen} toggle={toggleMenu} />
          </MobileNav>
        </Container>
      </header>

      <AnimatedContainer style={{ ...animProps }}>
        <MenuContainer>
          <AnimatedContainerContent>
            <Nav toggleMenu={toggleMenu} />
            <AuthButtonsContainer onClick={user ? goToApp : setModalState} />
          </AnimatedContainerContent>
          <MenuImg src={menuImage} />
        </MenuContainer>
      </AnimatedContainer>

      <SignInModal />
      <SignUpModal />
      <SignInModal verified />
      <CheckInboxModal />
      <RequestResetPasswordModal isOpen={modalState.isRequestResetPasswordModalOpen} />
      <CompleteResetPasswordModal />
    </>
  )
}

const AnimatedContainer = styled(animated.div)`
  overflow: hidden;
  position: absolute;
  width: 100%;
  max-height: 100vh;
  max-height: calc(var(--1dvh, 1vh) * 100);
  max-height: 100dvh;

  padding: 48px 80px 0;
  top: 0;

  z-index: 100;

  background: ${LandingColors.light};

  ${LandingMediaQuery.desktop} {
    display: none;
  }

  @media (max-width: 1240px) {
    padding: 48px 64px 0;
  }

  ${LandingMediaQuery.tablet} {
    padding: 48px 32px 0;
  }
`

const Container = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;

  width: 100%;

  padding: 48px 80px 0;
  position: relative;
  z-index: 101;

  background-color: ${LandingColors.light};

  @media (max-width: 1240px) {
    padding: 48px 64px 0;
  }

  ${LandingMediaQuery.tablet} {
    padding: 48px 32px 0;
  }

  @media (max-width: 570px) {
    & > #logo {
      z-index: 200;
    }
    z-index: 200;
  }
`

const AnimatedContainerContent = styled.div`
  width: 100%;
  padding: 120px 0 0 0;
  display: flex;
  flex-flow: column;
  justify-content: space-between;

  ${LandingMediaQuery.mobile} {
    padding: 90px 0 0 0;
  }
`

const AuthButtons = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  gap: 8px;

  button {
    font-size: 18px;
    letter-spacing: 0.8px;
  }

  ${LandingMediaQuery.smallDesktop} {
    justify-content: start;
    padding: 0 0 64px;

    bottom: 0;
  }

  ${LandingMediaQuery.mobile} {
    justify-content: center;
    gap: 12px;
    width: 100%;

    & .login {
      border: 2px solid ${LandingColors.textGrey};
    }

    & button {
      width: 100%;
    }
  }
`

const WebNav = styled.div`
  display: flex;
  flex-flow: row;
  width: 100%;
  margin-left: 90px;

  & button {
    border: none;
  }
  ${LandingMediaQuery.smallDesktop} {
    display: none;
  }
`

const MobileNav = styled.div`
  ${LandingMediaQuery.desktop} {
    display: none;
  }
`

const MenuContainer = styled.div`
  position: relative;
  display: flex;
  flex-flow: row;

  height: 100%;
`

const MenuImg = styled.img`
  display: flex;
  align-self: center;
  width: 520px;
  height: 440px;

  position: absolute;

  top: 60px;
  right: 20px;
  z-index: -1;

  ${LandingMediaQuery.tablet} {
    width: 430px;
    height: 375px;

    top: 100px;
    right: 5px;
  }

  @media (max-width: 570px) {
    display: none;
  }
`