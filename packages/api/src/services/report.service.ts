import { eq, and, sql, count as drizzleCount } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import type { Database } from '@sudanflood/db';
import { situationReports, citizenReports } from '@sudanflood/db/schema';
import type {
  CreateSituationReportInput,
  CreateCitizenReportInput,
  ReviewCitizenReportInput,
} from '@sudanflood/shared';
import { generateEntityCode, CODE_PREFIXES } from '@sudanflood/shared';

// ── Situation Reports ─────────────────────────────────────────────

export async function listSituationReports(
  db: Database,
  input: {
    page: number;
    limit: number;
    incidentId?: string;
    reportType?: string;
    isPublished?: boolean;
  },
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.incidentId) {
    conditions.push(eq(situationReports.incidentId, input.incidentId));
  }
  if (input.reportType) {
    conditions.push(
      eq(
        situationReports.reportType,
        input.reportType as (typeof situationReports.reportType.enumValues)[number],
      ),
    );
  }
  if (input.isPublished !== undefined) {
    conditions.push(eq(situationReports.isPublished, input.isPublished));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: situationReports.id,
        reportCode: situationReports.reportCode,
        incidentId: situationReports.incidentId,
        reportType: situationReports.reportType,
        reportNumber: situationReports.reportNumber,
        title_en: situationReports.title_en,
        title_ar: situationReports.title_ar,
        summary_en: situationReports.summary_en,
        isPublished: situationReports.isPublished,
        publishedAt: situationReports.publishedAt,
        createdByUserId: situationReports.createdByUserId,
        createdAt: situationReports.createdAt,
      })
      .from(situationReports)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(situationReports.createdAt),
    db.select({ count: drizzleCount() }).from(situationReports).where(whereClause),
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

export async function getSituationReportById(db: Database, id: string) {
  const [report] = await db
    .select({
      id: situationReports.id,
      reportCode: situationReports.reportCode,
      incidentId: situationReports.incidentId,
      reportType: situationReports.reportType,
      reportNumber: situationReports.reportNumber,
      title_en: situationReports.title_en,
      title_ar: situationReports.title_ar,
      summary_en: situationReports.summary_en,
      summary_ar: situationReports.summary_ar,
      content: situationReports.content,
      stateId: situationReports.stateId,
      isPublished: situationReports.isPublished,
      publishedAt: situationReports.publishedAt,
      createdByUserId: situationReports.createdByUserId,
      createdByOrgId: situationReports.createdByOrgId,
      metadata: situationReports.metadata,
      createdAt: situationReports.createdAt,
      updatedAt: situationReports.updatedAt,
    })
    .from(situationReports)
    .where(eq(situationReports.id, id))
    .limit(1);

  if (!report) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Situation report not found' });
  }

  return report;
}

export async function createSituationReport(
  db: Database,
  input: CreateSituationReportInput,
  userId: string,
  orgId: string | null,
) {
  // Auto-increment report number per incident
  const [numberResult] = await db
    .select({ count: drizzleCount() })
    .from(situationReports)
    .where(eq(situationReports.incidentId, input.incidentId));
  const reportNumber = (numberResult?.count ?? 0) + 1;

  // Generate entity code
  const countResult = await db.select({ count: drizzleCount() }).from(situationReports);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const reportCode = generateEntityCode(CODE_PREFIXES.SITUATION_REPORT, seq);

  const [report] = await db
    .insert(situationReports)
    .values({
      reportCode,
      incidentId: input.incidentId,
      reportType: input.reportType,
      reportNumber,
      title_en: input.title_en,
      title_ar: input.title_ar ?? null,
      summary_en: input.summary_en ?? null,
      summary_ar: input.summary_ar ?? null,
      content: input.content ?? {},
      stateId: input.stateId ?? null,
      createdByUserId: userId,
      createdByOrgId: orgId,
    })
    .returning();

  if (!report) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create situation report',
    });
  }

  return getSituationReportById(db, report.id);
}

