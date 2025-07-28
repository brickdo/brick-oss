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
import { LandingColors } from '@brick-shared/styles/landing'

export const Price = ({ price }: { price?: number }) => {
  return (
    <>
      {price ? (
        <Container>
          <span className='dollar'>$</span>
          <span className='price'>{price}</span>
          <span className='period'>/ month</span>
        </Container>
      ) : (
        <Container>Free</Container>
      )}
    </>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row;
  justify-content: flex-start;
  font-style: normal;
  font-weight: 600;
  font-size: 64px;

  max-height: 58px;

  margin-bottom: 16px;

  & > .dollar {
    display: flex;
    font-size: 24px;
    height: fit-content;
    color: ${LandingColors.textBlack}
    margin-right: 3px;
    align-self: flex-start;
  }

  & > .price {
    display: flex;
    align-items: center;
    color: ${LandingColors.textBlack}
    line-height: 72px;
  }

  & > .period {
    display: flex;
    align-self: flex-end;
    color: ${LandingColors.textGrey};
    height: max-content;
    font-size: 16px;
    margin-left: 4px;
  }
`