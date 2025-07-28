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

import clsx from 'clsx'
import { getPageCanonicalPath } from '@brick-shared/utils/pageLink'
import { PagesTree, PageView, PublicAddress } from '@brick-shared/types'
import ExpandIconBtn from '@brick-shared/components/ExpandIconBtn'

export type PageTreeItemPublicProps = {
  item: PageView
  pagesTree: PagesTree
  pagePublicAddress?: PublicAddress
  toggleExpanded: (id: string) => void
  isActive?: boolean
  offsetPerLevel: number
  depth: number
}

const PagesTreeItemPublic = ({
  item,
  toggleExpanded,
  pagePublicAddress,
  offsetPerLevel,
  isActive,
  pagesTree,
  depth,
}: PageTreeItemPublicProps) => {
  const isExpandBtnHidden = !item.children || !item.children.length
  const getOffset = (depthVal: number) => `${offsetPerLevel * depthVal}px`

  return (
    <a
      title={item.name}
      style={depth ? { paddingLeft: getOffset(depth) } : undefined}
      className={clsx('page-tree-item', isActive && 'page-tree-item_active')}
      href={`/${getPageCanonicalPath(item.id, pagesTree.items, pagePublicAddress)}`}
    >
      <ExpandIconBtn
        className={clsx(isExpandBtnHidden && 'invisible')}
        isExpanded={item.isExpanded}
        onClick={() => toggleExpanded(item.id)}
      />
      <div className='truncate'>{item.name}</div>
    </a>
  )
}

export default PagesTreeItemPublic