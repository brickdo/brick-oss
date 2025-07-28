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

import { Injectable } from '@nestjs/common'
import acme, { ClientAutoOptions } from 'acme-client'
import https from 'node:https'
import { promises as fs } from 'node:fs'
import { resolve, join } from 'node:path'
import { acmeAccountKey } from '@app/constants'
import { MyLoggerService } from '@brick/logger/my-logger.service'

const isProduction = process.env.NODE_ENV === 'production'

if (!isProduction) {
  acme.axios.defaults.httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  })
}

const challengeDir = resolve(__dirname, `../../../../../public/.well-known/acme-challenge`)
console.log(`challengeDir`, challengeDir)

@Injectable()
export class AcmeService {
  constructor(private logger: MyLoggerService) {
    logger.setContext('AcmeService')
  }

  async generateCertAndKey({ domain }: { domain: string }) {
    const email = 'REDACTED'

    const dirTestPebbleUrl = 'https://0.0.0.0:14000/dir'
    const acmeDirectoryUrl = isProduction ? acme.directory.letsencrypt.production : dirTestPebbleUrl

    /* Init client */
    const client = new acme.Client({
      accountKey: acmeAccountKey,
      directoryUrl: acmeDirectoryUrl,
    })

    /* Create CSR */
    const [key, csr] = await acme.forge.createCsr({
      commonName: domain,
      emailAddress: email,
    })

    /* Certificate */
    const cert = await client.auto({
      csr,
      email,
      termsOfServiceAgreed: true,
      skipChallengeVerification: true,
      challengePriority: ['http-01'],
      challengeCreateFn,
      challengeRemoveFn,
    })

    this.logger.info(`Success generating certificate and key for domain: ${domain}`)

    return { cert, key: key.toString() }
  }
}

/**
 * Function used to satisfy an ACME challenge
 *
 * @param authz Authorization object
 * @param challenge Selected challenge
 * @param keyAuthorization Authorization key
 */
const challengeCreateFn: ClientAutoOptions['challengeCreateFn'] = async (
  authz,
  challenge,
  keyAuthorization,
) => {
  // Other challenge types not supported
  if (challenge.type === 'http-01') {
    const filePath = join(challengeDir, `/${challenge.token}`)
    console.log(
      `Create challenge file for challenge:`,
      'challenge',
      challenge,
      'challenge.url',
      challenge.url,
      'filePath',
      filePath,
    )
    const fileContents = keyAuthorization

    await fs.mkdir(challengeDir, { recursive: true })
    await fs.writeFile(filePath, fileContents)
  }
}

/**
 * Function used to remove an ACME challenge response
 *
 * @param authz Authorization object
 * @param challenge Selected challenge
 * @param keyAuthorization Authorization key
 */
const challengeRemoveFn: ClientAutoOptions['challengeRemoveFn'] = async (
  authz,
  challenge,
  keyAuthorization,
) => {
  if (challenge.type === 'http-01') {
    const filePath = join(challengeDir, `/${challenge.token}`)

    console.log(
      `Remove challenge file for challenge:`,
      'challenge',
      challenge,
      'challenge.url',
      challenge.url,
      'filePath',
      filePath,
    )
    await fs.unlink(filePath)
  }
}