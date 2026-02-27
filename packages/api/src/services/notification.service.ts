import { eq, and, count as drizzleCount, desc } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { notifications } from '@sudanflood/db/schema';

export async function listNotifications(
  db: Database,
  input: { page: number; limit: number; unreadOnly?: boolean },
  userId: string,
) {
  const conditions = [eq(notifications.userId, userId)];

  if (input.unreadOnly) {
    conditions.push(eq(notifications.isRead, false));
  }

  const whereClause = and(...conditions);
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: notifications.id,
        title_en: notifications.title_en,
        title_ar: notifications.title_ar,
        body_en: notifications.body_en,
        body_ar: notifications.body_ar,
        notificationType: notifications.notificationType,
        severity: notifications.severity,
        referenceType: notifications.referenceType,
        referenceId: notifications.referenceId,
        isRead: notifications.isRead,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(desc(notifications.createdAt)),
    db.select({ count: drizzleCount() }).from(notifications).where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    items,
    total,
    page: input.page,
    limit: input.limit,
    totalPages: Math.ceil(total / input.limit),
  };
}

export async function getUnreadCount(db: Database, userId: string) {
  const [result] = await db
    .select({ count: drizzleCount() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return result?.count ?? 0;
}

export async function markRead(db: Database, id: string, userId: string) {
  const [notification] = await db
    .select({ id: notifications.id, userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, id))
    .limit(1);

  if (!notification) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Notification not found' });
  }

  if (notification.userId !== userId) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your notification' });
  }

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, id));

  return { success: true };
}

export async function markAllRead(db: Database, userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return { success: true };
}

export async function createNotification(
  db: Database,
  input: {
    userId: string;
    title_en: string;
    title_ar?: string;
    body_en?: string;
    body_ar?: string;
    notificationType: string;
    severity?: string;
    referenceType?: string;
    referenceId?: string;
  },
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: input.userId,
      title_en: input.title_en,
      title_ar: input.title_ar ?? null,
      body_en: input.body_en ?? null,
      body_ar: input.body_ar ?? null,
      notificationType: input.notificationType,
      severity: input.severity ?? 'info',
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
    })
    .returning();

  return notification;
}
