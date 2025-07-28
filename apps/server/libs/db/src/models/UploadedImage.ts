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

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'uploaded_images' })
export class UploadedImage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  filename: string // The S3 key (e.g., "uploads/uuid.jpg")

  @Column()
  originalName: string // Original filename from user

  @Column()
  mimeType: string // e.g., "image/jpeg"

  @Column()
  fileSize: number // Size in bytes

  @Column()
  s3Url: string // Full CDN URL

  // Store IDs as strings, not foreign key relations
  // (since referenced entities might be deleted later)
  @Column()
  uploadedByUserId: string

  @Column()
  workspaceId: string

  @Column()
  workspaceOwnerId: string // Owner at time of upload

  @Column()
  pageId: string // Page where image was uploaded

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}