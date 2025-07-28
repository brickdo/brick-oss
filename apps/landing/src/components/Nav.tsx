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
import Link from 'next/link'
import { useRouter } from 'next/router'

import { LandingColors, LandingMediaQuery } from '@brick-shared/styles/landing'

type NavProps = {
  toggleMenu?: () => void
}

export const Nav = ({ toggleMenu }: NavProps) => {
  const router = useRouter()

  type NavElem = {
    name: string
    route: string
  }
  const pages: NavElem[] = [
    { route: '/features', name: 'Features' },
    { route: '/pricing', name: 'Pricing' },
  ]

  return (
    <NavBlock>
      <NavList>
        {pages.map((val, index) => (
          <li key={index}>
            <Link href={val.route} passHref>
              <NavElem onClick={toggleMenu} isActive={val.route === router.pathname}>
                {val.name}
              </NavElem>
            </Link>
          </li>
        ))}
      </NavList>
    </NavBlock>
  )
}

const NavBlock = styled.nav`
  width: 100%;
  display: flex;

  align-items: center;
`

const NavList = styled.ul`
  display: flex;
  flex-flow: row;
  justify-content: start;
  align-items: center;

  width: 100%;

  padding: 0;
  gap: 48px;

  ${LandingMediaQuery.smallDesktop} {
    flex-flow: column;
    align-items: start;
    padding: 184px 64px 0;
  }

  ${LandingMediaQuery.mobile} {
    padding: 128px 20px 0;
  }
`

const NavElem = styled.a<{ isActive: boolean }>`
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  color: ${props => (props.isActive ? LandingColors.primary : LandingColors.textGrey)};
  text-decoration: none;
  cursor: pointer;

  letter-spacing: 0.8px;
  transition: color 0.2s;

  &:hover {
    color: ${LandingColors.primary};
  }

  ${LandingMediaQuery.smallDesktop} {
    font-family: Poppins;
    font-size: 32px;
    line-height: 40px;

    &:hover {
      color: ${props => (props.isActive ? LandingColors.primary : LandingColors.textBlack)};
    }
  }

  ${LandingMediaQuery.mobile} {
    font-size: 24px;
    line-height: 32px;
  }
`