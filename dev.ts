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

import path from 'node:path'
import { watch } from 'turbowatch'

// This script:
// * Runs all dev servers.
// * Watches all files in internal shared packages.
// * Rebuilds the internal packages, and restarts dev servers, whenever files in the shared packages change.
//
// See docs/turbo.md for more information.
//
void watch({
  // All internal packages are in the shared/ directory
  project: path.join(__dirname, 'shared'),
  triggers: [
    {
      expression: [
        'allof',
        ['not', ['dirname', 'node_modules']],
        ['not', ['dirname', 'dist']],
        ['anyof', ['match', '*.(ts|tsx|js|jsx|cjs|mjs|json|css|scss|html)', 'basename']],
      ],
      initialRun: true,
      interruptible: true,
      persistent: true,
      name: 'dev',
      onChange: async ({ spawn }) => {
        await spawn`turbo dev`
      },
    },
  ],
})