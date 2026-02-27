import { router, protectedProcedure, requirePermission } from '../trpc.js';
import {
  requestSupplySchema,
  approveSupplySchema,
  shipSupplySchema,
  updateSupplyLocationSchema,
  listSuppliesSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listSupplies,
  getSupplyById,
  requestSupply,
  approveSupply,
  rejectSupply,
  shipSupply,
  markDelivered,
  updateSupplyLocation,
  cancelSupply,
  getSupplyStats,
} from '../services/supply.service.js';

export const supplyRouter = router({
  list: protectedProcedure
    .use(requirePermission('supply:read'))
    .input(listSuppliesSchema)
    .query(async ({ input, ctx }) => {
      return listSupplies(ctx.db, input);
    }),

  getById: protectedProcedure
    .use(requirePermission('supply:read'))
    .input(idParamSchema)
    .query(async ({ input, ctx }) => {
      return getSupplyById(ctx.db, input.id);
    }),

  request: protectedProcedure
    .use(requirePermission('supply:request'))
    .input(requestSupplySchema)
    .mutation(async ({ input, ctx }) => {
      return requestSupply(ctx.db, input, ctx.user.id);
    }),

  approve: protectedProcedure
    .use(requirePermission('supply:approve'))
    .input(approveSupplySchema)
    .mutation(async ({ input, ctx }) => {
      return approveSupply(ctx.db, input.id, ctx.user.id, input.unitCostSdg);
    }),

  reject: protectedProcedure
    .use(requirePermission('supply:approve'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return rejectSupply(ctx.db, input.id);
    }),

  ship: protectedProcedure
    .use(requirePermission('supply:update'))
    .input(shipSupplySchema)
    .mutation(async ({ input, ctx }) => {
      return shipSupply(ctx.db, input.id, input.originLocation);
    }),

  markDelivered: protectedProcedure
    .use(requirePermission('supply:update'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return markDelivered(ctx.db, input.id);
    }),

  updateLocation: protectedProcedure
    .use(requirePermission('supply:update'))
    .input(updateSupplyLocationSchema)
    .mutation(async ({ input, ctx }) => {
      return updateSupplyLocation(ctx.db, input.id, input.currentLocation);
    }),

  cancel: protectedProcedure
    .use(requirePermission('supply:update'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return cancelSupply(ctx.db, input.id);
    }),

  stats: protectedProcedure
    .use(requirePermission('supply:read'))
    .query(async ({ ctx }) => {
      return getSupplyStats(ctx.db);
    }),
});
