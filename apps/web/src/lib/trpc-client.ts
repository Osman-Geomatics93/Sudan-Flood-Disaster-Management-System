import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@sudanflood/api';

export const trpc = createTRPCReact<AppRouter>();
