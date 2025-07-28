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

import closeIcon from '../../assets/close-modal.svg'
import { initialModalState, useModalContext } from '../../context/ModalContext'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Image } from '../Image'
import { IInput, InputFieldType } from '../InputField'
import { FormComponent } from '../FormComponent'
import api from '@brick-shared/api'
import { FormikProps, FormikConfig } from 'formik'
import { useRef, useState, useEffect } from 'react'
import { object, SchemaOf, string } from 'yup'
import { useRouter } from 'next/router'
import { is410 } from '@brick-shared/api/errorChecks'
import { VscError } from '@react-icons/all-files/vsc/VscError'
import { BsCheckCircle } from '@react-icons/all-files/bs/BsCheckCircle'
import isUUID from 'validator/lib/isUUID'

import { css } from '@emotion/react'

type Props = {}

export interface ISignInFormData {
  password: string
}

const CompleteResetPasswordFormInputs: IInput<ISignInFormData>[] = [
  {
    type: InputFieldType.password,
    label: 'New password',
    name: 'password',
  },
]

const CompleteResetPasswordFormSchema: SchemaOf<ISignInFormData> = object({
  password: string().required('Required'),
})

const initialValues: ISignInFormData = { password: '' }

const invalidTokenError =
  'Invalid or expired password reset request. Please request another password reset'

export const CompleteResetPasswordModal = (props: Props) => {
  const { setModalState, modalState } = useModalContext()

  const formikRef = useRef<FormikProps<ISignInFormData> | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [completeState, setCompleteState] = useState<{
    isComplete: boolean
    error: string | null
  }>({
    isComplete: false,
    error: null,
  })

  const router = useRouter()
  const isOpen =
    router.query['reset-password-token'] != null || router.query['reset-password-invalid'] != null
  const tokenId = router.query['reset-password-token'] as string | undefined

  const isValidTokenQuery = tokenId && isUUID(tokenId)
  const isInvalidTokenQuery = !isValidTokenQuery || router.query['reset-password-invalid'] != null

  useEffect(() => {
    if (!router.isReady) {
      return
    }
    if (isOpen && isInvalidTokenQuery) {
      setCompleteState({
        isComplete: true,
        error: invalidTokenError,
      })
    }
    if (isOpen) {
      setModalState({
        ...initialModalState,
        isCompleteResetPasswordModalOpen: true,
      })
    }
  }, [isInvalidTokenQuery, router, isOpen, setModalState])

  const onSubmit: FormikConfig<ISignInFormData>['onSubmit'] = async ({ password }) => {
    if (!isValidTokenQuery) {
      return
    }
    try {
      await api.post(`auth/reset-password`, { tokenId, password })
      setCompleteState({ isComplete: true, error: null })
    } catch (e) {
      if (is410(e)) {
        setCompleteState({
          isComplete: true,
          error: invalidTokenError,
        })
      } else {
        setLoginError('Unknown server error, please contact support')
      }
    }
  }

  const onClose = async () => {
    await router.replace('/')
    setTimeout(() => {
      formikRef.current?.resetForm()
      setCompleteState({
        isComplete: false,
        error: null,
      })
    }, 300)
  }

  return (
    <ModalWrapper
      isOpen={modalState.isCompleteResetPasswordModalOpen}
      onClick={e => {
        if (e.currentTarget === e.target) {
          setModalState(initialModalState)
          void onClose()
        }
      }}
    >
      <Dialog isOpen={modalState.isCompleteResetPasswordModalOpen}>
        <CloseIcon
          onClick={() => {
            setModalState(initialModalState)
            void onClose()
          }}
        >
          <Image height='20px' width='20px' src={closeIcon} alt='close modal' />
        </CloseIcon>

        {completeState.isComplete ? (
          <div
            css={css`
              margin-top: 30px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            `}
          >
            {completeState.error ? (
              <>
                <VscError size={'100px'} color={LandingColors.errorRed} />
                <ResetLinkSetTitle>{completeState.error}</ResetLinkSetTitle>
              </>
            ) : (
              <>
                <BsCheckCircle size={'100px'} color={LandingColors.successGreen} />
                <ResetLinkSetTitle>
                  Your password has been successfully reset! You can sign in now with your email and
                  new password
                </ResetLinkSetTitle>
              </>
            )}
          </div>
        ) : (
          <>
            <Title>Password reset</Title>

            <FormComponent
              data={CompleteResetPasswordFormInputs}
              initialValues={initialValues}
              onSubmit={onSubmit}
              schema={CompleteResetPasswordFormSchema}
              formName={'completeResetPass'}
              btnText='Set new password'
              errorText={loginError}
              innerRef={formikRef}
            />
          </>
        )}
      </Dialog>
    </ModalWrapper>
  )
}

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

const Title = styled.h1`
  font-size: 28px;
  line-height: 42px;

  max-width: 350px;

  text-align: center;

  margin-bottom: 25px;
  margin-top: 15px;

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: normal;
  }
`

const _Desc = styled.div`
  font-size: 18px;
  line-height: 24px;
  color: ${LandingColors.textGrey};
  margin-bottom: 25px;
`

const Dialog = styled.dialog<{ isOpen: boolean }>`
  position: relative;
  display: flex;
  padding: 40px;

  transform: scale(${props => (props.isOpen ? 1 : 0.5)});
  opacity: ${props => (props.isOpen ? 1 : 0)};

  transition:
    transform 0.15s,
    opacity 0.15s;

  width: 550px;
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

const ResetLinkSetTitle = styled.h1`
  font-size: 20px;
  line-height: 30px;

  max-width: 350px;

  text-align: center;

  margin-top: 20px;

  ${LandingMediaQuery.mobile} {
    font-size: 40px;
    line-height: normal;
  }
`