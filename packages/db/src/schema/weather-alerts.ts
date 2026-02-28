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
import { weatherAlertTypeEnum, weatherAlertSeverityEnum } from './enums.js';
import { states } from './locations.js';

export const weatherAlerts = pgTable(
  'weather_alerts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    alertCode: varchar('alert_code', { length: 30 }).notNull().unique(),
    alertType: weatherAlertTypeEnum('alert_type').notNull(),
    severity: weatherAlertSeverityEnum('severity').notNull(),
    stateId: uuid('state_id').references(() => states.id, { onDelete: 'set null' }),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    description_en: text('description_en'),
    description_ar: text('description_ar'),
    source: varchar('source', { length: 200 }),
    isActive: boolean('is_active').notNull().default(true),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_weather_alerts_active').on(table.isActive, table.severity),
    index('idx_weather_alerts_state').on(table.stateId),
    index('idx_weather_alerts_type').on(table.alertType),
    index('idx_weather_alerts_expires').on(table.expiresAt),
  ],
);
