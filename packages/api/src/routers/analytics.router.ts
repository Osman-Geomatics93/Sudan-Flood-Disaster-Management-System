import { router, adminProcedure } from '../trpc.js';
import { displacementTrendSchema, shelterRankingSchema } from '@sudanflood/shared';
import {
  getDisplacementTrend,
  getSupplyStatsByType,
  getShelterOccupancyRanking,
  getResponseTimeStats,
  getEmergencyCallsByUrgency,
} from '../services/analytics.service.js';

export const analyticsRouter = router({
  displacementTrend: adminProcedure.input(displacementTrendSchema).query(async ({ input, ctx }) => {
    return getDisplacementTrend(ctx.db, input.days);
  }),

  supplyByType: adminProcedure.query(async ({ ctx }) => {
    return getSupplyStatsByType(ctx.db);
  }),

  shelterRanking: adminProcedure.input(shelterRankingSchema).query(async ({ input, ctx }) => {
    return getShelterOccupancyRanking(ctx.db, input.limit);
  }),

  responseTime: adminProcedure.query(async ({ ctx }) => {
    return getResponseTimeStats(ctx.db);
  }),

  emergencyCallsByUrgency: adminProcedure.query(async ({ ctx }) => {
    return getEmergencyCallsByUrgency(ctx.db);
  }),
});
