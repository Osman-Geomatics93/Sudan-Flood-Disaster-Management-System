import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  jsonb,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  rescueOperationTypeEnum,
  operationStatusEnum,
  taskPriorityEnum,
} from './enums.js';
import { floodZones } from './flood-zones.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const rescueOperations = pgTable(
  'rescue_operations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    operationCode: varchar('operation_code', { length: 30 }).notNull().unique(),
    floodZoneId: uuid('flood_zone_id')
      .notNull()
      .references(() => floodZones.id, { onDelete: 'restrict' }),
    assignedOrgId: uuid('assigned_org_id')
      .notNull()
      .references(() => organizations.id),
    operationType: rescueOperationTypeEnum('operation_type').notNull(),
    status: operationStatusEnum('status').notNull().default('pending'),
    priority: taskPriorityEnum('priority').notNull().default('high'),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    description: text('description'),
    estimatedPersonsAtRisk: integer('estimated_persons_at_risk').default(0),
    personsRescued: integer('persons_rescued').default(0),
    teamSize: integer('team_size'),
    teamLeaderId: uuid('team_leader_id').references(() => users.id),
    emergencyCallId: uuid('emergency_call_id'),
    dispatchedAt: timestamp('dispatched_at', { withTimezone: true }),
    arrivedAt: timestamp('arrived_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    notes: text('notes'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_rescue_ops_zone').on(table.floodZoneId),
    index('idx_rescue_ops_org').on(table.assignedOrgId),
    index('idx_rescue_ops_status').on(table.status),
    index('idx_rescue_ops_priority').on(table.priority),
    index('idx_rescue_ops_leader').on(table.teamLeaderId),
  ],
);

export const rescueOperationsRelations = relations(rescueOperations, ({ one, many }) => ({
  floodZone: one(floodZones, {
    fields: [rescueOperations.floodZoneId],
    references: [floodZones.id],
  }),
  assignedOrg: one(organizations, {
    fields: [rescueOperations.assignedOrgId],
    references: [organizations.id],
  }),
  teamLeader: one(users, {
    fields: [rescueOperations.teamLeaderId],
    references: [users.id],
  }),
  teamMembers: many(rescueTeamMembers),
}));

export const rescueTeamMembers = pgTable(
  'rescue_team_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    rescueOperationId: uuid('rescue_operation_id')
      .notNull()
      .references(() => rescueOperations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleInTeam: varchar('role_in_team', { length: 50 }).default('member'),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_rescue_team_operation').on(table.rescueOperationId),
    index('idx_rescue_team_user').on(table.userId),
    unique('uq_rescue_team_member').on(table.rescueOperationId, table.userId),
  ],
);

export const rescueTeamMembersRelations = relations(rescueTeamMembers, ({ one }) => ({
  rescueOperation: one(rescueOperations, {
    fields: [rescueTeamMembers.rescueOperationId],
    references: [rescueOperations.id],
  }),
  user: one(users, {
    fields: [rescueTeamMembers.userId],
    references: [users.id],
  }),
}));
