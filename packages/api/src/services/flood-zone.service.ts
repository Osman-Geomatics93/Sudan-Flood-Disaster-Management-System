import { eq, and, sql, isNull, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { floodZones } from '@sudanflood/db/schema';
import type {
  ListFloodZonesInput,
  CreateFloodZoneInput,
  UpdateFloodZoneInput,
} from '@sudanflood/shared';
import { CODE_PREFIXES } from '@sudanflood/shared';
import { withCodeRetry } from '../utils/entity-code.js';

export async function listFloodZones(db: Database, input: ListFloodZonesInput) {
  const conditions = [isNull(floodZones.deletedAt)];

  if (input.severity) {
    conditions.push(eq(floodZones.severity, input.severity));
  }
  if (input.status) {
    conditions.push(eq(floodZones.status, input.status));
  }
  if (input.stateId) {
    conditions.push(eq(floodZones.stateId, input.stateId));
  }
  if (input.incidentId) {
    conditions.push(eq(floodZones.incidentId, input.incidentId));
  }
  if (input.bbox) {
    const [west, south, east, north] = input.bbox;
    conditions.push(
      sql`ST_Intersects(geometry, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))`,
    );
  }

  const whereClause = and(...conditions);
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: floodZones.id,
        incidentId: floodZones.incidentId,
        zoneCode: floodZones.zoneCode,
        name_en: floodZones.name_en,
        name_ar: floodZones.name_ar,
        severity: floodZones.severity,
        status: floodZones.status,
        area_km2: floodZones.area_km2,
        waterLevel_m: floodZones.waterLevel_m,
        waterLevelTrend: floodZones.waterLevelTrend,
        affectedPopulation: floodZones.affectedPopulation,
        stateId: floodZones.stateId,
        localityId: floodZones.localityId,
        lastAssessedAt: floodZones.lastAssessedAt,
        createdAt: floodZones.createdAt,
        updatedAt: floodZones.updatedAt,
        geometry: sql<unknown>`ST_AsGeoJSON(geometry)::json`,
      })
      .from(floodZones)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(floodZones.createdAt),
    db.select({ count: drizzleCount() }).from(floodZones).where(whereClause),
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

export async function getFloodZoneById(db: Database, id: string) {
  const [zone] = await db
    .select({
      id: floodZones.id,
      incidentId: floodZones.incidentId,
      zoneCode: floodZones.zoneCode,
      name_en: floodZones.name_en,
      name_ar: floodZones.name_ar,
      severity: floodZones.severity,
      status: floodZones.status,
      area_km2: floodZones.area_km2,
      waterLevel_m: floodZones.waterLevel_m,
      waterLevelTrend: floodZones.waterLevelTrend,
      maxWaterLevel_m: floodZones.maxWaterLevel_m,
      affectedPopulation: floodZones.affectedPopulation,
      stateId: floodZones.stateId,
      localityId: floodZones.localityId,
      monitoredByOrgId: floodZones.monitoredByOrgId,
      lastAssessedAt: floodZones.lastAssessedAt,
      lastAssessedBy: floodZones.lastAssessedBy,
      metadata: floodZones.metadata,
      createdAt: floodZones.createdAt,
      updatedAt: floodZones.updatedAt,
      geometry: sql<unknown>`ST_AsGeoJSON(geometry)::json`,
      centroid: sql<unknown>`ST_AsGeoJSON(centroid)::json`,
    })
    .from(floodZones)
    .where(and(eq(floodZones.id, id), isNull(floodZones.deletedAt)))
    .limit(1);

  if (!zone) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Flood zone not found' });
  }

  return zone;
}

export async function getFloodZonesByBounds(db: Database, bbox: [number, number, number, number]) {
  const [west, south, east, north] = bbox;

  const zones = await db
    .select({
      id: floodZones.id,
      zoneCode: floodZones.zoneCode,
      name_en: floodZones.name_en,
      name_ar: floodZones.name_ar,
      severity: floodZones.severity,
      status: floodZones.status,
      affectedPopulation: floodZones.affectedPopulation,
      waterLevel_m: floodZones.waterLevel_m,
      waterLevelTrend: floodZones.waterLevelTrend,
      geometry: sql<unknown>`ST_AsGeoJSON(geometry)::json`,
    })
    .from(floodZones)
    .where(
      and(
        isNull(floodZones.deletedAt),
        sql`ST_Intersects(geometry, ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326))`,
      ),
    );

  return {
    type: 'FeatureCollection' as const,
    features: zones.map((z) => ({
      type: 'Feature' as const,
      id: z.id,
      properties: {
        id: z.id,
        zoneCode: z.zoneCode,
        name_en: z.name_en,
        name_ar: z.name_ar,
        severity: z.severity,
        status: z.status,
        affectedPopulation: z.affectedPopulation,
        waterLevel_m: z.waterLevel_m,
        waterLevelTrend: z.waterLevelTrend,
      },
      geometry: z.geometry,
    })),
  };
}

