import type { UserRole } from './enums.js';

export const PERMISSIONS = {
  // Auth
  'auth:manage_users': ['super_admin'],
  'auth:manage_org_users': ['super_admin', 'agency_admin'],

  // Organizations
  'org:create': ['super_admin'],
  'org:update': ['super_admin', 'agency_admin'],
  'org:delete': ['super_admin'],
  'org:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Flood Zones
  'flood_zone:create': ['super_admin', 'agency_admin'],
  'flood_zone:update': ['super_admin', 'agency_admin'],
  'flood_zone:update_severity': ['super_admin', 'agency_admin', 'field_worker'],
  'flood_zone:delete': ['super_admin'],
  'flood_zone:read': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],

  // Rescue Operations
  'rescue:create': ['super_admin', 'agency_admin'],
  'rescue:dispatch': ['super_admin', 'agency_admin'],
  'rescue:update_status': ['super_admin', 'agency_admin', 'field_worker'],
  'rescue:update_location': ['field_worker'],
  'rescue:assign_team': ['super_admin', 'agency_admin'],
  'rescue:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Emergency Calls
  'emergency_call:create': ['super_admin', 'agency_admin', 'field_worker'],
  'emergency_call:triage': ['super_admin', 'agency_admin'],
  'emergency_call:dispatch': ['super_admin', 'agency_admin'],
  'emergency_call:resolve': ['super_admin', 'agency_admin'],
  'emergency_call:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Shelters
  'shelter:create': ['super_admin', 'agency_admin'],
  'shelter:update': ['super_admin', 'agency_admin'],
  'shelter:update_occupancy': ['super_admin', 'agency_admin', 'field_worker'],
  'shelter:read': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],

  // Displaced Persons
  'dp:register': ['super_admin', 'agency_admin', 'field_worker'],
  'dp:update': ['super_admin', 'agency_admin', 'field_worker'],
  'dp:read': ['super_admin', 'agency_admin', 'field_worker'],
  'dp:search': ['super_admin', 'agency_admin', 'field_worker'],

  // Relief Supplies
  'supply:request': ['super_admin', 'agency_admin'],
  'supply:approve': ['super_admin', 'agency_admin'],
  'supply:update': ['super_admin', 'agency_admin', 'field_worker'],
  'supply:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Tasks
  'task:create': ['super_admin', 'agency_admin'],
  'task:update': ['super_admin', 'agency_admin', 'field_worker'],
  'task:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Infrastructure
  'infra:create': ['super_admin', 'agency_admin'],
  'infra:assess': ['super_admin', 'agency_admin', 'field_worker'],
  'infra:update_repair': ['super_admin', 'agency_admin'],
  'infra:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Weather
  'weather:read': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],

  // UAV Surveys
  'uav:create': ['super_admin', 'agency_admin'],
  'uav:update': ['super_admin', 'agency_admin', 'field_worker'],
  'uav:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Reports
  'report:create': ['super_admin', 'agency_admin'],
  'report:publish': ['super_admin'],
  'report:export': ['super_admin', 'agency_admin'],
  'report:read': ['super_admin', 'agency_admin', 'field_worker'],

  // Citizen Reports
  'citizen_report:submit': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],
  'citizen_report:review': ['super_admin', 'agency_admin'],
  'citizen_report:read': ['super_admin', 'agency_admin'],

  // Notifications
  'notification:read': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],

  // Uploads
  'upload:create': ['super_admin', 'agency_admin', 'field_worker', 'citizen'],

  // Audit
  'audit:read': ['super_admin'],
} as const satisfies Record<string, readonly UserRole[]>;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return (allowedRoles as readonly string[]).includes(role);
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return (Object.entries(PERMISSIONS) as [Permission, readonly UserRole[]][])
    .filter(([_, roles]) => roles.includes(role))
    .map(([perm]) => perm);
}
