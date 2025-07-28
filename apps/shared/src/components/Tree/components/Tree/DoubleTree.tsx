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
import {
  Draggable,
  Droppable,
  DragDropContext,
  DragStart,
  DropResult,
  DragUpdate,
  DraggableProvided,
  DraggableStateSnapshot,
  DroppableProvided,
} from 'react-beautiful-dnd'
import { getBox } from 'css-box-model'
import {
  calculateDropPathAndNestingLevels,
  calculateFinalDropPositions,
  calculateFinalDropPositionsForDoubleTree,
  DOUBLE_TREE_DROPPABLE_ID,
  normalizeHorizontalLevel,
} from './Tree-utils'
import { Props as SingleTreeProps, State as SingleTreeState, DragState } from './Tree-types'
import { noop } from '../../utils/handy'
import { flattenTree, mutateTree } from '../../utils/tree'
import { FlattenedItem, FlattenedTree, ItemId, Path, TreeData } from '../../types'
import TreeItem from '../TreeItem'
import { getItemById } from '../../utils/flat-tree'
import DelayedFunction from '../../utils/delayed-function'
import { TreeDestinationPosition, TreeSourcePosition } from '../..'
import { Resizable, ResizeCallback } from 're-resizable'
import { css } from '@emotion/react'
import { getDraggedItemElement, getDroppableElement } from '../../utils/dom'
import { TreeItemDropPlaceholder } from './TreeItemDropPlaceholder'

export type onDragEndDoubleTree = (
  source: TreeSourcePosition & { droppableId: string },
  destination?: TreeDestinationPosition & { droppableId: string },
) => void

type Props<T = {}> = {
  tree1: TreeData
  tree2?: TreeData
  treesDivider?: ReactNode
  onDragEnd?: onDragEndDoubleTree
  onTreeSeparatorResize?: ResizeCallback
  treeSeparatorMountValue?: number
} & Omit<SingleTreeProps<T>, 'tree' | 'onDragEnd'>

type State = {
  flattenedTree1: FlattenedTree
  flattenedTree2?: FlattenedTree
  placeholderProps: {
    clientHeight: number
    clientWidth: number
    clientY: number
    clientX: number
    horizontalLevel?: number
    maxHorizontalLevel: number
    minHorizontalLevel: number
  } | null
} & Omit<SingleTreeState, 'flattenedTree'>

export default class DoubleTree<T> extends Component<Props<T>, State> {
  static defaultProps = {
    tree1: { children: [] },
    tree2: undefined,
    onExpand: noop,
    onCollapse: noop,
    onDragStart: noop,
    onDragEnd: noop,
    renderItem: noop,
    offsetPerLevel: 35,
    isDragEnabled: false,
    isNestingEnabled: false,
  }

  state: State = {
    flattenedTree1: [],
    flattenedTree2: [],
    draggedItemId: undefined,
    placeholderProps: null,
  }

  // State of dragging.
  dragState?: DragState

  // HTMLElement for each rendered item
  itemsElement: Record<ItemId, HTMLElement | undefined> = {}

  // HTMLElement of the container element
  containerElement: HTMLElement | undefined

  expandTimer = new DelayedFunction(500)

  static getDerivedStateFromProps(props: Props, state: State): State {
    const { draggedItemId } = state
    const { tree1, tree2 } = props

    const finalTree1: TreeData = DoubleTree.closeParentIfNeeded(tree1, draggedItemId)
    const finalTree2: TreeData | undefined =
      tree2 && DoubleTree.closeParentIfNeeded(tree2, draggedItemId)
    const flattenedTree1 = flattenTree(finalTree1)
    const flattenedTree2 = finalTree2 && flattenTree(finalTree2)

    return {
      ...state,
      flattenedTree1,
      flattenedTree2,
    }
  }

  static closeParentIfNeeded(tree: TreeData, draggedItemId?: ItemId): TreeData {
    if (draggedItemId) {
      // Closing parent internally during dragging, because visually we can only move one item not a subtree
      return mutateTree(tree, draggedItemId, {
        isExpanded: false,
      })
    }
    return tree
  }

