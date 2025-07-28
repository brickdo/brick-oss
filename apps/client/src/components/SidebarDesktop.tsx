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

import SidebarCore from './SidebarCore'
import { Resizable } from 're-resizable'
import { motion } from 'framer-motion'
import { useAppState } from '../store'
import localStorageConnector from '../utils/localStorageConnector'

type Props = {}

export const sidebarDefaultWidth = 270

const sidebarMountWidth = localStorageConnector.get('sidebarWidth') || sidebarDefaultWidth

const SidebarDesktop = (props: Props) => {
  const { isSidebarVisible } = useAppState()

  return (
    <motion.div
      className='relative'
      initial={'open'}
      animate={isSidebarVisible ? 'open' : 'closed'}
      layout
      variants={{
        open: {
          display: 'block',
          opacity: 1,
          width: 'auto',
        },
        closed: {
          opacity: 0,
          width: 0,
          transitionEnd: { display: 'none' },
          overflow: 'hidden',
        },
      }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      <Resizable
        defaultSize={{
          width: sidebarMountWidth,
          height: '100%',
        }}
        style={{
          position: 'static',
        }}
        handleWrapperClass={'sidebar-resizable-handle-wrapper'}
        maxHeight='100%'
        maxWidth={500}
        minWidth={270}
        onResize={(event, direction, el) =>
          localStorageConnector.set('sidebarWidth', el.offsetWidth)
        }
        enable={{
          right: true,
          top: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
      >
        <SidebarCore />
      </Resizable>
    </motion.div>
  )
}
export default SidebarDesktop