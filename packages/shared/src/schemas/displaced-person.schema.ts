import { z } from 'zod';
import { DISPLACED_PERSON_STATUSES, HEALTH_STATUSES, GENDERS } from '../constants/enums.js';
import { uuidSchema, paginationSchema, sudanPhoneSchema } from './common.schema.js';

export const registerDisplacedPersonSchema = z.object({
  firstName_ar: z.string().min(1).max(200),
  lastName_ar: z.string().min(1).max(200),
  firstName_en: z.string().max(100).optional(),
  lastName_en: z.string().max(100).optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(GENDERS).optional(),
  nationalId: z.string().max(30).optional(),
  phone: sudanPhoneSchema.optional(),
  healthStatus: z.enum(HEALTH_STATUSES).default('unknown'),
  healthNotes: z.string().optional(),
  hasDisability: z.boolean().default(false),
  disabilityNotes: z.string().optional(),
  isUnaccompaniedMinor: z.boolean().default(false),
  familyGroupId: uuidSchema.optional(),
  shelterId: uuidSchema.optional(),
  originStateId: uuidSchema.optional(),
  originLocalityId: uuidSchema.optional(),
  specialNeeds: z.string().optional(),
});

export type RegisterDisplacedPersonInput = z.infer<typeof registerDisplacedPersonSchema>;

export const updateDisplacedPersonSchema = registerDisplacedPersonSchema.partial().extend({
  id: uuidSchema,
  status: z.enum(DISPLACED_PERSON_STATUSES).optional(),
});

export const assignShelterSchema = z.object({
  personId: uuidSchema,
  shelterId: uuidSchema,
});

export const updateHealthSchema = z.object({
  id: uuidSchema,
  healthStatus: z.enum(HEALTH_STATUSES),
  healthNotes: z.string().optional(),
});

export const listDisplacedPersonsSchema = paginationSchema.extend({
  status: z.enum(DISPLACED_PERSON_STATUSES).optional(),
  shelterId: uuidSchema.optional(),
  healthStatus: z.enum(HEALTH_STATUSES).optional(),
  stateId: uuidSchema.optional(),
  search: z.string().max(200).optional(),
});

export const createFamilyGroupSchema = z.object({
  headOfFamilyId: uuidSchema.optional(),
  familySize: z.number().int().min(1),
  originStateId: uuidSchema.optional(),
  originLocalityId: uuidSchema.optional(),
  originAddress: z.string().optional(),
  notes: z.string().optional(),
});

export const addFamilyMemberSchema = z.object({
  familyGroupId: uuidSchema,
  personId: uuidSchema,
});
