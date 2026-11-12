/**
 * Copyright (C) 2025 Monadfix OÜ
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Injectable } from '@nestjs/common'
import { User } from '@app/db'
import { DefaultSubscriptionPlan, SubscriptionPlans } from '@brick/misc/constants/subscription'

@Injectable()
export class SubscriptionService {
  getUserSubscriptionPlan(user: User) {
    return SubscriptionPlans[user.subscriptionPlan] || DefaultSubscriptionPlan
  }
}
