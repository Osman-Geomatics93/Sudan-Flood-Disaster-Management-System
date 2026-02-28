import { eq, and, sql, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { reliefSupplies, notifications } from '@sudanflood/db/schema';
import type { RequestSupplyInput } from '@sudanflood/shared';
import { CODE_PREFIXES } from '@sudanflood/shared';
import { withCodeRetry } from '../utils/entity-code.js';

export async function listSupplies(
  db: Database,
  input: {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    sourceOrgId?: string;
    destOrgId?: string;
  },
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.type) {
    conditions.push(
      eq(
        reliefSupplies.supplyType,
        input.type as (typeof reliefSupplies.supplyType.enumValues)[number],
      ),
    );
  }
  if (input.status) {
    conditions.push(
      eq(reliefSupplies.status, input.status as (typeof reliefSupplies.status.enumValues)[number]),
    );
  }
  if (input.sourceOrgId) {
    conditions.push(eq(reliefSupplies.sourceOrgId, input.sourceOrgId));
  }
  if (input.destOrgId) {
    conditions.push(eq(reliefSupplies.destinationOrgId, input.destOrgId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: reliefSupplies.id,
        trackingCode: reliefSupplies.trackingCode,
        supplyType: reliefSupplies.supplyType,
        status: reliefSupplies.status,
        itemName_en: reliefSupplies.itemName_en,
        itemName_ar: reliefSupplies.itemName_ar,
        quantity: reliefSupplies.quantity,
        unit: reliefSupplies.unit,
        sourceOrgId: reliefSupplies.sourceOrgId,
        destinationOrgId: reliefSupplies.destinationOrgId,
        destinationShelterId: reliefSupplies.destinationShelterId,
        shippedAt: reliefSupplies.shippedAt,
        deliveredAt: reliefSupplies.deliveredAt,
        createdAt: reliefSupplies.createdAt,
      })
      .from(reliefSupplies)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(reliefSupplies.createdAt),
    db.select({ count: drizzleCount() }).from(reliefSupplies).where(whereClause),
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

export async function getSupplyById(db: Database, id: string) {
  const [supply] = await db
    .select({
      id: reliefSupplies.id,
      trackingCode: reliefSupplies.trackingCode,
      supplyType: reliefSupplies.supplyType,
      status: reliefSupplies.status,
      itemName_en: reliefSupplies.itemName_en,
      itemName_ar: reliefSupplies.itemName_ar,
      quantity: reliefSupplies.quantity,
      unit: reliefSupplies.unit,
      unitCostSdg: reliefSupplies.unitCostSdg,
      totalCostSdg: reliefSupplies.totalCostSdg,
      sourceOrgId: reliefSupplies.sourceOrgId,
      destinationOrgId: reliefSupplies.destinationOrgId,
      destinationShelterId: reliefSupplies.destinationShelterId,
      stateId: reliefSupplies.stateId,
      expiryDate: reliefSupplies.expiryDate,
      shippedAt: reliefSupplies.shippedAt,
      deliveredAt: reliefSupplies.deliveredAt,
      distributedAt: reliefSupplies.distributedAt,
      requestedByUserId: reliefSupplies.requestedByUserId,
      approvedByUserId: reliefSupplies.approvedByUserId,
      notes: reliefSupplies.notes,
      metadata: reliefSupplies.metadata,
      createdAt: reliefSupplies.createdAt,
      updatedAt: reliefSupplies.updatedAt,
      currentLocation: sql<unknown>`ST_AsGeoJSON(current_location)::json`,
    })
    .from(reliefSupplies)
    .where(eq(reliefSupplies.id, id))
    .limit(1);

  if (!supply) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Supply not found' });
  }

  return supply;
}

export async function requestSupply(db: Database, input: RequestSupplyInput, userId: string) {
  return withCodeRetry(
    async (trackingCode) => {
      const [supply] = await db
        .insert(reliefSupplies)
        .values({
          trackingCode,
          supplyType: input.supplyType,
          status: 'requested',
          itemName_en: input.itemName_en,
          itemName_ar: input.itemName_ar ?? null,
          quantity: String(input.quantity),
          unit: input.unit,
          sourceOrgId: input.sourceOrgId,
          destinationOrgId: input.destinationOrgId ?? null,
          destinationShelterId: input.destinationShelterId ?? null,
          stateId: input.stateId ?? null,
          expiryDate: input.expiryDate ? input.expiryDate.toISOString().split('T')[0]! : null,
          notes: input.notes ?? null,
          requestedByUserId: userId,
        })
        .returning();

      if (!supply) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create supply request',
        });
      }

      return getSupplyById(db, supply.id);
    },
    db,
    reliefSupplies,
    CODE_PREFIXES.RELIEF_SUPPLY,
  );
}

