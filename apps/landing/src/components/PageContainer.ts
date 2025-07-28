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

import styled from '@emotion/styled'

import { LandingMediaQuery } from '@brick-shared/styles/landing'

export const PageContainer = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;

  width: 100%;

  padding: 0 80px;

  @media (max-width: 1240px) {
    padding: 0 64px;
  }

  ${LandingMediaQuery.tablet} {
    padding: 0 32px;
  }

  ${LandingMediaQuery.mobile} {
    padding: 0 20px;
  }
`