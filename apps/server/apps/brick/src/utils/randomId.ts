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

import { customAlphabet } from 'nanoid'

// Excluding letters 'csfhuit' so that we don't generate an ID containing a swear word
const alphabet = '1234567890abdegjklmnopqrvwxyzABDEGJKLMNOPQRVWXYZ'

// We want unguessable page IDs. If IDs have 64 bits and we have 10 million pages, after bruteforcing
// through a billion pages the attacker will find ~0.0005 pages, i.e. less than one page. Good enough.
// Since 'Math.log(2**64) / Math.log(alphabet.length)' is ~11.46, we need IDs with 12 chars
// to achieve 64 bits.
//
// We also want the IDs to have at least one digit or capital letter, so that we can distinguish between
// brick.do/<id> and URLs like "brick.do/preferences" or whatever.
export const generateShortPageId = (): string => {
  const id = customAlphabet(alphabet, 12)()
  const isAcceptableId = id.match(/[A-Z0-9]/)
  return isAcceptableId ? id : generateShortPageId()
}

export const isShortPageId = (str: string) =>
  str.match(RegExp(`^[${alphabet}]{12}$`)) && str.match(/[A-Z0-9]/)

/** Get the ID from a string like "some-page-title-23guhf823n", or 'null' if it's not a valid ID */
export function extractShortPageId(str: string): string | null {
  const id = str.split('-').slice(-1)[0]
  return isShortPageId(id) && id
}