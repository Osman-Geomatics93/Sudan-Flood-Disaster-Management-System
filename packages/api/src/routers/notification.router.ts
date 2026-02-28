import { router, protectedProcedure, requirePermission } from '../trpc.js';
import { listNotificationsSchema, markReadSchema, markAllReadSchema } from '@sudanflood/shared';
import {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
} from '../services/notification.service.js';

export const notificationRouter = router({
  list: protectedProcedure
    .use(requirePermission('notification:read'))
    .input(listNotificationsSchema)
    .query(async ({ input, ctx }) => {
      return listNotifications(ctx.db, input, ctx.user.id);
    }),

  unreadCount: protectedProcedure
    .use(requirePermission('notification:read'))
    .query(async ({ ctx }) => {
      return getUnreadCount(ctx.db, ctx.user.id);
    }),

  markRead: protectedProcedure
    .use(requirePermission('notification:read'))
    .input(markReadSchema)
    .mutation(async ({ input, ctx }) => {
      return markRead(ctx.db, input.id, ctx.user.id);
    }),

  markAllRead: protectedProcedure
    .use(requirePermission('notification:read'))
    .input(markAllReadSchema)
    .mutation(async ({ ctx }) => {
      return markAllRead(ctx.db, ctx.user.id);
    }),
});
