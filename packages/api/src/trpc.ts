import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Database } from '@sudanflood/db';
import type { UserRole, Permission } from '@sudanflood/shared';
import { hasPermission } from '@sudanflood/shared';

/**
 * Context available to every tRPC procedure
 */
export interface TRPCContext {
  db: Database;
  user: {
    id: string;
    email: string;
    role: UserRole;
    orgId: string | null;
    preferredLocale: string;
  } | null;
  requestId: string;
  ipAddress: string | null;
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

/**
 * Public procedure — no auth required
 */
export const publicProcedure = t.procedure;

/**
 * Auth middleware — rejects unauthenticated requests
 */
const enforceAuth = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Protected procedure — requires authentication
 */
export const protectedProcedure = t.procedure.use(enforceAuth);

/**
 * RBAC middleware factory — checks specific permission
 */
export function requirePermission(permission: Permission) {
  return middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    if (!hasPermission(ctx.user.role, permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Insufficient permissions: ${permission}`,
      });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
}

/**
 * Admin procedure — requires agency_admin or super_admin
 */
export const adminProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'agency_admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

/**
 * Super admin procedure — requires super_admin only
 */
export const superAdminProcedure = t.procedure.use(
  middleware(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (ctx.user.role !== 'super_admin') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Super admin access required' });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
