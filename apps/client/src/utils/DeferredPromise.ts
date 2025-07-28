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

export class TimeoutError extends Error {}

export class DeferredPromise<T, E = any> {
  protected readonly _promise: Promise<T>
  protected _resolve: ((value: T | PromiseLike<T>) => void) | null = null
  protected _reject: ((reason?: E | TimeoutError) => void) | null = null
  protected _tid?: any // number | NodeJS.Timer
  protected _fulfilled = false

  constructor(protected timeout?: number) {
    this._promise = new Promise<T>((resolve, reject): void => {
      this._resolve = resolve
      this._reject = reject
    })
    if (timeout) {
      this._tid = setTimeout(() => {
        if (this._reject) {
          this.reject(new TimeoutError('timeout'))
        }
      }, timeout)
    }
  }

  public resolve(value: T | PromiseLike<T>): void {
    const { _resolve } = this
    if (_resolve) {
      this._fulfilled = true
      this.clear()
      _resolve(value)
    }
  }

  public reject(reason: E | TimeoutError): void {
    const { _reject } = this
    if (_reject) {
      this.clear()
      _reject(reason)
    }
  }

  public then<T1 = T, T2 = never>(
    onFulfilled?: ((value: T) => T1 | PromiseLike<T1>) | undefined | null,
    onRejected?: ((reason: any) => T2 | PromiseLike<T2>) | undefined | null,
  ): Promise<T1 | T2> {
    return this._promise.then(onFulfilled, onRejected)
  }

  public catch<T1 = never>(
    onRejected?: ((reason: any) => T1 | PromiseLike<T1>) | undefined | null,
  ): Promise<T | T1> {
    return this._promise.catch(onRejected)
  }

  public finally(onFinally: () => void): Promise<T> {
    return this._promise.then(
      v => {
        onFinally()
        return v
      },
      e => {
        onFinally()
        throw e
      },
    )
  }

  private clear(): void {
    this._resolve = null
    this._reject = null
    const { _tid } = this
    if (_tid) {
      clearTimeout(_tid)
      this._tid = undefined
    }
  }

  get promise(): Promise<T> {
    return this._promise
  }

  public get pending(): boolean {
    return Boolean(this._reject)
  }

  public get fulfilled(): boolean {
    return this._fulfilled
  }

  public get rejected(): boolean {
    return !(this._fulfilled || this.pending)
  }

  public get status(): 'pending' | 'fulfilled' | 'rejected' {
    return this.pending ? 'pending' : this.fulfilled ? 'fulfilled' : 'rejected'
  }
}