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

import { Controller, Get } from '@nestjs/common'
import { ApiControllerDecorator } from '@brick/decorators/api-controller.decorator'
import { themes } from '@brick/themes'

/**
 * API for Brick themes. The client uses this API to get available page themes.
 *
 * See `docs/themes.md`.
 */
@ApiControllerDecorator('themes')
export class ThemesController {
  @Get()
  getThemes() {
    return themes.map(theme => ({
      ...theme,
      screenshotUrl: `${process.env.PUBLICVAR_BRICK_URL}/themes-screenshots/${
        theme.id || 'null'
      }.png`,
    }))
  }
}