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

import { css } from '@emotion/react'
import { LandingColors } from '@brick-shared/styles/landing'

export const styles = css`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=block');
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
  }

  ul[class],
  ol[class] {
    padding: 0;
  }

  body,
  h1,
  h2,
  h3,
  h4,
  p,
  ul[class],
  ol[class],
  li,
  figure,
  figcaption,
  blockquote,
  dl,
  dd {
    margin: 0;
  }

  body {
    min-height: 100vh;
    scroll-behavior: smooth;
    text-rendering: optimizeSpeed;
    line-height: normal;

    font-family: Inter;
  }

  ul[class],
  ol[class] {
    list-style: none;
  }

  a {
    text-decoration: none;
  }

  a:not([class]) {
    text-decoration-skip-ink: auto;
  }

  img {
    max-width: 100%;
    display: block;
  }

  article > * + * {
    margin-top: 1em;
  }

  input:focus,
  textarea:focus {
    outline: none;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
  }

  .wrapper {
    height: 100%;
    width: 100%;
    display: flex;

    justify-content: center;
  }

  #root {
    position: relative;
    min-height: 100vh;

    max-width: 1440px;
    width: 100%;
  }

  a {
    cursor: pointer;
    color: ${LandingColors.primary};
    text-decoration: underline;
  }

  div,
  button,
  a,
  label,
  input,
  textarea {
    font-style: normal;
    font-weight: 500;
  }

  h1 {
    font-family: Poppins;
    font-style: normal;
    font-weight: 600;
    font-size: 48px;
    line-height: 56px;
  }

  h2 {
    font-style: normal;
    font-weight: 800;
    font-size: 12px;
    line-height: 16px;

    text-align: center;
    letter-spacing: 0.1em;
    text-transform: uppercase;

    color: ${LandingColors.lightBlue};

    margin-bottom: 16px;
  }

  header {
    max-height: 100vh;
  }

  body {
    background-color: ${LandingColors.light};
    color: ${LandingColors.textBlack};
  }

  label {
    font-size: 16px;
    line-height: 24px;
    color: ${LandingColors.textGrey};
    margin-bottom: 16px;
  }

  input,
  textarea {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    padding: 20px 24px;
    width: 100% !important;
    background: ${LandingColors.white};
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 16px;
    text-align: center;
    resize: none;
    border: 1px solid #f3f3f3;

    &::placeholder {
      font-weight: 400;
      font-size: 16px;
      color: #a0a0a3;
    }
  }

  input:hover,
  input:focus,
  textarea:hover,
  textarea:focus {
    border: 1px solid #cbccd1;
  }

  textarea::-webkit-scrollbar-track,
  textarea::-webkit-scrollbar {
    background-color: ${LandingColors.white};
    overflow-x: auto;
    border-radius: 15px;

    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  textarea::-webkit-scrollbar {
    width: 12px;
    background-color: ${LandingColors.lightGrey};
  }

  textarea::-webkit-scrollbar-thumb {
    background-color: rgb(240, 240, 240);
    overflow-x: auto;
  }

  .form {
    display: flex;
    flex-flow: column;

    width: 100%;
  }

  /* Shadows */
  :root {
    --shadow-color: 0deg 0% 78%;
    --shadow-elevation-low: 0.2px 0.2px 0.4px hsl(var(--shadow-color) / 0),
      0.8px 0.6px 1.5px hsl(var(--shadow-color) / 0.28);
    --shadow-elevation-medium: 0.2px 0.2px 0.4px hsl(var(--shadow-color) / 0),
      1.3px 1.1px 2.6px hsl(var(--shadow-color) / 0.18),
      3.8px 3.2px 7.5px hsl(var(--shadow-color) / 0.35);
    --shadow-elevation-high: 0.2px 0.2px 0.4px hsl(var(--shadow-color) / 0),
      2.3px 1.9px 4.5px hsl(var(--shadow-color) / 0.12),
      4.4px 3.7px 8.6px hsl(var(--shadow-color) / 0.23),
      7.7px 6.5px 15.1px hsl(var(--shadow-color) / 0.35),
      13.5px 11.4px 26.5px hsl(var(--shadow-color) / 0.47);
  }
`