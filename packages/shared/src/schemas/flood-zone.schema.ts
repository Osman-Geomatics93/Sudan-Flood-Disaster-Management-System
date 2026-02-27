import { z } from 'zod';
import {
  FLOOD_SEVERITIES,
  FLOOD_ZONE_STATUSES,
  INCIDENT_TYPES,
  INCIDENT_STATUSES,
} from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { geoJsonPolygonSchema, bboxSchema } from '../utils/geo.js';

export const createFloodZoneSchema = z.object({
  name_en: z.string().min(1).max(200),
  name_ar: z.string().max(400).optional(),
  severity: z.enum(FLOOD_SEVERITIES),
  status: z.enum(FLOOD_ZONE_STATUSES).default('monitoring'),
  geometry: geoJsonPolygonSchema,
  stateId: uuidSchema,
  localityId: uuidSchema.optional(),
  incidentId: uuidSchema.optional(),
  waterLevel: z.number().min(0).max(100).optional(),
  waterLevelTrend: z.enum(['rising', 'stable', 'falling']).optional(),
  affectedPopulation: z.number().int().min(0).optional(),
  monitoredByOrgId: uuidSchema.optional(),
});

export type CreateFloodZoneInput = z.infer<typeof createFloodZoneSchema>;

export const updateFloodZoneSchema = createFloodZoneSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateFloodZoneInput = z.infer<typeof updateFloodZoneSchema>;

export const updateSeveritySchema = z.object({
  id: uuidSchema,
  severity: z.enum(FLOOD_SEVERITIES),
  waterLevel: z.number().min(0).max(100).optional(),
  waterLevelTrend: z.enum(['rising', 'stable', 'falling']).optional(),
});

export const listFloodZonesSchema = paginationSchema.extend({
  severity: z.enum(FLOOD_SEVERITIES).optional(),
  status: z.enum(FLOOD_ZONE_STATUSES).optional(),
  stateId: uuidSchema.optional(),
  incidentId: uuidSchema.optional(),
  bbox: bboxSchema.optional(),
});

export type ListFloodZonesInput = z.infer<typeof listFloodZonesSchema>;

export const getByBoundsSchema = z.object({
  bbox: bboxSchema,
});

// --- Flood Incident schemas ---

export const createFloodIncidentSchema = z.object({
  title_en: z.string().min(1).max(300),
  title_ar: z.string().max(600).optional(),
  incidentType: z.enum(INCIDENT_TYPES),
  status: z.enum(INCIDENT_STATUSES).default('reported'),
  severity: z.enum(FLOOD_SEVERITIES),
  stateId: uuidSchema,
  localityId: uuidSchema.optional(),
  startDate: z.coerce.date(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  affectedArea: geoJsonPolygonSchema.optional(),
  estimatedAffectedPopulation: z.number().int().min(0).optional(),
  leadOrgId: uuidSchema.optional(),
});

export type CreateFloodIncidentInput = z.infer<typeof createFloodIncidentSchema>;

export const updateFloodIncidentSchema = createFloodIncidentSchema.partial().extend({
  id: uuidSchema,
});

export const listFloodIncidentsSchema = paginationSchema.extend({
  status: z.enum(INCIDENT_STATUSES).optional(),
  stateId: uuidSchema.optional(),
});
