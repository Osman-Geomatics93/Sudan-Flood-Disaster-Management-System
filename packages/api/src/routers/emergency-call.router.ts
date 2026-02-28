import { router, protectedProcedure, adminProcedure, requirePermission } from '../trpc.js';
import {
  createEmergencyCallSchema,
  updateEmergencyCallSchema,
  triageCallSchema,
  dispatchCallSchema,
  resolveCallSchema,
  listEmergencyCallsSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listEmergencyCalls,
  getEmergencyCallById,
  createEmergencyCall,
  updateEmergencyCall,
  deleteEmergencyCall,
  triageEmergencyCall,
  dispatchEmergencyCall,
  resolveEmergencyCall,
  getActiveCalls,
  getEmergencyCallStats,
} from '../services/emergency-call.service.js';

export const emergencyCallRouter = router({
  list: protectedProcedure.input(listEmergencyCallsSchema).query(async ({ input, ctx }) => {
    return listEmergencyCalls(ctx.db, input);
  }),

  getById: protectedProcedure.input(idParamSchema).query(async ({ input, ctx }) => {
    return getEmergencyCallById(ctx.db, input.id);
  }),

  create: protectedProcedure
    .use(requirePermission('emergency_call:create'))
    .input(createEmergencyCallSchema)
    .mutation(async ({ input, ctx }) => {
      return createEmergencyCall(ctx.db, input, ctx.user.id);
    }),

  update: protectedProcedure
    .use(requirePermission('emergency_call:create'))
    .input(updateEmergencyCallSchema)
    .mutation(async ({ input, ctx }) => {
      return updateEmergencyCall(ctx.db, input);
    }),

  delete: protectedProcedure
    .use(requirePermission('emergency_call:triage'))
    .input(idParamSchema)
    .mutation(async ({ input, ctx }) => {
      return deleteEmergencyCall(ctx.db, input.id);
    }),

  triage: adminProcedure
    .use(requirePermission('emergency_call:triage'))
    .input(triageCallSchema)
    .mutation(async ({ input, ctx }) => {
      return triageEmergencyCall(ctx.db, input);
    }),

  dispatch: adminProcedure
    .use(requirePermission('emergency_call:dispatch'))
    .input(dispatchCallSchema)
    .mutation(async ({ input, ctx }) => {
      return dispatchEmergencyCall(ctx.db, input);
    }),

  resolve: adminProcedure
    .use(requirePermission('emergency_call:resolve'))
    .input(resolveCallSchema)
    .mutation(async ({ input, ctx }) => {
      return resolveEmergencyCall(ctx.db, input);
    }),

  getActive: protectedProcedure.query(async ({ ctx }) => {
    return getActiveCalls(ctx.db);
  }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    return getEmergencyCallStats(ctx.db);
  }),
});
