import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { callUrgencyEnum, callStatusEnum } from './enums.js';
import { floodZones } from './flood-zones.js';
import { states, localities } from './locations.js';
import { users } from './users.js';
import { organizations } from './organizations.js';
import { rescueOperations } from './rescue-operations.js';

export const emergencyCalls = pgTable(
  'emergency_calls',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    callCode: varchar('call_code', { length: 30 }).notNull().unique(),
    callerName: varchar('caller_name', { length: 200 }),
    callerPhone: varchar('caller_phone', { length: 20 }).notNull(),
    callerAddress: text('caller_address'),
    callNumber: varchar('call_number', { length: 5 }).notNull(),
    urgency: callUrgencyEnum('urgency').notNull().default('medium'),
    status: callStatusEnum('status').notNull().default('received'),
    description_ar: text('description_ar'),
    description_en: text('description_en'),
    personsAtRisk: integer('persons_at_risk').default(0),
    floodZoneId: uuid('flood_zone_id').references(() => floodZones.id),
    stateId: uuid('state_id').references(() => states.id),
    localityId: uuid('locality_id').references(() => localities.id),
    receivedByUserId: uuid('received_by_user_id').references(() => users.id),
    dispatchedToOrgId: uuid('dispatched_to_org_id').references(() => organizations.id),
    rescueOperationId: uuid('rescue_operation_id')
      .unique()
      .references(() => rescueOperations.id, { onDelete: 'set null' }),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    triagedAt: timestamp('triaged_at', { withTimezone: true }),
    dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    recordingUrl: varchar('recording_url', { length: 1000 }),
    notes: text('notes'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_calls_urgency').on(table.urgency),
    index('idx_calls_status').on(table.status),
    index('idx_calls_zone').on(table.floodZoneId),
    index('idx_calls_state').on(table.stateId),
    index('idx_calls_received').on(table.receivedAt),
  ],
);

export const emergencyCallsRelations = relations(emergencyCalls, ({ one }) => ({
  floodZone: one(floodZones, {
    fields: [emergencyCalls.floodZoneId],
    references: [floodZones.id],
  }),
  state: one(states, { fields: [emergencyCalls.stateId], references: [states.id] }),
  receivedBy: one(users, {
    fields: [emergencyCalls.receivedByUserId],
    references: [users.id],
  }),
  dispatchedToOrg: one(organizations, {
    fields: [emergencyCalls.dispatchedToOrgId],
    references: [organizations.id],
  }),
  rescueOperation: one(rescueOperations, {
    fields: [emergencyCalls.rescueOperationId],
    references: [rescueOperations.id],
  }),
}));