  onDragStart = (result: DragStart) => {
    const { onDragStart } = this.props
    const { flattenedTree1, flattenedTree2 } = this.state
    this.dragState = {
      source: result.source,
      destination: result.source,
      mode: result.mode,
    }

    const draggedItemElement = getDraggedItemElement(result.draggableId)
    const droppableElement = getDroppableElement(result.source.droppableId)
    if (draggedItemElement && droppableElement) {
      const { clientHeight, clientWidth } = draggedItemElement
      const droppableStyles = window.getComputedStyle(droppableElement)
      const sourceIndex = result.source.index
      const clientY =
        parseFloat(droppableStyles.paddingTop) +
        Array.from(droppableElement.children)
          .slice(0, sourceIndex)
          .reduce((total, curr) => {
            const style = window.getComputedStyle(curr)
            const marginBottom = parseFloat(style.marginBottom)
            return total + curr.clientHeight + marginBottom
          }, 0)

      const destinationFlattenedTree = flattenedTree2
        ? result.source.droppableId === DOUBLE_TREE_DROPPABLE_ID.one
          ? flattenedTree1
          : flattenedTree2
        : flattenedTree1
      const upperItem = destinationFlattenedTree[result.source.index - 1]
      // On drag start item at index is dragging item itself so we use index + 1
      // when we move item from it's starting position lower item will be at index
      const lowerItem = destinationFlattenedTree[result.source.index + 1]
      const draggingItem = destinationFlattenedTree[result.source.index]

      const { maxLevel: maxHorizontalLevel, minLevel: minHorizontalLevel } =
        calculateDropPathAndNestingLevels({
          horizontalLevel: draggingItem.path.length,
          upperItemPath: upperItem?.path,
          lowerItemPath: lowerItem?.path,
          originalItemPath: draggingItem.path,
          isItemNotMovedVertically: true,
        })

      this.setState({
        placeholderProps: {
          clientHeight,
          clientWidth,
          clientY,
          clientX: parseFloat(droppableStyles.paddingLeft),
          maxHorizontalLevel,
          minHorizontalLevel,
        },
      })
    }

    this.setState({
      draggedItemId: result.draggableId,
    })
    if (onDragStart) {
      onDragStart(result.draggableId)
    }
  }

  onDragUpdate = (update: DragUpdate) => {
    const { onExpand } = this.props
    const { flattenedTree1, flattenedTree2 } = this.state
    const { destination, combine, draggableId, source } = update

    if (!this.dragState) {
      return
    }

    if (combine || !destination) {
      this.setState({
        placeholderProps: null,
      })
    } else {
      const draggedItemElement = getDraggedItemElement(draggableId)
      const droppableElement = getDroppableElement(destination.droppableId)
      const placeholder = droppableElement?.querySelector('[data-rbd-placeholder-context-id]')
      if (draggedItemElement && droppableElement && placeholder) {
        const { clientHeight, clientWidth } = draggedItemElement
        const droppableStyles = window.getComputedStyle(droppableElement)
        const destinationIndex = destination.index
        const childrenArray = Array.from(droppableElement.children)

        const childrenExceptDragged = childrenArray.filter(
          x => x.attributes.getNamedItem('data-rbd-draggable-id')?.value !== draggableId,
        )
        const clientY =
          parseFloat(droppableStyles.paddingTop) +
          childrenExceptDragged.slice(0, destinationIndex).reduce((total, curr) => {
            const style = window.getComputedStyle(curr)
            const marginBottom = parseFloat(style.marginBottom)
            return total + curr.clientHeight + marginBottom
          }, 0)

        const destinationFlattenedTree = flattenedTree2
          ? destination.droppableId === DOUBLE_TREE_DROPPABLE_ID.one
            ? flattenedTree1
            : flattenedTree2
          : flattenedTree1
        const isSameTree = destination.droppableId === source.droppableId
        const isItemNotMovedVertically = isSameTree && source.index === destination.index
        const upperItem = destinationFlattenedTree[destination.index - 1]
        const lowerItem = isItemNotMovedVertically
          ? destinationFlattenedTree[destination.index + 1]
          : destinationFlattenedTree[destination.index]
        const draggingItem = isItemNotMovedVertically
          ? destinationFlattenedTree[destination.index]
          : undefined

        const { maxLevel: maxHorizontalLevel, minLevel: minHorizontalLevel } =
          calculateDropPathAndNestingLevels({
            horizontalLevel: this.dragState.horizontalLevel,
            upperItemPath: upperItem?.path,
            lowerItemPath: lowerItem?.path,
            isItemNotMovedVertically,
            originalItemPath: draggingItem?.path,
          })

        this.setState({
          placeholderProps: {
            clientHeight,
            clientWidth,
            clientY,
            clientX: parseFloat(droppableStyles.paddingLeft),
            maxHorizontalLevel,
            minHorizontalLevel,
          },
        })
      }
    }

    this.expandTimer.stop()
    if (update.combine) {
      const { draggableId, droppableId } = update.combine
      const destinationFlattenedTree = flattenedTree2
        ? droppableId === DOUBLE_TREE_DROPPABLE_ID.one
          ? flattenedTree1
          : flattenedTree2
        : flattenedTree1

      const item: FlattenedItem | undefined = getItemById(destinationFlattenedTree, draggableId)
      if (item && this.isExpandable(item)) {
        this.expandTimer.start(() => onExpand(draggableId, item.path))
      }
    }
    this.dragState = {
      ...this.dragState,
      ...(update.destination === undefined ? {} : { destination: update.destination }),
      ...(update.combine === undefined ? {} : { combine: update.combine }),
    }
  }

