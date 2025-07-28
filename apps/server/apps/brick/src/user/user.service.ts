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

import { ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { User } from '@app/db'
import { In, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { SubscriptionPlanId } from '@brick/misc/constants/subscription'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { HelpCrunchClient } from '@brick/helpcrunch/helpcrunch-client.provider'
import { isEmpty } from 'lodash'
import { WorkspaceService } from '@brick/workspace/workspace.service'
import { AuthProvider } from './AuthProvider'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userModel: Repository<User>,
    private logger: MyLoggerService,
    @Inject(forwardRef(() => WorkspaceService))
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => HelpCrunchClient))
    private readonly helpCrunchClient: HelpCrunchClient,
  ) {
    logger.setContext('UserService')
  }

  async create(
    user: Omit<User, 'id' | 'subscriptionPlan'> & Partial<Pick<User, 'subscriptionPlan'>>,
  ) {
    if (user.provider === AuthProvider.local) {
      const existingLocalUserWithEmail = await this.userModel.findOne({
        provider: AuthProvider.local,
        email: user.email,
      })
      if (existingLocalUserWithEmail) {
        throw new ConflictException('This email is already in use')
      }
    }
    const newUserData = this.userModel.create({
      ...user,
      email: user.email.trim().toLowerCase(),
    })
    const { id } = await this.userModel.save(newUserData)
    const newUser = (await this.userModel.findOne(id)) as User
    this.logger.info('User created', { user: newUser })
    await this.workspaceService.create({
      name: `${newUser.name}'s workspace`,
      userId: id,
    })
    try {
      await this.helpCrunchClient.syncUserChanges(id, newUser)
    } catch (e) {
      this.logger.error('Failed to sync created user with HelpCrucnh', {
        error: e,
        userId: id,
      })
    }
    return newUser
  }

  async findAll() {
    return this.userModel.find()
  }

  findOne: Repository<User>['findOne'] = this.userModel.findOne.bind(this.userModel)

  async getById(id: User['id']) {
    return this.userModel.findOne({ id })
  }

  async updateById(id: User['id'], data: Partial<User>) {


    const updateResult = await this.userModel.update(id, data)
    try {
      const shouldSyncHelpCrunch = !isEmpty(this.helpCrunchClient.userToCustomerData(data))
      if (shouldSyncHelpCrunch) {
        await this.helpCrunchClient.syncUserChanges(id, data)
      }
    } catch (e) {
      console.error(`Failed to sync user changes with HelpCrunch`, e)
    }
    return updateResult
  }
}