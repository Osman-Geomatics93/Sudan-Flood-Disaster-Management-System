import { z } from 'zod';
import { uuidSchema } from './common.schema.js';

export const nearestSheltersSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  requiredCapacity: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(20).default(5),
});

export type NearestSheltersInput = z.infer<typeof nearestSheltersSchema>;

export const shelterRecommendationSchema = z.object({
  personCount: z.number().int().min(1),
  stateId: uuidSchema.optional(),
});

export type ShelterRecommendationInput = z.infer<typeof shelterRecommendationSchema>;
