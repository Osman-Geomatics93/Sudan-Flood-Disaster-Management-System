import { z } from 'zod';
import { REPORT_TYPES, CITIZEN_REPORT_TYPES, CITIZEN_REPORT_STATUSES, CALL_URGENCIES } from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { coordinateSchema } from '../utils/geo.js';

// ── Situation Reports ─────────────────────────────────────────────

export const listSituationReportsSchema = paginationSchema.extend({
  incidentId: uuidSchema.optional(),
  reportType: z.enum(REPORT_TYPES).optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type ListSituationReportsInput = z.infer<typeof listSituationReportsSchema>;

export const createSituationReportSchema = z.object({
  incidentId: uuidSchema,
  reportType: z.enum(REPORT_TYPES),
  title_en: z.string().min(1).max(300),
  title_ar: z.string().max(600).optional(),
  summary_en: z.string().optional(),
  summary_ar: z.string().optional(),
  content: z.record(z.unknown()).optional(),
  stateId: uuidSchema.optional(),
});

export type CreateSituationReportInput = z.infer<typeof createSituationReportSchema>;

export const publishReportSchema = z.object({
  id: uuidSchema,
});

export type PublishReportInput = z.infer<typeof publishReportSchema>;

// ── Citizen Reports ───────────────────────────────────────────────

export const listCitizenReportsSchema = paginationSchema.extend({
  status: z.enum(CITIZEN_REPORT_STATUSES).optional(),
  urgency: z.enum(CALL_URGENCIES).optional(),
  stateId: uuidSchema.optional(),
  reportType: z.enum(CITIZEN_REPORT_TYPES).optional(),
});

export type ListCitizenReportsInput = z.infer<typeof listCitizenReportsSchema>;

export const createCitizenReportSchema = z.object({
  reportType: z.enum(CITIZEN_REPORT_TYPES),
  urgency: z.enum(CALL_URGENCIES).default('medium'),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  location: coordinateSchema.optional(),
  reporterPhone: z.string().max(20).optional(),
  reporterName: z.string().max(200).optional(),
  stateId: uuidSchema.optional(),
  localityId: uuidSchema.optional(),
});

export type CreateCitizenReportInput = z.infer<typeof createCitizenReportSchema>;

export const reviewCitizenReportSchema = z.object({
  id: uuidSchema,
  status: z.enum(CITIZEN_REPORT_STATUSES),
  linkedTaskId: uuidSchema.optional(),
  linkedRescueId: uuidSchema.optional(),
});

export type ReviewCitizenReportInput = z.infer<typeof reviewCitizenReportSchema>;
