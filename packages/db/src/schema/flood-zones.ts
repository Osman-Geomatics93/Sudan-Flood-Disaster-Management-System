import {
  pgTable,
  uuid,
  varchar,
  integer,
  numeric,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import {
  floodSeverityEnum,
  floodZoneStatusEnum,
  incidentTypeEnum,
  incidentStatusEnum,
} from './enums.js';
import { states, localities } from './locations.js';
import { organizations } from './organizations.js';
import { users } from './users.js';

export const floodIncidents = pgTable(
  'flood_incidents',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    incidentCode: varchar('incident_code', { length: 30 }).notNull().unique(),
    incidentType: incidentTypeEnum('incident_type').notNull(),
    status: incidentStatusEnum('status').notNull().default('reported'),
    title_en: varchar('title_en', { length: 300 }).notNull(),
    title_ar: varchar('title_ar', { length: 600 }),
    description_en: text('description_en'),
    description_ar: text('description_ar'),
    severity: floodSeverityEnum('severity').notNull().default('moderate'),
    stateId: uuid('state_id')
      .notNull()
      .references(() => states.id),
    localityId: uuid('locality_id').references(() => localities.id),
    estimatedAffectedPopulation: integer('estimated_affected_population').default(0),
    startDate: timestamp('start_date', { withTimezone: true }).notNull(),
    endDate: timestamp('end_date', { withTimezone: true }),
    declaredByUserId: uuid('declared_by_user_id').references(() => users.id),
    leadOrgId: uuid('lead_org_id').references(() => organizations.id),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_flood_incidents_status').on(table.status),
    index('idx_flood_incidents_severity').on(table.severity),
    index('idx_flood_incidents_state').on(table.stateId),
    index('idx_flood_incidents_date').on(table.startDate),
  ],
);

export const floodIncidentsRelations = relations(floodIncidents, ({ one, many }) => ({
  state: one(states, { fields: [floodIncidents.stateId], references: [states.id] }),
  locality: one(localities, { fields: [floodIncidents.localityId], references: [localities.id] }),
  declaredBy: one(users, { fields: [floodIncidents.declaredByUserId], references: [users.id] }),
  leadOrg: one(organizations, { fields: [floodIncidents.leadOrgId], references: [organizations.id] }),
  floodZones: many(floodZones),
}));

export const floodZones = pgTable(
  'flood_zones',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    incidentId: uuid('incident_id').references(() => floodIncidents.id, { onDelete: 'set null' }),
    zoneCode: varchar('zone_code', { length: 30 }).notNull().unique(),
    name_en: varchar('name_en', { length: 200 }).notNull(),
    name_ar: varchar('name_ar', { length: 400 }),
    severity: floodSeverityEnum('severity').notNull(),
    status: floodZoneStatusEnum('status').notNull().default('monitoring'),
    // geometry columns handled via raw SQL for PostGIS
    area_km2: numeric('area_km2', { precision: 12, scale: 4 }),
    waterLevel_m: numeric('water_level_m', { precision: 6, scale: 2 }),
    waterLevelTrend: varchar('water_level_trend', { length: 20 }),
    maxWaterLevel_m: numeric('max_water_level_m', { precision: 6, scale: 2 }),
    affectedPopulation: integer('affected_population').default(0),
    stateId: uuid('state_id')
      .notNull()
      .references(() => states.id),
    localityId: uuid('locality_id').references(() => localities.id),
    monitoredByOrgId: uuid('monitored_by_org_id').references(() => organizations.id),
    lastAssessedAt: timestamp('last_assessed_at', { withTimezone: true }),
    lastAssessedBy: uuid('last_assessed_by').references(() => users.id),
    metadata: jsonb('metadata').default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_flood_zones_incident').on(table.incidentId),
    index('idx_flood_zones_severity').on(table.severity),
    index('idx_flood_zones_status').on(table.status),
    index('idx_flood_zones_state').on(table.stateId),
  ],
);

export const floodZonesRelations = relations(floodZones, ({ one }) => ({
  incident: one(floodIncidents, {
    fields: [floodZones.incidentId],
    references: [floodIncidents.id],
  }),
  state: one(states, { fields: [floodZones.stateId], references: [states.id] }),
  locality: one(localities, { fields: [floodZones.localityId], references: [localities.id] }),
  monitoredByOrg: one(organizations, {
    fields: [floodZones.monitoredByOrgId],
    references: [organizations.id],
  }),
  lastAssessedByUser: one(users, {
    fields: [floodZones.lastAssessedBy],
    references: [users.id],
  }),
}));
