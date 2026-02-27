import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@sudanflood/api';
import type { TRPCContext } from '@sudanflood/api';
import { db } from '@sudanflood/db/client';
import { auth } from '@/lib/auth';
import type { UserRole } from '@sudanflood/shared';

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function createContext(req: Request): Promise<TRPCContext> {
  const session = await auth();

  let user: TRPCContext['user'] = null;
  if (session?.user) {
    user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role as UserRole,
      orgId: session.user.orgId,
      preferredLocale: session.user.preferredLocale,
    };
  }

  const forwarded = req.headers.get('x-forwarded-for');
  const ipAddress = forwarded?.split(',')[0]?.trim() ?? null;

  return {
    db,
    user,
    requestId: generateRequestId(),
    ipAddress,
  };
}

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        console.error(`[tRPC] ${path}:`, error.message);
      }
    },
  });
}

export { handler as GET, handler as POST };
