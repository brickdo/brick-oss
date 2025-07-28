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

import { Module } from '@nestjs/common'
import { ApiModule } from './api.module'
import { MyLoggerModule } from './logger/my-logger.module'
import { ServeModule } from './serve/serve.module'
import { ScheduleModule } from '@nestjs/schedule'
import { SubscriptionCronService } from './subscription/subscription.cron.service'
import { StripeModule } from './stripe/stripe.module'



@Module({
  // `ServeModule` should be passed last because its controller doesn't have any route prefix
  // and works as fallback after another controllers
  imports: [ScheduleModule.forRoot(), MyLoggerModule, ApiModule, ServeModule],
  providers: [],
})
export class AppModule {}