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

import { applyDecorators, ControllerOptions, Controller } from '@nestjs/common'

export function ApiControllerDecorator(options?: string | ControllerOptions) {
  const pathPrefix = 'api/'
  let modified: string | ControllerOptions = pathPrefix
  if (typeof options === 'string') {
    modified += options
  } else if (typeof options === 'object') {
    modified = {
      ...options,

      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      path: pathPrefix + options.path,
    }
  }
  return applyDecorators(Controller(modified as string))
}