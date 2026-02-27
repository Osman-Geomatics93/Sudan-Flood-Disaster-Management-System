import { eq, and, sql, isNull, or, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { displacedPersons, familyGroups, shelters } from '@sudanflood/db/schema';
import type { RegisterDisplacedPersonInput } from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';

export async function listDisplacedPersons(
  db: Database,
  input: {
    page: number;
    limit: number;
    status?: string;
    shelterId?: string;
    healthStatus?: string;
    stateId?: string;
    search?: string;
  },
) {
  const conditions = [isNull(displacedPersons.deletedAt)];

  if (input.status) {
    conditions.push(
      eq(displacedPersons.status, input.status as typeof displacedPersons.status.enumValues[number]),
    );
  }
  if (input.shelterId) {
    conditions.push(eq(displacedPersons.currentShelterId, input.shelterId));
  }
  if (input.healthStatus) {
    conditions.push(
      eq(
        displacedPersons.healthStatus,
        input.healthStatus as typeof displacedPersons.healthStatus.enumValues[number],
      ),
    );
  }
  if (input.stateId) {
    conditions.push(eq(displacedPersons.originStateId, input.stateId));
  }
  if (input.search) {
    const pattern = `%${input.search}%`;
    conditions.push(
      or(
        sql`${displacedPersons.firstName_ar} ILIKE ${pattern}`,
        sql`${displacedPersons.lastName_ar} ILIKE ${pattern}`,
        sql`${displacedPersons.firstName_en} ILIKE ${pattern}`,
        sql`${displacedPersons.lastName_en} ILIKE ${pattern}`,
        sql`${displacedPersons.phone} ILIKE ${pattern}`,
        sql`${displacedPersons.nationalId} ILIKE ${pattern}`,
      )!,
    );
  }

  const whereClause = and(...conditions);
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: displacedPersons.id,
        registrationCode: displacedPersons.registrationCode,
        firstName_ar: displacedPersons.firstName_ar,
        lastName_ar: displacedPersons.lastName_ar,
        firstName_en: displacedPersons.firstName_en,
        lastName_en: displacedPersons.lastName_en,
        dateOfBirth: displacedPersons.dateOfBirth,
        gender: displacedPersons.gender,
        nationalId: displacedPersons.nationalId,
        phone: displacedPersons.phone,
        status: displacedPersons.status,
        healthStatus: displacedPersons.healthStatus,
        hasDisability: displacedPersons.hasDisability,
        isUnaccompaniedMinor: displacedPersons.isUnaccompaniedMinor,
        currentShelterId: displacedPersons.currentShelterId,
        familyGroupId: displacedPersons.familyGroupId,
        createdAt: displacedPersons.createdAt,
      })
      .from(displacedPersons)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(displacedPersons.createdAt),
    db.select({ count: drizzleCount() }).from(displacedPersons).where(whereClause),
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

export async function getDisplacedPersonById(db: Database, id: string) {
  const [person] = await db
    .select({
      id: displacedPersons.id,
      registrationCode: displacedPersons.registrationCode,
      firstName_ar: displacedPersons.firstName_ar,
      lastName_ar: displacedPersons.lastName_ar,
      firstName_en: displacedPersons.firstName_en,
      lastName_en: displacedPersons.lastName_en,
      dateOfBirth: displacedPersons.dateOfBirth,
      gender: displacedPersons.gender,
      nationalId: displacedPersons.nationalId,
      phone: displacedPersons.phone,
      status: displacedPersons.status,
      healthStatus: displacedPersons.healthStatus,
      healthNotes: displacedPersons.healthNotes,
      hasDisability: displacedPersons.hasDisability,
      disabilityNotes: displacedPersons.disabilityNotes,
      isUnaccompaniedMinor: displacedPersons.isUnaccompaniedMinor,
      currentShelterId: displacedPersons.currentShelterId,
      familyGroupId: displacedPersons.familyGroupId,
      originStateId: displacedPersons.originStateId,
      originLocalityId: displacedPersons.originLocalityId,
      specialNeeds: displacedPersons.specialNeeds,
      registeredAt: displacedPersons.registeredAt,
      createdAt: displacedPersons.createdAt,
      updatedAt: displacedPersons.updatedAt,
      // Family group info
      familyCode: familyGroups.familyCode,
      familySize: familyGroups.familySize,
      // Shelter info
      shelterName: shelters.name_en,
      shelterCode: shelters.shelterCode,
    })
    .from(displacedPersons)
    .leftJoin(familyGroups, eq(displacedPersons.familyGroupId, familyGroups.id))
    .leftJoin(shelters, eq(displacedPersons.currentShelterId, shelters.id))
    .where(and(eq(displacedPersons.id, id), isNull(displacedPersons.deletedAt)))
    .limit(1);

  if (!person) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Displaced person not found' });
  }

  return person;
}

