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

import {
  createActionsHook,
  createStateHook,
  createEffectsHook,
  createReactionHook,
} from 'overmind-react'
import { createOvermind, IContext } from 'overmind'
import { merge } from 'overmind/config'
import * as root from './root'
import * as workspaces from './workspaces'
import * as user from './user'
import * as subscription from './subscription'
import * as pages from './pages'

export const config = merge(root, workspaces, user, subscription, pages)

export type Context = IContext<{
  state: typeof config.state
  actions: typeof config.actions
  effects: typeof config.effects
}>

export type RootState = typeof config.state
// devEnv different from default 'development' prevents overmind from polluting console logs source location in chrome devtools
export const store = createOvermind(config /*  { devEnv: 'OVERMIND_DEV' } */)
export const useAppState = createStateHook<Context>()
export const useActions = createActionsHook<Context>()
export const useEffects = createEffectsHook<Context>()
export const useReaction = createReactionHook<Context>()