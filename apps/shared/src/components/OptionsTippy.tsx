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

/// <reference types="@emotion/react/types/css-prop" />
import {
  ReactElement,
  useState,
  useRef,
  ReactNode,
  useContext,
  CSSProperties,
  createContext,
  cloneElement,
  RefObject,
} from 'react'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light.css'
import { Instance as TippyInstance, Placement as TippyPlacement, sticky, Plugin } from 'tippy.js'
import { TippyProps } from '@tippyjs/react'
import {} from 'tippy.js'
import { KEY_DOWN, KEY_ESCAPE, KEY_UP } from 'keycode-js'
import { RequireAtLeastOne } from '../types'
import clsx from 'clsx'
import { css } from '@emotion/react'

type OptionsItemButton = {
  type: 'button'
  title: string
  subtitle?: string
  icon?: ReactElement<any>
  onClick?: (hide: TippyInstance['hide']) => void
  className?: string
  children?: ReactNode
}

type OptionsItemSeparator = {
  type: 'separator'
}

type OptionsItemCustom = {
  type: 'custom'
  content: ReactNode
}

export type OptionsTippyItem = OptionsItemButton | OptionsItemSeparator | OptionsItemCustom

export type OptionsTippyProps = RequireAtLeastOne<
  {
    options?: OptionsTippyItem[]
    customOptions?: ReactNode[]
    placement?: TippyPlacement
    content?:
      | ReactNode
      | ((hide: TippyInstance['hide']) => ReactNode)
      | ((hide: TippyInstance['hide'], tippyInstance: TippyInstance) => ReactNode)
    onHidden?: () => any
    children?: ReactNode | ((tippyInstance?: TippyInstance) => ReactNode)
    contentWrapStyle?: CSSProperties
    appendTo?: TippyProps['appendTo']
    onOpen?: () => void
    onClose?: () => void
    customContentWrap?: (p: { children: ReactNode }) => ReactElement
    render?: TippyProps['render']
    className?: string
  },
  'options' | 'customOptions'
>

/**
 * This plugins prevents jittering of tippy popover when reference element is set to display while tippy is shown
 */
const preventDisplayNoneJitter: Plugin = {
  name: 'preventDisplayNoneJitter',
  defaultValue: true,
  fn(tippyInstance) {
    const { props } = tippyInstance
    const originalTippyProps = { ...props }

    return {
      onShown({ setProps, popperInstance }) {
        // Store original reference element rects and use it to compute tippy position every time until tippy will be hidden
        const referenceRects = popperInstance?.state.rects.reference
        if (!referenceRects) {
          return
        }
        const { x, y, width, height } = referenceRects
        setProps({
          getReferenceClientRect: referenceRects
            ? () => ({
                x,
                y,
                toJSON: () => ({ x, y, width, height }),
                top: y,
                bottom: y,
                left: x,
                right: x,
                width,
                height,
              })
            : null,
        })
      },

      onHidden({ setProps }) {
        setProps(originalTippyProps)
      },
    }
  },
}

export const OptionsTippyContext = createContext<{
  tippyInstance?: null | TippyInstance
  isVisible: boolean
}>({ tippyInstance: null, isVisible: false })

export const useOptionsTippyContext = () => useContext(OptionsTippyContext)

