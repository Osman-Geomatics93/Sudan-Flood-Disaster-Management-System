// Shared application configuration constants

export const APP_NAME = 'SudanFlood';
export const APP_VERSION = '0.1.0';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const JWT = {
  ACCESS_EXPIRY_SECONDS: 15 * 60, // 15 minutes
  REFRESH_EXPIRY_SECONDS: 7 * 24 * 60 * 60, // 7 days
} as const;

export const RATE_LIMIT = {
  GENERAL: { windowMs: 60_000, max: 100 },
  AUTH: { windowMs: 60_000, max: 10 },
  UPLOAD: { windowMs: 60_000, max: 20 },
} as const;

export const UPLOAD = {
  MAX_FILE_SIZE_MB: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
  ALLOWED_DOC_TYPES: ['application/pdf', 'text/csv'],
  BUCKETS: {
    UPLOADS: 'uploads',
    UAV_IMAGERY: 'uav-imagery',
    EXPORTS: 'exports',
    AVATARS: 'avatars',
  },
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  BCRYPT_ROUNDS: 12,
} as const;
