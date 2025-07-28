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

import leafIcon from '../assets/icon-leaf.svg'
import flashIcon from '../assets/icon-flash.svg'
import chartIcon from '../assets/icon-chart.svg'
import { IFeatureDescriptionItem } from '../components/Features/Description'

export const featureDescriptions: IFeatureDescriptionItem[] = [
  {
    image: leafIcon,
    _title: 'As simple as possible',
    desc: 'You use Brick like any other document editor. Your pages instantly become websites.',
  },
  {
    image: flashIcon,
    _title: 'Lightweight and fast',
    desc: 'Brick is a modern product without feature bloat.',
  },
  {
    image: chartIcon,
    _title: 'Grows with you',
    desc: 'Make a custom design. Add third-party services. Connect your own domain. Invite others to collaborate.',
  },
]