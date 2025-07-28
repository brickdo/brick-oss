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

/* eslint-disable no-unused-vars */

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
const ESLintPlugin = require('eslint-webpack-plugin')
const paths = require('./paths')
const modules = require('./modules')
const getClientEnvironment = require('./env')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin')

const appPackageJson = require(paths.appPackageJson)

// Some apps do not need the benefits of saving a web request, so not inlining the chunk
// makes for a smoother build process.

const imageInlineSizeLimit = parseInt(process.env.IMAGE_INLINE_SIZE_LIMIT || '10000')

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig)

// style files regexes
const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false
  }

  try {
    require.resolve('react/jsx-runtime')
    return true
  } catch (e) {
    return false
  }
})()

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv) {
  const isEnvProduction = webpackEnv === 'production'
  const isEnvDevelopment = webpackEnv === 'development'
  // We will provide `paths.publicUrlOrPath` to our app
  // as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
  // Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
  // Get environment variables to inject into our app.
  const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1))

  const shouldUseReactRefresh = env.raw.FAST_REFRESH

  const babelLoaderOptions = {
    customize: require.resolve('babel-preset-react-app/webpack-overrides'),
    presets: [
      ['react-app', { modules: false }],
      ['@babel/preset-env', { modules: false, loose: true }],
      [
        '@babel/preset-react',
        {
          runtime: 'automatic',
          importSource: '@emotion/react',
          modules: false,
          loose: true,
        },
      ],
    ],

    plugins: [
      ['@emotion/babel-plugin', { sourceMap: isEnvDevelopment }],
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent: '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
          },
        },
      ],
      isEnvDevelopment && shouldUseReactRefresh && require.resolve('react-refresh/babel'),
    ].filter(Boolean),
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
    // See #6846 for context on why cacheCompression is disabled
    cacheCompression: false,
    compact: isEnvProduction,
  }

  // common function to get style loaders
  const getStyleLoaders = (cssOptions, preProcessor, useStringLoader) => {
    const loaders = [
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              require('tailwindcss'),
              require('postcss-flexbugs-fixes'),
              require('postcss-preset-env')({
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
              }),
              require('cssnano')({
                preset: [
                  'advanced',
                  {
                    discardComments: {
                      removeAll: true,
                    },
                  },
                ],
              }),
            ],
            sourceMap: false,
          },
        },
      },
    ].filter(Boolean)
    if (preProcessor) {
      loaders.push(
        {
          loader: require.resolve('resolve-url-loader'),
          options: {
            sourceMap: false,
            root: paths.appSrc,
          },
        },
        {
          loader: require.resolve(preProcessor),
          options: {
            sourceMap: true,
          },
        },
      )
    }
    return loaders
  }

  return {
    mode: 'production',
    stats: 'verbose',
    target: 'node',
    devtool: false,
    // Stop compilation early in production
    bail: isEnvProduction,
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: [
      // Finally, this is your app's code:
      paths.serverEntryJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ].filter(Boolean),
    output: {
      // The build folder.
      path: paths.appBuild,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: false,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      filename: paths.serverBundleFilename,
      libraryTarget: 'umd',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      devtoolModuleFilenameTemplate: info =>
        path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/'),
      // this defaults to 'window', but by setting it to 'this' then
      // module chunks which are built will work in web workers as well.
      globalObject: 'this',
    },
    resolve: {
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        fs: false,
        http2: false,
        net: false,
        tls: false,
        child_process: false,
      },
      // This allows you to set a fallback for where webpack should look for modules.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebook/create-react-app/issues/253
      // UPDATE: since we are using monorepo with shared folder which has its own node modules we should preoritize local node modules
      modules: [paths.appNodeModules, 'node_modules'].concat(modules.additionalModulePaths || []),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebook/create-react-app/issues/290
      // `web` extension prefixes have been added for better support
      // for React Native Web.
      extensions: paths.moduleFileExtensions
        .map(ext => `.${ext}`)
        .filter(ext => useTypeScript || !ext.includes('ts')),
      alias: {
        // Allows for better profiling with ReactDevTools
        ...(modules.webpackAliases || {}),
      },
      plugins: [],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.[cm]?js$/,
          parser: { requireEnsure: false },
        },
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false, // disable the behaviour
          },
        },
        {
          oneOf: [
            // "url" loader works like "file" loader except that it embeds assets
            // smaller than specified limit in bytes as data URLs to avoid requests.
            // A missing `test` is equivalent to a match.
            {
              test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
              loader: require.resolve('url-loader'),
              options: {
                limit: imageInlineSizeLimit,
                name: 'static/media/[name].[hash:8].[ext]',
              },
            },
            // Process application JS with Babel.
            // The preset includes JSX, Flow, TypeScript, and some ESnext features.
            {
              test: /\.(js|mjs|jsx|ts|tsx)$/,
              include: [paths.appSrc, paths.brickSharedSrc],
              loader: require.resolve('babel-loader'),
              resolve: {
                fullySpecified: false,
              },
              options: babelLoaderOptions,
            },
            // Process any JS outside of the app with Babel.
            // Unlike the application JS, we only compile the standard ES features.
            {
              test: /\.(js|mjs)$/,
              exclude: /@babel(?:\/|\\{1,2})runtime/,
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                compact: false,
                presets: [
                  [require.resolve('babel-preset-react-app/dependencies'), { helpers: true }],
                ],
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                // Babel sourcemaps are needed for debugging into node_modules
                // code.  Without the options below, debuggers like VSCode
                // show incorrect code and set breakpoints on the wrong lines.
                sourceMaps: false,
                inputSourceMap: false,
              },
            },
            // "postcss" loader applies autoprefixer to our CSS.
            // "css" loader resolves paths in CSS and adds assets as dependencies.
            // "style" loader turns CSS into JS modules that inject <style> tags.
            // In production, we use MiniCSSExtractPlugin to extract that CSS
            // to a file, but in development "style" loader enables hot editing
            // of CSS.
            // By default we support CSS Modules with the extension .module.css
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              oneOf: [
                {
                  resourceQuery: /string/,
                  use: getStyleLoaders(
                    {
                      importLoaders: 1,
                      sourceMap: false,
                    },
                    false,
                    true,
                  ),
                },
                {
                  use: getStyleLoaders({
                    importLoaders: 1,
                    sourceMap: false,
                  }),
                },
              ],
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
            // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
            // using the extension .module.css
            // {
            //   test: cssModuleRegex,
            //   loader: require.resolve('ignore-loader'),
            // use: getStyleLoaders({
            //   importLoaders: 1,
            //   sourceMap: false,
            //   modules: {
            //     getLocalIdent: getCSSModuleLocalIdent,
            //   },
            // }),
            // },
            // "file" loader makes sure those assets get served by WebpackDev.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              loader: require.resolve('file-loader'),
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/media/[name].[contenthash:8].[ext]',
              },
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ],
    },
    plugins: [
      // This gives some necessary context to module not found errors, such as
      // the requesting resource.
      new ModuleNotFoundPlugin(paths.appPath),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // It is absolutely essential that NODE_ENV is set to production
      // during a production build.
      // Otherwise React will be compiled in the very slow development mode.
      new webpack.DefinePlugin({ ...env.stringified, process: {} }),
      // TypeScript type checking
      useTypeScript &&
        new ForkTsCheckerWebpackPlugin({
          async: isEnvDevelopment,
          typescript: {
            configFile: paths.appTsConfig,
          },
        }),

      // !disableESLintPlugin &&
      // new ESLintPlugin({
      //   // Plugin options
      //   extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
      //   formatter: require.resolve('react-dev-utils/eslintFormatter'),
      //   eslintPath: require.resolve('eslint'),
      //   failOnError: !(isEnvDevelopment && emitErrorsAsWarnings),
      //   context: paths.appSrc,
      //   cache: true,
      //   cacheLocation: path.resolve(
      //     paths.appNodeModules,
      //     '.cache/.eslintcache'
      //   ),
      //   // ESLint class options
      //   cwd: paths.appPath,
      //   resolvePluginsRelativeTo: __dirname,
      //   baseConfig: {
      //     extends: [require.resolve('eslint-config-react-app/base')],
      //     rules: {
      //       ...(!hasJsxRuntime && {
      //         'react/react-in-jsx-scope': 'error',
      //       }),
      //     },
      //   },
      // }),
    ].filter(Boolean),
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  }
}