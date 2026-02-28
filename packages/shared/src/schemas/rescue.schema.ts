import { z } from 'zod';
import { RESCUE_OPERATION_TYPES, OPERATION_STATUSES, TASK_PRIORITIES } from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { coordinateSchema } from '../utils/geo.js';

export const createRescueOperationSchema = z.object({
  floodZoneId: uuidSchema,
  assignedOrgId: uuidSchema,
  operationType: z.enum(RESCUE_OPERATION_TYPES),
  priority: z.enum(TASK_PRIORITIES).default('high'),
  title_en: z.string().min(1).max(300),
  title_ar: z.string().max(600).optional(),
  description: z.string().optional(),
  targetLocation: coordinateSchema,
  estimatedPersonsAtRisk: z.number().int().min(0).optional(),
  teamLeaderId: uuidSchema.optional(),
});

export type CreateRescueOperationInput = z.infer<typeof createRescueOperationSchema>;

export const updateRescueStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(OPERATION_STATUSES),
  personsRescued: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const updateRescueLocationSchema = z.object({
  id: uuidSchema,
  currentLocation: coordinateSchema,
});

export const assignTeamSchema = z.object({
  operationId: uuidSchema,
  userIds: z.array(uuidSchema).min(1),
  leaderId: uuidSchema.optional(),
});

export const completeRescueSchema = z.object({
  id: uuidSchema,
  personsRescued: z.number().int().min(0),
  notes: z.string().optional(),
});

export const listRescueOperationsSchema = paginationSchema.extend({
  status: z.enum(OPERATION_STATUSES).optional(),
  zoneId: uuidSchema.optional(),
  orgId: uuidSchema.optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});
