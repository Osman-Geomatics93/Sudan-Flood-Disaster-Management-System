import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const states = pgTable(
  'states',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 5 }).notNull().unique(),
    name_en: varchar('name_en', { length: 100 }).notNull(),
    name_ar: varchar('name_ar', { length: 200 }).notNull(),
    // geometry handled via raw SQL (PostGIS)
    population: integer('population'),
    area_km2: numeric('area_km2', { precision: 10, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_states_code').on(table.code)],
);

export const statesRelations = relations(states, ({ many }) => ({
  localities: many(localities),
}));

export const localities = pgTable(
  'localities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stateId: uuid('state_id')
      .notNull()
      .references(() => states.id, { onDelete: 'restrict' }),
    code: varchar('code', { length: 10 }).notNull().unique(),
    name_en: varchar('name_en', { length: 150 }).notNull(),
    name_ar: varchar('name_ar', { length: 300 }).notNull(),
    population: integer('population'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_localities_state').on(table.stateId),
    index('idx_localities_code').on(table.code),
  ],
);

export const localitiesRelations = relations(localities, ({ one }) => ({
  state: one(states, {
    fields: [localities.stateId],
    references: [states.id],
  }),
}));
