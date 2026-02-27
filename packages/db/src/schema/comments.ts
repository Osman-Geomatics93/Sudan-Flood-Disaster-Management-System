import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';
import { tasks } from './tasks.js';
import { rescueOperations } from './rescue-operations.js';
import { floodZones, floodIncidents } from './flood-zones.js';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
    rescueOperationId: uuid('rescue_operation_id').references(() => rescueOperations.id, {
      onDelete: 'cascade',
    }),
    floodZoneId: uuid('flood_zone_id').references(() => floodZones.id, { onDelete: 'cascade' }),
    incidentId: uuid('incident_id').references(() => floodIncidents.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    parentCommentId: uuid('parent_comment_id').references((): never => comments.id as never, {
      onDelete: 'cascade',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_comments_user').on(table.userId),
    index('idx_comments_task').on(table.taskId),
    index('idx_comments_rescue').on(table.rescueOperationId),
    index('idx_comments_zone').on(table.floodZoneId),
    index('idx_comments_incident').on(table.incidentId),
    index('idx_comments_parent').on(table.parentCommentId),
  ],
);

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
  rescueOperation: one(rescueOperations, {
    fields: [comments.rescueOperationId],
    references: [rescueOperations.id],
  }),
  floodZone: one(floodZones, {
    fields: [comments.floodZoneId],
    references: [floodZones.id],
  }),
  incident: one(floodIncidents, {
    fields: [comments.incidentId],
    references: [floodIncidents.id],
  }),
}));