function OptionsTippy(props: OptionsTippyProps): ReactElement {
  const appendTo = props.appendTo || (() => document.body)
  const [tippyInstance, setTippyInstance] = useState<TippyInstance | undefined>(undefined)
  const [isVisible, setIsVisible] = useState(false)
  const contentRef: RefObject<HTMLDivElement> = useRef(null)
  const hide = () => tippyInstance && tippyInstance.hide()
  const focusContent = () => contentRef.current?.focus()
  const onArrowKeyPress = (direction: 'down' | 'up') => {
    const contentEl = contentRef.current
    if (!contentEl || props.content) {
      return
    }

    const options = Array.from(contentEl.children).filter(
      x => x.tagName === 'BUTTON',
    ) as HTMLButtonElement[]

    if (!options.length) {
      return
    }

    const lastOptionsIndex = options.length - 1

    const focusedOption = options.find(x => x === document.activeElement)
    const hoveredOption = options.find(x => x.matches(':hover'))
    const currentOption = focusedOption || hoveredOption
    let nextOptionIndex =
      direction === 'down'
        ? (currentOption && options.indexOf(currentOption) + 1) ?? 0
        : (currentOption && options.indexOf(currentOption) - 1) ?? lastOptionsIndex

    if (nextOptionIndex > lastOptionsIndex) {
      nextOptionIndex = 0
    }

    if (nextOptionIndex < 0) {
      nextOptionIndex = lastOptionsIndex
    }

    options[nextOptionIndex].focus()
  }

  const mapButton = (
    { title, subtitle, icon, onClick, className, children }: OptionsItemButton,
    key: number,
  ) => (
    <button
      key={`button-${title}-${key}`}
      onClick={() => onClick && onClick(hide)}
      className={clsx(
        'text-base text-left w-full pl-3 pr-4 py-1 option flex items-start outline-none hover:bg-gray-200 focus:bg-gray-200',
        className,
      )}
    >
      {icon && <div className='flex items-center h-6'>{cloneElement(icon, { size: '1rem' })}</div>}
      <div className='flex flex-col items-start'>
        <div>{title}</div>
        {subtitle && <div className='text-gray-500 text-sm'>{subtitle}</div>}
      </div>
      {children}
    </button>
  )

  const mapSeparator = (_: OptionsItemSeparator, key: number) => (
    <hr key={`hr-${key}`} className='my-1.5 mx-3' />
  )

  // eslint-disable-next-line array-callback-return
  const menu =
    (tippyInstance && props.customOptions) ||
    props.options?.map((x, key) => {
      switch (x.type) {
        case 'button':
          return mapButton(x, key)
        case 'separator':
          return mapSeparator(x, key)
        case 'custom':
          return x.content
      }
    })

  const tippyContent = props.content
    ? typeof props.content === 'function'
      ? tippyInstance && props.content(hide, tippyInstance)
      : props.content
    : menu

  const contentWrap = (
    <div
      className='outline-none'
      style={props.contentWrapStyle}
      tabIndex={0}
      ref={contentRef}
      onKeyDown={e => e.keyCode === KEY_ESCAPE && hide()}
      onClick={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onKeyDownCapture={e => {
        e.keyCode === KEY_DOWN && onArrowKeyPress('down')
        e.keyCode === KEY_UP && onArrowKeyPress('up')
      }}
      css={css`
        .options-tippy {
          max-width: initial !important;
          font-size: 1rem;
        }
        .options-tippy .tippy-content {
          padding: 6px 0;
        }
        * .option svg {
          margin-right: 0.4rem;
        }
      `}
    >
      {tippyContent}
    </div>
  )

  const contentCustomWrapped = props.customContentWrap ? (
    <props.customContentWrap>{contentWrap}</props.customContentWrap>
  ) : (
    contentWrap
  )

  // iOS executes "hover" on the first tap and "click" on the second, see
  // https://github.com/reactstrap/reactstrap/issues/1676#issuecomment-544481058.
  // Without this check, popups will only open with two taps on iOS.
  //
  // We are using 'try' because OptionsTippy is also used in public-client,
  // and 'navigator' is not available during server-side rendering.
  let isIOS: boolean
  try {
    isIOS = /iPhone|iPad|iPod/.test(navigator.platform)
  } catch {
    isIOS = false
  }
  const trigger = isIOS ? 'click mouseenter' : 'click'

  const placement = props.placement || 'bottom-start'

  const modifiers = [
    // Don't let the tooltip get cut off by the screen
    {
      name: 'flip',
      options: {
        fallbackPlacements: ['bottom', 'right-start', 'right-end', 'top'],
      },
    },
  ]

  return (
    <OptionsTippyContext.Provider value={{ tippyInstance, isVisible }}>
      <Tippy
        theme='light'
        trigger={trigger}
        appendTo={appendTo}
        render={props.render}
        placement={placement}
        popperOptions={{ modifiers, strategy: 'fixed' }}
        content={contentCustomWrapped}
        arrow={false}
        zIndex={10}
        onShown={() => focusContent()}
        // Passing undefined to tippyProps results in error. Tippy tries to invoke hooks function event if they are undefined
        onShow={() => {
          props.onOpen?.()
          setIsVisible(true)
        }}
        onHide={() => props.onClose?.()}
        className={clsx('options-tippy', props.className)}
        onCreate={instance => setTippyInstance(instance)}
        onHidden={() => {
          props.onHidden?.()
          setIsVisible(false)
        }}
        interactive
        sticky
        plugins={[sticky, preventDisplayNoneJitter]}
      >
        {typeof props.children === 'function' ? props.children(tippyInstance) : props.children}
      </Tippy>
    </OptionsTippyContext.Provider>
  )
}

export default OptionsTippy