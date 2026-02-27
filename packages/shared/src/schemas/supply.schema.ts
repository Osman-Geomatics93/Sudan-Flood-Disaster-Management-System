import { z } from 'zod';
import { SUPPLY_TYPES, SUPPLY_STATUSES } from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { coordinateSchema } from '../utils/geo.js';

export const requestSupplySchema = z.object({
  supplyType: z.enum(SUPPLY_TYPES),
  itemName_en: z.string().min(1).max(200),
  itemName_ar: z.string().max(400).optional(),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(50),
  sourceOrgId: uuidSchema,
  destinationOrgId: uuidSchema.optional(),
  destinationShelterId: uuidSchema.optional(),
  stateId: uuidSchema.optional(),
  expiryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type RequestSupplyInput = z.infer<typeof requestSupplySchema>;

export const approveSupplySchema = z.object({
  id: uuidSchema,
  unitCostSdg: z.number().min(0).optional(),
});

export const shipSupplySchema = z.object({
  id: uuidSchema,
  originLocation: coordinateSchema,
});

export const updateSupplyLocationSchema = z.object({
  id: uuidSchema,
  currentLocation: coordinateSchema,
});

export const listSuppliesSchema = paginationSchema.extend({
  type: z.enum(SUPPLY_TYPES).optional(),
  status: z.enum(SUPPLY_STATUSES).optional(),
  sourceOrgId: uuidSchema.optional(),
  destOrgId: uuidSchema.optional(),
});
