import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const fileAttachments = pgTable(
  'file_attachments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    entityId: uuid('entity_id').notNull(),
    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 200 }).notNull(),
    storageKey: varchar('storage_key', { length: 1000 }).notNull(),
    bucket: varchar('bucket', { length: 200 }).notNull(),
    uploadedByUserId: uuid('uploaded_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_file_attachments_entity').on(table.entityType, table.entityId),
    index('idx_file_attachments_user').on(table.uploadedByUserId),
  ],
);
