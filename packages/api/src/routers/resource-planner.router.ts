import { router, adminProcedure } from '../trpc.js';
import { nearestSheltersSchema, shelterRecommendationSchema } from '@sudanflood/shared';
import {
  findNearestAvailableShelters,
  getSupplyGapAnalysis,
  getCriticalShortages,
  getShelterRecommendation,
} from '../services/resource-planner.service.js';

export const resourcePlannerRouter = router({
  nearestShelters: adminProcedure
    .input(nearestSheltersSchema)
    .query(async ({ input, ctx }) => {
      return findNearestAvailableShelters(ctx.db, input);
    }),

  supplyGaps: adminProcedure.query(async ({ ctx }) => {
    return getSupplyGapAnalysis(ctx.db);
  }),

  criticalShortages: adminProcedure.query(async ({ ctx }) => {
    return getCriticalShortages(ctx.db);
  }),

  shelterRecommendation: adminProcedure
    .input(shelterRecommendationSchema)
    .query(async ({ input, ctx }) => {
      return getShelterRecommendation(ctx.db, input);
    }),
});
