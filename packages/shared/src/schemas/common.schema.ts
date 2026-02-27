import { z } from 'zod';
import { PAGINATION } from '../constants/config.js';
import { SUPPORTED_LOCALES } from '../constants/sudan.js';

// UUID
export const uuidSchema = z.string().uuid();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Paginated response wrapper
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });

// Sort
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// Search
export const searchSchema = z.object({
  query: z.string().min(1).max(200),
});

// Locale
export const localeSchema = z.enum(SUPPORTED_LOCALES);

// Phone (+249)
export const sudanPhoneSchema = z
  .string()
  .regex(/^\+249[0-9]{9}$/, 'Phone must be in +249XXXXXXXXX format');

// Date range
export const dateRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

// ID param
export const idParamSchema = z.object({
  id: uuidSchema,
});
