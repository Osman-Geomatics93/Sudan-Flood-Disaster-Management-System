import { router, protectedProcedure, requirePermission } from '../trpc.js';
import {
  listSituationReportsSchema,
  createSituationReportSchema,
  publishReportSchema,
  listCitizenReportsSchema,
  createCitizenReportSchema,
  reviewCitizenReportSchema,
  idParamSchema,
} from '@sudanflood/shared';
import {
  listSituationReports,
  getSituationReportById,
  createSituationReport,
  publishSituationReport,
  listCitizenReports,
  getCitizenReportById,
  createCitizenReport,
  reviewCitizenReport,
  getReportStats,
} from '../services/report.service.js';

export const reportRouter = router({
  // ── Situation Reports ───────────────────────────────────────────
  sitrep: router({
    list: protectedProcedure
      .use(requirePermission('report:read'))
      .input(listSituationReportsSchema)
      .query(async ({ input, ctx }) => {
        return listSituationReports(ctx.db, input);
      }),

    getById: protectedProcedure
      .use(requirePermission('report:read'))
      .input(idParamSchema)
      .query(async ({ input, ctx }) => {
        return getSituationReportById(ctx.db, input.id);
      }),

    create: protectedProcedure
      .use(requirePermission('report:create'))
      .input(createSituationReportSchema)
      .mutation(async ({ input, ctx }) => {
        return createSituationReport(ctx.db, input, ctx.user.id, ctx.user.orgId);
      }),

    publish: protectedProcedure
      .use(requirePermission('report:publish'))
      .input(publishReportSchema)
      .mutation(async ({ input, ctx }) => {
        return publishSituationReport(ctx.db, input.id);
      }),
  }),

  // ── Citizen Reports ─────────────────────────────────────────────
  citizen: router({
    list: protectedProcedure
      .use(requirePermission('citizen_report:read'))
      .input(listCitizenReportsSchema)
      .query(async ({ input, ctx }) => {
        return listCitizenReports(ctx.db, input);
      }),

    getById: protectedProcedure
      .use(requirePermission('citizen_report:read'))
      .input(idParamSchema)
      .query(async ({ input, ctx }) => {
        return getCitizenReportById(ctx.db, input.id);
      }),

    submit: protectedProcedure
      .use(requirePermission('citizen_report:submit'))
      .input(createCitizenReportSchema)
      .mutation(async ({ input, ctx }) => {
        return createCitizenReport(ctx.db, input, ctx.user.id);
      }),

    review: protectedProcedure
      .use(requirePermission('citizen_report:review'))
      .input(reviewCitizenReportSchema)
      .mutation(async ({ input, ctx }) => {
        return reviewCitizenReport(ctx.db, input, ctx.user.id);
      }),
  }),

  // ── Stats ───────────────────────────────────────────────────────
  stats: protectedProcedure.use(requirePermission('report:read')).query(async ({ ctx }) => {
    return getReportStats(ctx.db);
  }),
});
