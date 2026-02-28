import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createShelterSchema,
  updateShelterSchema,
  updateOccupancySchema,
  updateShelterStatusSchema,
  listSheltersSchema,
  findNearestSheltersSchema,
  getSheltersByBoundsSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listShelters,
  getShelterById,
  findNearestShelters,
  getSheltersByBounds,
  createShelter,
  updateShelter,
  updateOccupancy,
  updateShelterStatus,
  deleteShelter,
  getShelterStats,
} from '../services/shelter.service.js';

export const shelterRouter = router({
  list: protectedProcedure.input(listSheltersSchema).query(async ({ input, ctx }) => {
    return listShelters(ctx.db, input);
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getShelterById(ctx.db, input.id);
  }),

  findNearest: protectedProcedure.input(findNearestSheltersSchema).query(async ({ input, ctx }) => {
    return findNearestShelters(ctx.db, input);
  }),

  getByBounds: protectedProcedure.input(getSheltersByBoundsSchema).query(async ({ input, ctx }) => {
    return getSheltersByBounds(ctx.db, input.bbox);
  }),

  create: adminProcedure
    .use(requirePermission('shelter:create'))
    .input(createShelterSchema)
    .mutation(async ({ input, ctx }) => {
      return createShelter(ctx.db, input);
    }),

  update: adminProcedure
    .use(requirePermission('shelter:update'))
    .input(updateShelterSchema)
    .mutation(async ({ input, ctx }) => {
      return updateShelter(ctx.db, input);
    }),

  updateOccupancy: protectedProcedure
    .use(requirePermission('shelter:update_occupancy'))
    .input(updateOccupancySchema)
    .mutation(async ({ input, ctx }) => {
      return updateOccupancy(ctx.db, input.id, input.currentOccupancy);
    }),

  updateStatus: adminProcedure
    .use(requirePermission('shelter:update'))
    .input(updateShelterStatusSchema)
    .mutation(async ({ input, ctx }) => {
      return updateShelterStatus(ctx.db, input.id, input.status);
    }),

  delete: adminProcedure
    .use(requirePermission('shelter:create'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return deleteShelter(ctx.db, input.id);
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getShelterStats(ctx.db);
  }),
});
