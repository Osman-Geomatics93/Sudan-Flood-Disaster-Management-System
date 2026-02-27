import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { reportTypeEnum, callUrgencyEnum } from './enums.js';
import { floodIncidents } from './flood-zones.js';
import { states, localities } from './locations.js';
import { organizations } from './organizations.js';
import { users } from './users.js';
import { tasks } from './tasks.js';
import { rescueOperations } from './rescue-operations.js';

// ── Situation Reports ─────────────────────────────────────────────
export const situationReports = pgTable(
  'situation_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reportCode: varchar('report_code', { length: 30 }).notNull().unique(),
    incidentId: uuid('incident_id').references(() => floodIncidents.id, { onDelete: 'set null' }),
    reportType: reportTypeEnum('report_type').notNull(),
    reportNumber: integer('report_number').notNull().default(1),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    summary_en: text('summary_en'),
    summary_ar: text('summary_ar'),
    content: jsonb('content').default({}),
    stateId: uuid('state_id').references(() => states.id, { onDelete: 'set null' }),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id),
    createdByOrgId: uuid('created_by_org_id').references(() => organizations.id),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    isPublished: boolean('is_published').notNull().default(false),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_sitrep_incident').on(table.incidentId),
    index('idx_sitrep_type').on(table.reportType),
    index('idx_sitrep_published').on(table.isPublished),
    index('idx_sitrep_state').on(table.stateId),
    index('idx_sitrep_created_by').on(table.createdByUserId),
  ],
);

export const situationReportsRelations = relations(situationReports, ({ one }) => ({
  incident: one(floodIncidents, {
    fields: [situationReports.incidentId],
    references: [floodIncidents.id],
  }),
  state: one(states, { fields: [situationReports.stateId], references: [states.id] }),
  createdByUser: one(users, {
    fields: [situationReports.createdByUserId],
    references: [users.id],
    relationName: 'sitrepCreatedBy',
  }),
  createdByOrg: one(organizations, {
    fields: [situationReports.createdByOrgId],
    references: [organizations.id],
    relationName: 'sitrepOrg',
  }),
}));

// ── Citizen Reports ───────────────────────────────────────────────
export const citizenReports = pgTable(
  'citizen_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reportCode: varchar('report_code', { length: 30 }).notNull().unique(),
    reporterUserId: uuid('reporter_user_id').references(() => users.id, { onDelete: 'set null' }),
    reporterPhone: varchar('reporter_phone', { length: 20 }),
    reporterName: varchar('reporter_name', { length: 200 }),
    stateId: uuid('state_id').references(() => states.id, { onDelete: 'set null' }),
    localityId: uuid('locality_id').references(() => localities.id, { onDelete: 'set null' }),
    reportType: varchar('report_type', { length: 50 }).notNull(),
    urgency: callUrgencyEnum('urgency').notNull().default('medium'),
    description_ar: text('description_ar'),
    description_en: text('description_en'),
    // location (geometry) handled via raw SQL — same pattern as rescue service
    // photos TEXT[] handled via metadata or raw SQL
    status: varchar('status', { length: 30 }).notNull().default('submitted'),
    reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    linkedTaskId: uuid('linked_task_id').references(() => tasks.id, { onDelete: 'set null' }),
    linkedRescueId: uuid('linked_rescue_id').references(() => rescueOperations.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_citizen_report_reporter').on(table.reporterUserId),
    index('idx_citizen_report_status').on(table.status),
    index('idx_citizen_report_urgency').on(table.urgency),
    index('idx_citizen_report_state').on(table.stateId),
    index('idx_citizen_report_type').on(table.reportType),
  ],
);

export const citizenReportsRelations = relations(citizenReports, ({ one }) => ({
  reporter: one(users, {
    fields: [citizenReports.reporterUserId],
    references: [users.id],
    relationName: 'citizenReportReporter',
  }),
  state: one(states, { fields: [citizenReports.stateId], references: [states.id] }),
  locality: one(localities, { fields: [citizenReports.localityId], references: [localities.id] }),
  reviewedBy: one(users, {
    fields: [citizenReports.reviewedByUserId],
    references: [users.id],
    relationName: 'citizenReportReviewer',
  }),
  linkedTask: one(tasks, { fields: [citizenReports.linkedTaskId], references: [tasks.id] }),
  linkedRescue: one(rescueOperations, {
    fields: [citizenReports.linkedRescueId],
    references: [rescueOperations.id],
  }),
}));
