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

import { ReactElement } from 'react'

interface Props {
  profileName: string
}

function ProfileAvatar({ profileName }: Props): ReactElement {
  return (
    <span className='mr-2 text-white'>
      {profileName[0].toUpperCase()}
      <style jsx>{`
        span {
          user-select: none;
          font-size: 16px;
          width: 2em;
          height: 2em;
          flex-shrink: 0;
          line-height: 2em;
          border-radius: 50%;
          text-align: center;
          background: #5d6267;
        }
      `}</style>
    </span>
  )
}

export default ProfileAvatar