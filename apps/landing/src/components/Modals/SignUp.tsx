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
import { is409 } from '@brick-shared/api/errorChecks'

import { initialModalState, useModalContext } from '../../context/ModalContext'
import { SignUpFormSchema } from '../../schemas'
import { FormComponent } from '../FormComponent'
import { IInput, InputFieldType } from '../InputField'
import { AuthModal, ModalType } from './AuthModalComponent'

export interface ISignUpFormData {
  name: string
  email: string
  password: string
}

const signUpFormInputs: IInput<ISignUpFormData>[] = [
  {
    type: InputFieldType.name,
    placeholder: 'Your name',
    name: 'name',
  },
  {
    type: InputFieldType.email,
    placeholder: 'Your email',
    name: 'email',
  },
  {
    type: InputFieldType.password,
    placeholder: 'Password',
    name: 'password',
  },
]

const initialValues: ISignUpFormData = { name: '', email: '', password: '' }

export const SignUpModal = () => {
  const { modalState, setModalState } = useModalContext()
  const formikRef = useRef<FormikProps<ISignUpFormData> | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  useEffect(() => {
    if (!modalState.isSignUpModalOpen) {
      formikRef.current?.resetForm()
    }
  }, [modalState.isSignUpModalOpen])

  const onSubmit = async (
    { name, email, password }: ISignUpFormData,
    { resetForm }: FormikHelpers<ISignUpFormData>,
  ) => {
    let signupSuccess = false
    try {
      await api.post('auth/sign-up/local', { email, password, name })
      signupSuccess = true
    } catch (e) {
      if (is409(e)) {
        setSignupError('This email is already in use')
      } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        setSignupError(`Unknown error (${(e as any)?.message}), please contact support`)
      }
    }
    if (signupSuccess) {
      resetForm()
      setSignupError('')
      setModalState(prev => {
        return {
          ...prev,
          ...initialModalState,
          email,
          isCheckInboxModalOpen: true,
        }
      })
    }
  }

  return (
    <AuthModal
      _title='Sign up'
      desc='Or continue with email'
      type={ModalType.signUp}
      isOpen={modalState.isSignUpModalOpen}
    >
      <FormComponent
        data={signUpFormInputs}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={SignUpFormSchema}
        formName='signup'
        btnText='Sign up'
        innerRef={formikRef}
        errorText={signupError}
      />
    </AuthModal>
  )
}