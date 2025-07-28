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

export const pageStyleSelectors = `// Colors
:root {
  // --sidebar-bg-color: ;
}

// Navigation sidebar
.sidebar {}

// Navigation topbar
.navigation-header {}

// Page content
.page {
  // The page title
  .page-title {}

  // Headings (h2 is 'Heading 1', etc)
  h2, h3, h4 {}

  // Paragraphs
  p {}

  // Quotes
  blockquote {}

  // Inline code and code blocks
  code {}
  pre {}

  // Bulleted and numbered lists
  ul, ol {
    // List items
    li {}
  }

  // Lists with checkboxes
  .todo-list {
    li {}
    // Checkboxes
    .todo-list__label>input {
      // When checked
      &[checked] {}
    }
  }

  // Images
  .image {
    // Image captions
    figcaption {}
  }

  // Embeds
  .media {}

  // Tables
  table {
    // Table headers
    th {}
    // Table cells
    td {}
  }

  // Dividers
  hr {}

  // Highlighting
  .marker-yellow, .marker-green, .marker-pink, .marker-blue {}
  .pen-red, .pen-green {}
}

// Page footer
.page-footer {}
`