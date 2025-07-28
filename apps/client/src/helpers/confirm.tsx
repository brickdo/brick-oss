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

import { render, unmountComponentAtNode } from 'react-dom'
import ConfirmDialog, { IConfirmDialogProps } from '../components/ConfirmDialog'

export default function confirm(props: IConfirmDialogProps): Promise<boolean> {
  const body = document.querySelector('body') as HTMLBodyElement
  const confirmRoot = document.createElement('div')
  body.appendChild(confirmRoot)
  let resolve: (value: boolean) => void

  const promise = new Promise<boolean>(res => {
    resolve = res
  })

  const unmount = () => unmountComponentAtNode(confirmRoot)
  const onConfirm = () => {
    resolve(true)
  }
  const onCancel = () => {
    resolve(false)
  }

  // becuase ConfirmDialog doesnt have props like onOutsideClick and onEscPushed
  render(
    <ConfirmDialog
      {...props}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onCloseComplete={unmount}
    />,
    confirmRoot,
  )

  return promise
}