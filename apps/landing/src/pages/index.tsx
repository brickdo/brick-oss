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

import Head from 'next/head'

import { Advantages } from '../components/Advantages'
import { GetStarted } from '../components/Homepage/GetStarted'
import { HowToStart } from '../components/Homepage/HowToStart'
import { Illustrations } from '../components/Homepage/Illustration'
// import { Reviews } from '../components/Homepage/Reviews'
import { Security } from '../components/Homepage/Security'
import { TryItFree } from '../components/Homepage/TryItFree'
import { PageContainer } from '../components/PageContainer'
import { advantages } from '../data/advantages'
import { illustrations } from '../data/illustrations'

import type { NextPage } from 'next'
const Homepage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Brick: Homepage</title>
      </Head>
      <PageContainer>
        <TryItFree />
        <HowToStart />
        <Illustrations data={illustrations} />
        <Advantages data={advantages} />
        <Security />
        {/* <Reviews data={reviews} /> */}
        <GetStarted />
      </PageContainer>
    </>
  )
}

export default Homepage