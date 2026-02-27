import { z } from 'zod';
import { ORG_TYPES } from '../constants/enums.js';
import { uuidSchema, paginationSchema, sudanPhoneSchema } from './common.schema.js';

export const createOrganizationSchema = z.object({
  name_en: z.string().min(1).max(200),
  name_ar: z.string().min(1).max(400),
  acronym: z.string().max(20).optional(),
  orgType: z.enum(ORG_TYPES),
  parentOrgId: uuidSchema.optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: sudanPhoneSchema.optional(),
  website: z.string().url().max(500).optional(),
  headquartersStateId: uuidSchema.optional(),
  operatingStates: z.array(uuidSchema).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  id: uuidSchema,
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const listOrganizationsSchema = paginationSchema.extend({
  search: z.string().max(200).optional(),
  type: z.enum(ORG_TYPES).optional(),
  stateId: uuidSchema.optional(),
});

export type ListOrganizationsInput = z.infer<typeof listOrganizationsSchema>;