export async function publishSituationReport(db: Database, id: string) {
  await getSituationReportById(db, id);

  await db
    .update(situationReports)
    .set({
      isPublished: true,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(situationReports.id, id));

  return getSituationReportById(db, id);
}

// ── Citizen Reports ───────────────────────────────────────────────

export async function listCitizenReports(
  db: Database,
  input: {
    page: number;
    limit: number;
    status?: string;
    urgency?: string;
    stateId?: string;
    reportType?: string;
  },
) {
  const conditions: ReturnType<typeof eq>[] = [];

  if (input.status) {
    conditions.push(eq(citizenReports.status, input.status));
  }
  if (input.urgency) {
    conditions.push(
      eq(
        citizenReports.urgency,
        input.urgency as (typeof citizenReports.urgency.enumValues)[number],
      ),
    );
  }
  if (input.stateId) {
    conditions.push(eq(citizenReports.stateId, input.stateId));
  }
  if (input.reportType) {
    conditions.push(eq(citizenReports.reportType, input.reportType));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (input.page - 1) * input.limit;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: citizenReports.id,
        reportCode: citizenReports.reportCode,
        reporterUserId: citizenReports.reporterUserId,
        reporterPhone: citizenReports.reporterPhone,
        reporterName: citizenReports.reporterName,
        stateId: citizenReports.stateId,
        localityId: citizenReports.localityId,
        reportType: citizenReports.reportType,
        urgency: citizenReports.urgency,
        description_ar: citizenReports.description_ar,
        description_en: citizenReports.description_en,
        status: citizenReports.status,
        reviewedByUserId: citizenReports.reviewedByUserId,
        linkedTaskId: citizenReports.linkedTaskId,
        linkedRescueId: citizenReports.linkedRescueId,
        location: sql<unknown>`ST_AsGeoJSON(${citizenReports}.location)::json`,
        createdAt: citizenReports.createdAt,
      })
      .from(citizenReports)
      .where(whereClause)
      .limit(input.limit)
      .offset(offset)
      .orderBy(citizenReports.createdAt),
    db.select({ count: drizzleCount() }).from(citizenReports).where(whereClause),
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

export async function getCitizenReportById(db: Database, id: string) {
  const [report] = await db
    .select({
      id: citizenReports.id,
      reportCode: citizenReports.reportCode,
      reporterUserId: citizenReports.reporterUserId,
      reporterPhone: citizenReports.reporterPhone,
      reporterName: citizenReports.reporterName,
      stateId: citizenReports.stateId,
      localityId: citizenReports.localityId,
      reportType: citizenReports.reportType,
      urgency: citizenReports.urgency,
      description_ar: citizenReports.description_ar,
      description_en: citizenReports.description_en,
      status: citizenReports.status,
      reviewedByUserId: citizenReports.reviewedByUserId,
      linkedTaskId: citizenReports.linkedTaskId,
      linkedRescueId: citizenReports.linkedRescueId,
      location: sql<unknown>`ST_AsGeoJSON(${citizenReports}.location)::json`,
      metadata: citizenReports.metadata,
      createdAt: citizenReports.createdAt,
      updatedAt: citizenReports.updatedAt,
    })
    .from(citizenReports)
    .where(eq(citizenReports.id, id))
    .limit(1);

  if (!report) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Citizen report not found' });
  }

  return report;
}

export async function createCitizenReport(
  db: Database,
  input: CreateCitizenReportInput,
  userId: string,
) {
  const countResult = await db.select({ count: drizzleCount() }).from(citizenReports);
  const seq = (countResult[0]?.count ?? 0) + 1;
  const reportCode = generateEntityCode(CODE_PREFIXES.CITIZEN_REPORT, seq);

  if (input.location) {
    // Use raw SQL for geometry insert
    const [lng, lat] = input.location;
    const result = await db.execute(
      sql`INSERT INTO citizen_reports (
        report_code, reporter_user_id, reporter_phone, reporter_name,
        state_id, locality_id, report_type, urgency,
        description_ar, description_en, status, location
      ) VALUES (
        ${reportCode}, ${userId}, ${input.reporterPhone ?? null}, ${input.reporterName ?? null},
        ${input.stateId ?? null}, ${input.localityId ?? null}, ${input.reportType}, ${input.urgency},
        ${input.description_ar ?? null}, ${input.description_en ?? null}, 'submitted',
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
      ) RETURNING id`,
    );
    const id = (result as unknown as { rows: { id: string }[] }).rows?.[0]?.id;
    if (!id) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create citizen report',
      });
    }
    return getCitizenReportById(db, id);
  }

  const [report] = await db
    .insert(citizenReports)
    .values({
      reportCode,
      reporterUserId: userId,
      reporterPhone: input.reporterPhone ?? null,
      reporterName: input.reporterName ?? null,
      stateId: input.stateId ?? null,
      localityId: input.localityId ?? null,
      reportType: input.reportType,
      urgency: input.urgency,
      description_ar: input.description_ar ?? null,
      description_en: input.description_en ?? null,
      status: 'submitted',
    })
    .returning();

  if (!report) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create citizen report',
    });
  }

  return getCitizenReportById(db, report.id);
}

export async function reviewCitizenReport(
  db: Database,
  input: ReviewCitizenReportInput,
  reviewerId: string,
) {
  await getCitizenReportById(db, input.id);

  await db
    .update(citizenReports)
    .set({
      status: input.status,
      reviewedByUserId: reviewerId,
      linkedTaskId: input.linkedTaskId ?? null,
      linkedRescueId: input.linkedRescueId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(citizenReports.id, input.id));

  return getCitizenReportById(db, input.id);
}

// ── Stats ─────────────────────────────────────────────────────────

export async function getReportStats(db: Database) {
  const [sitrepTotal, sitrepByType, citizenTotal, citizenByStatus, citizenByUrgency] =
    await Promise.all([
      db.select({ count: drizzleCount() }).from(situationReports),
      db
        .select({
          type: situationReports.reportType,
          count: drizzleCount(),
        })
        .from(situationReports)
        .groupBy(situationReports.reportType),
      db.select({ count: drizzleCount() }).from(citizenReports),
      db
        .select({
          status: citizenReports.status,
          count: drizzleCount(),
        })
        .from(citizenReports)
        .groupBy(citizenReports.status),
      db
        .select({
          urgency: citizenReports.urgency,
          count: drizzleCount(),
        })
        .from(citizenReports)
        .groupBy(citizenReports.urgency),
    ]);

  return {
    situationReports: {
      total: sitrepTotal[0]?.count ?? 0,
      byType: sitrepByType,
    },
    citizenReports: {
      total: citizenTotal[0]?.count ?? 0,
      byStatus: citizenByStatus,
      byUrgency: citizenByUrgency,
    },
  };
}
