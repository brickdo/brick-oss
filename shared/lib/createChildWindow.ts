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

export function createChildWindow(url: string, title: string, w: number, h: number) {
  const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX
  const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY

  const width = window.innerWidth
    ? window.innerWidth
    : document.documentElement.clientWidth
      ? document.documentElement.clientWidth
      : window.screen.width
  const height = window.innerHeight
    ? window.innerHeight
    : document.documentElement.clientHeight
      ? document.documentElement.clientHeight
      : window.screen.height

  const systemZoom = width / window.screen.availWidth
  const left = (width - w) / 2 / systemZoom + dualScreenLeft
  const top = (height - h) / 2 / systemZoom + dualScreenTop

  const windowOpts = {
    toolbar: 0,
    scrollbars: 1,
    status: 1,
    resizable: 1,
    location: 1,
    menuBar: 0,
    width: w / systemZoom,
    height: h / systemZoom,
    left,
    top,
  }

  const windowOptsString = Object.entries(windowOpts)
    .map(([key, val]) => `${key}=${val}`)
    .join(',')

  return window.open(url, title, windowOptsString)
}