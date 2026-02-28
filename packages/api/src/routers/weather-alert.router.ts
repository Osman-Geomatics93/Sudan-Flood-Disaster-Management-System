import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createWeatherAlertSchema,
  updateWeatherAlertSchema,
  listWeatherAlertsSchema,
  deactivateWeatherAlertSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listWeatherAlerts,
  getActiveAlerts,
  getWeatherAlertById,
  createWeatherAlert,
  updateWeatherAlert,
  deleteWeatherAlert,
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

  getById: protectedProcedure
    .use(requirePermission('weather:read'))
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getWeatherAlertById(ctx.db, input.id);
    }),

  active: protectedProcedure.use(requirePermission('weather:read')).query(async ({ ctx }) => {
    return getActiveAlerts(ctx.db);
  }),

  create: adminProcedure.input(createWeatherAlertSchema).mutation(async ({ input, ctx }) => {
    return createWeatherAlert(ctx.db, input);
  }),

  update: adminProcedure.input(updateWeatherAlertSchema).mutation(async ({ input, ctx }) => {
    return updateWeatherAlert(ctx.db, input);
  }),

  delete: adminProcedure.input(idParamSchema).mutation(async ({ input, ctx }) => {
    return deleteWeatherAlert(ctx.db, input.id);
  }),

  deactivate: adminProcedure
    .input(deactivateWeatherAlertSchema)
    .mutation(async ({ input, ctx }) => {
      return deactivateAlert(ctx.db, input.id);
    }),

  stats: protectedProcedure.use(requirePermission('weather:read')).query(async ({ ctx }) => {
    return getWeatherAlertStats(ctx.db);
  }),
});
