import { eq, and, sql, count as drizzleCount, inArray } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { emergencyCalls } from '@sudanflood/db/schema';
import type { CreateEmergencyCallInput } from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';
import { createRescueOperation } from './rescue.service.js';

export async function listEmergencyCalls(
  db: Database,
  input: { page: number; limit: number; status?: string; urgency?: string; stateId?: string },
) {
  const conditions = [];

  if (input.status) {
    conditions.push(
      eq(emergencyCalls.status, input.status as (typeof emergencyCalls.status.enumValues)[number]),
    );
  }
  if (input.urgency) {
    conditions.push(
      eq(
        emergencyCalls.urgency,
        input.urgency as (typeof emergencyCalls.urgency.enumValues)[number],
      ),
    );
  }
  if (input.stateId) {
    conditions.push(eq(emergencyCalls.stateId, input.stateId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: emergencyCalls.id,
        callCode: emergencyCalls.callCode,
        callerName: emergencyCalls.callerName,
        callerPhone: emergencyCalls.callerPhone,
        callerAddress: emergencyCalls.callerAddress,
        callNumber: emergencyCalls.callNumber,
        urgency: emergencyCalls.urgency,
        status: emergencyCalls.status,
        description_en: emergencyCalls.description_en,
        description_ar: emergencyCalls.description_ar,
        personsAtRisk: emergencyCalls.personsAtRisk,
        floodZoneId: emergencyCalls.floodZoneId,
        stateId: emergencyCalls.stateId,
        rescueOperationId: emergencyCalls.rescueOperationId,
        receivedAt: emergencyCalls.receivedAt,
        triagedAt: emergencyCalls.triagedAt,
        dispatchedAt: emergencyCalls.dispatchedAt,
        resolvedAt: emergencyCalls.resolvedAt,
        createdAt: emergencyCalls.createdAt,
        callerLocation: sql<unknown>`ST_AsGeoJSON(caller_location)::json`,
      })
      .from(emergencyCalls)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(emergencyCalls.receivedAt),
    db.select({ count: drizzleCount() }).from(emergencyCalls).where(whereClause),
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

export async function getEmergencyCallById(db: Database, id: string) {
  const [call] = await db
    .select({
      id: emergencyCalls.id,
      callCode: emergencyCalls.callCode,
      callerName: emergencyCalls.callerName,
      callerPhone: emergencyCalls.callerPhone,
      callerAddress: emergencyCalls.callerAddress,
      callNumber: emergencyCalls.callNumber,
      urgency: emergencyCalls.urgency,
      status: emergencyCalls.status,
      description_en: emergencyCalls.description_en,
      description_ar: emergencyCalls.description_ar,
      personsAtRisk: emergencyCalls.personsAtRisk,
      floodZoneId: emergencyCalls.floodZoneId,
      stateId: emergencyCalls.stateId,
      localityId: emergencyCalls.localityId,
      receivedByUserId: emergencyCalls.receivedByUserId,
      dispatchedToOrgId: emergencyCalls.dispatchedToOrgId,
      rescueOperationId: emergencyCalls.rescueOperationId,
      receivedAt: emergencyCalls.receivedAt,
      triagedAt: emergencyCalls.triagedAt,
      dispatchedAt: emergencyCalls.dispatchedAt,
      resolvedAt: emergencyCalls.resolvedAt,
      recordingUrl: emergencyCalls.recordingUrl,
      notes: emergencyCalls.notes,
      metadata: emergencyCalls.metadata,
      createdAt: emergencyCalls.createdAt,
      updatedAt: emergencyCalls.updatedAt,
      callerLocation: sql<unknown>`ST_AsGeoJSON(caller_location)::json`,
    })
    .from(emergencyCalls)
    .where(eq(emergencyCalls.id, id))
    .limit(1);

  if (!call) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Emergency call not found' });
  }

  return call;
}

export async function createEmergencyCall(
  db: Database,
  input: CreateEmergencyCallInput,
  receivedByUserId: string,
) {
  const countResult = await db.select({ count: drizzleCount() }).from(emergencyCalls);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const callCode = generateEntityCode(CODE_PREFIXES.EMERGENCY_CALL, seq);

  const [call] = await db
    .insert(emergencyCalls)
    .values({
      callCode,
      callerName: input.callerName ?? null,
      callerPhone: input.callerPhone,
      callerAddress: input.callerAddress ?? null,
      callNumber: input.callNumber,
      urgency: input.urgency ?? 'medium',
      status: 'received',
      description_ar: input.description_ar ?? null,
      description_en: input.description_en ?? null,
      personsAtRisk: input.personsAtRisk ?? 0,
      floodZoneId: input.floodZoneId ?? null,
      stateId: input.stateId ?? null,
      receivedByUserId,
    })
    .returning();

  if (!call) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create emergency call',
    });
  }

  // Set caller location via raw SQL if provided
  if (input.callerLocation) {
    const [lng, lat] = input.callerLocation;
    await db.execute(
      sql`UPDATE emergency_calls SET caller_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${call.id}`,
    );
  }

  return getEmergencyCallById(db, call.id);
}

