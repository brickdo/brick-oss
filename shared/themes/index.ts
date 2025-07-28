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

import fs from 'node:fs'
import { basename, resolve } from 'node:path'
import { renderScss } from '@brick/lib/scss'

export type Theme = {
  id: string | null
  name: string
  content: string
}

// Mar 17, 2024: I tried to use 'parcel' to do SCSS rendering at build time (using the new macro functionality), but it requires newer typescript and also Parcel kinda messes with pnpm for whatever reason. I also considered using esbuild to embed SCSS file contents, but esbuild does not typecheck out of the box. In the end, reading files at runtime is the easiest solution.

function readStylesFile(filePath: string) {
  const root = basename(__dirname) === 'dist' ? resolve(__dirname, '..') : __dirname
  const path = resolve(root, filePath)
  const scss = renderScss(fs.readFileSync(path, 'utf8'))
  if (!scss) throw new Error(`Failed to render SCSS file ${path}`)
  return scss
}

export const themes: Theme[] = [
  {
    id: null,
    name: 'Default (inherit)',
    content: '',
  },
  // IDs are just random UUIDs. Generate a new one when adding a theme.
  {
    id: '57272066-ce46-4c71-9b68-5e58b3ef7bde',
    name: 'Sepia',
    content: readStylesFile('./css/sepia.scss'),
  },
  {
    id: 'ca60834c-029b-49b9-9005-410b39ca8b48',
    name: 'Dark',
    content: readStylesFile('./css/papermod-dark.scss'),
  },
]