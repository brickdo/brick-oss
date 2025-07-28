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

import { ReactElement, ReactNode, useEffect } from 'react'
import clsx from 'clsx'
import { KEY_ESCAPE } from 'keycode-js'
import { goToPrevPageOrRoot } from '../router/history'
import { css } from '@emotion/react'
import styled from '@emotion/styled'

export type GenericSettingsTabProps = {
  content: ReactNode
  isActive?: boolean
  disabled?: boolean
  showPremiumBadge?: boolean
}

export type GenericSettingsProps = {
  title: string
  tabs?: GenericSettingsTabProps[]
  header?: ReactNode
  children?: ReactNode
}

function GenericSettings({ title, tabs, header, children }: GenericSettingsProps): ReactElement {
  useEffect(() => {
    const eventListener = (e: KeyboardEvent) => {
      if (e.keyCode === KEY_ESCAPE) {
        goToPrevPageOrRoot()
      }
    }
    window.addEventListener('keydown', eventListener)
    return () => window.removeEventListener('keydown', eventListener)
  }, [])

  const tabsRendered =
    tabs &&
    tabs.length &&
    tabs.map((x, i) => (
      <GenericSettingsTab
        key={i}
        className={clsx('h-8 leading-8', i && 'ml-8')}
        isActive={x.isActive}
      >
        {x.content}
      </GenericSettingsTab>
    ))

  return (
    <div className='flex-1 flex flex-col max-h-full'>
      {header}

      <GenericSettingsCard className='px-12 mt-4 flex flex-col flex-1 mx-auto overflow-auto'>
        <h1 className='font-light mb-8 text-left'> {title} </h1>
        {tabsRendered ? (
          <GenericSettingsTabs className='mb-6 flex'>{tabsRendered}</GenericSettingsTabs>
        ) : null}

        <div className='px-2 overflow-auto'>{children}</div>
      </GenericSettingsCard>
    </div>
  )
}

const MobileMQ = `@media (max-width: 430px)`

const GenericSettingsCard = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  width: 100%;
  max-width: 1200px;
  overflow: auto;

  ${MobileMQ} {
    padding-left: 20px;
    padding-right: 20px;
  }
`

const GenericSettingsTab = styled.li<{ isActive?: boolean }>`
  ${({ isActive }) => css`
    outline: 0px;
    height: 100%;
    transition: all 200ms ease 0s;
    white-space: nowrap;
    display: block;
    color: ${isActive ? '#01091a' : '#999'};
    font-weight: 500;
    padding: 0 4px;
    position: relative;

    ::after {
      position: absolute;
      content: '';
      bottom: -2px;
      left: 0px;
      right: 0px;
      width: 100%;
      height: 2px;
      transform: scaleX(0.75);
      background-color: transparent;
      transition: all 200ms ease 0s;

      ${isActive
        ? css`
            background-color: rgb(var(--color-primary));
            transform: scaleX(1);
          `
        : ''}
    }

    > a {
      white-space: nowrap;
      color: inherit;
      display: block;
      text-decoration: none !important;
    }

    :hover {
      color: #01091a;
    }

    ${MobileMQ} {
      :not(:first-child) {
        margin-left: 1rem;
      }
    }
  `}
`

const GenericSettingsTabs = styled.ul`
  height: 40px;
  border-bottom: 2px solid #f1f1f1;

  ${MobileMQ} {
    font-size: 14px;
  }
`

export default GenericSettings