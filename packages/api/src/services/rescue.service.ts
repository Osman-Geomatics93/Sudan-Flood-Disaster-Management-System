import { eq, and, sql, count as drizzleCount, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { rescueOperations, rescueTeamMembers } from '@sudanflood/db/schema';
import type { CreateRescueOperationInput } from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';

export async function listRescueOperations(
  db: Database,
  input: {
    page: number;
    limit: number;
    status?: string;
    zoneId?: string;
    orgId?: string;
    priority?: string;
  },
) {
  const conditions = [];

  if (input.status) {
    conditions.push(
      eq(rescueOperations.status, input.status as typeof rescueOperations.status.enumValues[number]),
    );
  }
  if (input.zoneId) {
    conditions.push(eq(rescueOperations.floodZoneId, input.zoneId));
  }
  if (input.orgId) {
    conditions.push(eq(rescueOperations.assignedOrgId, input.orgId));
  }
  if (input.priority) {
    conditions.push(
      eq(rescueOperations.priority, input.priority as typeof rescueOperations.priority.enumValues[number]),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: rescueOperations.id,
        operationCode: rescueOperations.operationCode,
        floodZoneId: rescueOperations.floodZoneId,
        assignedOrgId: rescueOperations.assignedOrgId,
        operationType: rescueOperations.operationType,
        status: rescueOperations.status,
        priority: rescueOperations.priority,
        title_en: rescueOperations.title_en,
        title_ar: rescueOperations.title_ar,
        estimatedPersonsAtRisk: rescueOperations.estimatedPersonsAtRisk,
        personsRescued: rescueOperations.personsRescued,
        teamSize: rescueOperations.teamSize,
        teamLeaderId: rescueOperations.teamLeaderId,
        emergencyCallId: rescueOperations.emergencyCallId,
        dispatchedAt: rescueOperations.dispatchedAt,
        completedAt: rescueOperations.completedAt,
        createdAt: rescueOperations.createdAt,
        targetLocation: sql<unknown>`ST_AsGeoJSON(target_location)::json`,
        currentLocation: sql<unknown>`ST_AsGeoJSON(current_location)::json`,
      })
      .from(rescueOperations)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(rescueOperations.createdAt),
    db.select({ count: drizzleCount() }).from(rescueOperations).where(whereClause),
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

export async function getRescueOperationById(db: Database, id: string) {
  const [op] = await db
    .select({
      id: rescueOperations.id,
      operationCode: rescueOperations.operationCode,
      floodZoneId: rescueOperations.floodZoneId,
      assignedOrgId: rescueOperations.assignedOrgId,
      operationType: rescueOperations.operationType,
      status: rescueOperations.status,
      priority: rescueOperations.priority,
      title_en: rescueOperations.title_en,
      title_ar: rescueOperations.title_ar,
      description: rescueOperations.description,
      estimatedPersonsAtRisk: rescueOperations.estimatedPersonsAtRisk,
      personsRescued: rescueOperations.personsRescued,
      teamSize: rescueOperations.teamSize,
      teamLeaderId: rescueOperations.teamLeaderId,
      emergencyCallId: rescueOperations.emergencyCallId,
      dispatchedAt: rescueOperations.dispatchedAt,
      arrivedAt: rescueOperations.arrivedAt,
      completedAt: rescueOperations.completedAt,
      notes: rescueOperations.notes,
      metadata: rescueOperations.metadata,
      createdAt: rescueOperations.createdAt,
      updatedAt: rescueOperations.updatedAt,
      targetLocation: sql<unknown>`ST_AsGeoJSON(target_location)::json`,
      currentLocation: sql<unknown>`ST_AsGeoJSON(current_location)::json`,
    })
    .from(rescueOperations)
    .where(eq(rescueOperations.id, id))
    .limit(1);

  if (!op) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Rescue operation not found' });
  }

  const team = await db
    .select()
    .from(rescueTeamMembers)
    .where(eq(rescueTeamMembers.rescueOperationId, id));

  return { ...op, team };
}

export async function createRescueOperation(
  db: Database,
  input: CreateRescueOperationInput,
  emergencyCallId?: string,
) {
  const countResult = await db
    .select({ count: drizzleCount() })
    .from(rescueOperations);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const operationCode = generateEntityCode(CODE_PREFIXES.RESCUE_OPERATION, seq);

  const [lng, lat] = input.targetLocation;

  const [op] = await db
    .insert(rescueOperations)
    .values({
      operationCode,
      floodZoneId: input.floodZoneId,
      assignedOrgId: input.assignedOrgId,
      operationType: input.operationType,
      priority: input.priority ?? 'high',
      title_en: input.title_en,
      title_ar: input.title_ar ?? null,
      description: input.description ?? null,
      estimatedPersonsAtRisk: input.estimatedPersonsAtRisk ?? 0,
      teamLeaderId: input.teamLeaderId ?? null,
      emergencyCallId: emergencyCallId ?? null,
      status: 'pending',
    })
    .returning();

  if (!op) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create rescue operation' });
  }

  // Set target location via raw SQL
  await db.execute(
    sql`UPDATE rescue_operations SET target_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${op.id}`,
  );

  return getRescueOperationById(db, op.id);
}

