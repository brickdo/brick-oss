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

import clsx from 'clsx'
import { ReactElement, useState } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import PageStylesUpdate from './PageStylesUpdate'
import ThemeSelection from './ThemeSelection'

interface Props {
  pageId: string
}

function PageDesignSettings({ pageId }: Props): ReactElement {
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0)
  return (
    <Tabs forceRenderTabPanel defaultIndex={selectedTabIndex} onSelect={setSelectedTabIndex}>
      <TabList>
        <Tab>Base theme</Tab>
        <Tab>Customizations</Tab>
      </TabList>
      <TabPanel className={clsx('p-2', selectedTabIndex !== 0 && 'hidden')}>
        <div
          style={{ width: '450px', maxWidth: '100%', maxHeight: '400px' }}
          className='overflow-auto'
        >
          <ThemeSelection pageId={pageId} />
        </div>
      </TabPanel>
      <TabPanel className={clsx('p-2', selectedTabIndex !== 1 && 'hidden')}>
        <div style={{ width: '450px', maxWidth: '100%' }}>
          <h2 className='text-lg mt-0'> Custom styles </h2>
          <PageStylesUpdate pageId={pageId} />
        </div>
      </TabPanel>
    </Tabs>
  )
}

export default PageDesignSettings