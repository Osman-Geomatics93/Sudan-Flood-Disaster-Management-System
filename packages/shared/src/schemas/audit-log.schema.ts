import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema.js';
import { AUDIT_ACTIONS } from '../constants/enums.js';

export const listAuditLogsSchema = paginationSchema.extend({
  action: z.enum(AUDIT_ACTIONS).optional(),
  tableName: z.string().max(100).optional(),
  userId: uuidSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;

export const getAuditLogByIdSchema = z.object({
  id: uuidSchema,
});
