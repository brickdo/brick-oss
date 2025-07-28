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

type Certificate = {
  cert: string
  key: string
}

type CertificateInfo = {
  isWww?: boolean
}

type StorageItem = Certificate & CertificateInfo

type StorageAsArrayItem = {
  domain: string
} & StorageItem

class CertificatesStorage {
  private storage: { [key: string]: StorageItem } = {}

  getCertificate(domain: string): StorageItem | null {
    return this.storage[domain] || null
  }

  setCertificate(domain: string, certificate: StorageItem) {
    this.storage[domain] = certificate
  }

  getStorageAsArray(): StorageAsArrayItem[] {
    return Object.entries(this.storage).map(([domain, { cert, key, isWww }]) => ({
      domain,
      cert,
      key,
      isWww,
    }))
  }

  removeDomainFromStorage(domain: string) {
    delete this.storage[domain]
  }
}

const certificatesStorage = new CertificatesStorage()

export { certificatesStorage }