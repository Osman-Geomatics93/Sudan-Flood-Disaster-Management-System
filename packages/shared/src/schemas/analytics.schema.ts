import { z } from 'zod';

export const displacementTrendSchema = z.object({
  days: z.coerce.number().int().min(7).max(365).default(30),
});

export type DisplacementTrendInput = z.infer<typeof displacementTrendSchema>;

export const shelterRankingSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type ShelterRankingInput = z.infer<typeof shelterRankingSchema>;
