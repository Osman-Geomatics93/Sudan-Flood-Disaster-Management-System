import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createEmergencyCallSchema,
  triageCallSchema,
  dispatchCallSchema,
  resolveCallSchema,
  listEmergencyCallsSchema,
  idParamSchema,
} from '@sudanflood/shared';

export const emergencyCallRouter = router({
  list: protectedProcedure.input(listEmergencyCallsSchema).query(async ({ input }) => {
    return { items: [], total: 0, page: input.page, limit: input.limit, totalPages: 0 };
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input: _input }) => {
    throw new Error('Not implemented');
  }),

  create: protectedProcedure
    .use(requirePermission('emergency_call:create'))
    .input(createEmergencyCallSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  triage: adminProcedure
    .use(requirePermission('emergency_call:triage'))
    .input(triageCallSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  dispatch: adminProcedure
    .use(requirePermission('emergency_call:dispatch'))
    .input(dispatchCallSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),

  resolve: adminProcedure
    .use(requirePermission('emergency_call:resolve'))
    .input(resolveCallSchema)
    .mutation(async ({ input: _input }) => {
      throw new Error('Not implemented');
    }),
});
