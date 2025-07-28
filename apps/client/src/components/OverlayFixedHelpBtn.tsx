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

import { useEffect, useState } from 'react'
import { BsQuestionCircleFill } from '@react-icons/all-files/bs/BsQuestionCircleFill'
import { css, Global } from '@emotion/react'
import OptionsTippy, { OptionsTippyItem, useOptionsTippyContext } from './OptionsTippy'
import { openSupportChat, useUnreadChats } from '../support-chat'
import { IoChatbubblesOutline } from '@react-icons/all-files/io5/IoChatbubblesOutline'
import { IoStarOutline } from '@react-icons/all-files/io5/IoStarOutline'
import { IoLogoFacebook } from '@react-icons/all-files/io5/IoLogoFacebook'
import { CgIndieHackers } from '@react-icons/all-files/cg/CgIndieHackers'
import { FiTwitter } from '@react-icons/all-files/fi/FiTwitter'
import { useSearchContext } from '@sajari/react-hooks'
import { Input as SajariInput } from '@sajari/react-search-ui'
import { VscClose } from '@react-icons/all-files/vsc/VscClose'
import BrickHelpSearchBlock from './BrickHelpSearchBlock'
import clsx from 'clsx'

type SajariInputWrapperProps = {
  onCloseBtnClick?: () => void
  onFocus?: () => void
  hideCloseBtn?: boolean
}

const SajariInputWrapper = ({
  onCloseBtnClick,
  onFocus,
  hideCloseBtn,
}: SajariInputWrapperProps) => {
  return (
    <div className='relative mb-1' onFocus={onFocus}>
      <SajariInput
        placeholder='Search the knowledge base'
        css={css`
          input {
            padding-right: 30px;
          }
          input + div {
            display: none;
          }
          > [role='combobox'] {
            border: 0;
            border-bottom: 1px solid #efefef;
            border-radius: 0;
            outline: 0;

            &:after {
              display: none;
            }
          }
        `}
      />
      <button
        className={clsx(hideCloseBtn && 'hidden')}
        css={css`
          position: absolute;
          top: 50%;
          right: 8px;
          padding: 6px;
          transform: translateY(-50%);
        `}
        onClick={e => {
          e.stopPropagation()
          onCloseBtnClick?.()
        }}
      >
        <VscClose size={18} color='rgb(99, 99, 99)' />
      </button>
    </div>
  )
}

const searchBlockFocusStyles = css`
  position: absolute;
  background: #fff;
  inset: 0;
`

