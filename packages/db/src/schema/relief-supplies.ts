import {
  pgTable,
  uuid,
  varchar,
  numeric,
  text,
  timestamp,
  jsonb,
  index,
  date,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { supplyTypeEnum, supplyStatusEnum } from './enums.js';
import { organizations } from './organizations.js';
import { shelters } from './shelters.js';
import { users } from './users.js';
import { states } from './locations.js';

export const reliefSupplies = pgTable(
  'relief_supplies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    trackingCode: varchar('tracking_code', { length: 30 }).notNull().unique(),
    supplyType: supplyTypeEnum('supply_type').notNull(),
    status: supplyStatusEnum('status').notNull().default('requested'),
    itemName_en: varchar('item_name_en', { length: 200 }).notNull(),
    itemName_ar: varchar('item_name_ar', { length: 400 }),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    unitCostSdg: numeric('unit_cost_sdg', { precision: 12, scale: 2 }),
    totalCostSdg: numeric('total_cost_sdg', { precision: 14, scale: 2 }),
    sourceOrgId: uuid('source_org_id')
      .notNull()
      .references(() => organizations.id),
    destinationOrgId: uuid('destination_org_id').references(() => organizations.id),
    destinationShelterId: uuid('destination_shelter_id').references(() => shelters.id),
    // origin_location, destination_location, current_location handled via raw SQL (geometry)
    stateId: uuid('state_id').references(() => states.id),
    expiryDate: date('expiry_date'),
    shippedAt: timestamp('shipped_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    distributedAt: timestamp('distributed_at', { withTimezone: true }),
    requestedByUserId: uuid('requested_by_user_id').references(() => users.id),
    approvedByUserId: uuid('approved_by_user_id').references(() => users.id),
    notes: text('notes'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_relief_supplies_type').on(table.supplyType),
    index('idx_relief_supplies_status').on(table.status),
    index('idx_relief_supplies_source_org').on(table.sourceOrgId),
    index('idx_relief_supplies_dest_shelter').on(table.destinationShelterId),
    index('idx_relief_supplies_state').on(table.stateId),
  ],
);

export const reliefSuppliesRelations = relations(reliefSupplies, ({ one }) => ({
  sourceOrg: one(organizations, {
    fields: [reliefSupplies.sourceOrgId],
    references: [organizations.id],
    relationName: 'sourceOrg',
  }),
  destinationOrg: one(organizations, {
    fields: [reliefSupplies.destinationOrgId],
    references: [organizations.id],
    relationName: 'destinationOrg',
  }),
  destinationShelter: one(shelters, {
    fields: [reliefSupplies.destinationShelterId],
    references: [shelters.id],
  }),
  state: one(states, {
    fields: [reliefSupplies.stateId],
    references: [states.id],
  }),
  requestedBy: one(users, {
    fields: [reliefSupplies.requestedByUserId],
    references: [users.id],
    relationName: 'requestedBy',
  }),
  approvedBy: one(users, {
    fields: [reliefSupplies.approvedByUserId],
    references: [users.id],
    relationName: 'approvedBy',
  }),
}));
