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

import { RenderItemParams, TreeData } from '@brick-shared/components/Tree'
import TreeStatic from '@brick-shared/components/Tree/components/Tree/TreeStatic'
import PagesTreeItemPublic from './PagesTreeItemPublic'
import { PageView, PublicAddress } from '@brick-shared/types'

export type PagesTreeProps = {
  tree: TreeData<PageView>
  toggleExpanded: (id: string) => void
  isLinkActive: (item: PageView) => boolean
  publicAddress?: PublicAddress
}

export type PagesTreeCoreProps = {
  tree: TreeData<PageView>
  renderItem: (params: RenderItemParams<PageView> & { offsetPerLevel: number }) => JSX.Element
  offsetPerLevel?: number
}

const offsetPerLevel = 14
const PagesTreePublic = ({ isLinkActive, toggleExpanded, publicAddress, tree }: PagesTreeProps) => {
  const renderItem = ({ item, depth }: { item: any; depth: number }) => {
    return (
      <PagesTreeItemPublic
        item={item}
        depth={depth}
        offsetPerLevel={offsetPerLevel}
        pagePublicAddress={publicAddress}
        pagesTree={tree}
        toggleExpanded={toggleExpanded}
        isActive={isLinkActive(item)}
      />
    )
  }

  return (
    <TreeStatic<PageView>
      tree={tree}
      renderItem={params => renderItem({ ...params })}
      offsetPerLevel={offsetPerLevel}
    />
  )
}

export default PagesTreePublic