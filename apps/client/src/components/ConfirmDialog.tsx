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

import { Component, ReactNode } from 'react'
import { Dialog } from 'evergreen-ui'

export interface IConfirmDialogProps {
  text: string | ReactNode
  confirmBtnLabel?: string
  cancelBtnLabel?: string
  onConfirm?: Function
  onCancel?: Function
  onCloseComplete?: Function
}

interface IConfirmDialogState {
  isShown: boolean
}

class ConfirmDialog extends Component<IConfirmDialogProps, IConfirmDialogState> {
  state = {
    isShown: true,
  }

  close = () => {
    this.setState({ isShown: false })
  }

  onConfirmClick = () => {
    this.close()
    this.props.onConfirm && this.props.onConfirm()
  }

  onCancelClick = () => {
    this.close()
    this.props.onCancel && this.props.onCancel()
  }

  render() {
    const { onCloseComplete } = this.props
    return (
      <Dialog
        isShown={this.state.isShown}
        onCloseComplete={() => {
          if (this.state.isShown) {
            this.onCancelClick()
          }
          onCloseComplete && onCloseComplete()
        }}
        hasHeader={false}
        hasFooter={false}
        topOffset='45vh'
        width='300px'
        containerProps={{
          className: 'confirm-dialog',
          style: {
            maxHeight: 'unset',
            borderRadius: '0.25rem',
          },
        }}
        contentContainerProps={{
          style: {
            paddingTop: '12px',
          },
        }}
        preventBodyScrolling
      >
        <h1 className='text-lg font-light mt-0 mb-5'>{this.props.text}</h1>
        <div className='flex justify-end'>
          <button
            className='border border-gray-300 py-1 px-2 rounded hover:bg-gray-300 mr-2'
            onClick={this.onCancelClick}
          >
            {this.props.cancelBtnLabel || 'Cancel'}
          </button>
          <button
            className='text-white py-1 px-2 rounded bg-red-600 hover:bg-red-700'
            onClick={this.onConfirmClick}
          >
            {this.props.confirmBtnLabel || 'Delete'}
          </button>
        </div>
      </Dialog>
    )
  }
}

export default ConfirmDialog