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

export const rescueRouter = router({
  list: protectedProcedure.input(listRescueOperationsSchema).query(async ({ input }) => {
    return { items: [], total: 0, page: input.page, limit: input.limit, totalPages: 0 };
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input: _input }) => {
    throw new Error('Not implemented');
  }),

  create: adminProcedure
    .use(requirePermission('rescue:create'))
    .input(createRescueOperationSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  dispatch: adminProcedure
    .use(requirePermission('rescue:dispatch'))
    .input(idParamSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  updateStatus: protectedProcedure
    .use(requirePermission('rescue:update_status'))
    .input(updateRescueStatusSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  updateLocation: protectedProcedure
    .use(requirePermission('rescue:update_location'))
    .input(updateRescueLocationSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  assignTeam: adminProcedure
    .use(requirePermission('rescue:assign_team'))
    .input(assignTeamSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  complete: protectedProcedure
    .use(requirePermission('rescue:update_status'))
    .input(completeRescueSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),
});
