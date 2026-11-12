/**
 * Copyright (C) 2025 Monadfix OÜ
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Get, GoneException, Post, Put, Req, UseGuards } from '@nestjs/common'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { JwtAuthGuard } from '@brick/auth/auth.jwt.guard'
import { AuthenticatedRequest } from '@brick/types'

@ApiControllerDecorator('subscription')
export class SubscriptionController {
  @Get('user-subscription')
  @UseGuards(JwtAuthGuard)
  getUserSubscription(@Req() req: AuthenticatedRequest) {
    return { planId: req.user.subscriptionPlan }
  }

  @Post('create-checkout-session')
  createCheckoutSession() {
    throw new GoneException('Brick is free and no longer bills customers')
  }

  @Put('reactivate')
  reactivateSubscription() {
    throw new GoneException('Brick is free and no longer bills customers')
  }
}
