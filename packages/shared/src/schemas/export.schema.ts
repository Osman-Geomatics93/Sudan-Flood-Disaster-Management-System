import { z } from 'zod';

export const exportFormatSchema = z.enum(['excel', 'pdf']);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

export const exportSuppliesSchema = z.object({
  format: exportFormatSchema,
});

export const exportDisplacedPersonsSchema = z.object({
  format: exportFormatSchema,
});

export const exportTasksSchema = z.object({
  format: exportFormatSchema,
});

export const exportReportsSchema = z.object({
  format: exportFormatSchema,
});
