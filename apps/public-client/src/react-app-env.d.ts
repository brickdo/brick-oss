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

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="@emotion/react/types/css-prop" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test'
    readonly PUBLIC_URL: string
  }
}

declare module '*.bmp' {
  const src: string
  export default src
}

declare module '*.gif' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.svg' {
  import * as React from 'react'

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>

  const src: string
  export default src
}

declare module '*.worker.js' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}

declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}

declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor()
  }

  export default WebpackWorker
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css?string' {
  const object: { toString: () => string }
  export default object
}