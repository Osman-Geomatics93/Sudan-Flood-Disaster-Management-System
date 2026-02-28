import { pgTable, uuid, varchar, text, timestamp, jsonb, index, inet } from 'drizzle-orm/pg-core';
import { auditActionEnum } from './enums.js';
import { users } from './users.js';
import { organizations } from './organizations.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    action: auditActionEnum('action').notNull(),
    tableName: varchar('table_name', { length: 100 }).notNull(),
    recordId: uuid('record_id'),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    requestId: varchar('request_id', { length: 100 }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_user').on(table.userId),
    index('idx_audit_org').on(table.orgId),
    index('idx_audit_action').on(table.action),
    index('idx_audit_table').on(table.tableName, table.recordId),
    index('idx_audit_time').on(table.createdAt),
  ],
);
