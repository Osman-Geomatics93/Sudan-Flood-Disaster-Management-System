import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createWeatherAlertSchema,
  listWeatherAlertsSchema,
  deactivateWeatherAlertSchema,
} from '@sudanflood/shared';
import {
  listWeatherAlerts,
  getActiveAlerts,
  createWeatherAlert,
  deactivateAlert,
  getWeatherAlertStats,
} from '../services/weather-alert.service.js';

export const weatherAlertRouter = router({
  list: protectedProcedure
    .use(requirePermission('weather:read'))
    .input(listWeatherAlertsSchema)
    .query(async ({ input, ctx }) => {
      return listWeatherAlerts(ctx.db, input);
    }),

  active: protectedProcedure
    .use(requirePermission('weather:read'))
    .query(async ({ ctx }) => {
      return getActiveAlerts(ctx.db);
    }),

  create: adminProcedure
    .input(createWeatherAlertSchema)
    .mutation(async ({ input, ctx }) => {
      return createWeatherAlert(ctx.db, input);
    }),

  deactivate: adminProcedure
    .input(deactivateWeatherAlertSchema)
    .mutation(async ({ input, ctx }) => {
      return deactivateAlert(ctx.db, input.id);
    }),

  stats: protectedProcedure
    .use(requirePermission('weather:read'))
    .query(async ({ ctx }) => {
      return getWeatherAlertStats(ctx.db);
    }),
});
