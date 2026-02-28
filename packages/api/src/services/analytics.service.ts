import { sql, count as drizzleCount, desc, gte } from 'drizzle-orm';
import type { Database } from '@sudanflood/db';
import { displacedPersons, reliefSupplies, shelters, emergencyCalls } from '@sudanflood/db/schema';

export async function getDisplacementTrend(db: Database, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`date_trunc('day', ${displacedPersons.registeredAt})::date`.as('date'),
      count: drizzleCount(),
    })
    .from(displacedPersons)
    .where(gte(displacedPersons.registeredAt, startDate))
    .groupBy(sql`date_trunc('day', ${displacedPersons.registeredAt})::date`)
    .orderBy(sql`date_trunc('day', ${displacedPersons.registeredAt})::date`);

  return result;
}

export async function getSupplyStatsByType(db: Database) {
  const result = await db
    .select({
      type: reliefSupplies.supplyType,
      count: drizzleCount(),
      totalQuantity: sql<number>`COALESCE(SUM(${reliefSupplies.quantity}), 0)::int`.as('totalQuantity'),
    })
    .from(reliefSupplies)
    .groupBy(reliefSupplies.supplyType)
    .orderBy(desc(drizzleCount()));

  return result;
}

export async function getShelterOccupancyRanking(db: Database, limit: number) {
  const result = await db
    .select({
      id: shelters.id,
      name_en: shelters.name_en,
      name_ar: shelters.name_ar,
      capacity: shelters.capacity,
      currentOccupancy: shelters.currentOccupancy,
      status: shelters.status,
    })
    .from(shelters)
    .orderBy(desc(shelters.currentOccupancy))
    .limit(limit);

  return result;
}

export async function getResponseTimeStats(db: Database) {
  const result = await db
    .select({
      avgResponseMinutes: sql<number>`
        COALESCE(
          AVG(EXTRACT(EPOCH FROM (${emergencyCalls.dispatchedAt} - ${emergencyCalls.receivedAt})) / 60),
          0
        )::numeric(10,1)
      `.as('avgResponseMinutes'),
      totalCalls: drizzleCount(),
    })
    .from(emergencyCalls)
    .where(sql`${emergencyCalls.dispatchedAt} IS NOT NULL`);

  return result[0] ?? { avgResponseMinutes: 0, totalCalls: 0 };
}

export async function getEmergencyCallsByUrgency(db: Database) {
  const result = await db
    .select({
      urgency: emergencyCalls.urgency,
      count: drizzleCount(),
    })
    .from(emergencyCalls)
    .groupBy(emergencyCalls.urgency)
    .orderBy(drizzleCount());

  return result;
}
