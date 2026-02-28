import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { fileAttachments } from '@sudanflood/db/schema';
import type { RequestUploadInput, ListAttachmentsInput } from '@sudanflood/shared';
import {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  deleteObject,
} from './storage.service.js';
import { randomUUID } from 'crypto';

export async function requestUpload(db: Database, input: RequestUploadInput, userId: string) {
  const storageKey = `${input.entityType}/${input.entityId}/${randomUUID()}-${input.fileName}`;

  const presigned = await generatePresignedUploadUrl(storageKey, input.mimeType);

  const [attachment] = await db
    .insert(fileAttachments)
    .values({
      entityType: input.entityType,
      entityId: input.entityId,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mimeType: input.mimeType,
      storageKey: presigned.key,
      bucket: presigned.bucket,
      uploadedByUserId: userId,
    })
    .returning();

  return {
    attachmentId: attachment!.id,
    uploadUrl: presigned.url,
    storageKey: presigned.key,
  };
}

export async function listAttachments(db: Database, input: ListAttachmentsInput) {
  return db
    .select()
    .from(fileAttachments)
    .where(
      and(
        eq(fileAttachments.entityType, input.entityType),
        eq(fileAttachments.entityId, input.entityId),
      ),
    )
    .orderBy(fileAttachments.createdAt);
}

export async function getDownloadUrl(db: Database, id: string) {
  const [attachment] = await db
    .select()
    .from(fileAttachments)
    .where(eq(fileAttachments.id, id))
    .limit(1);

  if (!attachment) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Attachment not found' });
  }

  const url = await generatePresignedDownloadUrl(attachment.storageKey, attachment.bucket);

  return { url, fileName: attachment.fileName, mimeType: attachment.mimeType };
}

export async function deleteAttachment(db: Database, id: string, userId: string, userRole: string) {
  const [attachment] = await db
    .select()
    .from(fileAttachments)
    .where(eq(fileAttachments.id, id))
    .limit(1);

  if (!attachment) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Attachment not found' });
  }

  // Only the uploader or admins can delete attachments
  const isAdmin = userRole === 'super_admin' || userRole === 'agency_admin';
  if (attachment.uploadedByUserId !== userId && !isAdmin) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only delete your own attachments' });
  }

  await deleteObject(attachment.storageKey, attachment.bucket);

  await db.delete(fileAttachments).where(eq(fileAttachments.id, id));

  return { success: true };
}
