import { pgTable, uuid, varchar, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { orgTypeEnum } from './enums.js';
import { states } from './locations.js';

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name_en: varchar('name_en', { length: 200 }).notNull(),
    name_ar: varchar('name_ar', { length: 400 }).notNull(),
    acronym: varchar('acronym', { length: 20 }),
    orgType: orgTypeEnum('org_type').notNull(),
    parentOrgId: uuid('parent_org_id').references((): never => organizations.id as never, {
      onDelete: 'set null',
    }),
    contactEmail: varchar('contact_email', { length: 255 }),
    contactPhone: varchar('contact_phone', { length: 20 }),
    website: varchar('website', { length: 500 }),
    logoUrl: varchar('logo_url', { length: 1000 }),
    headquartersStateId: uuid('headquarters_state_id').references(() => states.id),
    isActive: boolean('is_active').notNull().default(true),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_organizations_type').on(table.orgType),
    index('idx_organizations_parent').on(table.parentOrgId),
    index('idx_organizations_active').on(table.isActive),
  ],
);

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  parentOrg: one(organizations, {
    fields: [organizations.parentOrgId],
    references: [organizations.id],
    relationName: 'parentOrg',
  }),
  childOrgs: many(organizations, { relationName: 'parentOrg' }),
  headquartersState: one(states, {
    fields: [organizations.headquartersStateId],
    references: [states.id],
  }),
}));
