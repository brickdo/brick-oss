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

import {
  Entity,
  Column,
  CreateDateColumn,
  Generated,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './User'

@Entity({ name: 'userResetPassword' })
export class UserResetPassword {
  @Column()
  @Generated('uuid')
  id: string

  @PrimaryColumn()
  userId: User['id']

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User

  @CreateDateColumn({
    transformer: {
      from: (value: Date) => {
        // In dev enviroment timestamp is stored in UTC in database,
        // but when TypeORM parses it to Date object it assumes it's in local timezone
        // so we convert in back to UTC

        return new Date(
          Date.UTC(
            value.getFullYear(),
            value.getMonth(),
            value.getDate(),
            value.getHours(),
            value.getMinutes(),
            value.getSeconds(),
            value.getMilliseconds(),
          ),
        )
      },
      to: (value: Date) => value,
    },
  })
  createdAt: Date
}