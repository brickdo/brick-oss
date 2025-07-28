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

import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { isUndefined, omitBy, pick } from 'lodash'
import { User } from '@app/db'
import { UserService } from '@brick/user/user.service'

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

const { HELPCRUNCH_API_KEY } = process.env

// There are more fields available, see https://docs.helpcrunch.com/rest-api-v1/search-customers-v1
export type HCCustomersSearchParams = {
  email?: string
  userId?: string // Brick uuid
}

// There are more fields available, see https://docs.helpcrunch.com/rest-api-v1/search-customers-v1.
export type HCCustomerData = {
  name: string
  email: string
  userId: string
  unsubscribed: boolean
}
export type HCCustomer = { id: number } & HCCustomerData

@Injectable()
export class HelpCrunchClient {
  private client: AxiosInstance

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {
    this.client = axios.create({
      baseURL: 'https://api.helpcrunch.com/v1/',
      headers: { Authorization: `Bearer ${HELPCRUNCH_API_KEY!}` },
    })
    this.client.interceptors.response.use(
      r => r.data,
      e => Promise.reject(e),
    )
  }

  // Commented out because we don't need custom data fields for now. Moreover,
  // we can't even set customData through the REST API due to a bug in
  // HelpCrunch - they said they will notify us when it's fixed.

  // fromAPICustomer (obj) {
  //     const { customData, ...newObj } = obj
  //     const customDataObj = customData.reduce((acc, cur) => ({ ...acc, [cur.property]: cur.value }), {})
  //     return { ...newObj, ...customDataObj }
  // }
  // toAPICustomer (obj) {
  //     const props: (keyof HCCustomerData)[] = ['isAgreedMailing']
  //     let customData = []
  //     props.forEach(prop => {
  //         if (obj.hasOwnProperty(prop)) {
  //             customData.push({ property: prop, value: obj[prop] })
  //         }
  //     })
  //     return { ...omit(obj, props), customData }
  // }

  async findCustomer(params: HCCustomersSearchParams): Promise<HCCustomer | null> {
    const filter = Object.entries(params).map(([key, value]) => ({
      field: `customers.${key}`,
      operator: '=',
      value,
    }))
    try {
      const response = await this.client.post<{ total: number; data: any[] }>('customers/search', {
        filter,
        limit: 1,
        offset: 0,
      })
      switch (response.total) {
        case 0:
          return null
        case 1:
          return response.data[0] // this.fromAPICustomer
        default:
          throw new Error('Impossible: HelpCrunch customers/search returned more than one result')
      }
    } catch (e: any) {
      if (e?.response?.status === 404) return null
      else throw e
    }
  }

  async createCustomer(data: HCCustomerData): Promise<HCCustomer> {
    return this.client.post<HCCustomer>('customers', data) // this.fromAPICustomer
  }

  async updateCustomer(id: number, data: Partial<HCCustomerData>): Promise<void> {
    return this.client.put(`customers/${id}`, data) // this.toAPICustomer
  }

  userToCustomerData(data: User): HCCustomerData
  userToCustomerData(data: Partial<User>): Partial<HCCustomerData>
  userToCustomerData(data: Partial<User>): Partial<HCCustomerData> {
    return omitBy(
      {
        ...pick(data, 'name', 'email'),
        unsubscribed: data.isAgreedMailing != null ? !data.isAgreedMailing : undefined,
        userId: data.id,
      },
      isUndefined,
    )
  }

  async syncUserChanges(id: User['id'], data: Partial<User>): Promise<HCCustomer> {
    let customer = await this.findCustomer({ userId: id })
    if (!customer) {
      const user = await this.userService.getById(id)

      if (!user) {
        throw new BadRequestException('User not found')
      }

      const fullData = this.userToCustomerData({ ...user, ...data })
      customer = await this.createCustomer(fullData)
    } else {
      await this.updateCustomer(customer.id, this.userToCustomerData(data))
    }
    return customer
  }
}