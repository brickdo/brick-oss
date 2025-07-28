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

import { FormikHelpers, FormikProps } from 'formik'
import { useEffect, useRef, useState } from 'react'
import api from '@brick-shared/api'
import { is401, is412 } from '@brick-shared/api/errorChecks'

import { initialModalState, useModalContext } from '../../context/ModalContext'
import { SignInFormSchema } from '../../schemas'
import { FormComponent } from '../FormComponent'
import { IInput, InputFieldType } from '../InputField'
import { AuthModal, ModalType } from './AuthModalComponent'

export interface ISignInFormData {
  email: string
  password: string
}

const signInFormInputs: IInput<ISignInFormData>[] = [
  {
    type: InputFieldType.email,
    label: 'Email',
    name: 'email',
  },
  {
    type: InputFieldType.password,
    label: 'Password',
    name: 'password',
  },
]

const initialValues: ISignInFormData = { email: '', password: '' }

export const SignInModal = (props: {
  // Whether the user has followed the ?success-email-confirmed link
  verified?: boolean
}) => {
  const { modalState, setModalState } = useModalContext()
  const formikRef = useRef<FormikProps<ISignInFormData> | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    if (!modalState.isSignInModalOpen) {
      formikRef.current?.resetForm()
    }
  }, [modalState.isSignInModalOpen])

  const onSubmit = async (
    { email, password }: ISignInFormData,
    { resetForm }: FormikHelpers<ISignInFormData>,
  ) => {
    let loginSuccess = false
    try {
      await api.post('auth/login', { email, password })
      loginSuccess = true
    } catch (e) {
      if (is412(e)) {
        setLoginError('Please confirm your email to finish the sign up')
      } else if (is401(e)) {
        setLoginError('Invalid email or password')
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        setLoginError(`Unknown error (${(e as any)?.message}), please contact support`)
      }
    }
    if (loginSuccess) {
      resetForm()
      setLoginError('')
      setModalState(prev => {
        return {
          ...prev,
          ...initialModalState,
          ...(props.verified ? { isVerifiedModalOpen: false } : { isSignInModalOpen: false }),
        }
      })
      // Our reverse proxy will detect the auth cookie and redirect to the app
      window.location.reload()
    }
  }

  return (
    <AuthModal
      _title='Log in'
      desc={
        props.verified
          ? 'Your email address has been verified. Enter your email and password to continue.'
          : 'Or continue with email'
      }
      type={props.verified ? ModalType.verified : ModalType.signIn}
      isOpen={props.verified ? modalState.isVerifiedModalOpen : modalState.isSignInModalOpen}
    >
      <FormComponent
        data={signInFormInputs}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={SignInFormSchema}
        formName={props.verified ? 'signinV' : 'signin'}
        btnText='Log in'
        errorText={loginError}
        innerRef={formikRef}
      />
    </AuthModal>
  )
}