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

declare namespace NodeJS {
  export interface ProcessEnv {
    CLIENT_BUILD_PATH: string
    PUBLIC_CLIENT_BUILD_PATH: string
    NODE_ENV: string
    HTTP_PORT: string
    HTTPS_PORT: string
    WEBSOCKET_PORT: string
    PUBLICVAR_BRICK_DOMAIN: string
    PUBLICVAR_BRICK_HOST: string
    PUBLICVAR_BRICK_URL: string
    DB_USERNAME: string
    DB_PASSWORD: string
    DB_HOST: string
    DB_PORT: string
    DB_DATABASE: string
    DB_SSL: string
    DB_URL: string
    NODE_TLS_REJECT_UNAUTHORIZED: string
    STRIPE_API_KEY: string
    STRIPE_ENDPOINT_SECRET: string
    OAUTH_GITHUB_CLIENT_ID: string
    OAUTH_GITHUB_CLIENT_SECRET: string
    OAUTH_GOOGLE_CLIENT_ID: string
    OAUTH_GOOGLE_CLIENT_SECRET: string

    MAINTENANCE_MODE: string
  }
}