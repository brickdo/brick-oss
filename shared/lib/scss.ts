// @ts-ignore: https://github.com/brickdo/brick/issues/78
import sass from 'sass'

/**
 * Render a SCSS string to CSS.
 */
export function renderScss(scss: string | null): string | null {
  if (scss) {
    const fixedScss = stripBom(scss)
    return stripBom(sass.renderSync({ data: fixedScss, outputStyle: 'compressed' }).css.toString())
  } else {
    return null
  }
}

/**
 * Based on https://github.com/sindresorhus/strip-bom/blob/main/index.js.
 *
 * @copyright Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 * @license MIT
 * @see THIRD-PARTY.md
 */
function stripBom(s: string): string {
  // Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
  // conversion translates it to FEFF (UTF-16 BOM).
  if (s.charCodeAt(0) === 0xfeff) {
    return s.slice(1)
  }
  return s
}