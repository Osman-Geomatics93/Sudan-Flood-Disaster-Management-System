import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'agency_admin',
  'field_worker',
  'citizen',
]);

export const floodSeverityEnum = pgEnum('flood_severity', [
  'low',
  'moderate',
  'high',
  'severe',
  'extreme',
]);

export const floodZoneStatusEnum = pgEnum('flood_zone_status', [
  'monitoring',
  'warning',
  'active_flood',
  'receding',
  'post_flood',
  'archived',
]);

export const rescueOperationTypeEnum = pgEnum('rescue_operation_type', [
  'boat',
  'helicopter',
  'ground_vehicle',
  'foot_patrol',
  'mixed',
]);

export const operationStatusEnum = pgEnum('operation_status', [
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'in_progress',
  'completed',
  'aborted',
  'failed',
]);

export const displacedPersonStatusEnum = pgEnum('displaced_person_status', [
  'registered',
  'sheltered',
  'relocated',
  'returned_home',
  'missing',
  'deceased',
]);

export const healthStatusEnum = pgEnum('health_status', [
  'healthy',
  'minor_injury',
  'major_injury',
  'chronic_condition',
  'critical',
  'unknown',
]);

export const shelterStatusEnum = pgEnum('shelter_status', [
  'preparing',
  'open',
  'at_capacity',
  'overcrowded',
  'closing',
  'closed',
]);

export const supplyTypeEnum = pgEnum('supply_type', [
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
]);

export const supplyStatusEnum = pgEnum('supply_status', [
  'requested',
  'approved',
  'in_transit',
  'delivered',
  'distributed',
  'expired',
  'damaged',
]);

export const infrastructureTypeEnum = pgEnum('infrastructure_type', [
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
]);

export const damageLevelEnum = pgEnum('damage_level', [
  'none',
  'minor',
  'moderate',
  'major',
  'destroyed',
]);

export const repairPriorityEnum = pgEnum('repair_priority', [
  'p0_critical',
  'p1_high',
  'p2_medium',
  'p3_low',
]);

export const repairStatusEnum = pgEnum('repair_status', [
  'not_assessed',
  'assessed',
  'repair_planned',
  'repair_in_progress',
  'repaired',
  'decommissioned',
]);

export const callUrgencyEnum = pgEnum('call_urgency', [
  'low',
  'medium',
  'high',
  'life_threatening',
]);

export const callStatusEnum = pgEnum('call_status', [
  'received',
  'triaged',
  'dispatched',
  'resolved',
  'duplicate',
  'false_alarm',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'draft',
  'assigned',
  'accepted',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const surveyStatusEnum = pgEnum('survey_status', [
  'planned',
  'in_flight',
  'data_collected',
  'processing',
  'analysis_complete',
  'archived',
]);

export const incidentTypeEnum = pgEnum('incident_type', [
  'flood',
  'flash_flood',
  'riverbank_overflow',
  'dam_breach',
  'urban_flooding',
  'mudslide',
]);

export const incidentStatusEnum = pgEnum('incident_status', [
  'reported',
  'confirmed',
  'active',
  'contained',
  'resolved',
  'archived',
]);

export const orgTypeEnum = pgEnum('org_type', [
  'government_federal',
  'government_state',
  'un_agency',
  'international_ngo',
  'local_ngo',
  'red_cross_crescent',
  'military',
  'private_sector',
  'community_based',
]);

export const reportTypeEnum = pgEnum('report_type', [
  'situation_report',
  'damage_assessment',
  'needs_assessment',
  'distribution_report',
  'field_report',
  'media_report',
]);

export const auditActionEnum = pgEnum('audit_action', [
  'INSERT',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'DISPATCH',
  'STATUS_CHANGE',
]);
