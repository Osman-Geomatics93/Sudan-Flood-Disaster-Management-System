import { z } from 'zod';
import { USER_ROLES } from '../constants/enums.js';
import { PASSWORD } from '../constants/config.js';
import { uuidSchema, sudanPhoneSchema } from './common.schema.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(PASSWORD.MIN_LENGTH, `Password must be at least ${PASSWORD.MIN_LENGTH} characters`)
    .max(PASSWORD.MAX_LENGTH),
  phone: sudanPhoneSchema.optional(),
  firstName_ar: z.string().min(1).max(200),
  lastName_ar: z.string().min(1).max(200),
  firstName_en: z.string().max(100).optional(),
  lastName_en: z.string().max(100).optional(),
  role: z.enum(USER_ROLES).default('citizen'),
  orgId: uuidSchema.optional(),
  preferredLocale: z.enum(['ar', 'en']).default('ar'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(PASSWORD.MIN_LENGTH)
    .max(PASSWORD.MAX_LENGTH),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z
    .string()
    .min(PASSWORD.MIN_LENGTH)
    .max(PASSWORD.MAX_LENGTH),
});
