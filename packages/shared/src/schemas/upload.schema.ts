import { z } from 'zod';
import { uuidSchema } from './common.schema.js';

export const requestUploadSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: uuidSchema,
  fileName: z.string().min(1).max(500),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(50 * 1024 * 1024), // 50MB max
  mimeType: z.string().min(1).max(200),
});

export type RequestUploadInput = z.infer<typeof requestUploadSchema>;

export const confirmUploadSchema = z.object({
  attachmentId: uuidSchema,
});

export const listAttachmentsSchema = z.object({
  entityType: z.string().min(1).max(50),
  entityId: uuidSchema,
});

export type ListAttachmentsInput = z.infer<typeof listAttachmentsSchema>;

export const deleteAttachmentSchema = z.object({
  id: uuidSchema,
});

export const getDownloadUrlSchema = z.object({
  id: uuidSchema,
});
