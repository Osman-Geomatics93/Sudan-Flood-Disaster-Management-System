import { z } from 'zod';
import { SHELTER_STATUSES } from '../constants/enums.js';
import { uuidSchema, paginationSchema } from './common.schema.js';
import { coordinateSchema, bboxSchema } from '../utils/geo.js';

export const createShelterSchema = z.object({
  name_en: z.string().min(1).max(200),
  name_ar: z.string().max(400).optional(),
  location: coordinateSchema,
  address_en: z.string().optional(),
  address_ar: z.string().optional(),
  stateId: uuidSchema,
  localityId: uuidSchema.optional(),
  managingOrgId: uuidSchema,
  managerUserId: uuidSchema.optional(),
  capacity: z.number().int().min(1),
  hasWater: z.boolean().default(false),
  hasElectricity: z.boolean().default(false),
  hasMedical: z.boolean().default(false),
  hasSanitation: z.boolean().default(false),
  hasKitchen: z.boolean().default(false),
  hasSecurity: z.boolean().default(false),
  facilityNotes: z.string().optional(),
});

export type CreateShelterInput = z.infer<typeof createShelterSchema>;

export const updateShelterSchema = createShelterSchema.partial().extend({
  id: uuidSchema,
});

export const updateOccupancySchema = z.object({
  id: uuidSchema,
  currentOccupancy: z.number().int().min(0),
});

export const updateShelterStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(SHELTER_STATUSES),
});

export const listSheltersSchema = paginationSchema.extend({
  status: z.enum(SHELTER_STATUSES).optional(),
  stateId: uuidSchema.optional(),
  hasCapacity: z.boolean().optional(),
});

export const findNearestSheltersSchema = z.object({
  location: coordinateSchema,
  radiusKm: z.number().min(0.1).max(500).default(50),
  limit: z.number().int().min(1).max(50).default(10),
});

export const getSheltersByBoundsSchema = z.object({
  bbox: bboxSchema,
});
