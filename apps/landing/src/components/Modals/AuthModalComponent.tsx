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

import githubLogo from '../../assets/github_logo.svg'
import closeIcon from '../../assets/close-modal.svg'
import googleLogo from '../../assets/google_logo.svg'
import { initialModalState, useModalContext } from '../../context/ModalContext'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { createChildWindow } from '@brick/lib/createChildWindow'
import { Btn } from '../Btn'
import { Image } from '../Image'

export enum ModalType {
  signIn,
  signUp,
  checkInbox,
  verified,
}

export interface ModalStatus {
  isOpen: boolean
}

interface AuthProps extends ModalStatus {
  type: ModalType
  _title: string
  desc?: string
}

export const AuthModal = (props: AuthProps & { children: JSX.Element[] | JSX.Element }) => {
  const { setModalState } = useModalContext()

  const backendAnswerMessage = 'ok'
  const googleOnClick = () => {
    const listener = (event: MessageEvent) => {
      if (event.data === backendAnswerMessage) {
        window.removeEventListener('message', listener)
        window.location.reload()
      }
    }
    window.addEventListener('message', listener)
    createChildWindow(`/api/auth/google?referrer=${document.referrer}`, 'Google Login', 400, 750)
  }
  const githubOnClick = () => {
    const listener = (event: MessageEvent) => {
      if (event.data === backendAnswerMessage) {
        window.removeEventListener('message', listener)
        window.location.reload()
      }
    }
    window.addEventListener('message', listener)
    createChildWindow(`/api/auth/github?referrer=${document.referrer}`, 'GitHub Login', 400, 750)
  }

  const openResetPasswordModal = () => {
    setModalState({
      ...initialModalState,
      isRequestResetPasswordModalOpen: true,
    })
  }

  return (
    <>
      <ModalWrapper
        isOpen={props.isOpen}
        onClick={e => {
          if (e.currentTarget === e.target) {
            setModalState(initialModalState)
          }
        }}
      >
        <Dialog type={props.type} isOpen={props.isOpen}>
          <CloseIcon onClick={() => setModalState(initialModalState)}>
            <Image height='20px' width='20px' src={closeIcon} alt='close modal' />
          </CloseIcon>
          <Title type={props.type}>{props._title}</Title>
          <OauthButtons type={props.type}>
            <Btn styleType='auth' onClick={googleOnClick}>
              <Image height='21px' width='21px' src={googleLogo} alt='Google logo' />
              {props.type === ModalType.signIn ? 'Log in ' : 'Sign up '} via Google
            </Btn>
            <Btn styleType='auth' onClick={githubOnClick}>
              <Image height='21px' width='21px' src={githubLogo} alt='GitHub logo' />
              {props.type === ModalType.signIn ? 'Log in ' : 'Sign up '} via GitHub
            </Btn>
          </OauthButtons>
          {props.desc ? <Desc type={props.type}>{props.desc}</Desc> : null}
          {props.children}
          <ResetPasswordBtn onClick={openResetPasswordModal}>Forgot password?</ResetPasswordBtn>
          <ModalFooter type={props.type}>
            By proceeding, you agree to the{' '}
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a target='_blank' href='https://help.brick.do/terms-of-service'>
              terms of service
            </a>{' '}
            and {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a target='_blank' href='https://help.brick.do/privacy-policy'>
              privacy policy
            </a>
            .
            {props.type === ModalType.signUp
              ? ' You will also be automatically subscribed to our newsletter, which you can unsubscribe from at any time.'
              : ''}
          </ModalFooter>
          <GoHomeBtnContainer type={props.type}>
            <Link href={'/'} passHref>
              <a style={{ textDecoration: 'none' }}>
                <Btn styleType='primary' onClick={() => setModalState(initialModalState)}>
                  Go to homepage
                </Btn>
              </a>
            </Link>
          </GoHomeBtnContainer>
        </Dialog>
      </ModalWrapper>
    </>
  )
}

const ResetPasswordBtn = styled.button`
  text-align: center;
  width: 100%;
  background: none;
  border: none;

  margin-top: 15px;

  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const CloseIcon = styled.div`
  position: absolute;
  top: 25px;
  right: 25px;

  opacity: 0.4;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  @media (max-width: 570px) {
    right: 32px;
    top: 22px;
  }

  ${LandingMediaQuery.mobile} {
    top: 65px;
  }
`

const GoHomeBtnContainer = styled.div<{ type: ModalType }>`
  display: ${props => (props.type === ModalType.checkInbox ? 'block' : 'none')};

  width: 100%;
`

const ModalFooter = styled.div<{ type: ModalType }>`
  display: ${props => (props.type === ModalType.checkInbox ? 'none' : 'block')};
  font-size: 13px;
  line-height: 24px;
  width: 100%;
  text-align: center;

  margin-top: 24px;
`

const Desc = styled.div<{ type: ModalType }>`
  font-size: 16px;
  line-height: 24px;

  text-align: center;

  margin-bottom: ${props => (props.type === ModalType.verified ? '48px' : '25px')};
`

const OauthButtons = styled.div<{ type: ModalType }>`
  display: ${props =>
    props.type === ModalType.checkInbox || props.type === ModalType.verified ? 'none' : 'flex'};
  flex-flow: row;

  justify-content: center;
  align-items: center;

  & button {
    gap: 10px;
  }

  gap: 20px;
  width: 100%;

  margin-bottom: 40px;

  ${LandingMediaQuery.mobile} {
    flex-flow: column;
  }
`

const Title = styled.h1<{ type: ModalType }>`
  font-size: 48px;
  line-height: 56px;

  max-width: 350px;

  text-align: center;

  margin-bottom: ${props => (props.type === ModalType.checkInbox ? '25px' : '48px')};

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: normal;
  }
`

const Dialog = styled.dialog<{ type: ModalType; isOpen: boolean }>`
  position: relative;
  display: flex;

  transform: scale(${props => (props.isOpen ? 1 : 0.5)});
  opacity: ${props => (props.isOpen ? 1 : 0)};

  transition:
    transform 0.15s,
    opacity 0.15s;

  width: 550px;
  padding: 40px 48px ${props => (props.type === ModalType.checkInbox ? '20px' : '56px')};
  border: none;
  border-radius: 32px;

  height: auto;

  box-shadow: var(--shadow-elevation-medium);

  flex-flow: column;
  align-items: center;
  z-index: 202;

  & button {
    width: 100%;
  }

  @media (max-width: 570px) {
    width: 100%;
    border-radius: 0;

    background: ${LandingColors.white};

    padding: 160px 20px 20px;
  }
`

const ModalWrapper = styled.div<{ isOpen: boolean }>`
  display: flex;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};

  background-color: rgba(249, 250, 251, ${props => (props.isOpen ? 0.98 : 0)});

  z-index: 201;

  transition:
    background-color 0.1s,
    visibility 0.1s;

  justify-content: center;
  align-items: center;

  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;

  overflow-y: scroll;

  & input {
    background: ${LandingColors.authInputBg};
  }
`