export async function approveSupply(
  db: Database,
  id: string,
  userId: string,
  unitCostSdg?: number,
) {
  const supply = await getSupplyById(db, id);

  if (supply.status !== 'requested') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Supply can only be approved from requested status',
    });
  }

  const totalCost = unitCostSdg != null ? String(unitCostSdg * Number(supply.quantity)) : null;

  await db
    .update(reliefSupplies)
    .set({
      status: 'approved',
      approvedByUserId: userId,
      unitCostSdg: unitCostSdg != null ? String(unitCostSdg) : undefined,
      totalCostSdg: totalCost ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(reliefSupplies.id, id));

  await notifySupplyStatusChange(db, id, 'approved');
  return getSupplyById(db, id);
}

export async function rejectSupply(db: Database, id: string) {
  const supply = await getSupplyById(db, id);

  if (supply.status !== 'requested') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Supply can only be rejected from requested status',
    });
  }

  await db
    .update(reliefSupplies)
    .set({ status: 'damaged', updatedAt: new Date() })
    .where(eq(reliefSupplies.id, id));

  await notifySupplyStatusChange(db, id, 'rejected');
  return getSupplyById(db, id);
}

export async function shipSupply(db: Database, id: string, originLocation?: [number, number]) {
  const supply = await getSupplyById(db, id);

  if (supply.status !== 'approved') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Supply can only be shipped from approved status',
    });
  }

  await db
    .update(reliefSupplies)
    .set({ status: 'in_transit', shippedAt: new Date(), updatedAt: new Date() })
    .where(eq(reliefSupplies.id, id));

  if (originLocation) {
    const [lng, lat] = originLocation;
    await db.execute(
      sql`UPDATE relief_supplies SET origin_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326) WHERE id = ${id}`,
    );
  }

  await notifySupplyStatusChange(db, id, 'in_transit');
  return getSupplyById(db, id);
}

export async function markDelivered(db: Database, id: string) {
  const supply = await getSupplyById(db, id);

  if (supply.status !== 'in_transit') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Supply can only be delivered from in_transit status',
    });
  }

  await db
    .update(reliefSupplies)
    .set({ status: 'delivered', deliveredAt: new Date(), updatedAt: new Date() })
    .where(eq(reliefSupplies.id, id));

  await notifySupplyStatusChange(db, id, 'delivered');
  return getSupplyById(db, id);
}

export async function updateSupplyLocation(
  db: Database,
  id: string,
  currentLocation: [number, number],
) {
  await getSupplyById(db, id);

  const [lng, lat] = currentLocation;
  await db.execute(
    sql`UPDATE relief_supplies SET current_location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326), updated_at = NOW() WHERE id = ${id}`,
  );

  return getSupplyById(db, id);
}

export async function cancelSupply(db: Database, id: string) {
  const supply = await getSupplyById(db, id);

  if (supply.status === 'delivered' || supply.status === 'distributed') {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Cannot cancel a delivered or distributed supply',
    });
  }

  await db
    .update(reliefSupplies)
    .set({ status: 'expired', updatedAt: new Date() })
    .where(eq(reliefSupplies.id, id));

  return getSupplyById(db, id);
}

export async function getSupplyStats(db: Database) {
  const [totalResult, byStatusResult, byTypeResult] = await Promise.all([
    db.select({ count: drizzleCount() }).from(reliefSupplies),
    db
      .select({
        status: reliefSupplies.status,
        count: drizzleCount(),
      })
      .from(reliefSupplies)
      .groupBy(reliefSupplies.status),
    db
      .select({
        type: reliefSupplies.supplyType,
        count: drizzleCount(),
      })
      .from(reliefSupplies)
      .groupBy(reliefSupplies.supplyType),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    byStatus: byStatusResult,
    byType: byTypeResult,
  };
}

async function notifySupplyStatusChange(db: Database, supplyId: string, newStatus: string) {
  try {
    const [supply] = await db
      .select({
        requestedByUserId: reliefSupplies.requestedByUserId,
        trackingCode: reliefSupplies.trackingCode,
      })
      .from(reliefSupplies)
      .where(eq(reliefSupplies.id, supplyId))
      .limit(1);

    if (supply?.requestedByUserId) {
      await db.insert(notifications).values({
        userId: supply.requestedByUserId,
        title_en: `Supply ${supply.trackingCode} status changed to ${newStatus}`,
        title_ar: `تم تغيير حالة الإمداد ${supply.trackingCode} إلى ${newStatus}`,
        notificationType: 'supply_status_change',
        severity: 'info',
        referenceType: 'relief_supply',
        referenceId: supplyId,
      });
    }
  } catch {
    // Don't fail the main operation if notification fails
  }
}
