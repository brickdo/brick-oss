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

import { RadioGroup } from '@material-ui/core'
import clsx from 'clsx'
import { ReactElement } from 'react'
import { useBoolean, useMount, useMountedState } from 'react-use'
import { useActions, useAppState } from '../store'
import ThemeSelectionItem from './ThemeSelectionItem'

interface Props {
  pageId: string
  className?: string
}

function ThemeSelection({ pageId, className }: Props): ReactElement | null {
  const { loadThemes, updatePageTheme } = useActions()
  const { themes, pages } = useAppState()
  const [isLoaded, setIsLoaded] = useBoolean(false)
  const isMounted = useMountedState()

  useMount(async () => {
    await loadThemes()
    if (isMounted()) {
      setIsLoaded(true)
    }
  })
  const page = pages[pageId]
  return (
    <div className={clsx('bg-white pb-2 px-1', className)}>
      {!isLoaded ? (
        'Loading...'
      ) : (
        <>
          <div className='text-gray-500'>
            <p className='mt-0'>
              All children pages will inherit parent theme unless they have their own non default
              theme preference.
            </p>
          </div>
          <RadioGroup
            // Or empty string because default theme "themeId" is null and radio input element can't have null value in react
            // see "`value` prop on `input` should not be null"
            value={page.themeId || ''}
            row={true}
          >
            {themes.map(t => (
              <ThemeSelectionItem
                key={t.id}
                value={t.id || ''}
                isSelected={page.themeId === t.id}
                onClick={() => updatePageTheme({ pageId, themeId: t.id })}
                label={t.name}
                screenshotSlot={
                  t.screenshotUrl ? <img src={t.screenshotUrl} alt='Theme screenshot' /> : null
                }
              />
            ))}
          </RadioGroup>
        </>
      )}
      <style jsx>{`
        * :global(.MuiFormGroup-root) {
          justify-content: space-between;
          margin-top: -10px;
        }
        * :global(.MuiFormGroup-root > *) {
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}

export default ThemeSelection