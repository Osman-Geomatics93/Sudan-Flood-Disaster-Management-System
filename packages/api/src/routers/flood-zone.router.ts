import { router, protectedProcedure, adminProcedure, superAdminProcedure, requirePermission } from '../trpc.js';
import {
  createFloodZoneSchema,
  updateFloodZoneSchema,
  updateSeveritySchema,
  listFloodZonesSchema,
  getByBoundsSchema,
  idParamSchema,
  createFloodIncidentSchema,
  updateFloodIncidentSchema,
  listFloodIncidentsSchema,
} from '@sudanflood/shared';
import {
  listFloodZones,
  getFloodZoneById,
  getFloodZonesByBounds,
  createFloodZone,
  updateFloodZone,
  updateFloodZoneSeverity,
  archiveFloodZone,
  getFloodZoneStats,
} from '../services/flood-zone.service.js';
import {
  listFloodIncidents,
  getFloodIncidentById,
  createFloodIncident,
  updateFloodIncident,
} from '../services/flood-incident.service.js';

const incidentRouter = router({
  list: protectedProcedure.input(listFloodIncidentsSchema).query(async ({ input, ctx }) => {
    return listFloodIncidents(ctx.db, input);
  }),
  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getFloodIncidentById(ctx.db, input.id);
  }),
  create: adminProcedure.input(createFloodIncidentSchema).mutation(async ({ input, ctx }) => {
    return createFloodIncident(ctx.db, input, ctx.user.id);
  }),
  update: adminProcedure.input(updateFloodIncidentSchema).mutation(async ({ input, ctx }) => {
    return updateFloodIncident(ctx.db, input);
  }),
});

export const floodZoneRouter = router({
  list: protectedProcedure.input(listFloodZonesSchema).query(async ({ input, ctx }) => {
    return listFloodZones(ctx.db, input);
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getFloodZoneById(ctx.db, input.id);
  }),

  getByBounds: protectedProcedure.input(getByBoundsSchema).query(async ({ input, ctx }) => {
    return getFloodZonesByBounds(ctx.db, input.bbox);
  }),

  create: adminProcedure
    .use(requirePermission('flood_zone:create'))
    .input(createFloodZoneSchema)
    .mutation(async ({ input, ctx }) => {
      return createFloodZone(ctx.db, input);
    }),

  update: adminProcedure
    .use(requirePermission('flood_zone:update'))
    .input(updateFloodZoneSchema)
    .mutation(async ({ input, ctx }) => {
      return updateFloodZone(ctx.db, input);
    }),

  updateSeverity: protectedProcedure
    .use(requirePermission('flood_zone:update_severity'))
    .input(updateSeveritySchema)
    .mutation(async ({ input, ctx }) => {
      return updateFloodZoneSeverity(ctx.db, input, ctx.user.id);
    }),

  archive: superAdminProcedure.input(idParamSchema).mutation(async ({ input, ctx }) => {
    return archiveFloodZone(ctx.db, input.id);
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getFloodZoneStats(ctx.db);
  }),

  incident: incidentRouter,
});
