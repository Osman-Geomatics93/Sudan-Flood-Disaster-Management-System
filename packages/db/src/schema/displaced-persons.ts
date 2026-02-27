import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  text,
  date,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { displacedPersonStatusEnum, healthStatusEnum } from './enums.js';
import { states, localities } from './locations.js';
import { shelters } from './shelters.js';
import { users } from './users.js';

export const familyGroups = pgTable(
  'family_groups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    familyCode: varchar('family_code', { length: 30 }).notNull().unique(),
    headOfFamilyId: uuid('head_of_family_id'),
    familySize: integer('family_size').notNull().default(1),
    originStateId: uuid('origin_state_id').references(() => states.id),
    originLocalityId: uuid('origin_locality_id').references(() => localities.id),
    originAddress: text('origin_address'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_family_groups_code').on(table.familyCode),
    index('idx_family_groups_origin').on(table.originStateId),
  ],
);

export const displacedPersons = pgTable(
  'displaced_persons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    registrationCode: varchar('registration_code', { length: 30 }).notNull().unique(),
    familyGroupId: uuid('family_group_id').references(() => familyGroups.id, {
      onDelete: 'set null',
    }),
    firstName_ar: varchar('first_name_ar', { length: 200 }).notNull(),
    lastName_ar: varchar('last_name_ar', { length: 200 }).notNull(),
    firstName_en: varchar('first_name_en', { length: 100 }),
    lastName_en: varchar('last_name_en', { length: 100 }),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', { length: 10 }),
    nationalId: varchar('national_id', { length: 30 }),
    phone: varchar('phone', { length: 20 }),
    status: displacedPersonStatusEnum('status').notNull().default('registered'),
    healthStatus: healthStatusEnum('health_status').notNull().default('unknown'),
    healthNotes: text('health_notes'),
    hasDisability: boolean('has_disability').default(false),
    disabilityNotes: text('disability_notes'),
    isUnaccompaniedMinor: boolean('is_unaccompanied_minor').default(false),
    currentShelterId: uuid('current_shelter_id').references(() => shelters.id, {
      onDelete: 'set null',
    }),
    originStateId: uuid('origin_state_id').references(() => states.id),
    originLocalityId: uuid('origin_locality_id').references(() => localities.id),
    photoUrl: varchar('photo_url', { length: 1000 }),
    registeredByUserId: uuid('registered_by_user_id').references(() => users.id),
    registeredAt: timestamp('registered_at', { withTimezone: true }).notNull().defaultNow(),
    specialNeeds: text('special_needs'),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_dp_family').on(table.familyGroupId),
    index('idx_dp_status').on(table.status),
    index('idx_dp_health').on(table.healthStatus),
    index('idx_dp_shelter').on(table.currentShelterId),
    index('idx_dp_registration').on(table.registrationCode),
    index('idx_dp_origin').on(table.originStateId),
  ],
);

export const familyGroupsRelations = relations(familyGroups, ({ one, many }) => ({
  originState: one(states, { fields: [familyGroups.originStateId], references: [states.id] }),
  members: many(displacedPersons),
}));

export const displacedPersonsRelations = relations(displacedPersons, ({ one }) => ({
  familyGroup: one(familyGroups, {
    fields: [displacedPersons.familyGroupId],
    references: [familyGroups.id],
  }),
  currentShelter: one(shelters, {
    fields: [displacedPersons.currentShelterId],
    references: [shelters.id],
  }),
  originState: one(states, {
    fields: [displacedPersons.originStateId],
    references: [states.id],
  }),
  registeredBy: one(users, {
    fields: [displacedPersons.registeredByUserId],
    references: [users.id],
  }),
}));
