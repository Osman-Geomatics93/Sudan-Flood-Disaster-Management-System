import { eq, and, sql, isNull, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { organizations } from '@sudanflood/db/schema';
import type { CreateOrganizationInput, UpdateOrganizationInput, ListOrganizationsInput } from '@sudanflood/shared';

export async function listOrganizations(db: Database, input: ListOrganizationsInput) {
  const conditions = [isNull(organizations.deletedAt)];

  if (input.type) {
    conditions.push(eq(organizations.orgType, input.type));
  }

  if (input.stateId) {
    conditions.push(eq(organizations.headquartersStateId, input.stateId));
  }

  if (input.search) {
    conditions.push(
      sql`(${organizations.name_en} ILIKE ${`%${input.search}%`} OR ${organizations.name_ar} ILIKE ${`%${input.search}%`} OR ${organizations.acronym} ILIKE ${`%${input.search}%`})`,
    );
  }

  const whereClause = and(...conditions);
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select()
      .from(organizations)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(organizations.name_en),
    db
      .select({ count: drizzleCount() })
      .from(organizations)
      .where(whereClause),
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

export async function getOrganizationById(db: Database, id: string) {
  const [org] = await db
    .select()
    .from(organizations)
    .where(and(eq(organizations.id, id), isNull(organizations.deletedAt)))
    .limit(1);

  if (!org) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' });
  }

  return org;
}

export async function createOrganization(db: Database, input: CreateOrganizationInput) {
  const [org] = await db
    .insert(organizations)
    .values({
      name_en: input.name_en,
      name_ar: input.name_ar,
      acronym: input.acronym ?? null,
      orgType: input.orgType,
      parentOrgId: input.parentOrgId ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      website: input.website ?? null,
      headquartersStateId: input.headquartersStateId ?? null,
    })
    .returning();

  return org;
}

export async function updateOrganization(db: Database, input: UpdateOrganizationInput) {
  const existing = await getOrganizationById(db, input.id);

  const [updated] = await db
    .update(organizations)
    .set({
      ...(input.name_en !== undefined && { name_en: input.name_en }),
      ...(input.name_ar !== undefined && { name_ar: input.name_ar }),
      ...(input.acronym !== undefined && { acronym: input.acronym }),
      ...(input.orgType !== undefined && { orgType: input.orgType }),
      ...(input.parentOrgId !== undefined && { parentOrgId: input.parentOrgId }),
      ...(input.contactEmail !== undefined && { contactEmail: input.contactEmail }),
      ...(input.contactPhone !== undefined && { contactPhone: input.contactPhone }),
      ...(input.website !== undefined && { website: input.website }),
      ...(input.headquartersStateId !== undefined && {
        headquartersStateId: input.headquartersStateId,
      }),
    })
    .where(eq(organizations.id, existing.id))
    .returning();

  return updated;
}

export async function deleteOrganization(db: Database, id: string) {
  await getOrganizationById(db, id);

  await db
    .update(organizations)
    .set({ deletedAt: new Date() })
    .where(eq(organizations.id, id));

  return { success: true };
}
