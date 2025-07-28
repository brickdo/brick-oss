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

import { SubscriptionPlanId } from '../constants/subscription'

export const PlanTitles = [
  'Content',
  'Workspaces and collaboration',
  'Sharing and domains',
  'Hosting',
  'Customization',
  'Export',
  'Support',
] as const

export type PlanTitle = (typeof PlanTitles)[number]

export type Feature = Readonly<{
  content: string
  isDowngrade?: boolean
}>

export type IPlan = {
  id: SubscriptionPlanId
  _title: string
  price?: number
  desc: string
  mostPopular: boolean
  features: {
    [key in PlanTitle]: Feature[]
  }
}

export const plans: IPlan[] = [
  {
    id: SubscriptionPlanId.free,
    _title: 'Basic',
    price: 0,
    desc: 'For personal sites and one-off pages',
    mostPopular: false,
    features: {
      Content: [
        {
          content: 'Unlimited pages and images (subject to fair use policy)',
        },
        { content: 'Embeds, tables, code blocks' },
        { content: 'No advanced text formatting', isDowngrade: true },
        { content: 'All pages are public', isDowngrade: true },
      ],
      'Workspaces and collaboration': [
        { content: '1 personal workspace' },
        { content: 'No collaboration', isDowngrade: true },
      ],
      'Sharing and domains': [
        { content: 'Unique links for all pages' },
        { content: '1 .brick.do subdomain' },
        { content: 'Cannot use custom domains', isDowngrade: true },
      ],
      Hosting: [
        { content: 'Image optimization & CDN' },
        {
          content: 'Add any third-party services (e.g. Google Analytics, Intercom)',
        },
        { content: 'Page visit tracking', isDowngrade: true },
      ],
      Customization: [
        { content: 'Three design themes (more coming)' },
        { content: 'Custom fonts and CSS styles' },
        { content: 'Custom HTML and JavaScript' },
      ],
      Export: [
        { content: 'Request a content archive at any time' },
        { content: 'No auto-recurring archives', isDowngrade: true },
      ],
      Support: [{ content: 'Knowledge base' }, { content: 'Chat support' }],
    },
  },
  {
    id: SubscriptionPlanId.hobby,
    _title: 'Hobby',
    price: 5,
    desc: 'For advanced Brick users — custom domains, workspaces, premium support',
    mostPopular: true,
    features: {
      Content: [
        {
          content: 'Unlimited pages and images (subject to fair use policy)',
        },
        { content: 'Embeds, tables, code blocks' },
        { content: 'Text alignment, font size and colors' },
        { content: 'Private and public pages' },
      ],
      'Workspaces and collaboration': [
        { content: '3 personal workspaces' },
        { content: 'No collaboration', isDowngrade: true },
      ],
      'Sharing and domains': [
        { content: 'Unique links for all pages' },
        { content: '5 .brick.do subdomains' },
        { content: '1 custom domain (CNAME), then $3/domain' },
        { content: 'Automatic SSL for custom domains' },
      ],
      Hosting: [
        { content: 'Image optimization & CDN' },
        {
          content: 'Add any third-party services (e.g. Google Analytics, Intercom)',
        },
        { content: 'Page visit tracking', isDowngrade: true },
      ],
      Customization: [
        { content: 'Three design themes (more coming)' },
        { content: 'Custom fonts and CSS styles' },
        { content: 'Custom HTML and JavaScript' },
      ],
      Export: [
        { content: 'Request a content archive at any time' },
        { content: 'No auto-recurring archives', isDowngrade: true },
      ],
      Support: [{ content: 'Knowledge base' }, { content: 'Chat support' }],
    },
  },
  {
    id: SubscriptionPlanId.business,
    _title: 'Business',
    desc: 'For teams who need collaboration',
    price: 39,
    mostPopular: false,
    features: {
      Content: [
        {
          content: 'Unlimited pages and images (subject to fair use policy)',
        },
        { content: 'Embeds, tables, code blocks' },
        { content: 'Text alignment, font size and colors' },
        { content: 'Private and public pages' },
      ],
      'Workspaces and collaboration': [
        { content: 'Unlimited personal workspaces' },
        { content: '3 team workspaces, then $10/month/workspace' },
        { content: '5 users in total, then $5/month/user' },
        { content: 'Invite guests to edit pages' },
      ],
      'Sharing and domains': [
        { content: 'Unique links for all pages' },
        { content: '15 .brick.do subdomains' },
        { content: '3 custom domains (CNAME), then $3/domain' },
        { content: 'Automatic SSL for custom domains' },
      ],
      Hosting: [
        { content: 'Image optimization & CDN' },
        {
          content: 'Add any third-party services (e.g. Google Analytics, Intercom)',
        },
        { content: 'We do not inject our own tracking' },
      ],
      Customization: [
        { content: 'Three design themes (more coming)' },
        { content: 'Custom fonts and CSS styles' },
        { content: 'Custom HTML and JavaScript' },
      ],
      Export: [
        { content: 'Request a content archive at any time' },
        { content: 'Receive weekly archives by email' },
      ],
      Support: [{ content: 'Knowledge base' }, { content: 'Chat support' }],
    },
  },
]