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

import { IFAQData } from '../components/FAQ'

export const pricingFAQdata: IFAQData[] = [
  {
    categoryName: 'General questions',
    questions: [
      {
        questionTitle: 'What platforms are supported?',
        answer:
          'Brick is a web app and works in all modern browsers (Chrome, Edge, Firefox, Safari) — both on desktop and on mobile. Standalone apps are planned in the future.',
      },
      {
        questionTitle: 'Can teams use Brick?',
        answer: (
          <div>
            Existing accounts can share workspaces with their teams without a paid subscription.
          </div>
        ),
      },
      {
        questionTitle: 'Do published pages include branding?',
        answer: (
          <div>
            Published pages include “Published with Brick” in the footer, but you can remove it —
            see{' '}
            <a
              href='https://help.brick.do/how-to-remove-the-published-with-brick-footer-42z41bGMZKVE'
              target='_blank'
              rel='noreferrer'
            >
              this help page
            </a>
            .
          </div>
        ),
      },
    ],
  },
]
