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

import { ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { VscEllipsis } from '@react-icons/all-files/vsc/VscEllipsis'
import Tippy from '@tippyjs/react'

interface Props {
  children: ReactNode[]
}

const getFullWidthOfElement = (el: HTMLElement) => {
  const style = getComputedStyle(el)
  const margins = parseFloat(style.marginLeft) + parseFloat(style.marginRight)
  return el.getBoundingClientRect().width + margins
}

const wrapItem = (x: ReactNode, i: number) => (
  <li
    key={i}
    style={{
      listStyle: 'none',
    }}
  >
    {x}
  </li>
)

function GreedyBar({ children }: Props): ReactElement {
  const barRef = useRef<HTMLDivElement>(null)
  const [wrappedItems, setWrappedItems] = useState(children.filter(Boolean).map(wrapItem))
  useEffect(() => {
    setWrappedItems(children.filter(Boolean).map(wrapItem))
    setIsSizeMesured(false)
  }, [children])
  const [visibleItems, setVisibleItems] = useState(wrappedItems)
  const [hiddenItems, setHiddenItems] = useState<ReactElement[] | ReactNode[]>([])
  const [itemsWidths, setItemsWidths] = useState<number[]>([])
  const [hiddenItemsNumber, setHiddenItemsNumber] = useState(0)
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const itemsContainer = useRef<HTMLUListElement>(null)
  const getContainerWidth = () => itemsContainer.current?.offsetWidth || 0

  const itemsContainerClone = useRef<HTMLUListElement>(null)
  const [isSizeMesured, setIsSizeMesured] = useState(false)

  const onResize = useCallback(() => {
    if (!barRef.current || !itemsContainer.current) {
      return
    }
    const containerWidth = getContainerWidth()
    const renderedItems = Array.from(
      itemsContainer.current.children as HTMLCollectionOf<HTMLElement>,
    )
    const usedSpace = renderedItems.reduce((acc, x) => (acc += x.offsetWidth), 0)
    const emptySpace = containerWidth - usedSpace

    if (emptySpace < 0) {
      setHiddenItemsNumber(hiddenItemsNumber + 1)
      return
    }

    if (!hiddenItemsNumber) {
      return
    }

    const firstHiddenIndex = wrappedItems.length - hiddenItemsNumber
    const firstHiddenWidth = itemsWidths.length && itemsWidths[firstHiddenIndex]
    const canShowItem = firstHiddenWidth < emptySpace
    if (canShowItem) {
      setHiddenItemsNumber(hiddenItemsNumber - 1)
    }
  }, [hiddenItemsNumber, itemsWidths, wrappedItems.length])

  // Measure size
  useEffect(() => {
    if (!itemsContainerClone.current) {
      return
    }
    if (!isSizeMesured) {
      const renderedItems = Array.from(
        itemsContainerClone.current.children as HTMLCollectionOf<HTMLElement>,
      )
      const widths = wrappedItems.map((x, i) => getFullWidthOfElement(renderedItems[i]))
      setItemsWidths(widths)
      setIsSizeMesured(true)
      let spaceLeft = getContainerWidth()
      let lastVisibleItemIndex = 0
      while (widths[lastVisibleItemIndex] && spaceLeft >= widths[lastVisibleItemIndex]) {
        spaceLeft = spaceLeft - widths[lastVisibleItemIndex]
        lastVisibleItemIndex++
      }
      setHiddenItemsNumber(wrappedItems.length - lastVisibleItemIndex)
    }
  }, [isSizeMesured, wrappedItems])

  useEffect(() => {
    const navEl = barRef.current
    if (!navEl) {
      const observer = resizeObserver.current
      return observer?.disconnect
    }
    if (resizeObserver.current) {
      resizeObserver.current.disconnect()
    }
    const observer = new ResizeObserver(onResize)
    observer.observe(navEl)
    resizeObserver.current = observer
    return () => observer?.disconnect()
  }, [onResize])

  useEffect(() => {
    if (hiddenItemsNumber > wrappedItems.length || hiddenItemsNumber < 0) {
      return
    }
    if (hiddenItemsNumber === 0) {
      setVisibleItems(wrappedItems)
      setHiddenItems([])
    } else {
      setVisibleItems(wrappedItems.slice(0, -hiddenItemsNumber))
      setHiddenItems(wrappedItems.slice(-hiddenItemsNumber))
    }
  }, [hiddenItemsNumber, wrappedItems])

  return (
    <div ref={barRef} className='flex flex-1 children-center relative overflow-x-hidden'>
      {!isSizeMesured && (
        <ul
          className='children-hidden-clone flex-1 flex justify-end children-center'
          aria-hidden={true}
          ref={itemsContainerClone}
        >
          {wrappedItems}
        </ul>
      )}
      <ul
        className='overflow-hidden flex-1 flex justify-end children-center greedy-bar-visible-container'
        ref={itemsContainer}
        style={{
          minHeight: '40px',
        }}
      >
        {visibleItems}
      </ul>

      {!!hiddenItems.length && (
        <Tippy
          theme='light'
          trigger='click'
          placement='bottom-start'
          arrow={false}
          zIndex={10}
          interactive
          appendTo={() => document.body}
          maxWidth={'initial'}
          content={<div className='flex flex-col hidden-items-menu'>{hiddenItems}</div>}
        >
          <button title='Page actions' className='p-1  ml-2 self-start hover:bg-gray-200 rounded'>
            <VscEllipsis size={24} />
          </button>
        </Tippy>
      )}

      <style jsx>{`
        .children-hidden-clone {
          position: absolute;
          top: 0;
          left: 0;
          /* Provides a slight buffer to prevent overflow issues with flex parents. */
          width: calc(100% - 20px);
          pointer-events: none;
          visibility: hidden;
          overflow: hidden;
        }

        .greedy-bar-visible-container > :global(li > *){
          height: 100%;
        }

        .greedy-bar-visible-container > :global(li:not(:first-child)){
          margin-left: .5rem;
        }

        :global(.hidden-items-menu > li) {
          width: 100%;
          display: flex;
        }

        :global(.hidden-items-menu > li > *) {
          flex: 1;
          width: 100%
          max-width: 100%;
        }
      `}</style>
    </div>
  )
}

export default GreedyBar