  onDropAnimating = () => {
    this.expandTimer.stop()
  }

  onDragEnd = (result: DropResult) => {
    const { onDragEnd, tree1, tree2 } = this.props
    const { flattenedTree1, flattenedTree2 } = this.state
    this.expandTimer.stop()
    const finalDragState: DragState = {
      ...this.dragState!,
      source: result.source,
      destination: result.destination,
      combine: result.combine,
    }

    this.setState({
      draggedItemId: undefined,
      placeholderProps: null,
    })

    const { sourcePosition, destinationPosition } =
      flattenedTree2 && tree2
        ? calculateFinalDropPositionsForDoubleTree(
            tree1,
            tree2,
            flattenedTree1,
            flattenedTree2,
            finalDragState,
          )
        : calculateFinalDropPositions(tree1, flattenedTree1, finalDragState)
    const sourcePositionFinal = {
      ...sourcePosition,
      droppableId: result?.source?.droppableId,
    }
    const destinationPositionFinal = destinationPosition && {
      ...destinationPosition,
      droppableId: (result?.destination?.droppableId || result.combine?.droppableId)!,
    }
    onDragEnd?.(sourcePositionFinal, destinationPositionFinal)

    this.dragState = undefined
  }

  onPointerMove = () => {
    if (this.dragState) {
      const horizontalLevel = this.getDroppedLevel()
      this.dragState = {
        ...this.dragState,
        horizontalLevel,
      }
      horizontalLevel && this.updatePlaceholderHorizontalLevel(horizontalLevel)
    }
  }

  updatePlaceholderHorizontalLevel(horizontalLevel: number) {
    if (!this.state.placeholderProps) {
      return
    }

    const currentLevel = this.state.placeholderProps.horizontalLevel
    if (currentLevel !== horizontalLevel) {
      this.setState({
        placeholderProps: { ...this.state.placeholderProps, horizontalLevel },
      })
    }
  }

