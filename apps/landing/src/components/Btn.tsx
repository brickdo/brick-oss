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
import { CSSProperties } from '@emotion/serialize'
import styled from '@emotion/styled'
import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

import { LandingColors } from '@brick-shared/styles/landing'

export type BtnStyleType = 'primary' | 'secondary' | 'auth' | 'text'

export type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  styleType: BtnStyleType
  style?: CSSProperties & React.CSSProperties
  className?: string
} & { children: ReactNode }

const BtnStyleTypeClassMap: { [key in BtnStyleType]: string } = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  auth: 'btn-auth',
  text: 'btn-text',
}

export const Btn = ({ styleType, style, className, children, ...props }: BtnProps) => {
  const styleTypeClass = BtnStyleTypeClassMap[styleType]

  return (
    <Button
      styleType={styleType}
      style={style}
      className={clsx(styleTypeClass, className)}
      {...props}
    >
      {children}
    </Button>
  )
}

const Button = styled.button<BtnProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: max-content;
  overflow: hidden;
  cursor: pointer;
  border-radius: 16px;
  padding: 16px 24px;
  font-weight: 700;
  font-size: 16px;
  line-height: 24px;
  white-space: nowrap;
  transition: all 0.2s;

  &.${BtnStyleTypeClassMap.primary} {
    color: ${LandingColors.white};
    background: ${LandingColors.primary};
    border: none;

    &:hover,
    &:focus-visible {
      background: ${LandingColors.primaryDark};
    }

    &:active {
      background: ${LandingColors.primaryLight};
    }
  }

  &.${BtnStyleTypeClassMap.secondary} {
    color: ${LandingColors.textBlack};
    background: transparent;
    border: 2px solid ${LandingColors.textBlack};

    &:hover {
      border-color: ${LandingColors.primary};
      color: ${LandingColors.primary};

      & img {
        fill: ${LandingColors.primary};
      }
    }
  }

  &.${BtnStyleTypeClassMap.text} {
    color: ${LandingColors.textBlack};
    background: transparent;

    &:hover {
      color: ${LandingColors.primary};
    }

    &:active {
      color: ${LandingColors.primary};
      background: ${LandingColors.btnGrey};
    }
  }

  &.${BtnStyleTypeClassMap.auth} {
    color: ${LandingColors.textBlack};
    background: transparent;
    border: 2px solid ${LandingColors.btnGrey};

    &:hover {
      border-color: ${LandingColors.textBlack};
    }
  }

  &:disabled {
    cursor: not-allowed;
    background: ${LandingColors.btnGrey};
    color: #fff;
    border-color: ${LandingColors.btnGrey};

    :hover {
      background: ${LandingColors.btnGrey};
      color: #fff;
      border-color: ${LandingColors.btnGrey};
    }
  }
`