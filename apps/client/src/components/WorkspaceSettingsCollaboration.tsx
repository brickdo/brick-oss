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
import { FiTrash } from '@react-icons/all-files/fi/FiTrash'
import { HiMinusCircle } from '@react-icons/all-files/hi/HiMinusCircle'
import { IoIosAdd } from '@react-icons/all-files/io/IoIosAdd'
import { useActions, useAppState } from '../store'
import CopyValueBtn from './CopyValueBtn'
import GenericSettingsSectionTitle from './GenericSettingsSectionTitle'
import ProfileAvatar from './ProfileAvatar'
import { NavLink } from 'react-router-dom'

const { host, protocol } = window.location
const appUrl = `${protocol}//${host}`

function WorkspaceSettingsCollaboration() {
  const {
    workspace,
    workspaces,
    userSubscriptionPlan: userSubscription,
    user,
    maintenanceMode,
  } = useAppState()
  const {
    createWorkspaceCollaborationInvite,
    deleteWorkspaceCollaborationInvite,
    removeCollaboratorFromWorkspace,
  } = useActions()

  if (!workspace) {
    return null
  }
  const { id: workspaceId, collaborationInviteIds, acceptedCollaborationInvites } = workspace
  const isThisCollabWorkspace = collaborationInviteIds.length || acceptedCollaborationInvites.length
  const collabWorkspacesLimit = userSubscription?.entities.collabWorkspacesUsers.limit
  const userCollabWorkspacesLength = workspaces.filter(
    x =>
      x.userId === user?.id &&
      (x.collaborationInviteIds.length || x.acceptedCollaborationInvites.length),
  ).length

  const canHaveExtraCollabWorkspace =
    userSubscription?.entities.collabWorkspacesUsers.exceedPerItemPriceId != null

  const isExceedCollabWorkspaces =
    collabWorkspacesLimit != null
      ? !isThisCollabWorkspace &&
        userCollabWorkspacesLength >= collabWorkspacesLimit &&
        !canHaveExtraCollabWorkspace
      : true

  const allWorkspacesAcceptedInvites = workspaces.flatMap(x => x.acceptedCollaborationInvites)
  const isExceedUsersLimit = !!(
    userSubscription &&
    collaborationInviteIds &&
    userSubscription.entities.collabWorkspacesUsers.limit <= allWorkspacesAcceptedInvites.length &&
    userSubscription.entities.collabWorkspacesUsers.exceedPerItemPriceId == null
  )

  if (isExceedCollabWorkspaces) {
    return (
      <div>
        You have reached the maximum number of collaborative workspaces allowed. <br />
        <NavLink to='/settings/subscription'>Upgrade your plan</NavLink> or remove all users and
        delete invites from one of your collaborative workspaces.
      </div>
    )
  }

  return (
    <div className='workspace-collab-settings'>
      <section className='mb-8'>
        <GenericSettingsSectionTitle>Manage invites</GenericSettingsSectionTitle>
        <button
          className='py-1 px-2 mb-2 flex items-center rounded w-full border border-dashed border-gray-500 workspace-collab-new-invite-btn'
          onClick={() => createWorkspaceCollaborationInvite({ workspaceId })}
          disabled={isExceedUsersLimit || maintenanceMode}
        >
          <IoIosAdd size='28' className='mr-1 ml-2' /> New collaboration invite
        </button>
        {isExceedUsersLimit && (
          <div className='font-semibold text-gray-500 text-sm mb-2'>
            You have exceeded the user limit for collaborative workspaces. <br />
            <NavLink to='/settings/subscription'>Manage your subscription</NavLink>
          </div>
        )}

        {collaborationInviteIds && !!collaborationInviteIds.length && (
          <ul
            className={clsx(
              'workspace-collaboration-list mt-2',
              isExceedUsersLimit && 'workspace-invites-list_users-limit',
            )}
          >
            {collaborationInviteIds?.map(x => {
              const inviteLink = `${appUrl}/api/collaboration/invite-workspace/${x}`
              return (
                <li key={x} className='workspace-collab-invite-item'>
                  <button
                    className='workspace-collab-link-delete-btn hover:bg-gray-300 rounded'
                    onClick={() => deleteWorkspaceCollaborationInvite({ workspaceId, inviteId: x })}
                    disabled={maintenanceMode}
                    title='Delete collaboration invite'
                  >
                    <FiTrash size='26px' className='p-1' />
                  </button>
                  <input readOnly value={inviteLink} />
                  <CopyValueBtn
                    disabled={isExceedUsersLimit}
                    className='workspace-collab-link-copy-btn hover:bg-gray-300'
                    copyValue={inviteLink}
                  />
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <GenericSettingsSectionTitle>Manage collaborators</GenericSettingsSectionTitle>

        <ul className={clsx('workspace-collaboration-list')}>
          {acceptedCollaborationInvites.map((x, i) => (
            <li
              key={i}
              className='flex items-center justify-between py-3 border-b'
              style={i === 0 ? { paddingTop: 0 } : undefined}
            >
              <div className='flex items-center'>
                <ProfileAvatar profileName={x.user.name} />
                <span className='font-medium'>{x.user.name}</span>
                <span className='ml-4'>{x.user.email}</span>
              </div>
              <button
                className='remove-access-btn'
                title='Remove user access'
                disabled={maintenanceMode}
                onClick={() =>
                  removeCollaboratorFromWorkspace({
                    collaboratorId: x.userId,
                    workspaceId,
                  })
                }
              >
                <HiMinusCircle className='text-white' size={20} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <style jsx>{`
        .remove-access-btn > :global(svg) {
          fill: rgba(248, 113, 113);
        }
        .remove-access-btn:hover > :global(svg) {
          fill: rgba(239, 68, 68);
        }
        .workspace-collab-settings {
          max-width: 600px;
        }
        .workspace-collaboration-list {
          max-height: 200px;
          overflow: auto;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }
        .workspace-collaboration-list::-webkit-scrollbar {
          -webkit-appearance: none;
          width: 7px;
          margin-left: 3px;
        }
        .workspace-collaboration-list::-webkit-scrollbar-thumb {
          border-radius: 4px;
          background-color: rgba(0, 0, 0, 0.5);
          box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
        }
        .workspace-collab-new-invite-btn:hover:not(:disabled) {
          background: rgb(234, 237, 240);
        }
        .workspace-collab-new-invite-btn:disabled {
          background: rgb(224 224 224);
          cursor: not-allowed;
          color: #b3b3b3;
        }
        .workspace-collab-invite-item {
          display: flex;
          align-items: center;
          width: 100%;
        }
        .workspace-collab-invite-item:not(:last-child) {
          margin-bottom: 8px;
        }
        .workspace-collab-invite-item:first-child {
          margin-top: 10px;
        }
        .workspace-collab-invite-item input {
          border: 1px solid #ddd;
          padding: 4px 6px;
          flex: 1;
          background: #dddddd45;
        }
        .workspace-collab-link-delete-btn {
          margin-right: 6px;
        }
        * :global(.workspace-collab-link-copy-btn) {
          padding: 4px;
          border-radius: 5px;
          margin-left: 6px;
          width: 68px;
          box-shadow:
            0 1px 3px 0 rgba(0, 0, 0, 0.1),
            0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border: 0.4px solid #ddd;
        }
        * :global(.workspace-collab-link-copy-btn:disabled) {
          cursor: not-allowed;
          background: #e0e0e0;
          color: rgb(179, 179, 179);
        }
      `}</style>
    </div>
  )
}

export default WorkspaceSettingsCollaboration