import { eq, and, sql, isNull, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { shelters } from '@sudanflood/db/schema';
import type { CreateShelterInput } from '@sudanflood/shared';
import { CODE_PREFIXES } from '@sudanflood/shared';
import { withCodeRetry } from '../utils/entity-code.js';

export async function listShelters(
  db: Database,
  input: { page: number; limit: number; status?: string; stateId?: string; hasCapacity?: boolean },
) {
  const conditions = [isNull(shelters.deletedAt)];

  if (input.status) {
    conditions.push(
      eq(shelters.status, input.status as (typeof shelters.status.enumValues)[number]),
    );
  }
  if (input.stateId) {
    conditions.push(eq(shelters.stateId, input.stateId));
  }
  if (input.hasCapacity) {
    conditions.push(sql`${shelters.currentOccupancy} < ${shelters.capacity}`);
  }

  const whereClause = and(...conditions);
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: shelters.id,
        shelterCode: shelters.shelterCode,
        name_en: shelters.name_en,
        name_ar: shelters.name_ar,
        status: shelters.status,
        address_en: shelters.address_en,
        address_ar: shelters.address_ar,
        stateId: shelters.stateId,
        localityId: shelters.localityId,
        managingOrgId: shelters.managingOrgId,
        capacity: shelters.capacity,
        currentOccupancy: shelters.currentOccupancy,
        hasWater: shelters.hasWater,
        hasElectricity: shelters.hasElectricity,
        hasMedical: shelters.hasMedical,
        hasSanitation: shelters.hasSanitation,
        hasKitchen: shelters.hasKitchen,
        hasSecurity: shelters.hasSecurity,
        createdAt: shelters.createdAt,
        updatedAt: shelters.updatedAt,
        location: sql<unknown>`ST_AsGeoJSON(location)::json`,
      })
      .from(shelters)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(shelters.name_en),
    db.select({ count: drizzleCount() }).from(shelters).where(whereClause),
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

export async function getShelterById(db: Database, id: string) {
  const [shelter] = await db
    .select({
      id: shelters.id,
      shelterCode: shelters.shelterCode,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      status: shelters.status,
      address_en: shelters.address_en,
      address_ar: shelters.address_ar,
      stateId: shelters.stateId,
      localityId: shelters.localityId,
      managingOrgId: shelters.managingOrgId,
      managerUserId: shelters.managerUserId,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      hasWater: shelters.hasWater,
      hasElectricity: shelters.hasElectricity,
      hasMedical: shelters.hasMedical,
      hasSanitation: shelters.hasSanitation,
      hasKitchen: shelters.hasKitchen,
      hasSecurity: shelters.hasSecurity,
      facilityNotes: shelters.facilityNotes,
      openedAt: shelters.openedAt,
      closedAt: shelters.closedAt,
      metadata: shelters.metadata,
      createdAt: shelters.createdAt,
      updatedAt: shelters.updatedAt,
      location: sql<unknown>`ST_AsGeoJSON(location)::json`,
    })
    .from(shelters)
    .where(and(eq(shelters.id, id), isNull(shelters.deletedAt)))
    .limit(1);

  if (!shelter) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Shelter not found' });
  }

  return shelter;
}

export async function findNearestShelters(
  db: Database,
  input: { location: [number, number]; radiusKm: number; limit: number },
) {
  const [lng, lat] = input.location;
  const radiusMeters = input.radiusKm * 1000;

  const results = await db
    .select({
      id: shelters.id,
      shelterCode: shelters.shelterCode,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      status: shelters.status,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      location: sql<unknown>`ST_AsGeoJSON(location)::json`,
      distance: sql<number>`ST_Distance(location::geography, ST_MakePoint(${lng}, ${lat})::geography)`,
    })
    .from(shelters)
    .where(
      and(
        isNull(shelters.deletedAt),
        sql`ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, ${radiusMeters})`,
      ),
    )
    .orderBy(sql`ST_Distance(location::geography, ST_MakePoint(${lng}, ${lat})::geography)`)
    .limit(input.limit);

  return results;
}

export async function getSheltersByBounds(db: Database, bbox: [number, number, number, number]) {
  const [west, south, east, north] = bbox;

  const results = await db
    .select({
      id: shelters.id,
      shelterCode: shelters.shelterCode,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      status: shelters.status,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      location: sql<unknown>`ST_AsGeoJSON(location)::json`,
    })
    .from(shelters)
    .where(
      and(
        isNull(shelters.deletedAt),
        sql`ST_Within(location, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))`,
      ),
    );

  return results;
}