  calculateEffectivePath = (flatItem: FlattenedItem, snapshot: DraggableStateSnapshot): Path => {
    const { tree1, tree2 } = this.props
    const { flattenedTree1, flattenedTree2, draggedItemId } = this.state

    if (
      !this.dragState ||
      draggedItemId !== flatItem.item.id ||
      (!this.dragState.destination && !this.dragState.combine)
    ) {
      return flatItem.path
    }

    const { mode } = this.dragState

    // We only update the path when it's dragged by keyboard or drop is animated
    if (mode !== 'SNAP' && !snapshot.isDropAnimating) {
      return flatItem.path
    }

    if (!tree2 || !flattenedTree2) {
      return flatItem.path
    }

    const { destinationPath: newPath } = calculateFinalDropPositionsForDoubleTree(
      tree1,
      tree2,
      flattenedTree1,
      flattenedTree2,
      this.dragState,
    )

    return newPath || flatItem.path
  }

  isExpandable = (item: FlattenedItem): boolean => !!item.item.hasChildren && !item.item.isExpanded

  getDroppedLevel = (): number | undefined => {
    const { offsetPerLevel } = this.props
    const { draggedItemId } = this.state

    if (!this.dragState || !this.containerElement) {
      return undefined
    }

    const containerLeft = getBox(this.containerElement).contentBox.left
    const itemElement = this.itemsElement[draggedItemId!]

    if (itemElement) {
      const currentLeft: number = getBox(itemElement).contentBox.left
      const relativeLeft: number = Math.max(currentLeft - containerLeft, 0)
      return Math.floor((relativeLeft + offsetPerLevel / 2) / offsetPerLevel) + 1
    }

    return undefined
  }

  patchDroppableProvided = (provided: DroppableProvided): DroppableProvided => {
    return {
      ...provided,
      innerRef: (el: HTMLElement | null) => {
        if (el) {
          this.containerElement = el
          provided.innerRef(el)
        }
      },
    }
  }

  setItemRef = (itemId: ItemId, el: HTMLElement | null) => {
    if (el) {
      this.itemsElement[itemId] = el
    }
  }

  renderItemsTree1 = (): Array<ReactNode> => {
    const { flattenedTree1 } = this.state
    return flattenedTree1.map(this.renderItem)
  }

  renderItemsTree2 = (): Array<ReactNode> | null => {
    const { flattenedTree2 } = this.state
    return flattenedTree2?.map(this.renderItem) || null
  }

  renderItem = (flatItem: FlattenedItem, index: number): ReactNode => {
    const { renderItem, onExpand, onCollapse, offsetPerLevel, isDragEnabled } = this.props

    if (!isDragEnabled) {
      return (
        <TreeItem
          key={flatItem.item.id}
          item={flatItem.item}
          path={flatItem.path}
          onExpand={onExpand}
          onCollapse={onCollapse}
          // @ts-ignore
          renderItem={renderItem}
          itemRef={this.setItemRef}
          offsetPerLevel={offsetPerLevel}
        />
      )
    }

    return (
      <Draggable
        key={flatItem.item.id}
        draggableId={flatItem.item.id.toString()}
        index={index}
        isDragDisabled={!isDragEnabled}
      >
        {this.renderDraggableItem(flatItem)}
      </Draggable>
    )
  }

  renderDraggableItem =
    (flatItem: FlattenedItem) =>
    (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
      const { renderItem, onExpand, onCollapse, offsetPerLevel } = this.props

      const currentPath: Path = this.calculateEffectivePath(flatItem, snapshot)
      if (snapshot.isDropAnimating) {
        this.onDropAnimating()
      }
      return (
        <TreeItem
          key={flatItem.item.id}
          item={flatItem.item}
          path={currentPath}
          onExpand={onExpand}
          onCollapse={onCollapse}
          // @ts-ignore
          renderItem={renderItem}
          provided={provided}
          snapshot={snapshot}
          itemRef={this.setItemRef}
          offsetPerLevel={offsetPerLevel}
        />
      )
    }

  onBeforeCapture({ draggableId }: { draggableId: string }) {
    this.setState({
      draggedItemId: draggableId,
    })
  }