export async function createFloodZone(db: Database, input: CreateFloodZoneInput) {
  return withCodeRetry(
    async (zoneCode) => {
      const geojson = JSON.stringify(input.geometry);
      const name_ar = input.name_ar ?? null;
      const localityId = input.localityId ?? null;
      const incidentId = input.incidentId ?? null;
      const waterLevel_m = input.waterLevel?.toString() ?? null;
      const waterLevelTrend = input.waterLevelTrend ?? null;
      const affectedPopulation = input.affectedPopulation ?? 0;
      const monitoredByOrgId = input.monitoredByOrgId ?? null;
      const status = input.status ?? 'monitoring';

      const result = await db.execute(
        sql`INSERT INTO flood_zones (zone_code, name_en, name_ar, severity, status, state_id, locality_id, incident_id, water_level_m, water_level_trend, affected_population, monitored_by_org_id, geometry)
            VALUES (${zoneCode}, ${input.name_en}, ${name_ar}, ${input.severity}, ${status}, ${input.stateId}, ${localityId}, ${incidentId}, ${waterLevel_m}, ${waterLevelTrend}, ${affectedPopulation}, ${monitoredByOrgId}, ST_GeomFromGeoJSON(${geojson}))
            RETURNING id`,
      );

      const zoneId = (result as unknown as { id: string }[])[0]?.id;
      if (!zoneId) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create flood zone',
        });
      }

      return getFloodZoneById(db, zoneId);
    },
    db,
    floodZones,
    CODE_PREFIXES.FLOOD_ZONE,
  );
}

export async function updateFloodZone(db: Database, input: UpdateFloodZoneInput) {
  const existing = await getFloodZoneById(db, input.id);

  await db
    .update(floodZones)
    .set({
      ...(input.name_en !== undefined && { name_en: input.name_en }),
      ...(input.name_ar !== undefined && { name_ar: input.name_ar }),
      ...(input.severity !== undefined && { severity: input.severity }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.stateId !== undefined && { stateId: input.stateId }),
      ...(input.localityId !== undefined && { localityId: input.localityId }),
      ...(input.incidentId !== undefined && { incidentId: input.incidentId }),
      ...(input.waterLevel !== undefined && { waterLevel_m: input.waterLevel.toString() }),
      ...(input.waterLevelTrend !== undefined && { waterLevelTrend: input.waterLevelTrend }),
      ...(input.affectedPopulation !== undefined && {
        affectedPopulation: input.affectedPopulation,
      }),
      ...(input.monitoredByOrgId !== undefined && { monitoredByOrgId: input.monitoredByOrgId }),
      updatedAt: new Date(),
    })
    .where(eq(floodZones.id, existing.id));

  // Update geometry if changed
  if (input.geometry) {
    const geojson = JSON.stringify(input.geometry);
    await db.execute(
      sql`UPDATE flood_zones SET geometry = ST_GeomFromGeoJSON(${geojson}) WHERE id = ${input.id}`,
    );
  }

  return getFloodZoneById(db, input.id);
}

export async function updateFloodZoneSeverity(
  db: Database,
  input: { id: string; severity: string; waterLevel?: number; waterLevelTrend?: string },
  assessedBy: string,
) {
  await getFloodZoneById(db, input.id);

  await db
    .update(floodZones)
    .set({
      severity: input.severity as (typeof floodZones.severity.enumValues)[number],
      ...(input.waterLevel !== undefined && { waterLevel_m: input.waterLevel.toString() }),
      ...(input.waterLevelTrend !== undefined && { waterLevelTrend: input.waterLevelTrend }),
      lastAssessedAt: new Date(),
      lastAssessedBy: assessedBy,
      updatedAt: new Date(),
    })
    .where(eq(floodZones.id, input.id));

  return getFloodZoneById(db, input.id);
}

export async function archiveFloodZone(db: Database, id: string) {
  await getFloodZoneById(db, id);

  await db.update(floodZones).set({ deletedAt: new Date() }).where(eq(floodZones.id, id));

  return { success: true };
}

export async function getFloodZoneStats(db: Database) {
  const stats = await db
    .select({
      severity: floodZones.severity,
      count: drizzleCount(),
      totalAffected: sql<number>`COALESCE(SUM(${floodZones.affectedPopulation}), 0)`,
    })
    .from(floodZones)
    .where(isNull(floodZones.deletedAt))
    .groupBy(floodZones.severity);

  const totalZones = stats.reduce((sum, s) => sum + s.count, 0);
  const totalAffected = stats.reduce((sum, s) => sum + Number(s.totalAffected), 0);

  return {
    bySeverity: stats.map((s) => ({
      severity: s.severity,
      count: s.count,
      affectedPopulation: Number(s.totalAffected),
    })),
    totalZones,
    totalAffectedPopulation: totalAffected,
  };
}
