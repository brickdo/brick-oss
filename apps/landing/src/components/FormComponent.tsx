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

import { LandingColors } from '@brick-shared/styles/landing'
import { css } from '@emotion/react'
import { Form, Formik, FormikConfig, FormikHelpers, FormikProps, FormikValues } from 'formik'
import { Ref } from 'react'
import { SchemaOf } from 'yup'

import { Btn } from './Btn'
import { IInput, InputField } from './InputField'

export type FormComponentProps<T extends FormikValues> = {
  initialValues: T
  onSubmit: (values: T, formikHelpres: FormikHelpers<T>) => void
  schema: SchemaOf<T>
  data: IInput<T>[]
  errorText: string | null
  btnText: string
  formName: string
  innerRef?: Ref<FormikProps<T>>
} & FormikConfig<T>

export const FormComponent = <T extends FormikValues>({
  errorText,
  btnText,
  data,
  formName,
  initialValues,
  onSubmit,
  schema,
  innerRef,
  ...formikProps
}: FormComponentProps<T>) => (
  <>
    <Formik<T>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={schema}
      innerRef={innerRef}
      {...formikProps}
    >
      {formik => (
        <Form className='form'>
          {data.map(val => (
            <InputField<T>
              type={val.type}
              label={val.label}
              placeholder={val.placeholder}
              key={`${val.name}${formName}`}
              name={val.name}
              formName={formName}
              onChange={e => {
                formik.setFieldError(val.name, '')
                formik.handleChange(e)
              }}
              formik={formik}
            />
          ))}
          <Btn type='submit' styleType='primary' style={{ marginTop: '10px' }}>
            {btnText}
          </Btn>
          <div
            css={css`
              color: ${LandingColors.errorRed};
              margin-top: 10px;
              text-align: center;
            `}
          >
            {errorText}
          </div>
        </Form>
      )}
    </Formik>
  </>
)