  render() {
    const { isNestingEnabled, isDragEnabled, treesDivider } = this.props
    const renderedItems1 = this.renderItemsTree1()
    const renderedItems2 = this.renderItemsTree2()
    if (!isDragEnabled) {
      return <div>{renderedItems1}</div>
    }

    const customPlaceholder = this.state.placeholderProps && (
      <TreeItemDropPlaceholder
        top={this.state.placeholderProps.clientY}
        left={this.state.placeholderProps.clientX}
        height={this.state.placeholderProps.clientHeight}
        width={this.state.placeholderProps.clientWidth}
        horizontalLevel={this.state.placeholderProps.horizontalLevel}
        offsetPerLevel={this.props.offsetPerLevel}
        maxHorizontalLevel={this.state.placeholderProps.maxHorizontalLevel}
        minHorizontalLevel={this.state.placeholderProps.minHorizontalLevel}
      />
    )

    return (
      <div
        className='flex flex-col overflow-hidden flex-1'
        css={css`
          .tree-resizable-handle {
            visibility: hidden;
            opacity: 0;
            transition:
              visibility 0s,
              opacity 0.2s ease-in-out;
          }
          :hover {
            .tree-resizable-handle {
              visibility: visible;
              opacity: 1;
            }
          }
        `}
      >
        <DragDropContext
          onDragStart={this.onDragStart}
          onDragEnd={this.onDragEnd}
          onDragUpdate={this.onDragUpdate}
          onBeforeCapture={item => this.onBeforeCapture(item)}
        >
          <div className='flex flex-col flex-1 h-16 overflow-auto'>
            <Droppable
              droppableId={DOUBLE_TREE_DROPPABLE_ID.one}
              isCombineEnabled={isNestingEnabled}
            >
              {(provided, snapshot) => {
                const finalProvided: DroppableProvided = this.patchDroppableProvided(provided)
                return (
                  <div
                    ref={finalProvided.innerRef}
                    style={{
                      pointerEvents: 'auto',
                      position: 'relative',
                      minHeight: '40px',
                      maxHeight: '100%',
                    }}
                    className='flex-1 overflow-auto'
                    onTouchMove={this.onPointerMove}
                    onMouseMove={this.onPointerMove}
                    {...finalProvided.droppableProps}
                  >
                    {renderedItems1}
                    {provided.placeholder}
                    {snapshot.isDraggingOver && customPlaceholder}
                  </div>
                )
              }}
            </Droppable>
          </div>

          {renderedItems2 && (
            <Resizable
              className='mt-3'
              defaultSize={{
                width: '100%',
                height: this.props.treeSeparatorMountValue || 230,
              }}
              handleClasses={{
                top: 'tree-resizable-handle',
              }}
              minHeight={100}
              enable={{
                right: false,
                top: true,
                bottom: false,
                left: false,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
              }}
              onResize={this.props.onTreeSeparatorResize}
              handleStyles={{
                top: {
                  pointerEvents: this.state.draggedItemId ? 'none' : 'auto',
                  top: '-4px',
                  width: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#a4a4a475',
                  borderRadius: '999px',
                  height: '18px',
                  padding: '8px 0.75rem',
                  backgroundClip: 'content-box',
                },
              }}
              // For some reason maxHeight prop results in bugs so use plain css instead
              // css={css`
              //   max-height: calc(100% - 100px);
              // `}
            >
              <div className='overflow-hidden h-full flex flex-col'>
                {treesDivider}
                <Droppable
                  droppableId={DOUBLE_TREE_DROPPABLE_ID.two}
                  isCombineEnabled={isNestingEnabled}
                >
                  {(provided, snapshot) => {
                    const finalProvided: DroppableProvided = this.patchDroppableProvided(provided)
                    return (
                      <div
                        ref={finalProvided.innerRef}
                        style={{
                          pointerEvents: 'auto',
                          position: 'relative',
                          minHeight: '40px',
                        }}
                        className='overflow-auto flex-1'
                        onTouchMove={this.onPointerMove}
                        onMouseMove={this.onPointerMove}
                        {...finalProvided.droppableProps}
                      >
                        {renderedItems2}
                        {provided.placeholder}
                        {snapshot.isDraggingOver && customPlaceholder}
                      </div>
                    )
                  }}
                </Droppable>
              </div>
            </Resizable>
          )}
        </DragDropContext>
      </div>
    )
  }
}