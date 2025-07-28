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
import { ReactElement } from 'react'
import { FiTrash } from '@react-icons/all-files/fi/FiTrash'
import { IoIosAdd } from '@react-icons/all-files/io/IoIosAdd'
import { useActions, useAppState } from '../store'
import { openSupportChat } from '../support-chat'
import { ActionText } from './ActionText'
import CopyValueBtn from './CopyValueBtn'

interface Props {
  pageId: string
  className?: string
}

function PageCollaborationSettings({ pageId, className }: Props): ReactElement | null {
  const { pages } = useAppState()
  const { createPageCollaborationInvite, deletePageCollaborationInvite } = useActions()
  const page = pages[pageId]
  if (!page) {
    return null
  }
  const invites = page.collaborationInviteIds
  const { host, protocol } = window.location
  const appUrl = `${protocol}//${host}`
  return (
    <div className={clsx('bg-white py-4 px-3 rounded', className)}>
      <button
        className='py-1 px-2 mb-2 flex items-center rounded w-full border border-dashed border-gray-500 collaboration-new-invite-btn'
        onClick={() => createPageCollaborationInvite({ pageId })}
      >
        <IoIosAdd size='28' className='mr-1 ml-2' /> New collaboration invite
      </button>

      <div className='text-gray-500'>
        <p>
          Create a new collaboration invite and send the link to another user. They will be able to
          edit this page and all pages inside of it.
        </p>
        <p>
          <strong>Note:</strong> deleting an invite does not remove access from users who already
          accepted the invite. Roles and access control for collaboration are coming soon.{' '}
          <ActionText onClick={openSupportChat}>Contact support</ActionText> if you need to remove
          somebody else's access.
        </p>
      </div>

      {invites && !!invites.length && (
        <div className='mt-2'>
          {invites?.map(x => {
            const inviteLink = `${appUrl}/api/collaboration/invite/${x}`
            return (
              <div key={x} className='collaboration-invite-item'>
                <button
                  className='collaboration-link-delete-btn hover:bg-gray-300 rounded'
                  onClick={() => deletePageCollaborationInvite({ pageId, inviteId: x })}
                  title='Delete collaboration invite'
                >
                  <FiTrash size='26px' className='p-1' />
                </button>
                <input readOnly value={inviteLink} />
                <CopyValueBtn
                  className='collaboration-link-copy-btn hover:bg-gray-300'
                  copyValue={inviteLink}
                />
              </div>
            )
          })}
        </div>
      )}

      <style jsx>{`
        .collaboration-new-invite-btn:hover {
          background: rgb(234, 237, 240);
        }
        .collaboration-invite-item {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .collaboration-invite-item:not(:last-child) {
          margin-bottom: 8px;
        }
        .collaboration-invite-item:first-child {
          margin-top: 10px;
        }
        .collaboration-invite-item input {
          border: 1px solid #ddd;
          padding: 4px 6px;
          flex: 1;
          background: #dddddd45;
        }
        .collaboration-link-delete-btn {
          margin-right: 6px;
        }
        * :global(.collaboration-link-copy-btn) {
          padding: 4px;
          border-radius: 5px;
          margin-left: 6px;
          width: 68px;
          box-shadow:
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 0.4px solid #ddd;
        }
      `}</style>
    </div>
  )
}

export default PageCollaborationSettings