import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { loginSchema, registerSchema, changePasswordSchema, refreshTokenSchema } from '@sudanflood/shared';
import { loginUser, registerUser, refreshUserTokens, getUserById, changeUserPassword } from '../services/auth.service.js';
import { logAuthEvent } from '../services/audit.service.js';

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const result = await loginUser(ctx.db, input.email, input.password);

    await logAuthEvent(ctx.db, 'LOGIN', result.user.id, {
      ipAddress: ctx.ipAddress ?? undefined,
      requestId: ctx.requestId,
    });

    return result;
  }),

  register: publicProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
    const result = await registerUser(ctx.db, input);

    await logAuthEvent(ctx.db, 'LOGIN', result.user.id, {
      ipAddress: ctx.ipAddress ?? undefined,
      requestId: ctx.requestId,
    });

    return result;
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.db, ctx.user.id);
    return user;
  }),

  refresh: publicProcedure.input(refreshTokenSchema).mutation(async ({ input, ctx }) => {
    return refreshUserTokens(ctx.db, input.refreshToken);
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await logAuthEvent(ctx.db, 'LOGOUT', ctx.user.id, {
      ipAddress: ctx.ipAddress ?? undefined,
      requestId: ctx.requestId,
    });
    return { success: true };
  }),

  changePassword: protectedProcedure
    .input(changePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      await changeUserPassword(ctx.db, ctx.user.id, input.currentPassword, input.newPassword);
      return { success: true };
    }),
});
