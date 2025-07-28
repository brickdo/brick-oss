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

import { css, keyframes } from '@emotion/react'
import styled from '@emotion/styled'
import { forwardRef, ReactNode, useEffect, useRef, useState } from 'react'
import VisibilitySensor from 'react-visibility-sensor'

import useScrollPosition from '../../hooks/useScrollPosition'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { FlexContainer } from '../FlexContainer'

export interface IIllustration {
  image: ReactNode
  title: string
  desc: string
}

type TransitionValues = {
  x: string
  y: string
  z: string
}

export enum HomepageIllustrationsMediaQuery {
  smallDesktop = '@media (max-width: 1200px)',
  smallerDesktop = '@media (max-width: 1024px)',
  tablet = '@media (max-width: 800px)',
  mobile = '@media (max-width: 500px)',
}

const getTransitionValues = (
  index: number,
  activeIndex: number,
  itemsLength: number,
): TransitionValues => {
  const xyStep = 20
  const zStep = 50

  const offset = (index + itemsLength - activeIndex) % itemsLength
  return {
    x: `-${xyStep * offset}px`,
    y: `-${xyStep * offset}px`,
    z: `-${zStep * offset}px`,
  }
}

export const Illustrations = ({ data }: { data: IIllustration[] }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const scrollPosition = useScrollPosition()
  const featuresDescriptionColumnRef = useRef<HTMLDivElement | null>(null)
  const imagesContainerRef = useRef<HTMLDivElement | null>(null)

  const onVisibleTrigger = (isVisible: boolean) => {
    setIsVisible(isVisible)
  }

  useEffect(() => {
    const featuresDescriptionColumnEl = featuresDescriptionColumnRef.current
    const imagesContainerEl = imagesContainerRef.current
    if (!featuresDescriptionColumnEl || !imagesContainerEl) {
      return
    }
    // Calculate image container top off set and height
    // from top offset and height calculate container center top offset
    // Find first description block which is close to center of image container and set it as active
    const imagesContainerHeight = imagesContainerEl.getBoundingClientRect().height
    const imagesContainerTopOffset = imagesContainerEl.getBoundingClientRect().top
    const imagesContainerCenterTopOffset =
      imagesContainerTopOffset + Math.floor(imagesContainerHeight / 2)
    const featuresDescriptionsBlocks = Array.from(featuresDescriptionColumnEl.children)
    for (const [i, descBlockEl] of featuresDescriptionsBlocks.entries()) {
      const desckBlockTopOffset = descBlockEl.getBoundingClientRect().top
      const deskBlockOffsetCorrected = desckBlockTopOffset - 50
      if (
        deskBlockOffsetCorrected <= imagesContainerCenterTopOffset &&
        deskBlockOffsetCorrected >= imagesContainerTopOffset
      ) {
        setActiveSlideIndex(i)
        return
      }
    }
  }, [
    scrollPosition,
    isVisible,
    data,
    activeSlideIndex,
    featuresDescriptionColumnRef,
    imagesContainerRef,
  ])

  return (
    <VisibilitySensor onChange={onVisibleTrigger} partialVisibility={true}>
      <RootContainer>
        <ImagesComponent data={data} activeSlideIndex={activeSlideIndex} ref={imagesContainerRef} />

        <FeaturesDescriptionColumn ref={featuresDescriptionColumnRef}>
          {data.map((val, index) => (
            <FeatureDescriptionBlock
              isActive={index === activeSlideIndex}
              activeSlideIndex={activeSlideIndex}
              key={index}
            >
              <FeatureTitle>{val.title}</FeatureTitle>
              <FeatureText>{val.desc}</FeatureText>
            </FeatureDescriptionBlock>
          ))}
        </FeaturesDescriptionColumn>

        {data.map((val, index) => (
          <IllustrationMobile
            image={val.image}
            title={val.title}
            color={index === 0 ? 'blue' : index === 1 ? 'green' : 'pink'}
            activeSlideIndex={activeSlideIndex}
            desc={val.desc}
            key={index}
            isActive={true}
          />
        ))}
      </RootContainer>
    </VisibilitySensor>
  )
}

type ImageComponentProps = {
  data: IIllustration[]
  activeSlideIndex: number
}

const ImagesComponent = forwardRef<HTMLDivElement, ImageComponentProps>((props, ref) => {
  const itemsLength = props.data.length
  return (
    <ImagesContainer>
      {props.data.map((val, index) => {
        return (
          <ImageContainer
            ref={ref}
            isActive={index === props.activeSlideIndex}
            key={index}
            index={index}
            activeIndex={props.activeSlideIndex}
            itemsLength={itemsLength}
          >
            {val.image}
          </ImageContainer>
        )
      })}
    </ImagesContainer>
  )
})

