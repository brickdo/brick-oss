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

const emailSupportLink = <a href='mailto:support@brick.do'>support@brick.do</a>

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
            We offer collaborative workspaces for teams. The price depends on the number of users
            belonging to your workspaces. To request a trial, please contact us in the support chat
            or write at {emailSupportLink}.
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
            . This applies both to free and premium plans.
          </div>
        ),
      },
    ],
  },
  {
    categoryName: 'Payment questions',
    questions: [
      {
        questionTitle: 'Can I pay via PayPal or bank transfer?',
        answer: (
          <div>
            Yes. Contact us in the support chat or by writing at {emailSupportLink} to learn about
            the available options.
          </div>
        ),
      },
      {
        questionTitle: 'Do you offer education/student discounts?',
        answer: (
          <div>
            Yes. Please contact us in the support chat or by writing at {emailSupportLink} to
            arrange the discount.
          </div>
        ),
      },
    ],
  },
  {
    categoryName: 'Refunds and cancellations',
    questions: [
      {
        questionTitle: 'How do I cancel my subscription?',
        answer:
          'You can cancel your subscription in the billing settings in-app. Your plan will be downgraded immediately.',
      },
      {
        questionTitle: 'Can I request a refund?',
        answer: (
          <div>
            When you cancel a monthly subscription, you can request a full refund for your last
            payment in the support chat or by writing at {emailSupportLink}. When you cancel an
            annual subscription, you can request a refund within 30 days of your last payment.
          </div>
        ),
      },
      {
        questionTitle: 'What happens with my pages if I cancel my subscription?',
        answer:
          'All your published pages and domains will keep working. However, if you are past the free plan domain limit, you will not be able to add new domains unless you resubscribe.',
      },
    ],
  },
]