export async function dispatchRescueOperation(db: Database, id: string) {
  const op = await getRescueOperationById(db, id);

  if (op.status !== 'pending') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cannot dispatch operation in '${op.status}' status`,
    });
  }

  await db
    .update(rescueOperations)
    .set({
      status: 'dispatched',
      dispatchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(rescueOperations.id, id));

  return getRescueOperationById(db, id);
}

export async function updateRescueStatus(
  db: Database,
  input: { id: string; status: string; personsRescued?: number; notes?: string },
) {
  await getRescueOperationById(db, input.id);

  const updates: Record<string, unknown> = {
    status: input.status as typeof rescueOperations.status.enumValues[number],
    updatedAt: new Date(),
  };

  if (input.personsRescued !== undefined) {
    updates.personsRescued = input.personsRescued;
  }
  if (input.notes !== undefined) {
    updates.notes = input.notes;
  }

  // Set timestamps based on status transitions
  if (input.status === 'dispatched') {
    updates.dispatchedAt = new Date();
  } else if (input.status === 'on_site') {
    updates.arrivedAt = new Date();
  } else if (input.status === 'completed' || input.status === 'failed' || input.status === 'aborted') {
    updates.completedAt = new Date();
  }

  await db
    .update(rescueOperations)
    .set(updates)
    .where(eq(rescueOperations.id, input.id));

  return getRescueOperationById(db, input.id);
}

export async function updateRescueLocation(
  db: Database,
  input: { id: string; currentLocation: [number, number] },
) {
  await getRescueOperationById(db, input.id);

  const [lng, lat] = input.currentLocation;
  await db.execute(
    sql`UPDATE rescue_operations SET current_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), updated_at = NOW() WHERE id = ${input.id}`,
  );

  return { success: true };
}

export async function assignTeam(
  db: Database,
  input: { operationId: string; userIds: string[]; leaderId?: string },
) {
  await getRescueOperationById(db, input.operationId);

  // Remove existing team members
  await db
    .delete(rescueTeamMembers)
    .where(eq(rescueTeamMembers.rescueOperationId, input.operationId));

  // Insert new team members
  const members = input.userIds.map((userId) => ({
    rescueOperationId: input.operationId,
    userId,
    roleInTeam: userId === (input.leaderId ?? input.userIds[0]) ? 'leader' : 'member',
  }));

  await db.insert(rescueTeamMembers).values(members);

  // Update team size and leader
  await db
    .update(rescueOperations)
    .set({
      teamSize: input.userIds.length,
      teamLeaderId: input.leaderId ?? input.userIds[0] ?? null,
      updatedAt: new Date(),
    })
    .where(eq(rescueOperations.id, input.operationId));

  return getRescueOperationById(db, input.operationId);
}

export async function completeRescueOperation(
  db: Database,
  input: { id: string; personsRescued: number; notes?: string },
) {
  const op = await getRescueOperationById(db, input.id);

  if (op.status === 'completed') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Operation already completed' });
  }

  await db
    .update(rescueOperations)
    .set({
      status: 'completed',
      personsRescued: input.personsRescued,
      notes: input.notes ?? op.notes,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(rescueOperations.id, input.id));

  return getRescueOperationById(db, input.id);
}

export async function getActiveByZone(db: Database, zoneId: string) {
  const items = await db
    .select({
      id: rescueOperations.id,
      operationCode: rescueOperations.operationCode,
      operationType: rescueOperations.operationType,
      status: rescueOperations.status,
      priority: rescueOperations.priority,
      title_en: rescueOperations.title_en,
      estimatedPersonsAtRisk: rescueOperations.estimatedPersonsAtRisk,
      personsRescued: rescueOperations.personsRescued,
      teamSize: rescueOperations.teamSize,
      dispatchedAt: rescueOperations.dispatchedAt,
      targetLocation: sql<unknown>`ST_AsGeoJSON(target_location)::json`,
      currentLocation: sql<unknown>`ST_AsGeoJSON(current_location)::json`,
    })
    .from(rescueOperations)
    .where(
      and(
        eq(rescueOperations.floodZoneId, zoneId),
        inArray(rescueOperations.status, ['pending', 'dispatched', 'en_route', 'on_site', 'in_progress']),
      ),
    )
    .orderBy(rescueOperations.priority);

  return items;
}

export async function getRescueStats(db: Database) {
  const active = await db
    .select({ count: drizzleCount() })
    .from(rescueOperations)
    .where(
      inArray(rescueOperations.status, ['pending', 'dispatched', 'en_route', 'on_site', 'in_progress']),
    );

  return {
    activeRescues: active[0]?.count ?? 0,
  };
}
