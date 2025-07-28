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
import { ReactNode, useEffect, useRef, useState } from 'react'

import FAQimg from '../assets/FAQ.svg'
import openImg from '../assets/open.svg'
import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'
import { Card } from './Card'
import { FlexContainer } from './FlexContainer'
import { Image } from './Image'
import { LineComponent } from './Line'
import { RotateItemAnimationContainer } from './RotateItemAnimationContainer'

interface IFAQ {
  questionTitle: string
  answer: ReactNode | string
}

type Props = {
  data: IFAQData[]
}

export interface IFAQData {
  categoryName: string
  questions: IFAQ[]
}

const sliceColumnsData = (data: IFAQData[]) => {
  const averageSizeOfColumn = Math.round(data.length / 2)
  return [data.slice(0, averageSizeOfColumn), data.slice(averageSizeOfColumn, data.length)]
}

export const FAQ = ({ data }: Props) => {
  return (
    <Container>
      <Title>Frequently asked questions</Title>
      <Content>
        {sliceColumnsData(data).map((column, columnIndex) => (
          <QuestionsColumn key={`col${columnIndex}`}>
            {column.map((category, categoryIndex) => (
              <QuestionsCategory key={`cat${categoryIndex}`}>
                <CategoryName>{category.categoryName}</CategoryName>
                <Line />
                <Questions>
                  {category.questions.map((question, qIndex) => (
                    <Question
                      questionTitle={question.questionTitle}
                      answer={question.answer}
                      key={`q${qIndex}`}
                    />
                  ))}
                </Questions>
              </QuestionsCategory>
            ))}
          </QuestionsColumn>
        ))}
      </Content>
      <ImageContainer>
        <Image height='100%' width='100%' src={FAQimg} alt='faq image' />
      </ImageContainer>
    </Container>
  )
}

type QuestionProps = {
  questionTitle: string
  answer: string | ReactNode
}

const Question = (props: QuestionProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const answerRef = useRef<HTMLHeadingElement>(null)
  const [answerHeight, setAnswerHeight] = useState(0)

  useEffect(() => {
    setAnswerHeight(answerRef.current?.scrollHeight ?? 0)
  }, [answerRef])

  return (
    <QuestionContainer>
      <QuestionTitle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {props.questionTitle}
        <RotateItemAnimationContainer
          isOpen={isOpen}
          closedOpacity={0.7}
          css={css`
            margin-left: 20px;
          `}
        >
          <Image
            css={css`
              min-height: 10px;
              min-width: 10px;
            `}
            height='10px'
            width='10px'
            src={openImg}
            alt='open/close answer'
          />
        </RotateItemAnimationContainer>
      </QuestionTitle>
      <Answer isOpen={isOpen} ref={answerRef} height={answerHeight}>
        {props.answer}
      </Answer>
    </QuestionContainer>
  )
}

const ImageContainer = styled.div`
  max-width: 500px;
  max-height: 468px;

  position: absolute;

  height: 100%;
  width: 100%;

  bottom: -90px;

  @media (max-width: 1240px) {
    max-width: 433px;
    max-height: 410px;
  }

  ${LandingMediaQuery.tablet} {
    max-width: 356px;
    max-height: 335px;
  }

  ${LandingMediaQuery.mobile} {
    display: none;
  }
`

const Answer = styled.div<{ isOpen: boolean; height: number }>`
  ${props => `
    max-height: ${props.isOpen ? `${props.height}px` : '0'};
  `}

  transition: max-height 0.15s;

  overflow: hidden;

  font-size: 16px;
  line-height: 24px;
  color: ${LandingColors.textGrey};
`

const QuestionContainer = styled.div`
  display: flex;
  flex-flow: column;

  width: 100%;
  gap: 6px;
`

const QuestionTitle = styled.h1<{ isOpen: boolean }>`
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: baseline;
  width: 100%;
  padding: 10px 0;
  margin-top: 10px;

  font-size: 18px;
  line-height: 24px;
  user-select: none;

  color: ${props => (props.isOpen ? LandingColors.textBlack : LandingColors.textGrey)};

  cursor: pointer;

  &:hover {
    color: ${LandingColors.textBlack};
    transition: color 0.5s;
  }
`

const Questions = styled(FlexContainer)`
  gap: 4px;
  width: 100%;
`

const Line = styled(LineComponent)`
  margin: 40px 0;
`

const CategoryName = styled.h1`
  font-size: 24px;
  line-height: 32px;
`

const QuestionsCategory = styled(FlexContainer)`
  justify-content: start;
  align-items: start;
  width: 100%;
`

const QuestionsColumn = styled(FlexContainer)`
  justify-content: start;
  align-items: center;

  max-width: 404px;
  width: 100%;
  gap: 24px;
`

const Title = styled.h1`
  max-width: 405px;
  text-align: center;

  margin-bottom: 80px;

  ${LandingMediaQuery.smallDesktop} {
    margin-bottom: 72px;

    font-size: 40px;
    line-height: 48px;
  }

  ${LandingMediaQuery.tablet} {
    font-size: 36px;
    line-height: 44px;
  }

  ${LandingMediaQuery.mobile} {
    margin-bottom: 47px;

    font-size: 32px;
    line-height: 40px;
  }
`

const Content = styled.div`
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: start;
  gap: 80px;
  width: 100%;

  ${LandingMediaQuery.tablet} {
    flex-flow: column;
    align-items: center;
  }
`

const Container = styled(Card)`
  background: ${LandingColors.white};
  box-shadow: 0px 5px 40px rgba(101, 122, 147, 0.05);

  flex-flow: column;
  align-items: center;

  max-width: 1120px;
  width: 100%;

  padding: 110px 115px 440px;
  margin-bottom: 90px;

  ${LandingMediaQuery.smallDesktop} {
    padding: 80px 56px 335px;
  }

  ${LandingMediaQuery.tablet} {
    padding: 80px 115px 260px;
  }

  @media (max-width: 700px) {
    padding: 48px 24px 260px;
  }

  ${LandingMediaQuery.mobile} {
    padding: 48px 24px 27px;
    margin-bottom: 0;
  }
`