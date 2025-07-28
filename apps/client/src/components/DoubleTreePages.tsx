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

import { toaster } from 'evergreen-ui'
import React, { ReactNode, useState } from 'react'
import { AiOutlineQuestionCircle } from '@react-icons/all-files/ai/AiOutlineQuestionCircle'
import { useActions, useAppState } from '../store'
import { PageCollaboratorWorkspace } from '../store/workspaces'
import CreateUserPageBtn from './CreateUserPageBtn'
import PagesTreeItemApp from './PagesTreeItemApp'
import styled from '@emotion/styled'
import { css } from '@emotion/react'
import clsx from 'clsx'
import Tooltip from './Tooltip'
import { mobileCssMediaCondition } from '../utils'
import localStorageConnector from '../utils/localStorageConnector'
import { RenderItemParams, ItemId, moveItemOnTree } from '@brick-shared/components/Tree'
import DoubleTree, {
  onDragEndDoubleTree,
} from '@brick-shared/components/Tree/components/Tree/DoubleTree'
import { DOUBLE_TREE_DROPPABLE_ID } from '@brick-shared/components/Tree/components/Tree/Tree-utils'
import { moveItemOnDoubleTree } from '@brick-shared/components/Tree/utils/tree'
import { PageView } from '@brick-shared/types'

const offsetPerLevel = 14

type TreeTitleProps = {
  label: string
  className?: string
  createBtnParentId?: string | null
  tooltipText: ReactNode
  showCreateBtn?: boolean
}

const TreeTitleTooltipWrapper = styled.div`
  transition: opacity 0.1s ease-in-out;
  opacity: 0;
  cursor: help;
  visibility: hidden;
  margin-left: 0.5rem;
`

const treeTitleTooltipWrapperVisible = css`
  ${TreeTitleTooltipWrapper} {
    opacity: 1;
    visibility: visible;
  }
`
const publicPagesTooltipText = (
  <div>
    These pages can be viewed by anyone who has a link.
    <br />
    Search engines will index these pages if there are other public websites linking to them.
  </div>
)

const privatePagesTooltipText = <div>Only workspace members can access these pages.</div>

const TreeTitle = ({
  label,
  className,
  createBtnParentId,
  tooltipText,
  showCreateBtn = true,
}: TreeTitleProps) => {
  const { maintenanceMode } = useAppState()
  return (
    <div
      className={clsx(
        className,
        'ml-3 mb-2 pr-3 uppercase tracking-wider text-gray-500 font-medium text-sm flex items-center justify-between',
      )}
    >
      <span className='flex items-center'>
        {label}

        <Tooltip content={tooltipText}>
          <TreeTitleTooltipWrapper>
            <AiOutlineQuestionCircle />
          </TreeTitleTooltipWrapper>
        </Tooltip>
      </span>

      {showCreateBtn && (
        <CreateUserPageBtn
          small
          parentId={createBtnParentId || undefined}
          disabled={maintenanceMode}
        />
      )}
    </div>
  )
}

const renderItem = ({ item, depth, provided, onExpand, snapshot }: RenderItemParams<PageView>) => {
  const isTargetForCombine = !!snapshot?.combineTargetFor
  return (
    <PagesTreeItemApp
      ref={provided && provided.innerRef}
      provided={provided}
      item={item}
      onExpand={onExpand}
      offsetPerLevel={offsetPerLevel}
      depth={depth}
      isDragging={snapshot?.isDragging}
      isTargetForCombine={isTargetForCombine}
    />
  )
}

