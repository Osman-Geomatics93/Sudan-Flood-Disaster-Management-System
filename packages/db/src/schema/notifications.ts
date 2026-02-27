import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    body_en: text('body_en'),
    body_ar: text('body_ar'),
    notificationType: varchar('notification_type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 20 }).default('info'),
    referenceType: varchar('reference_type', { length: 50 }),
    referenceId: uuid('reference_id'),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at', { withTimezone: true }),
    channel: varchar('channel', { length: 20 }).notNull().default('in_app'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_notifications_user').on(table.userId, table.isRead, table.createdAt),
    index('idx_notifications_type').on(table.notificationType),
    index('idx_notifications_ref').on(table.referenceType, table.referenceId),
  ],
);
