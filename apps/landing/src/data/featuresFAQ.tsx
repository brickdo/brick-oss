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

export const featuresFAQdata: IFAQData[] = [
  {
    categoryName: 'Editing',
    questions: [
      {
        questionTitle: 'What features does the editor support?',
        answer:
          'Text formatting, lists, quotes, code blocks, tables, images, embeds, and arbitrary HTML blocks. In the future we will aim to support full HTML editing & custom "widgets" or components.',
      },
      {
        questionTitle: 'Can I arrange elements on a canvas in arbitrary ways?',
        answer:
          "No, Brick is a document-based rather than canvas-based editor. It's a tradeoff — Brick is much simpler to use than canvas-based editors, but it might not be the best choice for e.g. complicated landing pages with specific design requirements.",
      },
      {
        questionTitle: 'Is there an offline mode?',
        answer: 'Not yet, and it is not likely to happen for at least a while.',
      },
      {
        questionTitle: 'What assets are supported? Can I upload images, videos, files?',
        answer: (
          <div>
            Images are supported. All images are uploaded to our CDN and optimized for different
            screen sizes. <br /> <br />
            We don't offer video or file hosting yet, but you can upload videos to any third-party
            video hosting and embed them into Brick.
          </div>
        ),
      },
    ],
  },
  {
    categoryName: 'Customization',
    questions: [
      {
        questionTitle: 'How customizable is the site design?',
        answer: (
          <div>
            We allow to add arbitrary CSS to your pages. This means that the look of all elements —
            text, tables, the navigation sidebar, etc — is fully customizable. We also offer several
            design themes that you can use without knowing any CSS.
            <br /> <br />
            More advanced customizations like "a different navigation menu instead of the sidebar"
            are not possible yet, but we are working on them.
          </div>
        ),
      },
      {
        questionTitle: 'What integrations are available?',
        answer:
          'Since we allow arbitrary HTML and JavaScript, you can use pretty much any third-party service. Examples include analytics (e.g. Google Analytics), chat widgets (e.g. Intercom), embedded forms (e.g. Jotform), and comments (e.g. Disqus).',
      },
    ],
  },
  {
    categoryName: 'Collaboration',
    questions: [
      {
        questionTitle: 'How can I collaborate in Brick?',
        answer: (
          <div>
            Brick lets several users join the same workspace. Those users can see and edit all pages
            in the workspace. In addition, you can invite "guest" users to edit any single
            page/site.
            <br /> <br />
            User roles (viewer, editor, admin) are not supported yet, but are on our roadmap.
          </div>
        ),
      },
    ],
  },
  {
    categoryName: 'Other questions',
    questions: [
      {
        questionTitle: 'Where is Brick based?',
        answer:
          'Brick is made by an Estonian company, Monadfix OÜ. Our servers are located in the Netherlands.',
      },
      {
        questionTitle: 'Can I host any site on Brick?',
        answer: `We consider Brick an "infrastructural" project — it's not our business to decide what you should be allowed to make with it. However, we are bound by Estonian and EU laws, so anything illegal in the EU is not allowed on Brick. In addition, we will remove any phishing pages and pages containing malware.`,
      },
      {
        questionTitle: 'Are there ads?',
        answer: (
          <div>
            We want to make money by selling a good product. Sites made with Brick don't have any
            ads and we don't plan to introduce them.
            <br /> <br />
            Of course, if you want to embed your own ads, you are free to do so.
          </div>
        ),
      },
      {
        questionTitle: 'What use cases does Brick work best for?',
        answer: (
          <div>
            Right now we are focusing on everything public-facing — sites, documentation pages,
            knowledge bases, announcements, tutorials.
            <br /> <br />
            Brick can also be used as e.g. a team wiki or a personal notebook — but right now it is
            lacking features like search or edit history, so a different tool might be more
            appropriate. This said, internally we use Brick as our team wiki and it is working well
            for us.
          </div>
        ),
      },
      {
        questionTitle: 'Do you have a feature roadmap?',
        answer: (
          <div>
            Yes, see{' '}
            <a href='https://roadmap.brick.do/roadmap' target='_blank' rel='noreferrer'>
              https://roadmap.brick.do/roadmap
            </a>
            . In particular, our immediate plans include an easy theme customization wizard and
            built-in email newsletters.
          </div>
        ),
      },
    ],
  },
]