const IllustrationMobile = (
  props: IIllustration & { isActive: boolean; color: string; activeSlideIndex: number },
) => {
  return (
    <IllustrationBlockMobile>
      <ImageContainerMobile>{props.image}</ImageContainerMobile>
      <FeatureDescriptionBlock isActive={props.isActive} activeSlideIndex={props.activeSlideIndex}>
        <FeatureTitle>{props.title}</FeatureTitle>
        <FeatureText>{props.desc}</FeatureText>
      </FeatureDescriptionBlock>
    </IllustrationBlockMobile>
  )
}

const ImageContainerMobile = styled.div`
  max-width: 450px;
  max-height: 390px;
  width: 100%;

  ${HomepageIllustrationsMediaQuery.mobile} {
    max-width: 100%;
    max-height: 390px;
    width: 390px;
  }
`

const ImageContainer = styled.div<{
  isActive: boolean
  index: number
  activeIndex: number
  itemsLength: number
}>`
  width: 100%;
  height: 100%;
  max-width: inherit;
  max-height: inherit;
  min-height: inherit;

  transition: opacity 0.75s;

  position: absolute;

  transform: ${props => {
    const values = getTransitionValues(props.index, props.activeIndex, props.itemsLength)

    return `translateX(${values.x}) translateY(${values.y}) translateZ(${values.z})`
  }};

  top: 0;
  left: 0;
  object-fit: fill;

  transition: all 0.6s;

  img,
  h1 {
    transition: ${({ isActive }) => `opacity ${isActive ? 0.2 : 0.75}s`};
    opacity: ${props => (props.isActive ? 1 : 0)};
  }

  @media (max-width: 725px) {
    opacity: 1;
    position: relative;

    & img {
      position: relative;
    }
  }
  @media (max-width: 1200px) {
    h1 {
      display: none;
    }
  }
`

const ImageAnimation = keyframes`

`

const ImagesContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;

  position: sticky;
  transform-style: preserve-3d;
  top: 25vh;

  max-width: 630px;
  max-height: 500px;
  min-height: 500px;
  width: 100%;
  height: 100%;

  & .image-animation {
    animation-name: ${ImageAnimation};
    animation-duration: 2s;
    animation-fill-mode: forwards;
  }

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    max-width: 510px;
    max-height: 420px;
    min-height: 420px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    width: 360px;
    min-width: 360px;
    max-height: 280px;
    min-height: 280px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    display: none;
  }
`

const FeaturesDescriptionColumn = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;

  gap: 64px;
  transform: translateY(115px);

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    gap: 60px;
  }

  ${LandingMediaQuery.tablet} {
    gap: 48px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    display: none;
  }
`

const FeatureDescriptionBlock = styled.div<{
  isActive: boolean
  activeSlideIndex: number
}>`
  display: flex;
  flex-flow: column;
  height: 100%;
  justify-content: center;
  align-items: start;

  transition:
    transform 1s,
    opacity 0.75s;

  max-width: 350px;
  width: 100%;

  ${props => `
    opacity: ${props.isActive ? 1 : 0.4};

    & > * {
      transform: scale(${props.isActive ? 1.1 : 1});
      transition: transform 1s;
    }
  `}

  ${HomepageIllustrationsMediaQuery.tablet} {
    align-items: center;
  }
`

const FeatureText = styled.div`
  font-size: 16px;
  line-height: 24px;

  color: ${LandingColors.textGrey};
  max-width: 286px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    font-size: 16px;
    line-height: 24px;
    max-width: 263px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    max-width: 250px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    max-width: 100%;
  }

  ${HomepageIllustrationsMediaQuery.mobile} {
    max-width: 250px;
  }
`

const FeatureTitle = styled.h1`
  font-size: 32px;
  line-height: 40px;

  margin-bottom: 16px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    font-size: 24px;
    line-height: 32px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    font-size: 20px;
    line-height: 30px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    max-width: 100%;
  }

  ${HomepageIllustrationsMediaQuery.mobile} {
    max-width: 250px;
  }
`

const RootContainer = styled(FlexContainer)`
  flex-flow: row;
  position: relative;
  width: 100%;
  justify-content: start;
  align-items: start;
  margin-top: 215px;
  margin-bottom: 200px;
  min-height: 970px;

  gap: 167px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    margin-bottom: 200px;
    gap: 136px;
    min-height: 850px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    gap: 190px;
    margin-top: 35px;
  }

  ${HomepageIllustrationsMediaQuery.tablet} {
    flex-direction: column;
    gap: 100px;
    margin-top: 0;
  }
`

const IllustrationBlock = styled.div`
  display: flex;
  flex-flow: row;

  width: 100%;

  gap: 86px;

  ${HomepageIllustrationsMediaQuery.smallDesktop} {
    gap: 65px;
  }

  ${HomepageIllustrationsMediaQuery.smallerDesktop} {
    align-items: end;
    gap: 45px;
  }

  align-items: center;
  justify-content: center;

  ${HomepageIllustrationsMediaQuery.tablet} {
    display: none;
    flex-flow: column;
    gap: 30px;
    align-items: center;
  }
`

const IllustrationBlockMobile = styled(IllustrationBlock)`
  display: none;
  ${HomepageIllustrationsMediaQuery.tablet} {
    display: flex;
  }
`