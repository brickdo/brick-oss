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

import axios from 'axios'

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}

const api = axios.create({ baseURL: `${process.env.PUBLICVAR_BRICK_URL!}/api/` })
api.interceptors.response.use(
  r => r.data,
  e => Promise.reject(e),
)

export default api