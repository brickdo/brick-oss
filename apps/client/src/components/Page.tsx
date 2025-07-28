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

import { useActions, useAppState } from '../store'
import PageEditorView from './PageEditorView'
import { EditorProps } from './Editor'
import PageHeader from './PageHeader'
import LoadingSpinner from './LoadingSpinner'
import { PageView } from '@brick-shared/types'

const Page = () => {
  const {
    currentPage,
    pages,
    isPageContentSaving,
    workspace,
    user,
    themes,
    userSubscriptionPlan: userSubscription,
  } = useAppState()
  const { updateCurrentPageTitle, updatePageContent } = useActions()

  const updatePageTitle = (data: string) => {
    const newTitle = data || 'Untitled'
    updateCurrentPageTitle(newTitle)
  }

  const updatePageContentLocal: EditorProps['onChange'] = async ({ content, pageId }) => {
    console.log('updatePageContentLocal', { content, pageId })
    if (content != null) {
      await updatePageContent({ content, pageId })
    }
  }

  if (!currentPage || !pages || !workspace || !user) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <LoadingSpinner />
      </div>
    )
  }
  const splittedMpath = currentPage.mpath.split('.').filter(Boolean)
  const ancestors = splittedMpath.slice(0, -1)
  const ancestorsStyles = ancestors.map(id => pages[id]?.stylesCss).filter(Boolean)
  const firstFoundAncestorStyle = ancestorsStyles.slice(-1)[0]
  const styles = currentPage.stylesCss || firstFoundAncestorStyle || null
  const ancestorsThemeId = ancestors.map(id => pages[id]?.themeId).filter(Boolean)[0]
  const themeId = currentPage.themeId || ancestorsThemeId
  const pageThemeStyles = themeId ? themes.find(x => x.id === themeId)?.content : null

  const checkIsPageCollaborative = (page: PageView) =>
    page.mpath
      .split('.')
      .filter(Boolean)
      .some(
        id =>
          !!pages[id]?.acceptedCollaborationInvites?.length ||
          !!pages[id]?.collaborationInviteIds?.length,
      )

  const isWorkspaceCollaborative =
    workspace.userId !== user.id ||
    !!workspace.acceptedCollaborationInvites.length ||
    !!workspace.collaborationInviteIds.length

  const doesPageBelongToWorkspace = currentPage.workspaceId === workspace.id
  const isCollaborativeWorkspacePage = isWorkspaceCollaborative && doesPageBelongToWorkspace
  const isPageCollaborative = checkIsPageCollaborative(currentPage)
  const isFontSettingsEnabled =
    userSubscription?.haveFontSettings || isCollaborativeWorkspacePage || isPageCollaborative

  return (
    <div className='page-full text-left flex flex-col max-h-full flex-1'>
      <PageHeader />
      <div className='flex flex-col flex-1 overflow-auto'>
        {userSubscription ? (
          <PageEditorView
            style={currentPage?.content === undefined ? { display: 'none' } : undefined}
            onContentChange={updatePageContentLocal}
            onTitleInput={updatePageTitle}
            isPageContentSaving={isPageContentSaving}
            isFontSettingsEnabled={!!isFontSettingsEnabled}
          />
        ) : (
          <div className='flex flex-1 items-center justify-center'>
            <LoadingSpinner />
          </div>
        )}
      </div>
      {pageThemeStyles && <style dangerouslySetInnerHTML={{ __html: pageThemeStyles }} />}
      {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
    </div>
  )
}

export default Page