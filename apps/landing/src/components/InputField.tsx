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
import { ErrorMessage, Field, FormikProps } from 'formik'
import { ChangeEvent } from 'react'

import { LandingColors } from '@brick-shared/styles/landing'

export enum InputFieldType {
  'email' = 'email',
  'name' = 'name',
  'password' = 'password',
  'text' = 'text',
}

export interface IInput<T> {
  label?: string
  placeholder?: string
  type: InputFieldType
  name: string & keyof T
}

interface InputProps<T> extends IInput<T> {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  formName: string
  formik: FormikProps<T>
}

export function InputField<T>(props: InputProps<T>) {
  return (
    <>
      {props.label ? (
        <label
          htmlFor={props.name}
          css={css`
            margin-left: 6px;
            margin-bottom: 7px;
            display: inline-block;
          `}
        >
          {props.label}
        </label>
      ) : null}
      <Field
        id={`${props.name}${props.formName}`}
        name={props.name}
        placeholder={props.placeholder}
        as={props.type === InputFieldType.text ? 'textarea' : 'input'}
        onChange={props.onChange}
        type={props.type === InputFieldType.password ? 'password' : 'text'}
        autoComplete='on'
        css={css`
          ${props.formik.errors[props.name] && `border: 1px solid ${LandingColors.primary};`}
        `}
      />
      <ErrorContainer>
        <ErrorMessage
          name={props.name}
          render={msg => {
            return <Error>{msg}</Error>
          }}
        />
      </ErrorContainer>
    </>
  )
}

const ErrorContainer = styled.div`
  height: 20px;
  margin-bottom: 10px;
  padding: 2px 0 0 15px;
`

const Error = styled.div`
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;

  color: ${LandingColors.primary};
`