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

import { IIllustration } from '../components/Homepage/Illustration'
import ScreenshotCollaboration from '../components/Homepage/ScreenshotCollaboration'
import ScreenshotCustomization from '../components/Homepage/ScreenshotCustomization'
import ScreenshotPublishing from '../components/Homepage/ScreenshotPublishing'

export const illustrations: IIllustration[] = [
  {
    image: <ScreenshotPublishing />,
    title: 'Every document is instantly a web page',
    desc: 'A webinar landing page, a course syllabus, an affiliate kit, a blog post. Anything text-heavy is a perfect fit for Brick.',
  },
  {
    image: <ScreenshotCollaboration />,
    title: 'Team collaboration',
    desc: 'Brick has collaboration out of the box. Invite others to your workspace, or give edit access to specific pages.',
  },
  {
    image: <ScreenshotCustomization />,
    title: 'Full customization',
    desc: 'Choose among several design themes. Add custom CSS if you need to. Embed HTML blocks and arbitrary JavaScript. Connect any third-party services like Intercom or Google Analytics.',
  },
]