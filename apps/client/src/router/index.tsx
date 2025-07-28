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

import { FC, useCallback, useEffect } from 'react'
import { Router as ReactRouter, Redirect, RouteComponentProps } from 'react-router-dom'
import {
  renderRoutes,
  matchRoutes,
  RouteConfig,
  RouteConfigComponentProps,
} from 'react-router-config'
import { useUnmount } from 'react-use'
import AppPage from '../pages/AppPage'
import Page from '../components/Page'
import history from './history'
import Settings from '../pages/Settings'
import AccountSettings from '../components/AccountSettings'
import BackupSettings from '../components/BackupSettings'
import WorkspaceSettings from '../pages/WorkspaceSettings'
import WorkspaceSettingsGeneral from '../components/WorkspaceSettingsGeneral'
import SubscriptionSettings from '../components/SubscriptionSettings'
import { IoMdMenu } from '@react-icons/all-files/io/IoMdMenu'
import HeaderContainer from '../components/HeaderContainer'
import WorkspaceSettingsCollaboration from '../components/WorkspaceSettingsCollaboration'
import { useActions, useAppState } from '../store'
import isUUID from 'validator/lib/isUUID'
import { is404 } from '@brick-shared/api/errorChecks'

const routes: RouteConfig[] = [
  {
    path: '/',
    component: IndexComponent,
    routes: [
      {
        path: '/',
        exact: true,
        component: PageNotSelected,
      },
      {
        path: '/settings',
        component: Settings,
        routes: [
          {
            path: '/settings',
            exact: true,
            component: () => <Redirect to='/settings/account' />,
          },
          {
            path: '/settings/account',
            exact: true,
            component: AccountSettings,
          },
          {
            path: '/settings/backup',
            exact: true,
            component: BackupSettings,
          },
          {
            path: '/settings/subscription',
            exact: true,
            component: SubscriptionSettings,
          },
        ],
      },
      {
        path: '/workspace-settings',
        component: WorkspaceSettings,
        routes: [
          {
            path: '/workspace-settings',
            exact: true,
            component: () => <Redirect to='/workspace-settings/general' />,
          },
          {
            path: '/workspace-settings/general',
            exact: true,
            component: WorkspaceSettingsGeneral,
          },
          {
            path: '/workspace-settings/collaboration',
            exact: true,
            component: WorkspaceSettingsCollaboration,
          },
        ],
      },
      {
        path: '/:id',
        meta: {
          isPageRoute: true,
        },
        exact: true,
        component: PageRouteRedirecter,
      },
    ],
  },
]

function IndexComponent(props: RouteComponentProps) {
  const { user } = useAppState()
  const { logout } = useActions()
  // If the cookie is invalid or not found, let's erase the cookie just in case.
  if (!user) logout()
  return <AppPage {...props} />
}

function PageRouteRedirecter(props: RouteConfigComponentProps<{ id: string }>) {
  const pageId = props.match.params.id
  const { isPagesInfoLoaded, pages } = useAppState()
  const { findPageByAnyId } = useActions()

  if (!isPagesInfoLoaded) {
    return <div>Loading...</div>
  }

  const page = findPageByAnyId(pageId)

  // Since we load all pages on app startup if page not found after isPagesInfoLoaded
  // this means that page does not exist anymore or user has no access to it
  if (!page) {
    return <Redirect to={`/`} />
  }

  const isFullPageId = isUUID(pageId)
  if (isFullPageId) {
    const page = pages[pageId]
    return <Redirect to={`/${page.shortId}`} />
  } else {
    return <PageRoute {...props} />
  }
}

// Handles both short and long IDs
function PageRoute(props: RouteConfigComponentProps<{ id: string }>) {
  const pageId = props.match.params.id
  const { editorService } = useAppState()
  const { resolveFullPageId, setCurrentPageId, setIsPageEditingReady, loadCurrentPage } =
    useActions()

  const triggerEditorOnChange = useCallback(() => {
    const currentService = editorService.current
    if (currentService && currentService.pageId) {
      currentService.onChange({
        content: currentService.getContent(),
        pageId: currentService.pageId,
      })
    }
  }, [editorService])

  useEffect(() => {
    const loadPage = async () => {
      try {
        triggerEditorOnChange()
        const fullPageId = await resolveFullPageId(pageId)
        setIsPageEditingReady(false)
        setCurrentPageId(fullPageId)
      } catch (e) {
        if (is404(e)) {
          history.push('/')
        } else {
          throw e
        }
      }
      await loadCurrentPage()
    }
    loadPage()
  }, [
    pageId,
    resolveFullPageId,
    setCurrentPageId,
    setIsPageEditingReady,
    loadCurrentPage,
    triggerEditorOnChange,
  ])

  useUnmount(() => {
    triggerEditorOnChange()
    setCurrentPageId(null)
  })

  return <Page />
}

function PageNotSelected() {
  const { toggleSidebar } = useActions()
  return (
    <div>
      <HeaderContainer className='justify-between '>
        <div className='flex items-center'>
          <button title='Toggle sidebar' className='p-1' onClick={toggleSidebar}>
            <IoMdMenu size='24' />
          </button>
        </div>
      </HeaderContainer>
      <h1> Select or create new page </h1>
    </div>
  )
}

const Router: FC = () => {
  return <ReactRouter history={history}>{renderRoutes(routes)}</ReactRouter>
}

export const getMatchedRoutes = () => matchRoutes<{ id: string }>(routes, history.location.pathname)
export const getPageRouteFromMatchedRoutes = () =>
  getMatchedRoutes().find(x => x.route.meta?.isPageRoute)
export const getMatchedRoutePageId = () => getPageRouteFromMatchedRoutes()?.match?.params?.id
export default Router