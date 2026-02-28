CREATE TYPE "public"."audit_action" AS ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'DISPATCH', 'STATUS_CHANGE');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('received', 'triaged', 'dispatched', 'resolved', 'duplicate', 'false_alarm');--> statement-breakpoint
CREATE TYPE "public"."call_urgency" AS ENUM('low', 'medium', 'high', 'life_threatening');--> statement-breakpoint
CREATE TYPE "public"."damage_level" AS ENUM('none', 'minor', 'moderate', 'major', 'destroyed');--> statement-breakpoint
CREATE TYPE "public"."displaced_person_status" AS ENUM('registered', 'sheltered', 'relocated', 'returned_home', 'missing', 'deceased');--> statement-breakpoint
CREATE TYPE "public"."flood_severity" AS ENUM('low', 'moderate', 'high', 'severe', 'extreme');--> statement-breakpoint
CREATE TYPE "public"."flood_zone_status" AS ENUM('monitoring', 'warning', 'active_flood', 'receding', 'post_flood', 'archived');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('healthy', 'minor_injury', 'major_injury', 'chronic_condition', 'critical', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."incident_status" AS ENUM('reported', 'confirmed', 'active', 'contained', 'resolved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."incident_type" AS ENUM('flood', 'flash_flood', 'riverbank_overflow', 'dam_breach', 'urban_flooding', 'mudslide');--> statement-breakpoint
CREATE TYPE "public"."infrastructure_type" AS ENUM('road', 'bridge', 'power_line', 'power_station', 'water_treatment', 'water_pipe', 'telecom_tower', 'hospital', 'school', 'government_building', 'dam', 'embankment', 'other');--> statement-breakpoint
CREATE TYPE "public"."operation_status" AS ENUM('pending', 'dispatched', 'en_route', 'on_site', 'in_progress', 'completed', 'aborted', 'failed');--> statement-breakpoint
CREATE TYPE "public"."org_type" AS ENUM('government_federal', 'government_state', 'un_agency', 'international_ngo', 'local_ngo', 'red_cross_crescent', 'military', 'private_sector', 'community_based');--> statement-breakpoint
CREATE TYPE "public"."repair_priority" AS ENUM('p0_critical', 'p1_high', 'p2_medium', 'p3_low');--> statement-breakpoint
CREATE TYPE "public"."repair_status" AS ENUM('not_assessed', 'assessed', 'repair_planned', 'repair_in_progress', 'repaired', 'decommissioned');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('situation_report', 'damage_assessment', 'needs_assessment', 'distribution_report', 'field_report', 'media_report');--> statement-breakpoint
CREATE TYPE "public"."rescue_operation_type" AS ENUM('boat', 'helicopter', 'ground_vehicle', 'foot_patrol', 'mixed');--> statement-breakpoint
CREATE TYPE "public"."shelter_status" AS ENUM('preparing', 'open', 'at_capacity', 'overcrowded', 'closing', 'closed');--> statement-breakpoint
CREATE TYPE "public"."supply_status" AS ENUM('requested', 'approved', 'in_transit', 'delivered', 'distributed', 'expired', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."supply_type" AS ENUM('food', 'water', 'medicine', 'tents', 'blankets', 'hygiene_kits', 'cooking_supplies', 'clothing', 'fuel', 'construction_materials', 'communication_equipment', 'other');--> statement-breakpoint
CREATE TYPE "public"."survey_status" AS ENUM('planned', 'in_flight', 'data_collected', 'processing', 'analysis_complete', 'archived');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('draft', 'assigned', 'accepted', 'in_progress', 'blocked', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('super_admin', 'agency_admin', 'field_worker', 'citizen');--> statement-breakpoint
CREATE TYPE "public"."weather_alert_severity" AS ENUM('advisory', 'watch', 'warning', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."weather_alert_type" AS ENUM('flood_warning', 'flash_flood', 'heavy_rain', 'river_overflow', 'dam_alert', 'tropical_storm');--> statement-breakpoint
CREATE TABLE "localities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_id" uuid NOT NULL,
	"code" varchar(10) NOT NULL,
	"name_en" varchar(150) NOT NULL,
	"name_ar" varchar(300) NOT NULL,
	"population" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "localities_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(5) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ar" varchar(200) NOT NULL,
	"population" integer,
	"area_km2" numeric(10, 2),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "states_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(400) NOT NULL,
	"acronym" varchar(20),
	"org_type" "org_type" NOT NULL,
	"parent_org_id" uuid,
	"contact_email" varchar(255),
	"contact_phone" varchar(20),
	"website" varchar(500),
	"logo_url" varchar(1000),
	"headquarters_state_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" varchar(500) NOT NULL,
	"refresh_token" varchar(500),
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid,
	"email" varchar(255),
	"phone" varchar(20),
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'citizen' NOT NULL,
	"first_name_en" varchar(100),
	"first_name_ar" varchar(200),
	"last_name_en" varchar(100),
	"last_name_ar" varchar(200),
	"avatar_url" varchar(1000),
	"preferred_locale" varchar(5) DEFAULT 'ar' NOT NULL,
	"assigned_state_id" uuid,
	"assigned_locality_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "flood_incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_code" varchar(30) NOT NULL,
	"incident_type" "incident_type" NOT NULL,
	"status" "incident_status" DEFAULT 'reported' NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"description_en" text,
	"description_ar" text,
	"severity" "flood_severity" DEFAULT 'moderate' NOT NULL,
	"state_id" uuid NOT NULL,
	"locality_id" uuid,
	"estimated_affected_population" integer DEFAULT 0,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"declared_by_user_id" uuid,
	"lead_org_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "flood_incidents_incident_code_unique" UNIQUE("incident_code")
);
--> statement-breakpoint
CREATE TABLE "flood_zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"incident_id" uuid,
	"zone_code" varchar(30) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(400),
	"severity" "flood_severity" NOT NULL,
	"status" "flood_zone_status" DEFAULT 'monitoring' NOT NULL,
	"area_km2" numeric(12, 4),
	"water_level_m" numeric(6, 2),
	"water_level_trend" varchar(20),
	"max_water_level_m" numeric(6, 2),
	"affected_population" integer DEFAULT 0,
	"state_id" uuid NOT NULL,
	"locality_id" uuid,
	"monitored_by_org_id" uuid,
	"last_assessed_at" timestamp with time zone,
	"last_assessed_by" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "flood_zones_zone_code_unique" UNIQUE("zone_code")
);
--> statement-breakpoint
CREATE TABLE "rescue_operations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"operation_code" varchar(30) NOT NULL,
	"flood_zone_id" uuid NOT NULL,
	"assigned_org_id" uuid NOT NULL,
	"operation_type" "rescue_operation_type" NOT NULL,
	"status" "operation_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'high' NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"description" text,
	"estimated_persons_at_risk" integer DEFAULT 0,
	"persons_rescued" integer DEFAULT 0,
	"team_size" integer,
	"team_leader_id" uuid,
	"emergency_call_id" uuid,
	"dispatched_at" timestamp with time zone,
	"arrived_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rescue_operations_operation_code_unique" UNIQUE("operation_code")
);
--> statement-breakpoint
CREATE TABLE "rescue_team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rescue_operation_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role_in_team" varchar(50) DEFAULT 'member',
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_rescue_team_member" UNIQUE("rescue_operation_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "shelters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shelter_code" varchar(30) NOT NULL,
	"name_en" varchar(200) NOT NULL,
	"name_ar" varchar(400),
	"status" "shelter_status" DEFAULT 'preparing' NOT NULL,
	"address_en" text,
	"address_ar" text,
	"state_id" uuid NOT NULL,
	"locality_id" uuid,
	"managing_org_id" uuid NOT NULL,
	"manager_user_id" uuid,
	"capacity" integer NOT NULL,
	"current_occupancy" integer DEFAULT 0 NOT NULL,
	"has_water" boolean DEFAULT false,
	"has_electricity" boolean DEFAULT false,
	"has_medical" boolean DEFAULT false,
	"has_sanitation" boolean DEFAULT false,
	"has_kitchen" boolean DEFAULT false,
	"has_security" boolean DEFAULT false,
	"facility_notes" text,
	"opened_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "shelters_shelter_code_unique" UNIQUE("shelter_code")
);
--> statement-breakpoint
CREATE TABLE "displaced_persons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_code" varchar(30) NOT NULL,
	"family_group_id" uuid,
	"first_name_ar" varchar(200) NOT NULL,
	"last_name_ar" varchar(200) NOT NULL,
	"first_name_en" varchar(100),
	"last_name_en" varchar(100),
	"date_of_birth" date,
	"gender" varchar(10),
	"national_id" varchar(30),
	"phone" varchar(20),
	"status" "displaced_person_status" DEFAULT 'registered' NOT NULL,
	"health_status" "health_status" DEFAULT 'unknown' NOT NULL,
	"health_notes" text,
	"has_disability" boolean DEFAULT false,
	"disability_notes" text,
	"is_unaccompanied_minor" boolean DEFAULT false,
	"current_shelter_id" uuid,
	"origin_state_id" uuid,
	"origin_locality_id" uuid,
	"photo_url" varchar(1000),
	"registered_by_user_id" uuid,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"special_needs" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "displaced_persons_registration_code_unique" UNIQUE("registration_code")
);
--> statement-breakpoint
CREATE TABLE "family_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"family_code" varchar(30) NOT NULL,
	"head_of_family_id" uuid,
	"family_size" integer DEFAULT 1 NOT NULL,
	"origin_state_id" uuid,
	"origin_locality_id" uuid,
	"origin_address" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "family_groups_family_code_unique" UNIQUE("family_code")
);
--> statement-breakpoint
CREATE TABLE "task_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"depends_on_task_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_task_dependency" UNIQUE("task_id","depends_on_task_id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_code" varchar(30) NOT NULL,
	"incident_id" uuid,
	"flood_zone_id" uuid,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"description" text,
	"status" "task_status" DEFAULT 'draft' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"assigned_to_org_id" uuid NOT NULL,
	"assigned_to_user_id" uuid,
	"created_by_org_id" uuid NOT NULL,
	"created_by_user_id" uuid NOT NULL,
	"parent_task_id" uuid,
	"deadline" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completion_notes" text,
	"progress_pct" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_task_code_unique" UNIQUE("task_code"),
	CONSTRAINT "chk_progress" CHECK ("tasks"."progress_pct" >= 0 AND "tasks"."progress_pct" <= 100)
);
--> statement-breakpoint
CREATE TABLE "emergency_calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_code" varchar(30) NOT NULL,
	"caller_name" varchar(200),
	"caller_phone" varchar(20) NOT NULL,
	"caller_address" text,
	"call_number" varchar(5) NOT NULL,
	"urgency" "call_urgency" DEFAULT 'medium' NOT NULL,
	"status" "call_status" DEFAULT 'received' NOT NULL,
	"description_ar" text,
	"description_en" text,
	"persons_at_risk" integer DEFAULT 0,
	"flood_zone_id" uuid,
	"state_id" uuid,
	"locality_id" uuid,
	"received_by_user_id" uuid,
	"dispatched_to_org_id" uuid,
	"rescue_operation_id" uuid,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"triaged_at" timestamp with time zone,
	"dispatched_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"recording_url" varchar(1000),
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "emergency_calls_call_code_unique" UNIQUE("call_code"),
	CONSTRAINT "emergency_calls_rescue_operation_id_unique" UNIQUE("rescue_operation_id")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"org_id" uuid,
	"action" "audit_action" NOT NULL,
	"table_name" varchar(100) NOT NULL,
	"record_id" uuid,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" "inet",
	"user_agent" text,
	"request_id" varchar(100),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"body_en" text,
	"body_ar" text,
	"notification_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'info',
	"reference_type" varchar(50),
	"reference_id" uuid,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"channel" varchar(20) DEFAULT 'in_app' NOT NULL,
	"sent_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relief_supplies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tracking_code" varchar(30) NOT NULL,
	"supply_type" "supply_type" NOT NULL,
	"status" "supply_status" DEFAULT 'requested' NOT NULL,
	"item_name_en" varchar(200) NOT NULL,
	"item_name_ar" varchar(400),
	"quantity" numeric(12, 2) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"unit_cost_sdg" numeric(12, 2),
	"total_cost_sdg" numeric(14, 2),
	"source_org_id" uuid NOT NULL,
	"destination_org_id" uuid,
	"destination_shelter_id" uuid,
	"state_id" uuid,
	"expiry_date" date,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"distributed_at" timestamp with time zone,
	"requested_by_user_id" uuid,
	"approved_by_user_id" uuid,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "relief_supplies_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid,
	"rescue_operation_id" uuid,
	"flood_zone_id" uuid,
	"incident_id" uuid,
	"body" text NOT NULL,
	"parent_comment_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "citizen_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_code" varchar(30) NOT NULL,
	"reporter_user_id" uuid,
	"reporter_phone" varchar(20),
	"reporter_name" varchar(200),
	"state_id" uuid,
	"locality_id" uuid,
	"report_type" varchar(50) NOT NULL,
	"urgency" "call_urgency" DEFAULT 'medium' NOT NULL,
	"description_ar" text,
	"description_en" text,
	"status" varchar(30) DEFAULT 'submitted' NOT NULL,
	"reviewed_by_user_id" uuid,
	"linked_task_id" uuid,
	"linked_rescue_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "citizen_reports_report_code_unique" UNIQUE("report_code")
);
--> statement-breakpoint
CREATE TABLE "situation_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_code" varchar(30) NOT NULL,
	"incident_id" uuid,
	"report_type" "report_type" NOT NULL,
	"report_number" integer DEFAULT 1 NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"summary_en" text,
	"summary_ar" text,
	"content" jsonb DEFAULT '{}'::jsonb,
	"state_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"created_by_org_id" uuid,
	"published_at" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "situation_reports_report_code_unique" UNIQUE("report_code")
);
--> statement-breakpoint
CREATE TABLE "file_attachments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_size" integer NOT NULL,
	"mime_type" varchar(200) NOT NULL,
	"storage_key" varchar(1000) NOT NULL,
	"bucket" varchar(200) NOT NULL,
	"uploaded_by_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weather_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_code" varchar(30) NOT NULL,
	"alert_type" "weather_alert_type" NOT NULL,
	"severity" "weather_alert_severity" NOT NULL,
	"state_id" uuid,
	"title_en" varchar(300) NOT NULL,
	"title_ar" varchar(600),
	"description_en" text,
	"description_ar" text,
	"source" varchar(200),
	"is_active" boolean DEFAULT true NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weather_alerts_alert_code_unique" UNIQUE("alert_code")
);
--> statement-breakpoint
ALTER TABLE "localities" ADD CONSTRAINT "localities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_parent_org_id_organizations_id_fk" FOREIGN KEY ("parent_org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_headquarters_state_id_states_id_fk" FOREIGN KEY ("headquarters_state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_assigned_state_id_states_id_fk" FOREIGN KEY ("assigned_state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_assigned_locality_id_localities_id_fk" FOREIGN KEY ("assigned_locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_incidents" ADD CONSTRAINT "flood_incidents_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_incidents" ADD CONSTRAINT "flood_incidents_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_incidents" ADD CONSTRAINT "flood_incidents_declared_by_user_id_users_id_fk" FOREIGN KEY ("declared_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_incidents" ADD CONSTRAINT "flood_incidents_lead_org_id_organizations_id_fk" FOREIGN KEY ("lead_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_zones" ADD CONSTRAINT "flood_zones_incident_id_flood_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."flood_incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_zones" ADD CONSTRAINT "flood_zones_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_zones" ADD CONSTRAINT "flood_zones_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_zones" ADD CONSTRAINT "flood_zones_monitored_by_org_id_organizations_id_fk" FOREIGN KEY ("monitored_by_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flood_zones" ADD CONSTRAINT "flood_zones_last_assessed_by_users_id_fk" FOREIGN KEY ("last_assessed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_operations" ADD CONSTRAINT "rescue_operations_flood_zone_id_flood_zones_id_fk" FOREIGN KEY ("flood_zone_id") REFERENCES "public"."flood_zones"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_operations" ADD CONSTRAINT "rescue_operations_assigned_org_id_organizations_id_fk" FOREIGN KEY ("assigned_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_operations" ADD CONSTRAINT "rescue_operations_team_leader_id_users_id_fk" FOREIGN KEY ("team_leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_team_members" ADD CONSTRAINT "rescue_team_members_rescue_operation_id_rescue_operations_id_fk" FOREIGN KEY ("rescue_operation_id") REFERENCES "public"."rescue_operations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rescue_team_members" ADD CONSTRAINT "rescue_team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_managing_org_id_organizations_id_fk" FOREIGN KEY ("managing_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shelters" ADD CONSTRAINT "shelters_manager_user_id_users_id_fk" FOREIGN KEY ("manager_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "displaced_persons" ADD CONSTRAINT "displaced_persons_family_group_id_family_groups_id_fk" FOREIGN KEY ("family_group_id") REFERENCES "public"."family_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "displaced_persons" ADD CONSTRAINT "displaced_persons_current_shelter_id_shelters_id_fk" FOREIGN KEY ("current_shelter_id") REFERENCES "public"."shelters"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "displaced_persons" ADD CONSTRAINT "displaced_persons_origin_state_id_states_id_fk" FOREIGN KEY ("origin_state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "displaced_persons" ADD CONSTRAINT "displaced_persons_origin_locality_id_localities_id_fk" FOREIGN KEY ("origin_locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "displaced_persons" ADD CONSTRAINT "displaced_persons_registered_by_user_id_users_id_fk" FOREIGN KEY ("registered_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_groups" ADD CONSTRAINT "family_groups_origin_state_id_states_id_fk" FOREIGN KEY ("origin_state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_groups" ADD CONSTRAINT "family_groups_origin_locality_id_localities_id_fk" FOREIGN KEY ("origin_locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_depends_on_task_id_tasks_id_fk" FOREIGN KEY ("depends_on_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_incident_id_flood_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."flood_incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_flood_zone_id_flood_zones_id_fk" FOREIGN KEY ("flood_zone_id") REFERENCES "public"."flood_zones"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_org_id_organizations_id_fk" FOREIGN KEY ("assigned_to_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_org_id_organizations_id_fk" FOREIGN KEY ("created_by_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_flood_zone_id_flood_zones_id_fk" FOREIGN KEY ("flood_zone_id") REFERENCES "public"."flood_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_received_by_user_id_users_id_fk" FOREIGN KEY ("received_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_dispatched_to_org_id_organizations_id_fk" FOREIGN KEY ("dispatched_to_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emergency_calls" ADD CONSTRAINT "emergency_calls_rescue_operation_id_rescue_operations_id_fk" FOREIGN KEY ("rescue_operation_id") REFERENCES "public"."rescue_operations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_source_org_id_organizations_id_fk" FOREIGN KEY ("source_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_destination_org_id_organizations_id_fk" FOREIGN KEY ("destination_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_destination_shelter_id_shelters_id_fk" FOREIGN KEY ("destination_shelter_id") REFERENCES "public"."shelters"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relief_supplies" ADD CONSTRAINT "relief_supplies_approved_by_user_id_users_id_fk" FOREIGN KEY ("approved_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_rescue_operation_id_rescue_operations_id_fk" FOREIGN KEY ("rescue_operation_id") REFERENCES "public"."rescue_operations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_flood_zone_id_flood_zones_id_fk" FOREIGN KEY ("flood_zone_id") REFERENCES "public"."flood_zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_incident_id_flood_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."flood_incidents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_locality_id_localities_id_fk" FOREIGN KEY ("locality_id") REFERENCES "public"."localities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_linked_task_id_tasks_id_fk" FOREIGN KEY ("linked_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citizen_reports" ADD CONSTRAINT "citizen_reports_linked_rescue_id_rescue_operations_id_fk" FOREIGN KEY ("linked_rescue_id") REFERENCES "public"."rescue_operations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situation_reports" ADD CONSTRAINT "situation_reports_incident_id_flood_incidents_id_fk" FOREIGN KEY ("incident_id") REFERENCES "public"."flood_incidents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situation_reports" ADD CONSTRAINT "situation_reports_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situation_reports" ADD CONSTRAINT "situation_reports_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "situation_reports" ADD CONSTRAINT "situation_reports_created_by_org_id_organizations_id_fk" FOREIGN KEY ("created_by_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_attachments" ADD CONSTRAINT "file_attachments_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weather_alerts" ADD CONSTRAINT "weather_alerts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_localities_state" ON "localities" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_localities_code" ON "localities" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_states_code" ON "states" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_organizations_type" ON "organizations" USING btree ("org_type");--> statement-breakpoint
CREATE INDEX "idx_organizations_parent" ON "organizations" USING btree ("parent_org_id");--> statement-breakpoint
CREATE INDEX "idx_organizations_active" ON "organizations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_token" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_org" ON "users" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_phone" ON "users" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_flood_incidents_status" ON "flood_incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_flood_incidents_severity" ON "flood_incidents" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_flood_incidents_state" ON "flood_incidents" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_flood_incidents_date" ON "flood_incidents" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "idx_flood_zones_incident" ON "flood_zones" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_flood_zones_severity" ON "flood_zones" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "idx_flood_zones_status" ON "flood_zones" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_flood_zones_state" ON "flood_zones" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_rescue_ops_zone" ON "rescue_operations" USING btree ("flood_zone_id");--> statement-breakpoint
CREATE INDEX "idx_rescue_ops_org" ON "rescue_operations" USING btree ("assigned_org_id");--> statement-breakpoint
CREATE INDEX "idx_rescue_ops_status" ON "rescue_operations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_rescue_ops_priority" ON "rescue_operations" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_rescue_ops_leader" ON "rescue_operations" USING btree ("team_leader_id");--> statement-breakpoint
CREATE INDEX "idx_rescue_team_operation" ON "rescue_team_members" USING btree ("rescue_operation_id");--> statement-breakpoint
CREATE INDEX "idx_rescue_team_user" ON "rescue_team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_shelters_status" ON "shelters" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_shelters_state" ON "shelters" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_shelters_org" ON "shelters" USING btree ("managing_org_id");--> statement-breakpoint
CREATE INDEX "idx_dp_family" ON "displaced_persons" USING btree ("family_group_id");--> statement-breakpoint
CREATE INDEX "idx_dp_status" ON "displaced_persons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_dp_health" ON "displaced_persons" USING btree ("health_status");--> statement-breakpoint
CREATE INDEX "idx_dp_shelter" ON "displaced_persons" USING btree ("current_shelter_id");--> statement-breakpoint
CREATE INDEX "idx_dp_registration" ON "displaced_persons" USING btree ("registration_code");--> statement-breakpoint
CREATE INDEX "idx_dp_origin" ON "displaced_persons" USING btree ("origin_state_id");--> statement-breakpoint
CREATE INDEX "idx_family_groups_code" ON "family_groups" USING btree ("family_code");--> statement-breakpoint
CREATE INDEX "idx_family_groups_origin" ON "family_groups" USING btree ("origin_state_id");--> statement-breakpoint
CREATE INDEX "idx_task_deps_task" ON "task_dependencies" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_task_deps_depends" ON "task_dependencies" USING btree ("depends_on_task_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_incident" ON "tasks" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_zone" ON "tasks" USING btree ("flood_zone_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned_org" ON "tasks" USING btree ("assigned_to_org_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned_user" ON "tasks" USING btree ("assigned_to_user_id");--> statement-breakpoint
CREATE INDEX "idx_calls_urgency" ON "emergency_calls" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "idx_calls_status" ON "emergency_calls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_calls_zone" ON "emergency_calls" USING btree ("flood_zone_id");--> statement-breakpoint
CREATE INDEX "idx_calls_state" ON "emergency_calls" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_calls_received" ON "emergency_calls" USING btree ("received_at");--> statement-breakpoint
CREATE INDEX "idx_audit_user" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_audit_org" ON "audit_logs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_table" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX "idx_audit_time" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_user" ON "notifications" USING btree ("user_id","is_read","created_at");--> statement-breakpoint
CREATE INDEX "idx_notifications_type" ON "notifications" USING btree ("notification_type");--> statement-breakpoint
CREATE INDEX "idx_notifications_ref" ON "notifications" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "idx_relief_supplies_type" ON "relief_supplies" USING btree ("supply_type");--> statement-breakpoint
CREATE INDEX "idx_relief_supplies_status" ON "relief_supplies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_relief_supplies_source_org" ON "relief_supplies" USING btree ("source_org_id");--> statement-breakpoint
CREATE INDEX "idx_relief_supplies_dest_shelter" ON "relief_supplies" USING btree ("destination_shelter_id");--> statement-breakpoint
CREATE INDEX "idx_relief_supplies_state" ON "relief_supplies" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_comments_user" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_comments_task" ON "comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_comments_rescue" ON "comments" USING btree ("rescue_operation_id");--> statement-breakpoint
CREATE INDEX "idx_comments_zone" ON "comments" USING btree ("flood_zone_id");--> statement-breakpoint
CREATE INDEX "idx_comments_incident" ON "comments" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_comments_parent" ON "comments" USING btree ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "idx_citizen_report_reporter" ON "citizen_reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "idx_citizen_report_status" ON "citizen_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_citizen_report_urgency" ON "citizen_reports" USING btree ("urgency");--> statement-breakpoint
CREATE INDEX "idx_citizen_report_state" ON "citizen_reports" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_citizen_report_type" ON "citizen_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_sitrep_incident" ON "situation_reports" USING btree ("incident_id");--> statement-breakpoint
CREATE INDEX "idx_sitrep_type" ON "situation_reports" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "idx_sitrep_published" ON "situation_reports" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_sitrep_state" ON "situation_reports" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_sitrep_created_by" ON "situation_reports" USING btree ("created_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_file_attachments_entity" ON "file_attachments" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_file_attachments_user" ON "file_attachments" USING btree ("uploaded_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_weather_alerts_active" ON "weather_alerts" USING btree ("is_active","severity");--> statement-breakpoint
CREATE INDEX "idx_weather_alerts_state" ON "weather_alerts" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_weather_alerts_type" ON "weather_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "idx_weather_alerts_expires" ON "weather_alerts" USING btree ("expires_at");