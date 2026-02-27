import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema.js';

export const listNotificationsSchema = paginationSchema.extend({
  unreadOnly: z.boolean().optional(),
});

export const markReadSchema = z.object({
  id: uuidSchema,
});

export const markAllReadSchema = z.object({});
