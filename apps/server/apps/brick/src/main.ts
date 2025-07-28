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

import { config } from 'dotenv'
import dotenvExpand from 'dotenv-expand'
const env = config()
dotenvExpand(env)
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express'
import { resolve } from 'node:path'
import { AppModule } from './app.module'
import hbs from 'hbs'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import tls from 'node:tls'
import express, { NextFunction, Request, Response } from 'express'
import compression from 'compression'
import { certificatesStorage } from '@app/storages/certificatesStorage'
import { CertificatesService } from './certificates/certificates.service'
import { PublicAddressService } from './public-address/public-address.service'
import { allowedDomainsStorage } from '@app/storages'
import { MyLoggerService } from './logger/my-logger.service'
import { clientBuildPath, publicClientBuildPath } from './frontend/frontend.provider'
import http from 'node:http'
import https from 'node:https'

const { NODE_ENV, DB_URL } = process.env
const isProduction = NODE_ENV === 'production'

const wwwPrefix = 'www.'
const wwwPrefixLength = wwwPrefix.length
const trimWwwPrefix = (str: string) =>
  str && str.startsWith(wwwPrefix) ? str.slice(wwwPrefixLength) : str

const trimWwwMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const host = req.headers.host || ''
  const trimmedHost = trimWwwPrefix(host) || process.env.PUBLICVAR_BRICK_HOST
  if (trimmedHost !== host) {
    res.redirect(`https://${trimmedHost}${req.url}`)
  } else {
    next()
  }
}

if (isProduction) {
  process.on('unhandledRejection', (reason: any, promise) => {
    console.log('Unhandled Rejection at:', 'stack', reason?.stack || reason)

  })
}

async function bootstrap() {

  const server = express()

  const httpPort = process.env.HTTP_PORT
  const httpsPort = process.env.HTTPS_PORT

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(server),
    {
      bodyParser: false,
      ...(!isProduction
        ? {
            cors: {

              origin: /^https:\/\/REDACTED:/,
              optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
            },
          }
        : {}),
    },
  )

  const appLogger = await app.resolve(MyLoggerService)
  // app.useLogger(appLogger)

  // Only used for custom domains
  const httpsOptions = {
    SNICallback(domain: string, cb: (err: Error | null, ctx?: tls.SecureContext) => void) {
      const certInfo = certificatesStorage.getCertificate(domain)
      if (certInfo) {
        const certificate = { cert: certInfo.cert, key: certInfo.key }
        const ctx = tls.createSecureContext(certificate)
        cb(null, ctx)
      } else {
        appLogger.warn(`SNICallback: no certificate found for custom domain ${domain}`)
        cb(new Error(`No certificate found for custom domain ${domain}`))
      }
    },
  }

  const publicAddressService = app.get(PublicAddressService)
  const externalDomains = await publicAddressService.getExternalDomainsAndCertificates()
  externalDomains
    .map(x => x.externalDomain)
    // eslint-disable-next-line @typescript-eslint/unbound-method
    .forEach(allowedDomainsStorage.add, allowedDomainsStorage)

  app.use(trimWwwMiddleware)
  app.use(compression())

  const staticFilesLocations = [
    resolve(__dirname, '../../../../public'),
    resolve(publicClientBuildPath, './client'),
    clientBuildPath,
  ]

  const publicClientPath = resolve(publicClientBuildPath, './client')
  app.setBaseViewsDir(publicClientPath)
  staticFilesLocations.forEach(x => app.useStaticAssets(x, { index: false }))
  app.setViewEngine('html')
  // eslint-disable-next-line @typescript-eslint/unbound-method
  app.engine('html', hbs.__express)

  if (!isProduction) {
    app.use((req: Request, res: Response, next: NextFunction) =>
      req.hostname === 'localhost'
        ? res.redirect(`${process.env.PUBLICVAR_BRICK_URL}${req.originalUrl}`)
        : next(),
    )
  }

  app.use(
    bodyParser.json({
      // quick solution for stripe verifying hooks doubles RAM usage for every request

      // https://stackoverflow.com/questions/54346465/access-raw-body-of-stripe-webhook-in-nest-jssw
      verify(req, res, buf) {
        // @ts-ignore
        req.rawBody = buf
      },
    }),
  )
  app.use(cookieParser())

  // We listen on http for the normal server & on https for custom domains, because for custom domains
  // Traefik can't do SSL termination for us
  await app.init()
  http.createServer(server).listen(httpPort)
  https.createServer(httpsOptions, server).listen(httpsPort)
  appLogger.info(`App is running`, {
    ports: { http: httpPort, https: httpsPort, websocket: process.env.WEBSOCKET_PORT },
  })

  const certificatesService = app.get(CertificatesService)

  await certificatesService.loadCertificates()
}

bootstrap().catch(e => console.error(e))