export { appRouter } from './routers/index.js';
export type { AppRouter } from './routers/index.js';
export type { TRPCContext } from './trpc.js';
export {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  superAdminProcedure,
  requirePermission,
} from './trpc.js';
