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
import Checkbox from './Checkbox'
import CodeInputTextarea from './CodeInputTextarea'
import { IoReorderTwoOutline } from '@react-icons/all-files/io5/IoReorderTwoOutline'
import { IoIosAdd } from '@react-icons/all-files/io/IoIosAdd'
import { VscChevronDown } from '@react-icons/all-files/vsc/VscChevronDown'
import { VscChevronRight } from '@react-icons/all-files/vsc/VscChevronRight'
import { VscTrash } from '@react-icons/all-files/vsc/VscTrash'
import { useAsync, useList, useToggle } from 'react-use'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import Collapsible from './Collapsible'
import styled from '@emotion/styled'
import api from '@brick-shared/api'
import { uniqueId } from 'lodash'
import LoadingSpinner from './LoadingSpinner'
import { Page } from '@brick-shared/types'

interface Props {
  items?: Omit<HeadContentItemProps, 'onChange'>[]
  onCancelClick?: () => void
  onSave?: () => void
  pageId: Page['id']
}

type HeadContentItemParams = {
  name: string
  content: string
  isInheritable: boolean
  isOpenInitially?: boolean
}

type HeadContentItemProps = {
  onChange?: (newItemOptions: HeadContentItemParams) => void
  onDeleteBtnClick?: () => void
} & HeadContentItemParams

const grabIconWidth = 24

const HeadContentItemWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: relative;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 0 8px 8px 0;
  background: #fff;
  width: calc(100% - ${grabIconWidth}px);
`

const HeadContentItemDeleteBtn = styled.button<{ isItemOpen: boolean }>`
  position: absolute;
  top: 15px;
  right: 14px;
  color: #ff8b8b;

  &:hover {
    color: #ff6767;
  }

  ${({ isItemOpen }) => (isItemOpen ? 'display: block;' : 'display: none;')}

  ${HeadContentItemWrapper}:hover & {
    display: block;
  }

  @media (hover: none) {
    display: block;
  }
`

const HeadContentItem = ({
  name,
  content,
  isInheritable,
  onChange,
  isOpenInitially,
  onDeleteBtnClick,
}: HeadContentItemProps) => {
  const [isOpen, toggleIsOpen] = useToggle(!!isOpenInitially)
  const xPaddings = '10px'

  return (
    <HeadContentItemWrapper>
      <button
        onClick={toggleIsOpen}
        css={css`
          text-align: left;
          display: flex;
          align-items: center;
          padding: 10px ${xPaddings};
        `}
        onKeyUp={e => e.currentTarget !== e.target && e.preventDefault()}
      >
        <div className='mr-2'>{isOpen ? <VscChevronDown /> : <VscChevronRight />}</div>
        <input
          disabled={!isOpen}
          onChange={e => onChange?.({ content, isInheritable, name: e.target.value })}
          onClick={e => e.stopPropagation()}
          css={css`
            cursor: pointer;
            background: transparent;
            margin-right: 32px;
            border-radius: 8px;
            ${isOpen &&
            `
              cursor: text;
              outline: none;
              background: #fafafa;
              border: 1px solid #f2f2f2;
            `}
            padding: 5px 0 5px 8px;
            flex: 1;
          `}
          value={name}
        />
      </button>
      <Collapsible isOpen={isOpen}>
        <div
          css={css`
            position: relative;
            padding: 14px ${xPaddings} 45px;
          `}
        >
          <CodeInputTextarea
            value={content}
            onChange={newContent => onChange?.({ content: newContent, isInheritable, name })}
            wrapperCss={css`
              flex: 1;
              min-height: 100px;
              height: 100px;
              border: none;
            `}
            placeholder='<meta name="twitter:title" content="I love Brick">'
          />

          <Checkbox
            label='Apply to subpages'
            onCheckedChange={newVal =>
              onChange?.({ content, isInheritable: Boolean(newVal), name })
            }
            checked={isInheritable}
            css={css`
              position: absolute;
              bottom: 10px;
              left: ${xPaddings};

              label {
                padding-left: 5px;
              }
            `}
          />
        </div>
      </Collapsible>

      <HeadContentItemDeleteBtn title='Delete tag' isItemOpen={isOpen} onClick={onDeleteBtnClick}>
        <VscTrash size={22} />
      </HeadContentItemDeleteBtn>
    </HeadContentItemWrapper>
  )
}

const reorder = <T,>(list: Array<T>, startIndex: number, endIndex: number) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const ManagePageHeadTags = ({ pageId, onCancelClick, onSave }: Props) => {
  const [items, { set, updateAt, push, removeAt }] = useList<
    HeadContentItemParams & { id: string }
  >([])

  const { loading } = useAsync(async () => {
    const currentHeadTags = await api.get<HeadContentItemParams[] | null | undefined>(
      `page/${pageId}/head-tags`,
    )
    set((currentHeadTags || []).map(x => ({ ...x, id: uniqueId() })))
  }, [pageId])

  const addCustomTag = () => {
    push({
      content: '',
      isInheritable: false,
      id: uniqueId(),
      name: 'Untitled',
      isOpenInitially: true,
    })
  }
  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const newItems = reorder(items, result.source.index, result.destination.index)

    set(newItems)
  }

  const save = async () => {
    await api.put(`page/${pageId}/update-head-tags`, {
      headTags: items.map(({ name, content, isInheritable }) => ({
        name,
        content,
        isInheritable,
      })),
    })
    onSave?.()
  }

  return (
    <div
      css={css`
        max-width: 100%;
        margin-top: 40px;
      `}
    >
      {loading ? (
        <div className='flex items-center justify-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {items.length ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId='droppablePageHeadTags'>
                {provided => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    css={css`
                      li {
                        margin-bottom: 10px;
                      }
                    `}
                  >
                    {[...(items || [])].map((x, i) => (
                      <Draggable key={x.id} draggableId={x.id} index={i}>
                        {provided => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={provided.draggableProps.style}
                            className='relative flex items-stretch w-full'
                          >
                            <button
                              {...provided.dragHandleProps}
                              className='bg-gray-200 text-gray-400'
                              css={css`
                                border-radius: 8px 0 0 8px;
                                cursor: grab;
                              `}
                            >
                              <IoReorderTwoOutline
                                size={grabIconWidth}
                                className='transform rotate-90'
                              />
                            </button>
                            <HeadContentItem
                              content={x.content}
                              name={x.name}
                              isInheritable={x.isInheritable}
                              onChange={v => updateAt(i, { ...items[i], ...v })}
                              onDeleteBtnClick={() => removeAt(i)}
                              isOpenInitially={x.isOpenInitially}
                            />
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className='text-center text-lg text-gray-400'>No tags here yet</div>
          )}
          <div className='flex items-center mt-4'>
            <button
              className='flex items-center font-medium text-xs py-2 px-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-2xl'
              onClick={addCustomTag}
            >
              <IoIosAdd className='mr-1' size={18} /> Add custom tag
            </button>
          </div>
        </>
      )}
      <div className='flex justify-end items-center mt-4'>
        <button
          className='flex items-center font-medium py-2 px-4 mt-6 hover:bg-gray-100 rounded-lg border border-gray-400 mr-4'
          onClick={onCancelClick}
        >
          Cancel
        </button>
        <button
          className='flex items-center font-medium py-2 px-5 mt-6 text-white border rounded-lg'
          disabled={loading}
          onClick={save}
          css={css`
            background-color: rgb(var(--color-primary), 0.9);

            &:hover {
              background-color: rgb(var(--color-primary), 1);
            }
            &:disabled {
              background-color: var(--bg-disabled-btn);
              color: #ffffff;
            }
          `}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default ManagePageHeadTags