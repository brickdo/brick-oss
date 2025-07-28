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

import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react'

export interface IModalContext {
  isSignInModalOpen: boolean
  isSignUpModalOpen: boolean
  isCheckInboxModalOpen: boolean
  isVerifiedModalOpen: boolean
  isRequestResetPasswordModalOpen: boolean
  isCompleteResetPasswordModalOpen: boolean
  email: string
}

type InitialContext = {
  modalState: IModalContext
  setModalState: Dispatch<SetStateAction<IModalContext>>
}

export const initialModalState: IModalContext = {
  email: '',
  isSignInModalOpen: false,
  isSignUpModalOpen: false,
  isCheckInboxModalOpen: false,
  isVerifiedModalOpen: false,
  isRequestResetPasswordModalOpen: false,
  isCompleteResetPasswordModalOpen: false,
}

const modalInitialContext: InitialContext = {
  modalState: initialModalState,
  setModalState: () => {},
}

const ModalContext = createContext<InitialContext>(modalInitialContext)

export const ModalWrapper = (props: { children: JSX.Element[] | JSX.Element }) => {
  const [modalState, setModalState] = useState<IModalContext>(modalInitialContext.modalState)

  useEffect(() => {
    document.body.style.overflow =
      modalState.isCheckInboxModalOpen ||
      modalState.isSignInModalOpen ||
      modalState.isSignUpModalOpen ||
      modalState.isCheckInboxModalOpen
        ? 'hidden'
        : 'auto'
  }, [modalState])

  return (
    <ModalContext.Provider value={{ modalState, setModalState }}>
      {props.children}
    </ModalContext.Provider>
  )
}

export const useModalContext = () => useContext(ModalContext)