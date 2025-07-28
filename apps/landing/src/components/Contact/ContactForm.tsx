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

// @ts-nocheck
// We aren't using the contact form

import styled from '@emotion/styled'

import { SendContactForm } from '../../api'
import { ContactFormSchema } from '../../schemas'
import { LandingMediaQuery } from '@brick-shared/styles/landing'
import { IContactFormData } from '../../types/types'
import { FlexContainer } from '../FlexContainer'
import { FormComponent } from '../FormComponent'
import { IInput, InputFieldType } from '../InputField'

const contactFormInputs: IInput<IContactFormData>[] = [
  {
    type: InputFieldType.email,
    label: 'Your email',
    name: 'email',
  },
  {
    type: InputFieldType.text,
    label: 'Tell us what you need help with:',
    placeholder: 'Enter a topic, like “channel problem...”',
    name: 'text',
  },
]

const initialValues: IContactFormData = { email: '', text: '' }

export const ContactForm = () => {
  const onSubmit = async (values: IContactFormData) => {
    const result = await SendContactForm(values)
    if (result.status === 200) {
      console.log('good')
    } else {
      console.log('error')
    }
  }

  return (
    <Container>
      <FormComponent
        data={contactFormInputs}
        initialValues={initialValues}
        onSubmit={onSubmit}
        schema={ContactFormSchema}
        btnText='Send now'
        formName='contact'
      />
    </Container>
  )
}

const Container = styled(FlexContainer)`
  align-items: start;
  width: 100%;

  & textarea,
  input {
    text-align: left;
  }

  & textarea {
    height: 160px !important;
  }

  ${LandingMediaQuery.mobile} {
    & .form {
      align-items: center;
      & button {
        width: 100%;
      }
    }
    & textarea,
    input {
      text-align: center;
    }
  }
`