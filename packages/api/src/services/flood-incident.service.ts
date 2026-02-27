import { eq, and, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { floodIncidents } from '@sudanflood/db/schema';
import type { CreateFloodIncidentInput } from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';

export async function listFloodIncidents(
  db: Database,
  input: { page: number; limit: number; status?: string; stateId?: string },
) {
  const conditions = [];

  if (input.status) {
    conditions.push(eq(floodIncidents.status, input.status as typeof floodIncidents.status.enumValues[number]));
  }
  if (input.stateId) {
    conditions.push(eq(floodIncidents.stateId, input.stateId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(floodIncidents)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(floodIncidents.createdAt),
    db.select({ count: drizzleCount() }).from(floodIncidents).where(whereClause),
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

export async function getFloodIncidentById(db: Database, id: string) {
  const [incident] = await db
    .select()
    .from(floodIncidents)
    .where(eq(floodIncidents.id, id))
    .limit(1);

  if (!incident) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Flood incident not found' });
  }

  return incident;
}

export async function createFloodIncident(
  db: Database,
  input: CreateFloodIncidentInput,
  declaredByUserId?: string,
) {
  const countResult = await db
    .select({ count: drizzleCount() })
    .from(floodIncidents);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const incidentCode = generateEntityCode(CODE_PREFIXES.FLOOD_INCIDENT, seq);

  const [incident] = await db
    .insert(floodIncidents)
    .values({
      incidentCode,
      incidentType: input.incidentType,
      status: input.status ?? 'reported',
      title_en: input.title_en,
      title_ar: input.title_ar ?? null,
      description_en: input.description_en ?? null,
      description_ar: input.description_ar ?? null,
      severity: input.severity,
      stateId: input.stateId,
      localityId: input.localityId ?? null,
      estimatedAffectedPopulation: input.estimatedAffectedPopulation ?? 0,
      startDate: input.startDate,
      leadOrgId: input.leadOrgId ?? null,
      declaredByUserId: declaredByUserId ?? null,
    })
    .returning();

  return incident;
}

export async function updateFloodIncident(
  db: Database,
  input: {
    id: string;
    title_en?: string;
    title_ar?: string;
    incidentType?: string;
    status?: string;
    severity?: string;
    stateId?: string;
    localityId?: string;
    startDate?: Date;
    description_en?: string;
    description_ar?: string;
    estimatedAffectedPopulation?: number;
    leadOrgId?: string;
  },
) {
  const existing = await getFloodIncidentById(db, input.id);

  const [updated] = await db
    .update(floodIncidents)
    .set({
      ...(input.title_en !== undefined && { title_en: input.title_en }),
      ...(input.title_ar !== undefined && { title_ar: input.title_ar }),
      ...(input.incidentType !== undefined && {
        incidentType: input.incidentType as typeof floodIncidents.incidentType.enumValues[number],
      }),
      ...(input.status !== undefined && {
        status: input.status as typeof floodIncidents.status.enumValues[number],
      }),
      ...(input.severity !== undefined && {
        severity: input.severity as typeof floodIncidents.severity.enumValues[number],
      }),
      ...(input.stateId !== undefined && { stateId: input.stateId }),
      ...(input.localityId !== undefined && { localityId: input.localityId }),
      ...(input.startDate !== undefined && { startDate: input.startDate }),
      ...(input.description_en !== undefined && { description_en: input.description_en }),
      ...(input.description_ar !== undefined && { description_ar: input.description_ar }),
      ...(input.estimatedAffectedPopulation !== undefined && {
        estimatedAffectedPopulation: input.estimatedAffectedPopulation,
      }),
      ...(input.leadOrgId !== undefined && { leadOrgId: input.leadOrgId }),
      updatedAt: new Date(),
    })
    .where(eq(floodIncidents.id, existing.id))
    .returning();

  return updated;
}
