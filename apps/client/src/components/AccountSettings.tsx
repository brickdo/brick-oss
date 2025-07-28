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

import { ReactElement, useCallback, useState } from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import { useActions, useAppState } from '../store'
import _debounce from 'lodash/debounce'
import { ActionText } from './ActionText'
import GenericSettingsSectionTitle from './GenericSettingsSectionTitle'
import { openSupportChat } from '../support-chat'
import CustomInput from './CustomInput'
import { Btn } from './Btn'
import { UserAuthProvider } from 'src/types'
import { css } from '@emotion/react'
import { toaster } from 'evergreen-ui'

function AccountSettings(): ReactElement {
  const { user, maintenanceMode } = useAppState()
  const { updateUser, requestEmailChange } = useActions()

  // Save account settings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    _debounce((nextValue: boolean) => updateUser({ isAgreedMailing: nextValue }), 200),
    [],
  )

  const [isEmailUpdating, setIsEmailUpdating] = useState(false)

  const updateUserEmail = async () => {
    if (!newEmail) {
      return
    }
    setIsEmailUpdating(true)
    try {
      await requestEmailChange(newEmail)
      setIsEmailUpdating(false)
      toaster.success('Email request was successfully sent. Check your old email inbox to proceed.')
    } catch (e: any) {
      toaster.danger(e?.message || e)
    }
  }

  const [newEmail, setNewEmail] = useState<string | null>(user?.email || null)

  const isUserProviderEmailPass = user?.provider === UserAuthProvider.local

  return (
    <div className='flex flex-col text-left'>
      <div className='flex flex-col'>
        <GenericSettingsSectionTitle>Communication preferences</GenericSettingsSectionTitle>
        <FormControlLabel
          control={
            <Checkbox
              name='isAgreedMailing'
              checked={user?.isAgreedMailing}
              disabled={maintenanceMode}
              onChange={event => debouncedSave(event.target.checked)}
            />
          }
          className='text-lg'
          label='Send me information about new features, deals or recommendations by mail'
        />
      </div>

      <div className='flex flex-col mt-4'>
        <GenericSettingsSectionTitle>Delete the account</GenericSettingsSectionTitle>
        <p className='mt-0 italic'>
          To delete your account, please{' '}
          <ActionText onClick={openSupportChat}>contact support</ActionText>.
        </p>
      </div>

      <div className='flex flex-col mt-4'>
        <GenericSettingsSectionTitle>Change email</GenericSettingsSectionTitle>
        <div>
          {newEmail != null && (
            <CustomInput
              value={newEmail}
              onChange={setNewEmail}
              type='email'
              css={css`
                padding: 0;
              `}
              disabled={!isUserProviderEmailPass || maintenanceMode}
            />
          )}

          {!isUserProviderEmailPass && (
            <div className='mt-2 text-sm text-gray-500'>
              Email can only be changed for password-based accounts. Please contact support if you’d
              like to change your email.
            </div>
          )}
        </div>

        {isUserProviderEmailPass && (
          <div className='mt-4'>
            <Btn
              onClick={updateUserEmail}
              styleType='primary'
              disabled={isEmailUpdating || maintenanceMode}
            >
              Change email
            </Btn>
            <div className='mt-2 text-sm text-gray-500'>
              We will send you a verification email to both your old and new email address. Please
              click the links in both emails to confirm the change. If you don’t see the email,
              check other places it might be, like your junk, spam, social, or other folders. If you
              still can’t find it,{' '}
              <ActionText onClick={openSupportChat}>contact support</ActionText>.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSettings