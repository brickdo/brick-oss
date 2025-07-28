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

import { css } from '@emotion/react'
import Head from 'next/head'

import { Advantages } from '../components/Advantages'
import { FAQ } from '../components/FAQ'
import { Description } from '../components/Features/Description'
import { Different } from '../components/Features/Different'
import { Gradient } from '../components/Features/Gradient'
import { Setup } from '../components/Features/Setup'
import { PageContainer } from '../components/PageContainer'
import { advantages } from '../data/advantages'
import { featureDescriptions as featuresDescriptions } from '../data/descriptions'
import { featuresFAQdata } from '../data/featuresFAQ'

export default function Features() {
  return (
    <>
      <Head>
        <title>Brick: Features</title>
      </Head>
      <PageContainer>
        <Different />
        <Description data={featuresDescriptions} />
        <Setup />
        <Advantages data={advantages} />
        <div
          css={css`
            margin: 136px 0;
          `}
        >
          <FAQ data={featuresFAQdata} />
        </div>
        <Gradient />
      </PageContainer>
    </>
  )
}