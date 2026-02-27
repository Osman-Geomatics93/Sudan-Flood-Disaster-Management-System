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
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { taskStatusEnum, taskPriorityEnum } from './enums.js';
import { floodIncidents, floodZones } from './flood-zones.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskCode: varchar('task_code', { length: 30 }).notNull().unique(),
    incidentId: uuid('incident_id').references(() => floodIncidents.id, { onDelete: 'set null' }),
    floodZoneId: uuid('flood_zone_id').references(() => floodZones.id, { onDelete: 'set null' }),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('draft'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    assignedToOrgId: uuid('assigned_to_org_id')
      .notNull()
      .references(() => organizations.id),
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
    createdByOrgId: uuid('created_by_org_id')
      .notNull()
      .references(() => organizations.id),
    createdByUserId: uuid('created_by_user_id')
      .notNull()
      .references(() => users.id),
    parentTaskId: uuid('parent_task_id'),
    deadline: timestamp('deadline', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    completionNotes: text('completion_notes'),
    progressPct: integer('progress_pct').default(0),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_tasks_incident').on(table.incidentId),
    index('idx_tasks_zone').on(table.floodZoneId),
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_priority').on(table.priority),
    index('idx_tasks_assigned_org').on(table.assignedToOrgId),
    index('idx_tasks_assigned_user').on(table.assignedToUserId),
    check('chk_progress', sql`${table.progressPct} >= 0 AND ${table.progressPct} <= 100`),
  ],
);

export const tasksRelations = relations(tasks, ({ one }) => ({
  incident: one(floodIncidents, { fields: [tasks.incidentId], references: [floodIncidents.id] }),
  floodZone: one(floodZones, { fields: [tasks.floodZoneId], references: [floodZones.id] }),
  assignedToOrg: one(organizations, {
    fields: [tasks.assignedToOrgId],
    references: [organizations.id],
    relationName: 'assignedOrg',
  }),
  assignedToUser: one(users, {
    fields: [tasks.assignedToUserId],
    references: [users.id],
    relationName: 'assignedUser',
  }),
  createdByOrg: one(organizations, {
    fields: [tasks.createdByOrgId],
    references: [organizations.id],
    relationName: 'createdByOrg',
  }),
  createdByUser: one(users, {
    fields: [tasks.createdByUserId],
    references: [users.id],
    relationName: 'createdByUser',
  }),
}));

export const taskDependencies = pgTable(
  'task_dependencies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    dependsOnTaskId: uuid('depends_on_task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_task_deps_task').on(table.taskId),
    index('idx_task_deps_depends').on(table.dependsOnTaskId),
    unique('uq_task_dependency').on(table.taskId, table.dependsOnTaskId),
  ],
);
