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

import { useState } from 'react'
import OptionsTippy, { OptionsTippyProps, OptionsTippyItem } from './OptionsTippy'
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink'
import { FiTrash } from '@react-icons/all-files/fi/FiTrash'
import { IoMdAdd } from '@react-icons/all-files/io/IoMdAdd'
import { IoMdGlobe } from '@react-icons/all-files/io/IoMdGlobe'
import { IoMdLink } from '@react-icons/all-files/io/IoMdLink'
import { IoCodeOutline } from '@react-icons/all-files/io5/IoCodeOutline'
import confirm from '../helpers/confirm'
import PublicAddressDomainUpdate from './PublicAddressDomainUpdate'
import { toaster } from 'evergreen-ui'
import PageCustomLinkUpdate from './PageCustomLinkUpdate'
import { RiPaletteLine } from '@react-icons/all-files/ri/RiPaletteLine'
import PageDesignSettings from './PageDesignSettings'
import { notNull } from '../utils/notNull'
import { BsArrow90DegRight } from '@react-icons/all-files/bs/BsArrow90DegRight'
import MovePageToWorkspace from './MovePageToWorkspace'
import { useActions, useAppState } from '../store'
import { copyToClipboard, getPageCanonicalLink } from '../utils'
import ManagePageHeadTagsDialog from './ManagePageHeadTagsDialog'
import { useToggle } from 'react-use'
import { PageView } from '@brick-shared/types'

type Props = {
  page: PageView
  children?: OptionsTippyProps['children']
  onOpen?: () => void
  onClose?: () => void
}

function PageOptionsTippy({ page, children, onClose, onOpen }: Props) {
  const {
    publicAddresses,
    workspaces,
    workspace,
    pages,
    isCurrentWorkspaceOwnedByUser,
    maintenanceMode,
  } = useAppState()
  const { createPage, deletePage } = useActions()
  const [content, setContent] = useState<JSX.Element | undefined>(undefined)
  const isTopLevelPage = page.mpath.split('.').filter(Boolean).length === 1
  const otherWorkspaces = workspace ? workspaces.filter(x => x.id !== workspace.id) : []

  const [isManageHeadTagsOpen, toggleManageHeadTags] = useToggle(false)

  const deletePageWrapper = async (pageId: string) => {
    const pageAssociatedPublicAddress = publicAddresses.find(x => x.rootPageId === pageId)
    if (pageAssociatedPublicAddress) {
      toaster.warning(`To delete this page, unbind the domain first.`, {
        duration: 5,
      })
      return
    }

    const isConfirmed = await confirm({
      text: 'Deleting the page will also delete all the nested pages. Are you sure?',
    })
    if (!isConfirmed) {
      return
    }
    await deletePage(pageId)
  }
  const splittedMpath = page.mpath.split('.').filter(Boolean)
  const rootPageId = splittedMpath[0]
  const rootPage = rootPageId && pages[rootPageId]
  if (!rootPage || !rootPageId) {
    return null
  }
  const pagePublicAddress = publicAddresses.find(x => x.rootPageId === rootPageId)

  const optionsUnfiltered: (OptionsTippyItem | null)[] = [
    {
      type: 'button',
      title: 'Add page inside',
      disabled: maintenanceMode,
      onClick: hide => {
        hide()
        createPage({ parentId: page.id })
      },
      icon: <IoMdAdd />,
    },
    {
      type: 'button',
      title: 'Delete page',
      disabled: maintenanceMode,
      onClick: hide => {
        hide()
        deletePageWrapper(page.id)
      },
      icon: <FiTrash />,
    },
    // {
    //   type: 'button',
    //   title: isPagePublic ? 'Make page private' : 'Make page public',
    //   disabled: maintenanceMode,
    //   onClick: (hide) => {
    //     hide()
    //     if(!workspacePrivateRootPageId || !workspacePublicRootPageId) {
    //       return
    //     }
    //     movePage({
    //       pageId: page.id,
    //       newParentId: isPagePublic ? workspacePrivateRootPageId : workspacePublicRootPageId,
    //     })
    //   },
    // },
    !otherWorkspaces.length || !isCurrentWorkspaceOwnedByUser
      ? null
      : {
          type: 'button',
          title: 'Move to...',
          disabled: maintenanceMode,
          onClick: hide => {
            setContent(<MovePageToWorkspace pageId={page.id} onAfterSelect={hide} />)
          },
          icon: <BsArrow90DegRight />,
        },
    { type: 'separator' },
    {
      type: 'button',
      title: 'Design',
      disabled: maintenanceMode,
      onClick: hide => {
        setContent(<PageDesignSettings pageId={page.id} />)
      },
      icon: <RiPaletteLine />,
    },
    isTopLevelPage
      ? {
          type: 'button',
          title: `${pagePublicAddress ? 'Change' : 'Add'} domain`,
          disabled: maintenanceMode,
          onClick: hide => {
            setContent(
              <PublicAddressDomainUpdate
                pageId={page.id}
                publicAddress={pagePublicAddress}
                hide={hide}
              />,
            )
          },
          icon: <IoMdGlobe />,
        }
      : {
          type: 'button',
          title: 'Custom link',
          disabled: maintenanceMode,
          onClick: hide => {
            setContent(<PageCustomLinkUpdate pageId={page.id} onAfterUpdate={hide} />)
          },
          icon: <IoMdLink />,
        },
    {
      type: 'button',
      title: 'Manage head tags',
      disabled: maintenanceMode,
      onClick: async hide => {
        toggleManageHeadTags()
        hide()
      },
      icon: <IoCodeOutline />,
    },
    { type: 'separator' },
    {
      type: 'button',
      title: 'Сopy public link',
      onClick: async hide => {
        const pageCanonicalLink = getPageCanonicalLink(page.id, pages, pagePublicAddress)
        await copyToClipboard(pageCanonicalLink)
        hide()
      },
      icon: <FiExternalLink />,
    },
  ]
  const options: OptionsTippyItem[] = optionsUnfiltered.filter(notNull)

  return (
    <>
      <OptionsTippy
        options={options}
        content={content}
        onHidden={() => setContent(undefined)}
        onOpen={onOpen}
        onClose={onClose}
        className='page-options-tippy'
      >
        {children}
      </OptionsTippy>

      <ManagePageHeadTagsDialog
        isOpen={isManageHeadTagsOpen}
        onClose={toggleManageHeadTags}
        pageId={page.id}
      />
    </>
  )
}

export default PageOptionsTippy