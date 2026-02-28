import { eq, and, desc, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { weatherAlerts, states } from '@sudanflood/db/schema';
import type { CreateWeatherAlertInput, ListWeatherAlertsInput } from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';

export async function listWeatherAlerts(db: Database, input: ListWeatherAlertsInput) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.alertType) {
    conditions.push(eq(weatherAlerts.alertType, input.alertType));
  }
  if (input.severity) {
    conditions.push(eq(weatherAlerts.severity, input.severity));
  }
  if (input.stateId) {
    conditions.push(eq(weatherAlerts.stateId, input.stateId));
  }
  if (input.activeOnly) {
    conditions.push(eq(weatherAlerts.isActive, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: weatherAlerts.id,
        alertCode: weatherAlerts.alertCode,
        alertType: weatherAlerts.alertType,
        severity: weatherAlerts.severity,
        stateId: weatherAlerts.stateId,
        stateName: states.name_en,
        title_en: weatherAlerts.title_en,
        title_ar: weatherAlerts.title_ar,
        description_en: weatherAlerts.description_en,
        description_ar: weatherAlerts.description_ar,
        source: weatherAlerts.source,
        isActive: weatherAlerts.isActive,
        issuedAt: weatherAlerts.issuedAt,
        expiresAt: weatherAlerts.expiresAt,
        createdAt: weatherAlerts.createdAt,
      })
      .from(weatherAlerts)
      .leftJoin(states, eq(weatherAlerts.stateId, states.id))
      .where(whereClause)
      .orderBy(desc(weatherAlerts.createdAt))
      .limit(input.limit)
      .offset(offset),
    db.select({ count: drizzleCount() }).from(weatherAlerts).where(whereClause),
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

export async function getActiveAlerts(db: Database) {
  return db
    .select({
      id: weatherAlerts.id,
      alertCode: weatherAlerts.alertCode,
      alertType: weatherAlerts.alertType,
      severity: weatherAlerts.severity,
      stateId: weatherAlerts.stateId,
      stateName: states.name_en,
      title_en: weatherAlerts.title_en,
      title_ar: weatherAlerts.title_ar,
      description_en: weatherAlerts.description_en,
      isActive: weatherAlerts.isActive,
      issuedAt: weatherAlerts.issuedAt,
      expiresAt: weatherAlerts.expiresAt,
    })
    .from(weatherAlerts)
    .leftJoin(states, eq(weatherAlerts.stateId, states.id))
    .where(eq(weatherAlerts.isActive, true))
    .orderBy(desc(weatherAlerts.issuedAt));
}

export async function createWeatherAlert(db: Database, input: CreateWeatherAlertInput) {
  const countResult = await db.select({ count: drizzleCount() }).from(weatherAlerts);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const alertCode = generateEntityCode(CODE_PREFIXES.WEATHER_ALERT, seq);

  const [alert] = await db
    .insert(weatherAlerts)
    .values({
      alertCode,
      alertType: input.alertType,
      severity: input.severity,
      stateId: input.stateId,
      title_en: input.title_en,
      title_ar: input.title_ar,
      description_en: input.description_en,
      description_ar: input.description_ar,
      source: input.source,
      expiresAt: input.expiresAt,
      metadata: input.metadata ?? {},
    })
    .returning();

  return alert;
}

export async function deactivateAlert(db: Database, id: string) {
  const [alert] = await db
    .update(weatherAlerts)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(weatherAlerts.id, id))
    .returning();

  if (!alert) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Weather alert not found' });
  }

  return alert;
}

export async function getWeatherAlertStats(db: Database) {
  const [activeCount] = await db
    .select({ count: drizzleCount() })
    .from(weatherAlerts)
    .where(eq(weatherAlerts.isActive, true));

  const bySeverity = await db
    .select({
      severity: weatherAlerts.severity,
      count: drizzleCount(),
    })
    .from(weatherAlerts)
    .where(eq(weatherAlerts.isActive, true))
    .groupBy(weatherAlerts.severity);

  return {
    activeAlerts: activeCount?.count ?? 0,
    bySeverity,
  };
}
