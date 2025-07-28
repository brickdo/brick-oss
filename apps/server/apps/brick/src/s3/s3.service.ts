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
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { fromBuffer } from 'file-type'
import { UploadedImage } from '@app/db'

interface S3ConfigValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)
  private s3Client: S3Client | null = null
  private bucketName: string
  private baseUrl: string
  private isConfigured = false
  private configValidation: S3ConfigValidationResult

  constructor(
    @InjectRepository(UploadedImage)
    private readonly uploadedImageRepository: Repository<UploadedImage>,
  ) {
    this.configValidation = this.validateConfiguration()

    if (this.configValidation.isValid) {
      this.initializeS3Client()
    } else {
      this.logConfigurationErrors()
    }
  }

  private validateConfiguration(): S3ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const requiredEnvVars = [
      { key: 'IMAGE_UPLOAD_S3_ENDPOINT', value: process.env.IMAGE_UPLOAD_S3_ENDPOINT },
      { key: 'IMAGE_UPLOAD_S3_BUCKET_NAME', value: process.env.IMAGE_UPLOAD_S3_BUCKET_NAME },
      { key: 'IMAGE_UPLOAD_S3_KEY_ID', value: process.env.IMAGE_UPLOAD_S3_KEY_ID },
      { key: 'IMAGE_UPLOAD_S3_SECRET_KEY', value: process.env.IMAGE_UPLOAD_S3_SECRET_KEY },
      { key: 'IMAGE_UPLOAD_S3_CDN_ENDPOINT', value: process.env.IMAGE_UPLOAD_S3_CDN_ENDPOINT },
      { key: 'IMAGE_UPLOAD_S3_REGION', value: process.env.IMAGE_UPLOAD_S3_REGION },
    ]

    // Check for missing required environment variables
    for (const envVar of requiredEnvVars) {
      if (!envVar.value || envVar.value.trim() === '') {
        errors.push(`Missing required environment variable: ${envVar.key}`)
      }
    }

    // Validate URL formats
    if (process.env.IMAGE_UPLOAD_S3_ENDPOINT) {
      try {
        new URL(process.env.IMAGE_UPLOAD_S3_ENDPOINT)
      } catch {
        errors.push('IMAGE_UPLOAD_S3_ENDPOINT must be a valid URL')
      }
    }

    if (process.env.IMAGE_UPLOAD_S3_CDN_ENDPOINT) {
      try {
        new URL(process.env.IMAGE_UPLOAD_S3_CDN_ENDPOINT)
      } catch {
        errors.push('IMAGE_UPLOAD_S3_CDN_ENDPOINT must be a valid URL')
      }
    }

    // Check optional environment variables and provide warnings
    const forcePathStyleStr = process.env.IMAGE_UPLOAD_S3_FORCE_PATH_STYLE
    if (!forcePathStyleStr) {
      warnings.push('IMAGE_UPLOAD_S3_FORCE_PATH_STYLE not set, defaulting to false')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private initializeS3Client(): void {
    const endpoint = process.env.IMAGE_UPLOAD_S3_ENDPOINT!
    const bucketName = process.env.IMAGE_UPLOAD_S3_BUCKET_NAME!
    const keyId = process.env.IMAGE_UPLOAD_S3_KEY_ID!
    const secretKey = process.env.IMAGE_UPLOAD_S3_SECRET_KEY!
    const cdnEndpoint = process.env.IMAGE_UPLOAD_S3_CDN_ENDPOINT!
    const region = process.env.IMAGE_UPLOAD_S3_REGION!

    // Parse forcePathStyle from env var (treat any non-empty string as true except "false", "0")
    const forcePathStyleStr = process.env.IMAGE_UPLOAD_S3_FORCE_PATH_STYLE || ''
    const forcePathStyle =
      forcePathStyleStr !== '' && forcePathStyleStr !== 'false' && forcePathStyleStr !== '0'

    this.isConfigured = true
    this.bucketName = bucketName
    this.baseUrl = cdnEndpoint

    // Initialize the S3 client
    this.s3Client = new S3Client({
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: keyId,
        secretAccessKey: secretKey,
      },
      forcePathStyle: forcePathStyle,
    })

    this.logger.log('S3 service initialized successfully')

    // Log any warnings
    if (this.configValidation.warnings.length > 0) {
      this.configValidation.warnings.forEach(warning => {
        this.logger.warn(warning)
      })
    }
  }

  private logConfigurationErrors(): void {
    this.logger.error('S3 configuration validation failed:')
    this.configValidation.errors.forEach(error => {
      this.logger.error(`  - ${error}`)
    })
    this.logger.error('Image uploading will be disabled until configuration is fixed')
  }

  getConfigurationStatus(): S3ConfigValidationResult {
    return this.configValidation
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadedByUserId: string,
    workspaceId: string,
    workspaceOwnerId: string,
    pageId: string,
  ): Promise<{ url: string }> {
    const uploadContext = {
      userId: uploadedByUserId,
      workspaceId,
      originalName: file.originalname,
      fileSize: file.size,
    }

    try {
      // Check if S3 service is configured
      if (!this.isConfigured || !this.s3Client) {
        this.logger.error('Upload failed - S3 service not configured', uploadContext)
        throw new InternalServerErrorException('Image uploading is currently unavailable')
      }

      // Validate file exists
      if (!file || !file.buffer) {
        this.logger.warn('Upload failed - No file provided', uploadContext)
        throw new BadRequestException('No file provided')
      }

      // Detect actual file type using magic bytes
      const detectedType = await fromBuffer(file.buffer)
      if (
        !detectedType ||
        !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(detectedType.mime)
      ) {
        this.logger.warn('Upload failed - Invalid file type', {
          ...uploadContext,
          detectedMimeType: detectedType?.mime || 'unknown',
        })
        throw new BadRequestException(
          'Invalid or unsupported image format. Supported formats: JPEG, PNG, WebP, GIF',
        )
      }

      // Generate a unique filename using detected extension
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const filename = `uploads/${uuidv4()}.${detectedType.ext}`

      // Upload the file to S3-compatible storage
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: detectedType.mime,

        // How does Notion, etc do it?
        ACL: 'public-read', // Make the file publicly accessible
      })

      this.logger.log('Starting S3 upload', {
        ...uploadContext,
        filename,
        mimeType: detectedType.mime,
      })

      await this.s3Client.send(command)

      // Build the full URL
      const s3Url = `${this.baseUrl}/${filename}`

      // Save image metadata to database
      const uploadedImage = this.uploadedImageRepository.create({
        filename,
        originalName: file.originalname,
        mimeType: detectedType.mime,
        fileSize: file.size,
        s3Url,
        uploadedByUserId,
        workspaceId,
        workspaceOwnerId,
        pageId,
      })

      await this.uploadedImageRepository.save(uploadedImage)

      this.logger.log('Upload completed successfully', {
        ...uploadContext,
        filename,
        s3Url,
      })

      // Return the URL to the uploaded file
      return {
        url: s3Url,
      }
    } catch (error) {
      // Log error with context for monitoring
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        // Re-throw known exceptions without additional logging
        throw error
      }

      // Log unexpected errors with full context
      this.logger.error('Upload failed with unexpected error', {
        ...uploadContext,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      })

      // Return generic error to avoid exposing internal details
      throw new InternalServerErrorException('Failed to upload image')
    }
  }
}