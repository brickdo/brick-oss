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

import { CSSProperties, forwardRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import CreateUserPageBtn from './CreateUserPageBtn'
import PageOptionsBtn from './PageOptionsBtn'
import ExpandIconBtn from './ExpandIconBtn'
import { checkIsMobile } from '../utils'
import { PageView } from '@brick-shared/types'
import { useActions, useAppState } from '../store'
import { PageCollaboratorWorkspace } from '../store/workspaces'
import clsx from 'clsx'
import { RenderItemParams } from '@brick-shared/components/Tree'

export type PagesTreeItemAppProps = {
  item: PageView
  provided: RenderItemParams['provided']
  offsetPerLevel: number
  depth: number
  isDragging?: boolean
  isTargetForCombine?: boolean
  onExpand?: (itemId: string) => void
}

const PagesTreeItemApp = forwardRef<HTMLDivElement, PagesTreeItemAppProps>(
  ({ item, provided, offsetPerLevel, depth, isDragging, isTargetForCombine, onExpand }, ref) => {
    const getOffset = (depthVal: number) => `${offsetPerLevel * depthVal}px`
    const { toggleSidebar, togglePageExpanded } = useActions()
    const { publicAddresses, workspace, maintenanceMode } = useAppState()
    const [isHovered, setIsHovered] = useState(false)
    const [isOptionsTippyOpen, setIsOptionsTippyOpen] = useState(false)
    const topLevelAncestorId = item.mpath.split('.').filter(Boolean)[0]
    const isTopLevelItem = item.id === topLevelAncestorId
    const pagePublicAddress =
      publicAddresses && publicAddresses.find(x => x.rootPageId === topLevelAncestorId)
    const host = (globalThis.window && globalThis.window.location.host) || 'brick.do'
    const pageDomain =
      pagePublicAddress &&
      (pagePublicAddress.externalDomain || `${pagePublicAddress.subdomain}.${host}`)

    const draggableProps = provided
      ? {
          ...provided.draggableProps,
          ...provided.dragHandleProps,
        }
      : {}

    const wrapperStyles: CSSProperties = {
      ...(provided?.draggableProps.style || {}),
      paddingLeft: undefined,
      boxShadow: isDragging ? 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px' : undefined,
      backgroundColor: isTargetForCombine ? 'rgba(var(--color-primary), 0.1)' : 'transparent',
    }

    const isMobile = checkIsMobile()
    return (
      <div {...draggableProps} ref={ref} style={wrapperStyles}>
        <NavLink
          title={item.name}
          onMouseOver={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className='page-tree-item'
          activeClassName={isTargetForCombine ? undefined : 'page-tree-item_active'}
          to={`/${item.shortId}`}
          onClick={() => isMobile && toggleSidebar()}
          style={{ paddingLeft: getOffset(depth) }}
        >
          <ExpandIconBtn
            className='ml-2 page-tree-item-expand'
            isExpanded={item.isExpanded}
            onClick={() => {
              onExpand ? onExpand(item.id) : togglePageExpanded(item.id)
            }}
          />

          <div className='truncate'>
            <div className='truncate'>{item.name}</div>
            {pageDomain && isTopLevelItem && (
              <div className='text-base text-gray-600 truncate'>{pageDomain}</div>
            )}
          </div>
          <div className='flex items-center ml-auto self-start'>
            {workspace?.id !== PageCollaboratorWorkspace.id && (
              <>
                <PageOptionsBtn
                  page={item}
                  className={clsx(!isMobile && 'border border-gray-400', 'mr-2')}
                  isVisible={isHovered || isMobile}
                  onOpen={() => setIsOptionsTippyOpen(true)}
                  onClose={() => {
                    setIsOptionsTippyOpen(false)
                    setIsHovered(false)
                  }}
                />
                <CreateUserPageBtn
                  small
                  title='Add page inside'
                  className={clsx(
                    !isHovered && !isMobile && !isOptionsTippyOpen && 'hidden',
                    isMobile && 'border-none',
                  )}
                  disabled={
                    !workspace || workspace?.id === PageCollaboratorWorkspace.id || maintenanceMode
                  }
                  parentId={item.id}
                />
              </>
            )}
          </div>
        </NavLink>
      </div>
    )
  },
)

export default PagesTreeItemApp