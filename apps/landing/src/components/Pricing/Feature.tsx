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

import removeCircle from '../../assets/remove-circle.svg'
import featureImage from '../../assets/feature.svg'
import { LandingColors } from '@brick-shared/styles/landing'
import { Image } from '../Image'

type Props = {
  text: string
  isDowngrade?: boolean
}

export const Feature = (props: Props) => {
  const { text, isDowngrade } = props

  return (
    <Container>
      <Image
        height='18px'
        width='18px'
        color={isDowngrade ? LandingColors.textGrey : undefined}
        src={isDowngrade ? removeCircle : featureImage}
        alt='feature'
      />
      <Text {...props}>{text}</Text>
    </Container>
  )
}

const Text = styled.div<Props>`
  ${props => props.isDowngrade && `color: ${LandingColors.textGrey}`}
`

const Container = styled.div`
  display: flex;
  flex-flow: row;

  font-size: 16px;
  line-height: 20px;

  gap: 12px;
`