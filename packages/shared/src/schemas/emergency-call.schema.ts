import { z } from 'zod';
import { CALL_URGENCIES, CALL_STATUSES } from '../constants/enums.js';
import { uuidSchema, paginationSchema, sudanPhoneSchema } from './common.schema.js';
import { coordinateSchema } from '../utils/geo.js';

export const createEmergencyCallSchema = z.object({
  callerName: z.string().max(200).optional(),
  callerPhone: sudanPhoneSchema,
  callerLocation: coordinateSchema.optional(),
  callerAddress: z.string().optional(),
  callNumber: z.enum(['999', '112']),
  urgency: z.enum(CALL_URGENCIES).default('medium'),
  description_ar: z.string().optional(),
  description_en: z.string().optional(),
  personsAtRisk: z.number().int().min(0).optional(),
  stateId: uuidSchema.optional(),
  floodZoneId: uuidSchema.optional(),
});

export type CreateEmergencyCallInput = z.infer<typeof createEmergencyCallSchema>;

export const triageCallSchema = z.object({
  id: uuidSchema,
  urgency: z.enum(CALL_URGENCIES),
  floodZoneId: uuidSchema.optional(),
  notes: z.string().optional(),
});

export const dispatchCallSchema = z.object({
  id: uuidSchema,
  dispatchToOrgId: uuidSchema,
  createRescue: z.boolean().default(false),
});

export const resolveCallSchema = z.object({
  id: uuidSchema,
  notes: z.string().optional(),
});

export const listEmergencyCallsSchema = paginationSchema.extend({
  status: z.enum(CALL_STATUSES).optional(),
  urgency: z.enum(CALL_URGENCIES).optional(),
  stateId: uuidSchema.optional(),
});
