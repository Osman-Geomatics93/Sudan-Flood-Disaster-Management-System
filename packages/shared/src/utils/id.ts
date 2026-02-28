/**
 * Generate human-readable codes for entities.
 * Format: PREFIX-STATECODE-YEAR-SEQUENCE
 * e.g. FZ-KRT-2026-001, DP-2026-000042, RO-KRT-2026-015
 */

export function generateEntityCode(
  prefix: string,
  sequence: number,
  options?: { stateCode?: string; year?: number },
): string {
  const year = options?.year ?? new Date().getFullYear();
  const seq = String(sequence).padStart(3, '0');

  if (options?.stateCode) {
    return `${prefix}-${options.stateCode}-${year}-${seq}`;
  }

  return `${prefix}-${year}-${seq}`;
}

/**
 * Prefixes for different entity types
 */
export const CODE_PREFIXES = {
  FLOOD_INCIDENT: 'FL',
  FLOOD_ZONE: 'FZ',
  RESCUE_OPERATION: 'RO',
  SHELTER: 'SH',
  DISPLACED_PERSON: 'DP',
  FAMILY_GROUP: 'FG',
  RELIEF_SUPPLY: 'RS',
  INFRASTRUCTURE: 'IN',
  UAV_SURVEY: 'UV',
  EMERGENCY_CALL: 'EC',
  TASK: 'TK',
  SITUATION_REPORT: 'SR',
  CITIZEN_REPORT: 'CR',
  WEATHER_ALERT: 'WA',
} as const;
