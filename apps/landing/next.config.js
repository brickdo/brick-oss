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

/* eslint-disable @typescript-eslint/no-var-requires */

const withImages = require('next-images')
const webpack = require('webpack')

// Embed all env vars starting with PUBLICVAR_ into the frontend
const publicvarPlugin = new webpack.DefinePlugin({
  ...Object.keys(process.env).reduce((prev, key) => {
    if (key.startsWith('PUBLICVAR_')) {
      prev[`process.env.${key}`] = JSON.stringify(process.env[key])
    }
    return prev
  }, {}),
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // So that we can use @brick-shared
    externalDir: true,
  },
  webpack: config => {
    config.plugins.push(publicvarPlugin)
    return config
  },
}

module.exports = withImages(nextConfig)