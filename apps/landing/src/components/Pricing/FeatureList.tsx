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
import styled from '@emotion/styled'

import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { IPlan, PlanTitle } from '@brick/misc/data/plans'
import { Feature } from './Feature'
import { MaxFeatureBlockItems } from './Plan'

type Props = {
  plan: IPlan
  maxFeatureBlockItems: MaxFeatureBlockItems
}

const oneFeatureRowHeight = '20px'

export const FeatureList = ({ plan, maxFeatureBlockItems }: Props) => {
  const featuresBlocks = Object.entries(plan.features).map(([title, featureItems]) => ({
    title,
    featureItems,
  }))

  const featureBlocksGridRows = Object.entries(maxFeatureBlockItems).reduce(
    (acc, [title, maxItems]) => {
      const gridRows = [...new Array(maxItems)].map(_ => oneFeatureRowHeight).join(' ')
      acc[title as PlanTitle] = `${gridRows}`
      return acc
    },
    {} as { [key in PlanTitle]: string },
  )

  return (
    <FeaturesList id={plan.id.toString()}>
      {featuresBlocks.map(({ title, featureItems }, blockIndex) => (
        <div key={blockIndex}>
          <FeautreBlockTitle>{title}</FeautreBlockTitle>
          <div
            css={css`
              display: grid;
              grid-template-rows: ${featureBlocksGridRows[title as PlanTitle]};
              align-items: baseline;
              grid-row-gap: 30px;
            `}
          >
            {featureItems.map(({ content, isDowngrade }, featureIndex) => (
              <Feature text={content} key={featureIndex} isDowngrade={isDowngrade} />
            ))}
            {[...new Array(maxFeatureBlockItems[title as PlanTitle] - featureItems.length)].map(
              (x, i) => (
                <EmptyFeatureDash key={i} />
              ),
            )}
          </div>
        </div>
      ))}
    </FeaturesList>
  )
}

const FeautreBlockTitle = styled.h2`
  font-size: 12px;
  padding: 0 8px 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${LandingColors.lightGrey};
  color: ${LandingColors.textGrey};
  font-weight: 700;
  margin-bottom: 15px;
  margin-top: 15px;
`

const FeaturesList = styled.div`
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  gap: 24px;

  margin-bottom: 20px;

  ${LandingMediaQuery.mobile} {
    margin-top: 32px;
  }
`

const EmptyFeatureDash = styled.div`
  position: relative;
  &:after {
    content: ' ';
    border-top: 1px solid #d7d7d7;
    border-bottom: 1px solid #d7d7d7;
    position: absolute;
    height: 0px;
    top: 10px;
    width: 40px;
    transform: translate(0, -50%);
    border-radius: 20px;
`