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

import { ReactElement, useCallback } from 'react'
import { Checkbox, FormControlLabel } from '@material-ui/core'
import _debounce from 'lodash/debounce'
import { ActionText } from './ActionText'
import GenericSettingsSectionTitle from './GenericSettingsSectionTitle'
import { openSupportChat } from '../support-chat'
import { useActions, useAppState } from '../store'
import PremiumBadge from './PremiumBadge'

function BackupSettings(): ReactElement {
  const { user, userSubscriptionPlan: userSubscription, maintenanceMode } = useAppState()
  const { updateUser } = useActions()

  // Save backup settings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    _debounce((nextValue: boolean) => updateUser({ periodicBackups: nextValue }), 200),
    [],
  )

  const canWeeklyBackups = userSubscription?.canWeeklyBackups
  return (
    <div className='flex flex-col text-left'>
      <div className='flex flex-col'>
        <GenericSettingsSectionTitle>Export your data</GenericSettingsSectionTitle>
        <p className='mt-0 italic'>
          To request an archive of your data, please{' '}
          <ActionText onClick={openSupportChat}>contact support</ActionText>.
        </p>
      </div>

      <div className='flex flex-col mt-4'>
        <GenericSettingsSectionTitle>Restore your data</GenericSettingsSectionTitle>
        <p className='mt-0 italic'>
          To restore your data from any point in the last seven days, please{' '}
          <ActionText onClick={openSupportChat}>contact support</ActionText>.
        </p>
      </div>

      <div className='flex flex-col mt-4'>
        <GenericSettingsSectionTitle>
          Weekly backups
          <PremiumBadge />
        </GenericSettingsSectionTitle>
        <FormControlLabel
          control={
            <Checkbox
              name='periodicBackups'
              checked={user?.periodicBackups}
              onChange={event => debouncedSave(event.target.checked)}
              disabled={!canWeeklyBackups || maintenanceMode}
            />
          }
          className='text-lg'
          label='Send me weekly backups by email'
        />
      </div>
    </div>
  )
}

export default BackupSettings