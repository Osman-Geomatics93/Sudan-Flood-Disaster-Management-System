// All enum values matching the PostgreSQL enums in 001_initial_schema.sql

export const USER_ROLES = ['super_admin', 'agency_admin', 'field_worker', 'citizen'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FLOOD_SEVERITIES = ['low', 'moderate', 'high', 'severe', 'extreme'] as const;
export type FloodSeverity = (typeof FLOOD_SEVERITIES)[number];

export const FLOOD_ZONE_STATUSES = [
  'monitoring',
  'warning',
  'active_flood',
  'receding',
  'post_flood',
  'archived',
] as const;
export type FloodZoneStatus = (typeof FLOOD_ZONE_STATUSES)[number];

export const RESCUE_OPERATION_TYPES = [
  'boat',
  'helicopter',
  'ground_vehicle',
  'foot_patrol',
  'mixed',
] as const;
export type RescueOperationType = (typeof RESCUE_OPERATION_TYPES)[number];

export const OPERATION_STATUSES = [
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'in_progress',
  'completed',
  'aborted',
  'failed',
] as const;
export type OperationStatus = (typeof OPERATION_STATUSES)[number];

export const DISPLACED_PERSON_STATUSES = [
  'registered',
  'sheltered',
  'relocated',
  'returned_home',
  'missing',
  'deceased',
] as const;
export type DisplacedPersonStatus = (typeof DISPLACED_PERSON_STATUSES)[number];

export const HEALTH_STATUSES = [
  'healthy',
  'minor_injury',
  'major_injury',
  'chronic_condition',
  'critical',
  'unknown',
] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export const SHELTER_STATUSES = [
  'preparing',
  'open',
  'at_capacity',
  'overcrowded',
  'closing',
  'closed',
] as const;
export type ShelterStatus = (typeof SHELTER_STATUSES)[number];

export const SUPPLY_TYPES = [
  'food',
  'water',
  'medicine',
  'tents',
  'blankets',
  'hygiene_kits',
  'cooking_supplies',
  'clothing',
  'fuel',
  'construction_materials',
  'communication_equipment',
  'other',
] as const;
export type SupplyType = (typeof SUPPLY_TYPES)[number];

export const SUPPLY_STATUSES = [
  'requested',
  'approved',
  'in_transit',
  'delivered',
  'distributed',
  'expired',
  'damaged',
] as const;
export type SupplyStatus = (typeof SUPPLY_STATUSES)[number];

export const INFRASTRUCTURE_TYPES = [
  'road',
  'bridge',
  'power_line',
  'power_station',
  'water_treatment',
  'water_pipe',
  'telecom_tower',
  'hospital',
  'school',
  'government_building',
  'dam',
  'embankment',
  'other',
] as const;
export type InfrastructureType = (typeof INFRASTRUCTURE_TYPES)[number];

export const DAMAGE_LEVELS = [
  'not_assessed',
  'none',
  'minor',
  'moderate',
  'major',
  'destroyed',
] as const;
export type DamageLevel = (typeof DAMAGE_LEVELS)[number];

export const REPAIR_PRIORITIES = ['p0_critical', 'p1_high', 'p2_medium', 'p3_low'] as const;
export type RepairPriority = (typeof REPAIR_PRIORITIES)[number];

export const REPAIR_STATUSES = [
  'not_assessed',
  'assessed',
  'repair_planned',
  'repair_in_progress',
  'repaired',
  'decommissioned',
] as const;
export type RepairStatus = (typeof REPAIR_STATUSES)[number];

export const CALL_URGENCIES = ['low', 'medium', 'high', 'life_threatening'] as const;
export type CallUrgency = (typeof CALL_URGENCIES)[number];

export const CALL_STATUSES = [
  'received',
  'triaged',
  'dispatched',
  'resolved',
  'duplicate',
  'false_alarm',
] as const;
export type CallStatus = (typeof CALL_STATUSES)[number];

export const TASK_STATUSES = [
  'draft',
  'assigned',
  'accepted',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ['critical', 'high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const SURVEY_STATUSES = [
  'planned',
  'in_flight',
  'data_collected',
  'processing',
  'analysis_complete',
  'archived',
] as const;
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export const INCIDENT_TYPES = [
  'flood',
  'flash_flood',
  'riverbank_overflow',
  'dam_breach',
  'urban_flooding',
  'mudslide',
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_STATUSES = [
  'reported',
  'confirmed',
  'active',
  'contained',
  'resolved',
  'archived',
] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const ORG_TYPES = [
  'government_federal',
  'government_state',
  'un_agency',
  'international_ngo',
  'local_ngo',
  'red_cross_crescent',
  'military',
  'private_sector',
  'community_based',
] as const;
export type OrgType = (typeof ORG_TYPES)[number];

export const REPORT_TYPES = [
  'situation_report',
  'damage_assessment',
  'needs_assessment',
  'distribution_report',
  'field_report',
  'media_report',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const AUDIT_ACTIONS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'DISPATCH',
  'STATUS_CHANGE',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const GENDERS = ['male', 'female'] as const;
export type Gender = (typeof GENDERS)[number];

export const NOTIFICATION_SEVERITIES = ['info', 'warning', 'critical'] as const;
export type NotificationSeverity = (typeof NOTIFICATION_SEVERITIES)[number];

export const NOTIFICATION_CHANNELS = ['in_app', 'sms', 'email', 'push'] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const CITIZEN_REPORT_TYPES = [
  'flood',
  'rescue_needed',
  'shelter_needed',
  'supply_needed',
  'infrastructure_damage',
] as const;
export type CitizenReportType = (typeof CITIZEN_REPORT_TYPES)[number];

export const CITIZEN_REPORT_STATUSES = [
  'submitted',
  'reviewed',
  'actioned',
  'resolved',
  'rejected',
] as const;
export type CitizenReportStatus = (typeof CITIZEN_REPORT_STATUSES)[number];

export const WEATHER_ALERT_TYPES = [
  'flood_warning',
  'flash_flood',
  'heavy_rain',
  'river_overflow',
  'dam_alert',
  'tropical_storm',
] as const;
export type WeatherAlertType = (typeof WEATHER_ALERT_TYPES)[number];

export const WEATHER_ALERT_SEVERITIES = ['advisory', 'watch', 'warning', 'emergency'] as const;
export type WeatherAlertSeverity = (typeof WEATHER_ALERT_SEVERITIES)[number];
