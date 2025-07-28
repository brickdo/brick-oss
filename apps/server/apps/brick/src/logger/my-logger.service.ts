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

import { Injectable, LoggerService, Scope } from '@nestjs/common'
import winston from 'winston'

const winstonLogger = winston.createLogger({
  transports: [new winston.transports.Console()],
})

@Injectable({ scope: Scope.TRANSIENT })
export class MyLoggerService implements LoggerService {
  protected winstonLogger: winston.Logger
  protected context?: string

  constructor() {
    this.winstonLogger = winstonLogger
  }

  setContext(context: string) {
    this.winstonLogger = winstonLogger.child({ context })
  }
  log(message: string, meta?: any) {
    this.winstonLogger.info(message, meta)
  }
  info(message: string, meta?: any) {
    this.winstonLogger.info(message, meta)
  }
  error(message: string, meta?: any) {
    this.winstonLogger.error(message, meta)
  }
  warn(message: string, meta?: any) {
    this.winstonLogger.warn(message, meta)
  }
  debug(message: string, meta?: any) {
    this.winstonLogger.debug(message, meta)
  }
  verbose(message: string, meta?: any) {
    this.winstonLogger.verbose(message, meta)
  }
}