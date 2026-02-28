import { eq, and, desc, count as drizzleCount, gte, lte } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { auditLogs, users } from '@sudanflood/db/schema';
import type { ListAuditLogsInput } from '@sudanflood/shared';

export async function listAuditLogs(db: Database, input: ListAuditLogsInput) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.action) {
    conditions.push(eq(auditLogs.action, input.action));
  }
  if (input.tableName) {
    conditions.push(eq(auditLogs.tableName, input.tableName));
  }
  if (input.userId) {
    conditions.push(eq(auditLogs.userId, input.userId));
  }
  if (input.dateFrom) {
    conditions.push(gte(auditLogs.createdAt, input.dateFrom));
  }
  if (input.dateTo) {
    conditions.push(lte(auditLogs.createdAt, input.dateTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        userEmail: users.email,
        userFirstName: users.firstName_en,
        action: auditLogs.action,
        tableName: auditLogs.tableName,
        recordId: auditLogs.recordId,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        ipAddress: auditLogs.ipAddress,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(input.limit)
      .offset(offset),
    db.select({ count: drizzleCount() }).from(auditLogs).where(whereClause),
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

export async function getAuditLogById(db: Database, id: string) {
  const [log] = await db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      userEmail: users.email,
      userFirstName: users.firstName_en,
      orgId: auditLogs.orgId,
      action: auditLogs.action,
      tableName: auditLogs.tableName,
      recordId: auditLogs.recordId,
      oldValues: auditLogs.oldValues,
      newValues: auditLogs.newValues,
      ipAddress: auditLogs.ipAddress,
      userAgent: auditLogs.userAgent,
      requestId: auditLogs.requestId,
      metadata: auditLogs.metadata,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.id, id))
    .limit(1);

  if (!log) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Audit log not found' });
  }

  return log;
}