const DoubleTreePages = () => {
  const {
    publicAddresses,
    arePrivatePagesEnabled,
    workspace,
    currentWorkspacePublicPagesTree,
    currentWorkspacePrivatePagesTree,
    workspacePrivateRootPageId,
    workspacePublicRootPageId,
  } = useAppState()
  const { movePage, togglePageExpanded } = useActions()
  const { maintenanceMode } = useAppState()
  const [draggingItemId, setDraggingItemId] = useState<ItemId | null>(null)
  const [isNestingEnabled, setIsNestingEnabled] = useState(true)

  const getPagePublicAddress = (pageId: string | number) => {
    return publicAddresses && publicAddresses.find(x => x.rootPageId === pageId)
  }

  const onDragStart = (itemId: ItemId) => {
    const isPageWithDomain = getPagePublicAddress(itemId)
    setDraggingItemId(itemId)
    const shouldNestingBeEnabled = !isPageWithDomain
    if (shouldNestingBeEnabled !== isNestingEnabled) {
      setIsNestingEnabled(!isPageWithDomain)
    }
  }

  const onDragEnd: onDragEndDoubleTree = async (source, destination) => {
    if (!destination || !draggingItemId) {
      return
    }
    const newParentId = source.parentId !== destination.parentId ? destination.parentId : undefined
    const isPageWithDomain = getPagePublicAddress(draggingItemId)
    const isMoveInsideNonRootPage =
      newParentId &&
      destination.parentId !== workspacePublicRootPageId &&
      destination.parentId !== workspacePrivateRootPageId
    if (isPageWithDomain && isMoveInsideNonRootPage) {
      toaster.warning(`To move this page, unbind the domain first.`, {
        description: 'Domains can only be bound to top-level pages.',
        duration: 5,
      })
      return
    }

    const isSameTree = source.droppableId === destination?.droppableId
    const sourceTree =
      source.droppableId === DOUBLE_TREE_DROPPABLE_ID.one
        ? currentWorkspacePublicPagesTree!
        : currentWorkspacePrivatePagesTree!
    if (isSameTree) {
      const newParentId =
        source.parentId !== destination.parentId ? destination.parentId : undefined
      const newPosition =
        destination.index != null && (source.index !== destination.index || newParentId)
          ? destination.index
          : undefined
      const notMoved = !newParentId && newPosition == null
      if (notMoved) {
        return
      }
      const newTree = moveItemOnTree(sourceTree, source, destination)
      await movePage({
        pageId: draggingItemId,
        newParentId,
        newPosition,
        updatedItems: newTree.items,
      })
      return
    }

    const destinationTree =
      destination.droppableId === DOUBLE_TREE_DROPPABLE_ID.one
        ? currentWorkspacePublicPagesTree!
        : currentWorkspacePrivatePagesTree!
    const updatedItems = moveItemOnDoubleTree(sourceTree, destinationTree, source, destination)

    const newPosition =
      destination.index != null && (source.index !== destination.index || newParentId)
        ? destination.index
        : undefined
    updatedItems[draggingItemId].mpath = `${
      destinationTree.items[destination.parentId].mpath
    }${draggingItemId}.`
    await movePage({
      pageId: draggingItemId,
      newParentId,
      newPosition,
      updatedItems,
    })
  }

  const isPageCollaboratorWorkspace = workspace?.id === PageCollaboratorWorkspace.id
  const renderDoubleTreeCondition = isPageCollaboratorWorkspace
    ? currentWorkspacePublicPagesTree
    : currentWorkspacePublicPagesTree && currentWorkspacePrivatePagesTree

  return (
    <div
      className='flex flex-col h-full max-h-full page-tree-container'
      css={css`
        &:hover {
          ${treeTitleTooltipWrapperVisible}
        }

        ${mobileCssMediaCondition} {
          ${treeTitleTooltipWrapperVisible}
        }
      `}
    >
      {!isPageCollaboratorWorkspace && (
        <TreeTitle
          label='Public pages'
          className='tree-title-public'
          tooltipText={publicPagesTooltipText}
          createBtnParentId={workspacePublicRootPageId}
        />
      )}
      {renderDoubleTreeCondition && (
        <DoubleTree
          tree1={currentWorkspacePublicPagesTree || undefined}
          tree2={
            !isPageCollaboratorWorkspace &&
            arePrivatePagesEnabled &&
            currentWorkspacePrivatePagesTree
              ? currentWorkspacePrivatePagesTree
              : undefined
          }
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onExpand={togglePageExpanded}
          treesDivider={
            <TreeTitle
              label='Private pages'
              tooltipText={privatePagesTooltipText}
              createBtnParentId={workspacePrivateRootPageId}
              className='tree-title-private mt-4'
            />
          }
          isDragEnabled={!isPageCollaboratorWorkspace && !maintenanceMode}
          isNestingEnabled={isNestingEnabled}
          renderItem={renderItem}
          offsetPerLevel={offsetPerLevel}
          onTreeSeparatorResize={(event, direction, el) =>
            localStorageConnector.set('doubleTreeSeparatorValue', el.offsetHeight)
          }
          treeSeparatorMountValue={localStorageConnector.get('doubleTreeSeparatorValue')}
        />
      )}
      {!arePrivatePagesEnabled && (
        <>
          <TreeTitle
            label='Private pages'
            tooltipText={privatePagesTooltipText}
            createBtnParentId={workspacePrivateRootPageId}
            showCreateBtn={false}
            className='tree-title-private mt-4'
          />

          <div className='text-sm mt-1 text-center text-gray-500 italic'>
            Private pages are a premium feature.
          </div>
        </>
      )}
    </div>
  )
}

export default DoubleTreePages