export async function registerDisplacedPerson(db: Database, input: RegisterDisplacedPersonInput) {
  const countResult = await db.select({ count: drizzleCount() }).from(displacedPersons);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const registrationCode = generateEntityCode(CODE_PREFIXES.DISPLACED_PERSON, seq);

  const [person] = await db
    .insert(displacedPersons)
    .values({
      registrationCode,
      firstName_ar: input.firstName_ar,
      lastName_ar: input.lastName_ar,
      firstName_en: input.firstName_en ?? null,
      lastName_en: input.lastName_en ?? null,
      dateOfBirth: input.dateOfBirth ? input.dateOfBirth.toISOString().split('T')[0] : null,
      gender: input.gender ?? null,
      nationalId: input.nationalId ?? null,
      phone: input.phone ?? null,
      status: input.shelterId ? 'sheltered' : 'registered',
      healthStatus: input.healthStatus ?? 'unknown',
      healthNotes: input.healthNotes ?? null,
      hasDisability: input.hasDisability ?? false,
      disabilityNotes: input.disabilityNotes ?? null,
      isUnaccompaniedMinor: input.isUnaccompaniedMinor ?? false,
      currentShelterId: input.shelterId ?? null,
      familyGroupId: input.familyGroupId ?? null,
      originStateId: input.originStateId ?? null,
      originLocalityId: input.originLocalityId ?? null,
      specialNeeds: input.specialNeeds ?? null,
    })
    .returning();

  if (!person) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to register displaced person',
    });
  }

  // Increment shelter occupancy if assigned
  if (input.shelterId) {
    await db
      .update(shelters)
      .set({
        currentOccupancy: sql`${shelters.currentOccupancy} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(shelters.id, input.shelterId));
  }

  return getDisplacedPersonById(db, person.id);
}

export async function updateDisplacedPerson(
  db: Database,
  input: {
    id: string;
    firstName_ar?: string;
    lastName_ar?: string;
    firstName_en?: string;
    lastName_en?: string;
    dateOfBirth?: Date;
    gender?: string;
    nationalId?: string;
    phone?: string;
    status?: string;
    healthStatus?: string;
    healthNotes?: string;
    hasDisability?: boolean;
    disabilityNotes?: string;
    isUnaccompaniedMinor?: boolean;
    specialNeeds?: string;
    originStateId?: string;
    originLocalityId?: string;
    familyGroupId?: string;
    shelterId?: string;
  },
) {
  const existing = await getDisplacedPersonById(db, input.id);

  await db
    .update(displacedPersons)
    .set({
      ...(input.firstName_ar !== undefined && { firstName_ar: input.firstName_ar }),
      ...(input.lastName_ar !== undefined && { lastName_ar: input.lastName_ar }),
      ...(input.firstName_en !== undefined && { firstName_en: input.firstName_en }),
      ...(input.lastName_en !== undefined && { lastName_en: input.lastName_en }),
      ...(input.dateOfBirth !== undefined && {
        dateOfBirth: input.dateOfBirth.toISOString().split('T')[0],
      }),
      ...(input.gender !== undefined && { gender: input.gender }),
      ...(input.nationalId !== undefined && { nationalId: input.nationalId }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.status !== undefined && {
        status: input.status as typeof displacedPersons.status.enumValues[number],
      }),
      ...(input.healthStatus !== undefined && {
        healthStatus: input.healthStatus as typeof displacedPersons.healthStatus.enumValues[number],
      }),
      ...(input.healthNotes !== undefined && { healthNotes: input.healthNotes }),
      ...(input.hasDisability !== undefined && { hasDisability: input.hasDisability }),
      ...(input.disabilityNotes !== undefined && { disabilityNotes: input.disabilityNotes }),
      ...(input.isUnaccompaniedMinor !== undefined && {
        isUnaccompaniedMinor: input.isUnaccompaniedMinor,
      }),
      ...(input.specialNeeds !== undefined && { specialNeeds: input.specialNeeds }),
      ...(input.originStateId !== undefined && { originStateId: input.originStateId }),
      ...(input.originLocalityId !== undefined && { originLocalityId: input.originLocalityId }),
      ...(input.familyGroupId !== undefined && { familyGroupId: input.familyGroupId }),
      ...(input.shelterId !== undefined && { currentShelterId: input.shelterId }),
      updatedAt: new Date(),
    })
    .where(eq(displacedPersons.id, existing.id));

  return getDisplacedPersonById(db, input.id);
}

export async function assignShelter(
  db: Database,
  input: { personId: string; shelterId: string },
) {
  const person = await getDisplacedPersonById(db, input.personId);

  // Verify target shelter exists
  const [targetShelter] = await db
    .select({ id: shelters.id })
    .from(shelters)
    .where(and(eq(shelters.id, input.shelterId), isNull(shelters.deletedAt)))
    .limit(1);

  if (!targetShelter) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Target shelter not found' });
  }

  // Decrement old shelter occupancy if person was previously sheltered
  if (person.currentShelterId) {
    await db
      .update(shelters)
      .set({
        currentOccupancy: sql`GREATEST(${shelters.currentOccupancy} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(shelters.id, person.currentShelterId));
  }

  // Increment new shelter occupancy
  await db
    .update(shelters)
    .set({
      currentOccupancy: sql`${shelters.currentOccupancy} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(shelters.id, input.shelterId));

  // Update person
  await db
    .update(displacedPersons)
    .set({
      currentShelterId: input.shelterId,
      status: 'sheltered',
      updatedAt: new Date(),
    })
    .where(eq(displacedPersons.id, input.personId));

  return getDisplacedPersonById(db, input.personId);
}

export async function updateHealth(
  db: Database,
  input: { id: string; healthStatus: string; healthNotes?: string },
) {
  await getDisplacedPersonById(db, input.id);

  await db
    .update(displacedPersons)
    .set({
      healthStatus: input.healthStatus as typeof displacedPersons.healthStatus.enumValues[number],
      ...(input.healthNotes !== undefined && { healthNotes: input.healthNotes }),
      updatedAt: new Date(),
    })
    .where(eq(displacedPersons.id, input.id));

  return getDisplacedPersonById(db, input.id);
}

export async function searchDisplacedPersons(db: Database, query: string) {
  const pattern = `%${query}%`;

  const results = await db
    .select({
      id: displacedPersons.id,
      registrationCode: displacedPersons.registrationCode,
      firstName_ar: displacedPersons.firstName_ar,
      lastName_ar: displacedPersons.lastName_ar,
      firstName_en: displacedPersons.firstName_en,
      lastName_en: displacedPersons.lastName_en,
      phone: displacedPersons.phone,
      nationalId: displacedPersons.nationalId,
      status: displacedPersons.status,
      healthStatus: displacedPersons.healthStatus,
      currentShelterId: displacedPersons.currentShelterId,
    })
    .from(displacedPersons)
    .where(
      and(
        isNull(displacedPersons.deletedAt),
        or(
          sql`${displacedPersons.firstName_ar} ILIKE ${pattern}`,
          sql`${displacedPersons.lastName_ar} ILIKE ${pattern}`,
          sql`${displacedPersons.firstName_en} ILIKE ${pattern}`,
          sql`${displacedPersons.lastName_en} ILIKE ${pattern}`,
          sql`${displacedPersons.phone} ILIKE ${pattern}`,
          sql`${displacedPersons.nationalId} ILIKE ${pattern}`,
        ),
      ),
    )
    .limit(50);

  return results;
}

export async function getDisplacedPersonStats(db: Database) {
  const baseCondition = isNull(displacedPersons.deletedAt);

  const [totalResult, byStatusResult, byHealthResult, minorsResult] = await Promise.all([
    db.select({ count: drizzleCount() }).from(displacedPersons).where(baseCondition),
    db
      .select({
        status: displacedPersons.status,
        count: drizzleCount(),
      })
      .from(displacedPersons)
      .where(baseCondition)
      .groupBy(displacedPersons.status),
    db
      .select({
        healthStatus: displacedPersons.healthStatus,
        count: drizzleCount(),
      })
      .from(displacedPersons)
      .where(baseCondition)
      .groupBy(displacedPersons.healthStatus),
    db
      .select({ count: drizzleCount() })
      .from(displacedPersons)
      .where(and(baseCondition, eq(displacedPersons.isUnaccompaniedMinor, true))),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    byStatus: byStatusResult,
    byHealth: byHealthResult,
    unaccompaniedMinors: minorsResult[0]?.count ?? 0,
  };
}

export async function createFamilyGroup(
  db: Database,
  input: {
    headOfFamilyId?: string;
    familySize: number;
    originStateId?: string;
    originLocalityId?: string;
    originAddress?: string;
    notes?: string;
  },
) {
  const countResult = await db.select({ count: drizzleCount() }).from(familyGroups);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const familyCode = generateEntityCode(CODE_PREFIXES.FAMILY_GROUP, seq);

  const [group] = await db
    .insert(familyGroups)
    .values({
      familyCode,
      headOfFamilyId: input.headOfFamilyId ?? null,
      familySize: input.familySize,
      originStateId: input.originStateId ?? null,
      originLocalityId: input.originLocalityId ?? null,
      originAddress: input.originAddress ?? null,
      notes: input.notes ?? null,
    })
    .returning();

  if (!group) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create family group',
    });
  }

  // If headOfFamilyId is set, assign the person to this family group
  if (input.headOfFamilyId) {
    await db
      .update(displacedPersons)
      .set({ familyGroupId: group.id, updatedAt: new Date() })
      .where(eq(displacedPersons.id, input.headOfFamilyId));
  }

  return group;
}

export async function addFamilyMember(
  db: Database,
  input: { familyGroupId: string; personId: string },
) {
  // Verify family group exists
  const [group] = await db
    .select()
    .from(familyGroups)
    .where(eq(familyGroups.id, input.familyGroupId))
    .limit(1);

  if (!group) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Family group not found' });
  }

  // Verify person exists
  await getDisplacedPersonById(db, input.personId);

  // Assign person to family group
  await db
    .update(displacedPersons)
    .set({ familyGroupId: input.familyGroupId, updatedAt: new Date() })
    .where(eq(displacedPersons.id, input.personId));

  // Update family size
  await db
    .update(familyGroups)
    .set({
      familySize: sql`${familyGroups.familySize} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(familyGroups.id, input.familyGroupId));

  return getFamilyGroupById(db, input.familyGroupId);
}

export async function getFamilyGroupById(db: Database, id: string) {
  const [group] = await db
    .select()
    .from(familyGroups)
    .where(eq(familyGroups.id, id))
    .limit(1);

  if (!group) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Family group not found' });
  }

  const members = await db
    .select({
      id: displacedPersons.id,
      registrationCode: displacedPersons.registrationCode,
      firstName_ar: displacedPersons.firstName_ar,
      lastName_ar: displacedPersons.lastName_ar,
      firstName_en: displacedPersons.firstName_en,
      lastName_en: displacedPersons.lastName_en,
      status: displacedPersons.status,
      healthStatus: displacedPersons.healthStatus,
    })
    .from(displacedPersons)
    .where(
      and(eq(displacedPersons.familyGroupId, id), isNull(displacedPersons.deletedAt)),
    );

  return { ...group, members };
}
