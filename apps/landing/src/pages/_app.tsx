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

import { Global } from '@emotion/react'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { ModalWrapper } from '../context/ModalContext'
import { styles } from '../styles/globalStyles'

import type { AppProps } from 'next/app'
import { User } from './pricing'
import { createContext, useContext, useState } from 'react'

export const UserContext = createContext<{
  user?: User | null | undefined
  setUser: (newUser?: User | null) => void
}>({
  user: null,
  setUser: () => {},
})

export const useUser = () => {
  const user = useContext(UserContext)
  return user
}

function MyApp({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null | undefined>(null)

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      <ModalWrapper>
        <Global styles={styles} />
        <div className='wrapper'>
          <div id='root'>
            <Header />
            <Component {...pageProps} />
            <Footer />
          </div>
        </div>
      </ModalWrapper>
    </UserContext.Provider>
  )
}

export default MyApp