export async function triageEmergencyCall(
  db: Database,
  input: { id: string; urgency: string; floodZoneId?: string; notes?: string },
) {
  const call = await getEmergencyCallById(db, input.id);

  if (call.status !== 'received') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cannot triage call in '${call.status}' status`,
    });
  }

  await db
    .update(emergencyCalls)
    .set({
      urgency: input.urgency as (typeof emergencyCalls.urgency.enumValues)[number],
      status: 'triaged',
      floodZoneId: input.floodZoneId ?? call.floodZoneId,
      notes: input.notes ?? call.notes,
      triagedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emergencyCalls.id, input.id));

  return getEmergencyCallById(db, input.id);
}

export async function dispatchEmergencyCall(
  db: Database,
  input: { id: string; dispatchToOrgId: string; createRescue?: boolean },
) {
  const call = await getEmergencyCallById(db, input.id);

  if (call.status !== 'received' && call.status !== 'triaged') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cannot dispatch call in '${call.status}' status`,
    });
  }

  let rescueOperationId: string | null = null;

  // Optionally create a rescue operation linked to this call
  if (input.createRescue && call.floodZoneId) {
    const rescueOp = await createRescueOperation(
      db,
      {
        floodZoneId: call.floodZoneId,
        assignedOrgId: input.dispatchToOrgId,
        operationType: 'mixed',
        priority:
          call.urgency === 'life_threatening'
            ? 'critical'
            : call.urgency === 'high'
              ? 'high'
              : 'medium',
        title_en: `Rescue for call ${call.callCode}`,
        targetLocation: call.callerLocation
          ? (call.callerLocation as { coordinates: [number, number] }).coordinates
          : [32.5, 15.5],
        estimatedPersonsAtRisk: call.personsAtRisk ?? 0,
      },
      call.id,
    );
    rescueOperationId = rescueOp.id;
  }

  await db
    .update(emergencyCalls)
    .set({
      status: 'dispatched',
      dispatchedToOrgId: input.dispatchToOrgId,
      rescueOperationId,
      dispatchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emergencyCalls.id, input.id));

  const updatedCall = await getEmergencyCallById(db, input.id);
  return {
    call: updatedCall,
    rescueOperationId,
  };
}

export async function resolveEmergencyCall(db: Database, input: { id: string; notes?: string }) {
  const call = await getEmergencyCallById(db, input.id);

  if (call.status === 'resolved') {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Call already resolved' });
  }

  await db
    .update(emergencyCalls)
    .set({
      status: 'resolved',
      notes: input.notes ?? call.notes,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(emergencyCalls.id, input.id));

  return getEmergencyCallById(db, input.id);
}

export async function getActiveCalls(db: Database) {
  const items = await db
    .select({
      id: emergencyCalls.id,
      callCode: emergencyCalls.callCode,
      callerName: emergencyCalls.callerName,
      callerPhone: emergencyCalls.callerPhone,
      callNumber: emergencyCalls.callNumber,
      urgency: emergencyCalls.urgency,
      status: emergencyCalls.status,
      personsAtRisk: emergencyCalls.personsAtRisk,
      floodZoneId: emergencyCalls.floodZoneId,
      stateId: emergencyCalls.stateId,
      receivedAt: emergencyCalls.receivedAt,
      callerLocation: sql<unknown>`ST_AsGeoJSON(caller_location)::json`,
    })
    .from(emergencyCalls)
    .where(inArray(emergencyCalls.status, ['received', 'triaged', 'dispatched']))
    .orderBy(emergencyCalls.receivedAt);

  return items;
}

export async function getEmergencyCallStats(db: Database) {
  const pending = await db
    .select({ count: drizzleCount() })
    .from(emergencyCalls)
    .where(inArray(emergencyCalls.status, ['received', 'triaged']));

  return {
    pendingCalls: pending[0]?.count ?? 0,
  };
}
