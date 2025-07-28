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

module.exports = opts => {
  const isIncorrectOpts =
    !Array.isArray(opts) || opts.some(replaceRule => !Array.isArray(replaceRule))

  if (isIncorrectOpts) {
    throw new Error(
      '"postcss-selector-replace" plugin exception! \n Options should be array in next format: [ [%searchStr%, %replaceStr%], ...]',
    )
  }

  return {
    postcssPlugin: 'postcss-selector-replace',
    Once(css) {
      css.walkRules(rule => {
        opts.forEach(([searchStr, replaceStr]) => {
          const searchRegExp = new RegExp(escapeRegExp(searchStr), 'g')
          rule.selector = rule.selector.replace(searchRegExp, replaceStr)
        })
      })
    },
  }
}

module.exports.postcss = true

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}