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

import advantage1 from '../assets/advantage1.svg'
import advantage2 from '../assets/advantage2.svg'
import advantage3 from '../assets/advantage3.svg'
import advantage4 from '../assets/advantage4.svg'
import advantage5 from '../assets/advantage5.svg'
import advantage6 from '../assets/advantage6.svg'
import advantage7 from '../assets/advantage7.svg'
import iconRocket from '../assets/icon-rocket.svg'
import { IAdvantage } from '../types/types'

export const advantages: IAdvantage[] = [
  {
    image: advantage1,
    title: 'Fast',
    desc: 'Published pages load instantly',
  },
  {
    image: advantage2,
    title: 'Unlimited pages',
    desc: 'No limits on page length or quantity, even on the free plan',
  },
  {
    image: advantage3,
    title: 'Workspaces',
    desc: 'Organize your content across multiple workspaces',
  },
  {
    image: advantage4,
    title: 'Custom domains',
    desc: 'Use a brick.do subdomain or bring your own domain',
  },
  {
    image: advantage5,
    title: 'Anonymity',
    desc: 'Published pages are anonymous by default',
  },
  {
    image: advantage6,
    title: 'Export your data',
    desc: 'You can request weekly backups of your data in HTML and Markdown',
  },
  {
    image: advantage7,
    title: 'Great support',
    desc: 'Chat-based support and a growing knowledge base',
  },
  {
    image: iconRocket,
    title: 'Integrations',
    desc: 'Connect any third-party service or embed',
  },
]