const SearchInputAndResultsOverlay = () => {
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false)
  const searched = useSearchContext()

  const { isVisible } = useOptionsTippyContext()

  const clearSearch = () => searched.search('')

  useEffect(() => {
    if (!isVisible) {
      clearSearch()
      setIsSearchInputFocused(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, setIsSearchInputFocused])

  return (
    <div className='flex flex-col z-10' css={[isSearchInputFocused && searchBlockFocusStyles]}>
      <SajariInputWrapper
        onFocus={() => setIsSearchInputFocused(true)}
        hideCloseBtn={!isSearchInputFocused}
        onCloseBtnClick={() => {
          if (searched && searched.queryValues?.get('q')) {
            clearSearch()
            return
          }
          setIsSearchInputFocused(false)
        }}
      />

      <div className={clsx('flex flex-col overflow-auto', !isSearchInputFocused && 'hidden')}>
        <BrickHelpSearchBlock />
      </div>
    </div>
  )
}

const ContactSupportOptionUnreadBadge = () => {
  const unreadChats = useUnreadChats()

  return (
    <span
      css={css`
        display: flex;
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%) scale(1);
        transition:
          opacity 0.3s 0.1s linear,
          transform 0.3s 0.1s linear;
        position: absolute;
        top: 50%;
        right: 10px;
        padding: 10px;
        background: rgb(var(--color-primary));
        border-radius: 100%;
        line-height: 1;
        font-weight: 700;
        color: #fff;
        box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
        justify-content: center;
        align-items: center;
        border: 1px solid #fff;
        font-size: 0.8rem;
        width: 10px;
        height: 10px;
        overflow: hidden;
        ${!unreadChats &&
        css`
          visibility: hidden;
          opacity: 0;
          transform: translateY(-50%) scale(0);
          transition: none;
        `}
      `}
    >
      {unreadChats}
    </span>
  )
}

const options: OptionsTippyItem[] = [
  {
    type: 'custom',
    content: <SearchInputAndResultsOverlay key='sajari-search-overlay' />,
  },
  {
    type: 'button',
    title: 'Contact support via chat',
    subtitle: 'We are usually available Monday–Friday. You can also email us at support@brick.do.',
    onClick: hide => {
      hide()
      openSupportChat()
    },
    className: 'relative',
    children: <ContactSupportOptionUnreadBadge />,
    icon: <IoChatbubblesOutline />,
  },
  {
    type: 'button',
    title: 'Propose a new feature',
    onClick: hide => {
      hide()
      window.open('https://roadmap.brick.do/roadmap')
    },
    className: 'relative',
    icon: <IoStarOutline />,
  },
  {
    type: 'separator',
  },
  {
    type: 'button',
    title: 'Join our Facebook group',
    onClick: hide => {
      hide()
      window.open('https://www.facebook.com/groups/brickdo')
    },
    icon: <IoLogoFacebook />,
  },
  {
    type: 'button',
    title: 'Read our Indie Hackers blog',
    onClick: hide => {
      hide()
      window.open('https://www.indiehackers.com/product/brick')
    },
    icon: <CgIndieHackers />,
  },
  {
    type: 'button',
    title: 'Ask us anything on Twitter',
    onClick: hide => {
      hide()
      window.open('https://twitter.com/TryBrick')
    },
    icon: <FiTwitter />,
  },
]

const OverlayFixedHelpBtn = () => {
  const unreadChats = useUnreadChats()
  return (
    <>
      <OptionsTippy
        placement='top-end'
        options={options}
        contentWrapStyle={{
          maxWidth: '100%',
          width: '400px',
          position: 'relative',
          height: '258px',
        }}
        css={css`
          .tippy-content {
            padding-top: 0;
          }
        `}
      >
        <button
          aria-label='Brick help and feedback'
          css={css`
            background-color: white;
            color: #afa39e;
            border-radius: 50%;
            position: fixed;
            bottom: 20px;
            right: 20px;
            :hover {
              color: #9f9d9c;
            }
          `}
        >
          <BsQuestionCircleFill size={50} />

          <span
            css={css`
              display: flex;
              opacity: 1;
              visibility: visible;
              transform: scale(1);
              transition:
                opacity 0.3s 0.1s linear,
                transform 0.3s 0.1s linear;
              position: absolute;
              top: -2px;
              right: -6px;
              padding: 10px;
              background: rgb(var(--color-primary));
              border-radius: 100%;
              line-height: 1;
              font-weight: 700;
              color: #fff;
              box-shadow: rgb(99 99 99 / 20%) 0px 2px 8px 0px;
              justify-content: center;
              align-items: center;
              border: 1px solid #fff;
              font-size: 0.8rem;
              width: 10px;
              height: 10px;
              overflow: hidden;
              ${!unreadChats &&
              `
                visibility: hidden;
                opacity: 0;
                transform: scale(0);
                transition: none;
              `}
            `}
          >
            {unreadChats}
          </span>
        </button>
      </OptionsTippy>

      {/* BR-15: this doesn't help because we can't add CSS inside iframes. */}
      <Global
        styles={css`
          .helpcrunch-iframe-wrapper,
          [name='helpcrunch-iframe'] .helpcrunch-widget-icon-block {
            display: none !important;
          }
        `}
      />
    </>
  )
}

export default OverlayFixedHelpBtn