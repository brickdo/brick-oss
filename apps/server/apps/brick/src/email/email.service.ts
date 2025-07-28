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
import handlebars from 'handlebars'
import mailjet, { Email } from 'node-mailjet'
import fs from 'node:fs'
import { resolve } from 'node:path'
import { User } from '@app/db'

const appHost = process.env.PUBLICVAR_BRICK_HOST

const getTemplateHtml = (templateName: string) =>
  fs.readFileSync(resolve(__dirname, `./templates/${templateName}`)).toString()
const saasMantraCompleteSignUpEmailTemplate = handlebars.compile(
  getTemplateHtml('saas-mantra-sign-up-finish.html'),
)
const confirmEmailTemplate = handlebars.compile(getTemplateHtml('confirm-email.html'))
const resetPasswordTemplate = handlebars.compile(getTemplateHtml('reset-password.html'))
const changeEmailOldEmailTemplate = handlebars.compile(
  getTemplateHtml('change-email-old-email.html'),
)
const changeEmailVerifyNewTemplate = handlebars.compile(
  getTemplateHtml('change-email-verify-new.html'),
)

@Injectable()
export class EmailService {
  private mailjetClient: Email.Client

  constructor() {
    this.mailjetClient = mailjet.connect(
      'REDACTED',
      'REDACTED',
    )
  }

  async sendSaasMantraCompleteSignUpEmail({
    userName,
    email,
    userFinishSignUpId,
  }: {
    userName: string
    email: string
    userFinishSignUpId: string
  }) {
    try {
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'robot@brick.do',
              Name: 'Brick',
            },
            To: [
              {
                Email: email,
                Name: userName,
              },
            ],
            Subject: 'Thank you for buying Brick LTD from SaaS Mantra',
            TextPart: 'Thank you for buying Brick LTD from SaaS Mantra',
            HTMLPart: saasMantraCompleteSignUpEmailTemplate({
              appHost,
              userName,
              userFinishSignUpId,
            }),
            CustomID: 'SaaSMantraFinishSignUp',
          },
        ],
      })
    } catch (e) {
      console.error('Error sending email for SaasMantra complete signup', e)
    }
  }

  async sendConfirmEmailLink({
    userName,
    email,
    token,
  }: {
    userName: string
    email: string
    token: string
  }) {
    try {
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'robot@brick.do',
              Name: 'Brick',
            },
            To: [
              {
                Email: email,
                Name: userName,
              },
            ],
            Subject: 'Confirm email',
            TextPart: 'Confirm email',
            HTMLPart: confirmEmailTemplate({ userName, token, appHost }),
            CustomID: 'ConfirmEmail',
          },
        ],
      })
    } catch (e) {
      console.error('Error sending email for email confirmation', e)
    }
  }

  async sendResetPasswordEmail({
    userName,
    email,
    tokenId,
  }: {
    userName: string
    email: string
    tokenId: string
  }) {
    try {
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'robot@brick.do',
              Name: 'Brick',
            },
            To: [
              {
                Email: email,
                Name: userName,
              },
            ],
            Subject: 'Reset your password',
            TextPart: 'Reset your password',
            HTMLPart: resetPasswordTemplate({ userName, tokenId, appHost }),
            CustomID: 'ResetPpassword',
          },
        ],
      })
    } catch (e) {
      console.error('Error sending password reset email', {
        e,
        userName,
        email,
      })
    }
  }

  async sendConfirmChangeEmailOldEmail(user: User, newEmail: string, token: string) {
    try {
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'robot@brick.do',
              Name: 'Brick',
            },
            To: [
              {
                Email: user.email,
                Name: user.name,
              },
            ],
            Subject: 'Change your email',
            TextPart: 'Change your email',
            HTMLPart: changeEmailOldEmailTemplate({
              userName: user.name,
              newEmail,
              appHost,
              token,
            }),
            CustomID: 'ChangeEmailOld',
          },
        ],
      })
    } catch (e) {
      console.error('Error sending "change email" email', {
        e,
        userName: user.name,
        newEmail,
      })
    }
  }

  async sendVerifyNewEmailAfterChange(user: User, newEmail: string, token: string) {
    try {
      await this.mailjetClient.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'robot@brick.do',
              Name: 'Brick',
            },
            To: [
              {
                Email: newEmail,
                Name: user.name,
              },
            ],
            Subject: 'Verify your new email',
            TextPart: 'Verify your new email',
            HTMLPart: changeEmailVerifyNewTemplate({
              userName: user.name,
              appHost,
              token,
            }),
            CustomID: 'VerifyNewEmail',
          },
        ],
      })
    } catch (e) {
      console.error('Error sending "change email" email', {
        e,
        userName: user.name,
        newEmail,
      })
    }
  }
}