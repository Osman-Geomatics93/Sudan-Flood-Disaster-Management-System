import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { shelterStatusEnum } from './enums.js';
import { states, localities } from './locations.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const shelters = pgTable(
  'shelters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    shelterCode: varchar('shelter_code', { length: 30 }).notNull().unique(),
    name_en: varchar('name_en', { length: 200 }).notNull(),
    name_ar: varchar('name_ar', { length: 400 }),
    status: shelterStatusEnum('status').notNull().default('preparing'),
    // location geometry handled via raw SQL
    address_en: text('address_en'),
    address_ar: text('address_ar'),
    stateId: uuid('state_id')
      .notNull()
      .references(() => states.id),
    localityId: uuid('locality_id').references(() => localities.id),
    managingOrgId: uuid('managing_org_id')
      .notNull()
      .references(() => organizations.id),
    managerUserId: uuid('manager_user_id').references(() => users.id),
    capacity: integer('capacity').notNull(),
    currentOccupancy: integer('current_occupancy').notNull().default(0),
    hasWater: boolean('has_water').default(false),
    hasElectricity: boolean('has_electricity').default(false),
    hasMedical: boolean('has_medical').default(false),
    hasSanitation: boolean('has_sanitation').default(false),
    hasKitchen: boolean('has_kitchen').default(false),
    hasSecurity: boolean('has_security').default(false),
    facilityNotes: text('facility_notes'),
    openedAt: timestamp('opened_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_shelters_status').on(table.status),
    index('idx_shelters_state').on(table.stateId),
    index('idx_shelters_org').on(table.managingOrgId),
  ],
);

export const sheltersRelations = relations(shelters, ({ one }) => ({
  state: one(states, { fields: [shelters.stateId], references: [states.id] }),
  locality: one(localities, { fields: [shelters.localityId], references: [localities.id] }),
  managingOrg: one(organizations, {
    fields: [shelters.managingOrgId],
    references: [organizations.id],
  }),
  manager: one(users, { fields: [shelters.managerUserId], references: [users.id] }),
}));
