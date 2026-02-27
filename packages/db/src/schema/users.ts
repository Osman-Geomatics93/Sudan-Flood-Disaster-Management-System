import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
  inet,
  text,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userRoleEnum } from './enums.js';
import { organizations } from './organizations.js';
import { states } from './locations.js';
import { localities } from './locations.js';

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 20 }),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull().default('citizen'),
    firstName_en: varchar('first_name_en', { length: 100 }),
    firstName_ar: varchar('first_name_ar', { length: 200 }),
    lastName_en: varchar('last_name_en', { length: 100 }),
    lastName_ar: varchar('last_name_ar', { length: 200 }),
    avatarUrl: varchar('avatar_url', { length: 1000 }),
    preferredLocale: varchar('preferred_locale', { length: 5 }).notNull().default('ar'),
    assignedStateId: uuid('assigned_state_id').references(() => states.id),
    assignedLocalityId: uuid('assigned_locality_id').references(() => localities.id),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_users_org').on(table.orgId),
    index('idx_users_role').on(table.role),
    index('idx_users_email').on(table.email),
    index('idx_users_phone').on(table.phone),
    index('idx_users_active').on(table.isActive),
  ],
);

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  assignedState: one(states, {
    fields: [users.assignedStateId],
    references: [states.id],
  }),
  assignedLocality: one(localities, {
    fields: [users.assignedLocalityId],
    references: [localities.id],
  }),
}));

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionToken: varchar('session_token', { length: 500 }).notNull().unique(),
    refreshToken: varchar('refresh_token', { length: 500 }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: inet('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_sessions_user').on(table.userId),
    index('idx_sessions_token').on(table.sessionToken),
    index('idx_sessions_expires').on(table.expiresAt),
  ],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
