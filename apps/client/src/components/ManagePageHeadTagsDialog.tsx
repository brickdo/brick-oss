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

import { Page } from '@brick-shared/types'
import { css } from '@emotion/react'
import Dialog, { DialogProps } from './Dialog'
import ManagePageHeadTags from './ManagePageHeadTags'

type Props = {
  pageId: Page['id']
} & DialogProps

const ManagePageHeadTagsDialog = ({ pageId, ...props }: Props) => {
  return (
    <Dialog
      {...props}
      contentCss={css`
        border-radius: 25px;
        max-width: 600px;
      `}
    >
      <div className='bg-white max-w-full w-full'>
        <h1 className='text-2xl mb-8'>Manage page's {`<head>`} tags</h1>
        <ManagePageHeadTags onCancelClick={props.onClose} onSave={props.onClose} pageId={pageId} />
      </div>
    </Dialog>
  )
}

export default ManagePageHeadTagsDialog