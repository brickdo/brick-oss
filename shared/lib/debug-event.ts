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

/**
 * A module for "debug events" that can be emitted in the client and listened to in tests.
 */

/**
 * These events are emitted by the client.
 */
export type AppDebugEvent =
  // Called whenever CKEditor thinks about a page autosave and decides it should actually try it. Eg. this should not be emitted if the page didn't change.
  { type: 'page-autosave'; pageId: string }

/**
 * Unless you call this function, `appDebugEvent` will not log anything.
 */
export function enableAppDebug() {
  // @ts-expect-error
  window.__enableAppDebug = true
}

/**
 * Log an `AppDebugEvent` to the console.
 *
 * Needs to be enabled by calling `enableAppDebug`. Otherwise, the passed function will not be executed. This makes it safe to do expensive operations or log big objects.
 */
export function appDebugEvent(fn: () => AppDebugEvent) {
  // @ts-expect-error
  if (window.__enableAppDebug) {
    console.debug('#AppDebugEvent', fn())
  }
}

/**
 * Deconstruct an `AppDebugEvent` from JSON (which you can get eg. from <https://playwright.dev/docs/api/class-consolemessage)
 */
export function parseAppDebugEvent(args: any[]): AppDebugEvent | undefined {
  if (args.length !== 2) return
  if (args[0] !== '#AppDebugEvent') return
  // We don't verify the event shape here, although with something like zod we could. We only check that it is an object.
  if (typeof args[1] !== 'object')
    throw new Error(`Expected an object, but got: ${JSON.stringify(args[1])}`)
  return args[1]
}