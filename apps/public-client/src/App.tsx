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

/* eslint-disable react/jsx-no-target-blank */
/// <reference types="@emotion/react/types/css-prop" />

import 'tailwindcss/tailwind.css'
import './index.css'
import 'prismjs/themes/prism-okaidia.css'

import { useState, useEffect } from 'react'
import { IoMdMenu } from '@react-icons/all-files/io/IoMdMenu'
import PagesTreePublic from './PagesTreePublic'
import { mutateTree } from '@brick-shared/components/Tree/utils/tree'
import TreeBreadcrumbs from '@brick-shared/components/TreeBreadcrumbs'

import { Drawer, DrawerProps } from '@material-ui/core'
import clsx from 'clsx'
import { PublicAddress } from '@brick-shared/types'
import { AppProps } from './types'
import PagePreviewView from './PagePreviewView'

// No idea if this import is needed or not :/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { css } from '@emotion/react'

const checkIsMobile = () => globalThis.window && globalThis.window.innerWidth <= 768

function App({ id, tree, title, content, publicAddress, isMobileInitial }: AppProps) {
  useEffect(() => {
    // remove @material-ui server side generated styles to avoid duplicates
    const jssStyles = document.querySelector('#material-ui-server-side')
    if (jssStyles?.parentElement) {
      jssStyles.parentElement.removeChild(jssStyles)
    }
  }, [])

  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobileInitial)
  const [sidebarVariant, setSidebarVariant] = useState<DrawerProps['variant']>(
    isMobileInitial ? 'temporary' : 'persistent',
  )
  const isMobile = checkIsMobile()
  useEffect(() => {
    if (isMobile !== isMobileInitial) {
      setIsSidebarOpen(!isMobile)
      setSidebarVariant(isMobile ? 'temporary' : 'persistent')
    }
  }, [isMobile, isMobileInitial])

  const [stateTree, setStateTree] = useState(tree)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const toggleTreeItem = (id: string) => {
    setStateTree((curTree: any) =>
      mutateTree(curTree, id, { isExpanded: !stateTree.items[id].isExpanded }),
    )
  }

  return (
    <div className='h-auto flex flex-col overflow-auto min-h-full relative rendered-page'>
      <div className='sidebar'>
        {
          <Drawer
            // without providing this prop elements inside drawer (inputs in pages options) are not getting focus and therefore not accessible
            disableEnforceFocus
            variant={sidebarVariant}
            open={isSidebarOpen}
            onClose={toggleSidebar}
            anchor='left'
          >
            <div
              style={{ width: '240px' }}
              className='max-h-full overflow-auto tree-container py-4'
            >
              <PagesTreePublic
                tree={stateTree}
                publicAddress={publicAddress}
                toggleExpanded={toggleTreeItem}
                isLinkActive={item => id === item.id}
              />
            </div>
          </Drawer>
        }
      </div>
      <div
        className={clsx(
          'flex-1 flex flex-col h-full overflow-visible',
          'page-container',
          isSidebarOpen && 'page-container_sidebar-open',
        )}
      >
        <header className='navigation-header flex items-center px-4 py-2'>
          <button title='Navigation' className='menu p-1' onClick={toggleSidebar}>
            <IoMdMenu size='24' />
          </button>

          <TreeBreadcrumbs
            renderItem={({ text, link, isApp, className }) => {
              const elProps = {
                className: clsx(
                  className,
                  'mx-1 px-1 breadcrumb-item inline-block whitespace-no-wrap',
                ),
                title: text,
              }
              return link ? (
                <a {...elProps} href={link}>
                  {text}
                </a>
              ) : (
                <span {...elProps}>{text}</span>
              )
            }}
            currentPageId={id}
            pages={tree.items}
            publicAddresses={publicAddress && [publicAddress as PublicAddress]}
            breadcrumbsContainerStyle={{
              maxWidth: 'calc(100% - 32px)',
            }}
          />
        </header>

        <div className='flex-1 flex flex-col items-center h-full'>
          <PagePreviewView title={title} content={content} />

          <footer className='page-footer flex w-full justify-center items-center px-2 py-3'>
            Published with&nbsp;
            <a href='https://brick.do/' target='_blank'>
              Brick
            </a>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App