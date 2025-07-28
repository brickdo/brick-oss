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

import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { CronJob } from 'cron'
import acme from 'acme-client'
import { lookup } from 'node:dns/promises'
import { AcmeService } from '@brick/acme/acme.service'
import { PublicAddressService } from '@brick/public-address/public-address.service'
import { certificatesStorage } from '@app/storages/certificatesStorage'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { PublicAddress } from '@app/db'

const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

@Injectable()
export class CertificatesService {
  constructor(
    private readonly acmeService: AcmeService,
    @Inject(forwardRef(() => PublicAddressService))
    private readonly publicAddressService: PublicAddressService,
    private logger: MyLoggerService,
  ) {
    logger.setContext('CertificatesService')
    // eslint-disable-next-line @typescript-eslint/unbound-method
    new CronJob('0 0 * * *', () => this.checkCertsExpire).start()
  }

  async loadCertificates() {
    const publicAddresses = await this.publicAddressService.getExternalDomainsAndCertificates()

    publicAddresses.map(address => {
      const { externalDomain, cert, key, wwwCert, wwwKey } = address

      console.log(`Load certificate for ${externalDomain}`)

      if (cert && key && externalDomain) {
        console.log(`Set certificate for ${externalDomain}`)
        certificatesStorage.setCertificate(externalDomain, { cert, key })
      }

      const wwwExternalDomain = `www.${externalDomain}`
      if (wwwCert && wwwKey) {
        console.log(`Set certificate for ${wwwExternalDomain}`)
        certificatesStorage.setCertificate(wwwExternalDomain, {
          cert: wwwCert,
          key: wwwKey,
          isWww: true,
        })
      }
    })

    await this.checkCertsExpire()
  }

  async checkCertsExpire() {
    if (maintenanceMode) {
      console.log('Maintenance mode, skip renew certificates')
      return
    }

    await Promise.all(
      certificatesStorage.getStorageAsArray().map(async ({ cert, domain, isWww }) => {
        if (process.env.BRICK_IP) {
          try {
            const { address } = await lookup(domain)
            if (address !== process.env.BRICK_IP) {
              console.log(
                `Domain ${domain} is not longer pointing to Brick, Brick IP: ${process.env.BRICK_IP}, domain IP: ${address}, skip renew`,
              )
              return
            }
          } catch (e) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.error(`Failed to lookup domain ${domain} IP, skip renew error: ${e}`)
            return
          }
        }
        const certInfo = await acme.forge.readCertificateInfo(cert)
        const millisecondsBeforeExpire = certInfo.notAfter.getTime() - Date.now()
        const millisecondsInHour = 60 * 60 * 1000
        const hoursBeforeExpire = Math.floor(millisecondsBeforeExpire / millisecondsInHour)

        const hoursToRenewBeforeExpire = 720
        const shouldRenew = hoursBeforeExpire < hoursToRenewBeforeExpire
        console.log(
          `Check certificate for ${domain}, should renew: ${
            shouldRenew ? 'yes' : 'no'
          }, hours before expire: ${hoursBeforeExpire}`,
        )
        if (shouldRenew) {
          try {
            await this.renewCert(domain, isWww)
          } catch (e) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            console.error(`Failed to renew certificate for ${domain}, error: ${e}`)
          }
        }
      }),
    )
  }

  async generateCertsForPublicAddress({ externalDomain }: PublicAddress) {
    if (!externalDomain) {
      return
    }

    const wwwExternalDomain = `www.${externalDomain}`

    console.log(`Generate certificate for ${externalDomain}`)

    let cert, key, wwwCert, wwwKey
    try {
      const res = await this.acmeService.generateCertAndKey({
        domain: externalDomain,
      })
      cert = res.cert
      key = res.key
    } catch (e) {
      console.error(`Failed generate certificate for ${externalDomain}:`, e)
    }
    try {
      const res = await this.acmeService.generateCertAndKey({
        domain: wwwExternalDomain,
      })
      wwwCert = res.cert
      wwwKey = res.key
    } catch (e) {
      console.error(`Failed generate certificate for ${wwwExternalDomain}:`, e)
    }

    if (cert && key) {
      console.log(`Certificate for ${externalDomain} generated`)
      certificatesStorage.setCertificate(externalDomain, { cert, key })
      await this.publicAddressService.updateExternalDomainCertAndKey({
        externalDomain,
        cert,
        key,
      })
    } else {
      console.error(`Failed generate certificate for ${externalDomain}`)
    }

    if (wwwCert && wwwKey) {
      console.log(`Certificate for ${wwwExternalDomain} generated`)
      certificatesStorage.setCertificate(wwwExternalDomain, {
        cert: wwwCert,
        key: wwwKey,
        isWww: true,
      })
      await this.publicAddressService.updateExternalDomainWwwCertAndKey({
        externalDomain,
        wwwCert: wwwCert,
        wwwKey: wwwKey,
      })
    } else {
      console.error(`Failed generate certificate for ${wwwExternalDomain}`)
    }

    return { cert, key, wwwCert, wwwKey }
  }

  async renewCert(domain: string, isWww?: boolean) {
    console.log(`Renew certificate for ${domain}`)
    const { cert, key } = await this.acmeService.generateCertAndKey({ domain })

    if (isWww) {
      const wwwPrefix = 'www.'
      const wwwPrefixLength = wwwPrefix.length
      const rootDomain = domain.slice(wwwPrefixLength)
      await this.publicAddressService.updateExternalDomainWwwCertAndKey({
        externalDomain: rootDomain,
        wwwCert: cert,
        wwwKey: key,
      })
    } else {
      await this.publicAddressService.updateExternalDomainCertAndKey({
        externalDomain: domain,
        cert,
        key,
      })
    }
    certificatesStorage.setCertificate(domain, { cert, key, isWww })
  }
}