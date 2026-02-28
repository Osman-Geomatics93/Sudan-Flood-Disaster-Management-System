import { router, superAdminProcedure, requirePermission } from '../trpc.js';
import { listAuditLogsSchema, getAuditLogByIdSchema } from '@sudanflood/shared';
import { listAuditLogs, getAuditLogById } from '../services/audit-log-reader.service.js';

export const auditLogRouter = router({
  list: superAdminProcedure
    .use(requirePermission('audit:read'))
    .input(listAuditLogsSchema)
    .query(async ({ input, ctx }) => {
      return listAuditLogs(ctx.db, input);
    }),

  getById: superAdminProcedure
    .use(requirePermission('audit:read'))
    .input(getAuditLogByIdSchema)
    .query(async ({ input, ctx }) => {
      return getAuditLogById(ctx.db, input.id);
    }),
});
