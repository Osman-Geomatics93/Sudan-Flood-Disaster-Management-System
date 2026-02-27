import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createRescueOperationSchema,
  updateRescueStatusSchema,
  updateRescueLocationSchema,
  assignTeamSchema,
  completeRescueSchema,
  listRescueOperationsSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listRescueOperations,
  getRescueOperationById,
  createRescueOperation,
  dispatchRescueOperation,
  updateRescueStatus,
  updateRescueLocation,
  assignTeam,
  completeRescueOperation,
  getActiveByZone,
  getRescueStats,
} from '../services/rescue.service.js';

export const rescueRouter = router({
  list: protectedProcedure.input(listRescueOperationsSchema).query(async ({ input, ctx }) => {
    return listRescueOperations(ctx.db, input);
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getRescueOperationById(ctx.db, input.id);
  }),

  create: adminProcedure
    .use(requirePermission('rescue:create'))
    .input(createRescueOperationSchema)
    .mutation(async ({ input, ctx }) => {
      return createRescueOperation(ctx.db, input);
    }),

  dispatch: adminProcedure
    .use(requirePermission('rescue:dispatch'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return dispatchRescueOperation(ctx.db, input.id);
    }),

  updateStatus: protectedProcedure
    .use(requirePermission('rescue:update_status'))
    .input(updateRescueStatusSchema)
    .mutation(async ({ input, ctx }) => {
      return updateRescueStatus(ctx.db, input);
    }),

  updateLocation: protectedProcedure
    .use(requirePermission('rescue:update_location'))
    .input(updateRescueLocationSchema)
    .mutation(async ({ input, ctx }) => {
      return updateRescueLocation(ctx.db, input);
    }),

  assignTeam: adminProcedure
    .use(requirePermission('rescue:assign_team'))
    .input(assignTeamSchema)
    .mutation(async ({ input, ctx }) => {
      return assignTeam(ctx.db, input);
    }),

  complete: protectedProcedure
    .use(requirePermission('rescue:update_status'))
    .input(completeRescueSchema)
    .mutation(async ({ input, ctx }) => {
      return completeRescueOperation(ctx.db, input);
    }),

  getActiveByZone: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getActiveByZone(ctx.db, input.id);
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getRescueStats(ctx.db);
  }),
});
