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

import { config } from 'dotenv'
config()
import path from 'node:path'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'

const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE, DB_SSL, NODE_ENV } = process.env
const isProduction = NODE_ENV === 'production'

const entities = [path.resolve(__dirname, './models/*')]

const dbConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  ssl: DB_SSL === 'true',
  logging: true,
  entities,
  subscribers: entities,
  synchronize: false,
  keepConnectionAlive: true,
  migrations: [path.resolve(__dirname, '../../../apps/brick/src/migrations/*')],
  migrationsRun: false,
  cli: {
    migrationsDir: 'apps/brick/src/migrations',
    entitiesDir: 'libs/db/src/models',
    subscribersDir: 'libs/db/src/models',
  },
}

export default dbConfig