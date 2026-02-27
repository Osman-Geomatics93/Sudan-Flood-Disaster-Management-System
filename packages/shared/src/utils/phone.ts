import { COUNTRY_CODE } from '../constants/sudan.js';

const SUDAN_PHONE_REGEX = /^\+249[0-9]{9}$/;
const SUDAN_LOCAL_REGEX = /^0[0-9]{9}$/;

/**
 * Validate a Sudan phone number in +249XXXXXXXXX format
 */
export function isValidSudanPhone(phone: string): boolean {
  return SUDAN_PHONE_REGEX.test(phone);
}

/**
 * Normalize a Sudan phone number to +249XXXXXXXXX format.
 * Accepts: +249123456789, 0123456789
 * Returns null if invalid.
 */
export function normalizeSudanPhone(phone: string): string | null {
  const trimmed = phone.trim().replace(/[\s\-()]/g, '');

  if (SUDAN_PHONE_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (SUDAN_LOCAL_REGEX.test(trimmed)) {
    return `${COUNTRY_CODE}${trimmed.slice(1)}`;
  }

  return null;
}

/**
 * Format a +249 number for display: +249 XX XXX XXXX
 */
export function formatSudanPhone(phone: string): string {
  if (!SUDAN_PHONE_REGEX.test(phone)) return phone;
  return `${phone.slice(0, 4)} ${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
}
