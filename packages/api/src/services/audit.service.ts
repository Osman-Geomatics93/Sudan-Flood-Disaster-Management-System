import type { Database } from '@sudanflood/db';
import { auditLogs } from '@sudanflood/db/schema';
import type { AuditAction } from '@sudanflood/shared';

export interface AuditLogEntry {
  userId?: string | null;
  orgId?: string | null;
  action: AuditAction;
  tableName: string;
  recordId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export async function writeAuditLog(db: Database, entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId ?? null,
      orgId: entry.orgId ?? null,
      action: entry.action,
      tableName: entry.tableName,
      recordId: entry.recordId ?? null,
      oldValues: entry.oldValues ?? null,
      newValues: entry.newValues ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
      requestId: entry.requestId ?? null,
    });
  } catch (error) {
    // Audit logging should never crash the request
    console.error('[AUDIT] Failed to write audit log:', error);
  }
}

export async function logAuthEvent(
  db: Database,
  action: 'LOGIN' | 'LOGOUT',
  userId: string,
  meta?: { ipAddress?: string; userAgent?: string; requestId?: string },
): Promise<void> {
  await writeAuditLog(db, {
    userId,
    action,
    tableName: 'users',
    recordId: userId,
    ipAddress: meta?.ipAddress,
    userAgent: meta?.userAgent,
    requestId: meta?.requestId,
  });
}