export async function createShelter(db: Database, input: CreateShelterInput) {
  return withCodeRetry(
    async (shelterCode) => {
      const [lng, lat] = input.location;
      const name_ar = input.name_ar ?? null;
      const address_en = input.address_en ?? null;
      const address_ar = input.address_ar ?? null;
      const localityId = input.localityId ?? null;
      const managerUserId = input.managerUserId ?? null;
      const facilityNotes = input.facilityNotes ?? null;
      const hasWater = input.hasWater ?? false;
      const hasElectricity = input.hasElectricity ?? false;
      const hasMedical = input.hasMedical ?? false;
      const hasSanitation = input.hasSanitation ?? false;
      const hasKitchen = input.hasKitchen ?? false;
      const hasSecurity = input.hasSecurity ?? false;

      const result = await db.execute(
        sql`INSERT INTO shelters (
          shelter_code, name_en, name_ar, status,
          address_en, address_ar, state_id, locality_id,
          managing_org_id, manager_user_id, capacity, current_occupancy,
          has_water, has_electricity, has_medical, has_sanitation,
          has_kitchen, has_security, facility_notes, location
        ) VALUES (
          ${shelterCode}, ${input.name_en}, ${name_ar}, 'preparing',
          ${address_en}, ${address_ar}, ${input.stateId}, ${localityId},
          ${input.managingOrgId}, ${managerUserId}, ${input.capacity}, 0,
          ${hasWater}, ${hasElectricity}, ${hasMedical}, ${hasSanitation},
          ${hasKitchen}, ${hasSecurity}, ${facilityNotes},
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
        ) RETURNING id`,
      );

      const newId = (result as unknown as { id: string }[])[0]?.id;
      if (!newId) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to create shelter' });
      }

      return getShelterById(db, newId);
    },
    db,
    shelters,
    CODE_PREFIXES.SHELTER,
  );
}

export async function updateShelter(
  db: Database,
  input: {
    id: string;
    name_en?: string;
    name_ar?: string;
    location?: [number, number];
    address_en?: string;
    address_ar?: string;
    stateId?: string;
    localityId?: string;
    managingOrgId?: string;
    managerUserId?: string;
    capacity?: number;
    hasWater?: boolean;
    hasElectricity?: boolean;
    hasMedical?: boolean;
    hasSanitation?: boolean;
    hasKitchen?: boolean;
    hasSecurity?: boolean;
    facilityNotes?: string;
  },
) {
  const existing = await getShelterById(db, input.id);

  await db
    .update(shelters)
    .set({
      ...(input.name_en !== undefined && { name_en: input.name_en }),
      ...(input.name_ar !== undefined && { name_ar: input.name_ar }),
      ...(input.address_en !== undefined && { address_en: input.address_en }),
      ...(input.address_ar !== undefined && { address_ar: input.address_ar }),
      ...(input.stateId !== undefined && { stateId: input.stateId }),
      ...(input.localityId !== undefined && { localityId: input.localityId }),
      ...(input.managingOrgId !== undefined && { managingOrgId: input.managingOrgId }),
      ...(input.managerUserId !== undefined && { managerUserId: input.managerUserId }),
      ...(input.capacity !== undefined && { capacity: input.capacity }),
      ...(input.hasWater !== undefined && { hasWater: input.hasWater }),
      ...(input.hasElectricity !== undefined && { hasElectricity: input.hasElectricity }),
      ...(input.hasMedical !== undefined && { hasMedical: input.hasMedical }),
      ...(input.hasSanitation !== undefined && { hasSanitation: input.hasSanitation }),
      ...(input.hasKitchen !== undefined && { hasKitchen: input.hasKitchen }),
      ...(input.hasSecurity !== undefined && { hasSecurity: input.hasSecurity }),
      ...(input.facilityNotes !== undefined && { facilityNotes: input.facilityNotes }),
      updatedAt: new Date(),
    })
    .where(eq(shelters.id, existing.id));

  // Update location if changed
  if (input.location) {
    const [lng, lat] = input.location;
    await db.execute(
      sql`UPDATE shelters SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${input.id}`,
    );
  }

  return getShelterById(db, input.id);
}

export async function updateOccupancy(db: Database, id: string, currentOccupancy: number) {
  await getShelterById(db, id);

  await db
    .update(shelters)
    .set({ currentOccupancy, updatedAt: new Date() })
    .where(eq(shelters.id, id));

  return getShelterById(db, id);
}

export async function updateShelterStatus(
  db: Database,
  id: string,
  status: (typeof shelters.status.enumValues)[number],
) {
  await getShelterById(db, id);

  await db.update(shelters).set({ status, updatedAt: new Date() }).where(eq(shelters.id, id));

  return getShelterById(db, id);
}

export async function deleteShelter(db: Database, id: string) {
  await getShelterById(db, id);
  await db.update(shelters).set({ deletedAt: new Date() }).where(eq(shelters.id, id));
  return { success: true };
}

export async function getShelterStats(db: Database) {
  const baseCondition = isNull(shelters.deletedAt);

  const [totalResult, byStatusResult, capacityResult] = await Promise.all([
    db.select({ count: drizzleCount() }).from(shelters).where(baseCondition),
    db
      .select({
        status: shelters.status,
        count: drizzleCount(),
      })
      .from(shelters)
      .where(baseCondition)
      .groupBy(shelters.status),
    db
      .select({
        totalCapacity: sql<number>`COALESCE(SUM(${shelters.capacity}), 0)`,
        totalOccupancy: sql<number>`COALESCE(SUM(${shelters.currentOccupancy}), 0)`,
      })
      .from(shelters)
      .where(baseCondition),
  ]);

  const total = totalResult[0]?.count ?? 0;
  const totalCapacity = Number(capacityResult[0]?.totalCapacity ?? 0);
  const totalOccupancy = Number(capacityResult[0]?.totalOccupancy ?? 0);
  const utilizationPct = totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return {
    total,
    byStatus: byStatusResult,
    totalCapacity,
    totalOccupancy,
    utilizationPct,
  };
}
