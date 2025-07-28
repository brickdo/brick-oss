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

import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
  GoneException,
} from '@nestjs/common'
import { AuthProvider } from '@brick/user/AuthProvider'
import { UserService } from '@brick/user/user.service'
import { JwtService } from '@nestjs/jwt'
import { MyLoggerService } from '@brick/logger/my-logger.service'
import { User, UserResetPassword } from '@app/db'
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, In, Repository } from 'typeorm'
import { EmailService } from '@brick/email/email.service'
import { AuthenticatedRequest } from '@brick/types'

const confirmEmailJwtSecret =
  'REDACTED'

export type RequestWithAccessToken = AuthenticatedRequest & {
  user: { accessToken: string }
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(UserResetPassword)
    private readonly userResetPasswordModel: Repository<UserResetPassword>,
    private logger: MyLoggerService,
  ) {
    logger.setContext('AuthService')
  }

  async signIn(user: User) {
    const existingUser = await this.userService.findOne(user)
    if (!existingUser) {
      throw new UnauthorizedException('Invalid Credentials')
    }

    const { id } = existingUser

    const accessToken = await this.jwtService.signAsync({ id })
    this.logger.info('User signed in', { user })
    return accessToken
  }

  async signUp(
    user: Omit<User, 'id' | 'subscriptionPlan'> & Partial<Pick<User, 'subscriptionPlan'>>,
  ) {
    return this.userService.create(user)
  }

  async demoLogin() {
    let user = await this.userService.findOne({ provider: AuthProvider.demo })
    if (!user) {
      user = await this.userService.create({
        name: 'John',
        email: 'john-doe@brick.dev',
        provider: AuthProvider.demo,
      })
    }
    return this.signIn(user)
  }

  async validateUser({ email, password }: { email: string; password: string }) {
    const user = await this.userService.findOne({
      where: {
        email: ILike(`${email}`),
        provider: AuthProvider.local,
      },
      select: ['password', 'email', 'provider', 'id'],
    })
    if (!user || !user.password) {
      return null
    }
    const isPassCorrect = await this.comparePasswords(password, user.password)
    if (!isPassCorrect) {
      return null
    }

    return this.userService.findOne(user.id)
  }

  async hashPassword(pass: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(16).toString('hex')
      scrypt(pass, salt, 64, (err, derivedKey) => {
        if (err) reject(err)
        resolve(`${salt}:${derivedKey.toString('hex')}`)
      })
    })
  }

  async comparePasswords(plainPass: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const [salt, key] = hash.split(':')
      if (typeof salt === 'string' && typeof key === 'string') {
        scrypt(plainPass, salt, 64, (err, derivedKey) => {
          if (err) reject(err)
          else resolve(timingSafeEqual(Buffer.from(key, 'hex'), derivedKey))
        })
      } else {
        reject(new TypeError('Expected colon (:) separated hash string'))
      }
    })
  }

  async generateConfirmEmailJwt({ userId }: { userId: User['id'] }) {
    return jwt.sign({ userId }, confirmEmailJwtSecret, {
      expiresIn: '9999 years',
    })
  }

  validateConfirmEmailJwt(token: string) {
    try {
      jwt.verify(token, confirmEmailJwtSecret)
      return true
    } catch (e) {
      return false
    }
  }

  decodeConfirmEmailJwt(token: string): string | { userId?: string } | JwtPayload | null {
    return jwt.decode(token)
  }

  async requestResetPassword(email: string) {
    const user = await this.userService.findOne({
      email: ILike(`${email}`),
      provider: AuthProvider.local,
    })
    if (!user || !user.isEmailConfirmed) {
      return
    }
    let resetPasswordRecord = await this.userResetPasswordModel.findOne({
      userId: user.id,
    })
    if (resetPasswordRecord) {
      await this.userResetPasswordModel.remove(resetPasswordRecord)
    }
    resetPasswordRecord = await this.userResetPasswordModel.save({
      userId: user.id,
    })
    await this.emailService.sendResetPasswordEmail({
      tokenId: resetPasswordRecord.id,
      email: user.email,
      userName: user.name,
    })
  }

  async checkIsResetPasswordTokenValid(tokenId: string) {
    const resetPasswordRecord = await this.userResetPasswordModel.findOne({
      id: tokenId,
    })

    if (!resetPasswordRecord) {
      return false
    }

    // Token is valid for 2 hours
    const validTime = 1000 * 60 * 60 * 2
    const isExpired = Date.now() - new Date(resetPasswordRecord.createdAt).getTime() >= validTime

    if (isExpired) {
      return false
    }

    return resetPasswordRecord
  }

  async resetPassword({ tokenId, password }: { tokenId: string; password: string }) {
    const resetPasswordRecord = await this.checkIsResetPasswordTokenValid(tokenId)
    if (!resetPasswordRecord) {
      throw new GoneException(`Invalid or expired reset password request`)
    }
    const passwordHash = await this.hashPassword(password)
    await this.userService.updateById(resetPasswordRecord.userId, {
      password: passwordHash,
    })
    await this.userResetPasswordModel.remove(resetPasswordRecord)
  }
}