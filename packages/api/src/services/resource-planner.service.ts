import { sql, desc } from 'drizzle-orm';
import type { Database } from '@sudanflood/db';
import { shelters, reliefSupplies } from '@sudanflood/db/schema';
import type { NearestSheltersInput, ShelterRecommendationInput } from '@sudanflood/shared';

export async function findNearestAvailableShelters(db: Database, input: NearestSheltersInput) {
  const result = await db
    .select({
      id: shelters.id,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      shelterCode: shelters.shelterCode,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      status: shelters.status,
      distance: sql<number>`
        ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography
        ) / 1000
      `.as('distance_km'),
    })
    .from(shelters)
    .where(
      sql`${shelters.status} IN ('open', 'preparing') AND (${shelters.capacity} - ${shelters.currentOccupancy}) >= ${input.requiredCapacity}`
    )
    .orderBy(sql`ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${input.lng}, ${input.lat}), 4326)::geography)`)
    .limit(input.limit);

  return result.map((r) => ({
    ...r,
    availableCapacity: r.capacity - r.currentOccupancy,
    distance: Number(r.distance).toFixed(1),
  }));
}

export async function getSupplyGapAnalysis(db: Database) {
  // Get supplies grouped by type and shelter
  const result = await db
    .select({
      supplyType: reliefSupplies.supplyType,
      totalQuantity: sql<number>`COALESCE(SUM(${reliefSupplies.quantity}), 0)::int`.as('totalQuantity'),
      deliveredQuantity: sql<number>`COALESCE(SUM(CASE WHEN ${reliefSupplies.status} = 'delivered' THEN ${reliefSupplies.quantity} ELSE 0 END), 0)::int`.as('deliveredQuantity'),
      requestedQuantity: sql<number>`COALESCE(SUM(CASE WHEN ${reliefSupplies.status} = 'requested' THEN ${reliefSupplies.quantity} ELSE 0 END), 0)::int`.as('requestedQuantity'),
    })
    .from(reliefSupplies)
    .groupBy(reliefSupplies.supplyType)
    .orderBy(reliefSupplies.supplyType);

  return result;
}

export async function getCriticalShortages(db: Database) {
  // Find shelters where occupancy > 80% of capacity
  const overcrowded = await db
    .select({
      id: shelters.id,
      name_en: shelters.name_en,
      shelterCode: shelters.shelterCode,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      occupancyRate: sql<number>`ROUND((${shelters.currentOccupancy}::numeric / NULLIF(${shelters.capacity}, 0)) * 100, 1)`.as('occupancyRate'),
    })
    .from(shelters)
    .where(
      sql`${shelters.status} IN ('open', 'at_capacity', 'overcrowded') AND ${shelters.currentOccupancy}::numeric / NULLIF(${shelters.capacity}, 0) > 0.8`
    )
    .orderBy(desc(sql`${shelters.currentOccupancy}::numeric / NULLIF(${shelters.capacity}, 0)`))
    .limit(10);

  return overcrowded;
}

export async function getShelterRecommendation(db: Database, input: ShelterRecommendationInput) {
  const conditions = [
    sql`${shelters.status} IN ('open', 'preparing')`,
    sql`(${shelters.capacity} - ${shelters.currentOccupancy}) >= ${input.personCount}`,
  ];

  if (input.stateId) {
    conditions.push(sql`${shelters.stateId} = ${input.stateId}`);
  }

  const result = await db
    .select({
      id: shelters.id,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      shelterCode: shelters.shelterCode,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      status: shelters.status,
    })
    .from(shelters)
    .where(sql.join(conditions, sql` AND `))
    .orderBy(desc(sql`${shelters.capacity} - ${shelters.currentOccupancy}`))
    .limit(5);

  return result.map((r) => ({
    ...r,
    availableCapacity: r.capacity - r.currentOccupancy,
  }));
}
