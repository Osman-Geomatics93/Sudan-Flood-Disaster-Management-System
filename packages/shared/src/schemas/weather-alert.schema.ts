import { z } from 'zod';
import { paginationSchema, uuidSchema } from './common.schema.js';
import { WEATHER_ALERT_TYPES, WEATHER_ALERT_SEVERITIES } from '../constants/enums.js';

export const createWeatherAlertSchema = z.object({
  alertType: z.enum(WEATHER_ALERT_TYPES),
  severity: z.enum(WEATHER_ALERT_SEVERITIES),
  stateId: uuidSchema.optional(),
  title_en: z.string().min(1).max(300),
  title_ar: z.string().max(600).optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  source: z.string().max(200).optional(),
  expiresAt: z.coerce.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateWeatherAlertInput = z.infer<typeof createWeatherAlertSchema>;

export const listWeatherAlertsSchema = paginationSchema.extend({
  alertType: z.enum(WEATHER_ALERT_TYPES).optional(),
  severity: z.enum(WEATHER_ALERT_SEVERITIES).optional(),
  stateId: uuidSchema.optional(),
  activeOnly: z.boolean().optional(),
});

export type ListWeatherAlertsInput = z.infer<typeof listWeatherAlertsSchema>;

export const updateWeatherAlertSchema = z.object({
  id: uuidSchema,
  alertType: z.enum(WEATHER_ALERT_TYPES).optional(),
  severity: z.enum(WEATHER_ALERT_SEVERITIES).optional(),
  stateId: uuidSchema.optional(),
  title_en: z.string().min(1).max(300).optional(),
  title_ar: z.string().max(600).optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  source: z.string().max(200).optional(),
  expiresAt: z.coerce.date().optional(),
});

export type UpdateWeatherAlertInput = z.infer<typeof updateWeatherAlertSchema>;

export const deactivateWeatherAlertSchema = z.object({
  id: uuidSchema,
});
