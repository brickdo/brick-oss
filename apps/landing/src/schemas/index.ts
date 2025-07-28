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

import { object, SchemaOf, string } from 'yup'

import { ISignInFormData } from '../components/Modals/SignIn'
import { ISignUpFormData } from '../components/Modals/SignUp'
import { IContactFormData } from '../types/types'

export const ContactFormSchema: SchemaOf<IContactFormData> = object({
  email: string().ensure().email('Please provide valid email address').required('Required'),
  text: string().ensure().required('Required'),
})

export const SignUpFormSchema: SchemaOf<ISignUpFormData> = object({
  name: string().required('Required'),
  email: string().ensure().email('Please provide a valid email address').required('Required'),
  password: string().required('Required'),
})

export const SignInFormSchema: SchemaOf<ISignInFormData> = object({
  email: string().ensure().email('Please provide a valid email address').required('Required'),
  password: string().required('Required'),
})