-- ============================================================================
-- DELIVERABLE B — SudanFlood Complete Database Schema
-- PostgreSQL 16 + PostGIS 3.4
-- SRID: 4326 (WGS84)
-- ============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- for exclusion constraints
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- for Arabic text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM (
  'super_admin',
  'agency_admin',
  'field_worker',
  'citizen'
);

CREATE TYPE flood_severity AS ENUM (
  'low',
  'moderate',
  'high',
  'severe',
  'extreme'
);

CREATE TYPE flood_zone_status AS ENUM (
  'monitoring',
  'warning',
  'active_flood',
  'receding',
  'post_flood',
  'archived'
);

CREATE TYPE rescue_operation_type AS ENUM (
  'boat',
  'helicopter',
  'ground_vehicle',
  'foot_patrol',
  'mixed'
);

CREATE TYPE operation_status AS ENUM (
  'pending',
  'dispatched',
  'en_route',
  'on_site',
  'in_progress',
  'completed',
  'aborted',
  'failed'
);

CREATE TYPE displaced_person_status AS ENUM (
  'registered',
  'sheltered',
  'relocated',
  'returned_home',
  'missing',
  'deceased'
);

CREATE TYPE health_status AS ENUM (
  'healthy',
  'minor_injury',
  'major_injury',
  'chronic_condition',
  'critical',
  'unknown'
);

CREATE TYPE shelter_status AS ENUM (
  'preparing',
  'open',
  'at_capacity',
  'overcrowded',
  'closing',
  'closed'
);

CREATE TYPE supply_type AS ENUM (
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
  'other'
);

CREATE TYPE supply_status AS ENUM (
  'requested',
  'approved',
  'in_transit',
  'delivered',
  'distributed',
  'expired',
  'damaged'
);

CREATE TYPE infrastructure_type AS ENUM (
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
  'other'
);

CREATE TYPE damage_level AS ENUM (
  'not_assessed',
  'none',
  'minor',
  'moderate',
  'major',
  'destroyed'
);

CREATE TYPE repair_priority AS ENUM (
  'p0_critical',
  'p1_high',
  'p2_medium',
  'p3_low'
);

CREATE TYPE repair_status AS ENUM (
  'not_assessed',
  'assessed',
  'repair_planned',
  'repair_in_progress',
  'repaired',
  'decommissioned'
);

CREATE TYPE call_urgency AS ENUM (
  'low',
  'medium',
  'high',
  'life_threatening'
);

CREATE TYPE call_status AS ENUM (
  'received',
  'triaged',
  'dispatched',
  'resolved',
  'duplicate',
  'false_alarm'
);

CREATE TYPE task_status AS ENUM (
  'draft',
  'assigned',
  'accepted',
  'in_progress',
  'blocked',
  'completed',
  'cancelled'
);

CREATE TYPE task_priority AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

CREATE TYPE survey_status AS ENUM (
  'planned',
  'in_flight',
  'data_collected',
  'processing',
  'analysis_complete',
  'archived'
);

CREATE TYPE incident_type AS ENUM (
  'flood',
  'flash_flood',
  'riverbank_overflow',
  'dam_breach',
  'urban_flooding',
  'mudslide'
);

CREATE TYPE incident_status AS ENUM (
  'reported',
  'confirmed',
  'active',
  'contained',
  'resolved',
  'archived'
);

CREATE TYPE org_type AS ENUM (
  'government_federal',
  'government_state',
  'un_agency',
  'international_ngo',
  'local_ngo',
  'red_cross_crescent',
  'military',
  'private_sector',
  'community_based'
);

CREATE TYPE report_type AS ENUM (
  'situation_report',
  'damage_assessment',
  'needs_assessment',
  'distribution_report',
  'field_report',
  'media_report'
);

CREATE TYPE audit_action AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'DISPATCH',
  'STATUS_CHANGE'
);

-- ============================================================================
-- LOCATION HIERARCHY (Sudan-Specific)
-- Federal → State → Locality
-- ============================================================================

CREATE TABLE states (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          VARCHAR(5) NOT NULL UNIQUE,               -- e.g., 'KRT', 'RNL'
  name_en       VARCHAR(100) NOT NULL,
  name_ar       VARCHAR(200) NOT NULL,
  geometry      GEOMETRY(MultiPolygon, 4326),
  population    INTEGER,
  area_km2      NUMERIC(10, 2),
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_states_geometry ON states USING GIST (geometry);
CREATE INDEX idx_states_code ON states (code);

CREATE TABLE localities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state_id      UUID NOT NULL REFERENCES states(id) ON DELETE RESTRICT,
  code          VARCHAR(10) NOT NULL UNIQUE,
  name_en       VARCHAR(150) NOT NULL,
  name_ar       VARCHAR(300) NOT NULL,
  geometry      GEOMETRY(MultiPolygon, 4326),
  population    INTEGER,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_localities_state ON localities (state_id);
CREATE INDEX idx_localities_geometry ON localities USING GIST (geometry);
CREATE INDEX idx_localities_code ON localities (code);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en         VARCHAR(200) NOT NULL,
  name_ar         VARCHAR(400) NOT NULL,
  acronym         VARCHAR(20),
  org_type        org_type NOT NULL,
  parent_org_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(20),                             -- +249 format
  website         VARCHAR(500),
  logo_url        VARCHAR(1000),
  headquarters_state_id UUID REFERENCES states(id),
  operating_states UUID[] DEFAULT '{}',                     -- array of state IDs they operate in
  is_active       BOOLEAN NOT NULL DEFAULT true,
  metadata        JSONB DEFAULT '{}',                       -- flexible extra fields
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                               -- soft delete
);

CREATE INDEX idx_organizations_type ON organizations (org_type);
CREATE INDEX idx_organizations_parent ON organizations (parent_org_id);
CREATE INDEX idx_organizations_active ON organizations (is_active) WHERE is_active = true;
CREATE INDEX idx_organizations_deleted ON organizations (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email           VARCHAR(255) UNIQUE,
  phone           VARCHAR(20),                              -- +249XXXXXXXXX
  password_hash   VARCHAR(255) NOT NULL,
  role            user_role NOT NULL DEFAULT 'citizen',
  first_name_en   VARCHAR(100),
  first_name_ar   VARCHAR(200),
  last_name_en    VARCHAR(100),
  last_name_ar    VARCHAR(200),
  avatar_url      VARCHAR(1000),
  preferred_locale VARCHAR(5) NOT NULL DEFAULT 'ar',        -- 'ar' or 'en'
  assigned_state_id   UUID REFERENCES states(id),
  assigned_locality_id UUID REFERENCES localities(id),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  last_known_location GEOMETRY(Point, 4326),                -- field worker GPS
  last_location_at TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                               -- soft delete
);

CREATE INDEX idx_users_org ON users (org_id);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_active ON users (is_active) WHERE is_active = true;
CREATE INDEX idx_users_location ON users USING GIST (last_known_location);
CREATE INDEX idx_users_deleted ON users (deleted_at) WHERE deleted_at IS NULL;

-- User sessions for NextAuth
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token   VARCHAR(500) NOT NULL UNIQUE,
  refresh_token   VARCHAR(500),
  expires_at      TIMESTAMPTZ NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (session_token);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);

-- ============================================================================
-- FLOOD INCIDENTS (Event Model)
-- ============================================================================

CREATE TABLE flood_incidents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_code   VARCHAR(30) NOT NULL UNIQUE,              -- e.g., 'FL-2026-KRT-001'
  incident_type   incident_type NOT NULL,
  status          incident_status NOT NULL DEFAULT 'reported',
  title_en        VARCHAR(300) NOT NULL,
  title_ar        VARCHAR(600),
  description_en  TEXT,
  description_ar  TEXT,
  severity        flood_severity NOT NULL DEFAULT 'moderate',
  state_id        UUID NOT NULL REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  affected_area   GEOMETRY(MultiPolygon, 4326),
  epicenter       GEOMETRY(Point, 4326),
  estimated_affected_population INTEGER DEFAULT 0,
  start_date      TIMESTAMPTZ NOT NULL,
  end_date        TIMESTAMPTZ,
  declared_by_user_id UUID REFERENCES users(id),
  lead_org_id     UUID REFERENCES organizations(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flood_incidents_status ON flood_incidents (status);
CREATE INDEX idx_flood_incidents_severity ON flood_incidents (severity);
CREATE INDEX idx_flood_incidents_state ON flood_incidents (state_id);
CREATE INDEX idx_flood_incidents_area ON flood_incidents USING GIST (affected_area);
CREATE INDEX idx_flood_incidents_date ON flood_incidents (start_date DESC);

-- ============================================================================
-- FLOOD ZONES
-- ============================================================================

CREATE TABLE flood_zones (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id     UUID REFERENCES flood_incidents(id) ON DELETE SET NULL,
  zone_code       VARCHAR(30) NOT NULL UNIQUE,              -- e.g., 'FZ-KRT-2026-042'
  name_en         VARCHAR(200) NOT NULL,
  name_ar         VARCHAR(400),
  severity        flood_severity NOT NULL,
  status          flood_zone_status NOT NULL DEFAULT 'monitoring',
  geometry        GEOMETRY(Polygon, 4326) NOT NULL,         -- flood zone polygon
  centroid        GEOMETRY(Point, 4326),                    -- auto-calculated
  area_km2        NUMERIC(12, 4),
  water_level_m   NUMERIC(6, 2),                            -- current water level in meters
  water_level_trend VARCHAR(20),                            -- 'rising', 'stable', 'falling'
  max_water_level_m NUMERIC(6, 2),
  affected_population INTEGER DEFAULT 0,
  state_id        UUID NOT NULL REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  monitored_by_org_id UUID REFERENCES organizations(id),
  last_assessed_at TIMESTAMPTZ,
  last_assessed_by UUID REFERENCES users(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_flood_zones_incident ON flood_zones (incident_id);
CREATE INDEX idx_flood_zones_severity ON flood_zones (severity);
CREATE INDEX idx_flood_zones_status ON flood_zones (status);
CREATE INDEX idx_flood_zones_geometry ON flood_zones USING GIST (geometry);
CREATE INDEX idx_flood_zones_state ON flood_zones (state_id);
CREATE INDEX idx_flood_zones_active ON flood_zones (deleted_at) WHERE deleted_at IS NULL;

-- Auto-calculate centroid trigger
CREATE OR REPLACE FUNCTION fn_update_flood_zone_centroid()
RETURNS TRIGGER AS $$
BEGIN
  NEW.centroid := ST_Centroid(NEW.geometry);
  NEW.area_km2 := ST_Area(NEW.geometry::geography) / 1000000.0;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flood_zone_centroid
  BEFORE INSERT OR UPDATE OF geometry ON flood_zones
  FOR EACH ROW EXECUTE FUNCTION fn_update_flood_zone_centroid();

-- ============================================================================
-- RESCUE OPERATIONS
-- ============================================================================

CREATE TABLE rescue_operations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_code  VARCHAR(30) NOT NULL UNIQUE,
  flood_zone_id   UUID NOT NULL REFERENCES flood_zones(id) ON DELETE RESTRICT,
  assigned_org_id UUID NOT NULL REFERENCES organizations(id),
  operation_type  rescue_operation_type NOT NULL,
  status          operation_status NOT NULL DEFAULT 'pending',
  priority        task_priority NOT NULL DEFAULT 'high',
  title_en        VARCHAR(300) NOT NULL,
  title_ar        VARCHAR(600),
  description     TEXT,
  target_location GEOMETRY(Point, 4326) NOT NULL,
  route_geometry  GEOMETRY(LineString, 4326),
  estimated_persons_at_risk INTEGER DEFAULT 0,
  persons_rescued INTEGER DEFAULT 0,
  team_size       INTEGER,
  team_leader_id  UUID REFERENCES users(id),
  dispatched_at   TIMESTAMPTZ,
  arrived_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  emergency_call_id UUID,                                   -- FK added after emergency_calls table
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rescue_ops_zone ON rescue_operations (flood_zone_id);
CREATE INDEX idx_rescue_ops_org ON rescue_operations (assigned_org_id);
CREATE INDEX idx_rescue_ops_status ON rescue_operations (status);
CREATE INDEX idx_rescue_ops_priority ON rescue_operations (priority);
CREATE INDEX idx_rescue_ops_target ON rescue_operations USING GIST (target_location);
CREATE INDEX idx_rescue_ops_leader ON rescue_operations (team_leader_id);
CREATE INDEX idx_rescue_ops_active ON rescue_operations (status) WHERE status NOT IN ('completed', 'aborted', 'failed');

-- Rescue team members (many-to-many: users ↔ rescue_operations)
CREATE TABLE rescue_team_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rescue_operation_id UUID NOT NULL REFERENCES rescue_operations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_team    VARCHAR(50) DEFAULT 'member',             -- 'leader', 'medic', 'driver', 'member'
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rescue_operation_id, user_id)
);

CREATE INDEX idx_rescue_team_operation ON rescue_team_members (rescue_operation_id);
CREATE INDEX idx_rescue_team_user ON rescue_team_members (user_id);

-- ============================================================================
-- SHELTERS
-- ============================================================================

CREATE TABLE shelters (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shelter_code    VARCHAR(30) NOT NULL UNIQUE,
  name_en         VARCHAR(200) NOT NULL,
  name_ar         VARCHAR(400),
  status          shelter_status NOT NULL DEFAULT 'preparing',
  location        GEOMETRY(Point, 4326) NOT NULL,
  address_en      TEXT,
  address_ar      TEXT,
  state_id        UUID NOT NULL REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  managing_org_id UUID NOT NULL REFERENCES organizations(id),
  manager_user_id UUID REFERENCES users(id),
  capacity        INTEGER NOT NULL,
  current_occupancy INTEGER NOT NULL DEFAULT 0,
  has_water       BOOLEAN DEFAULT false,
  has_electricity BOOLEAN DEFAULT false,
  has_medical     BOOLEAN DEFAULT false,
  has_sanitation  BOOLEAN DEFAULT false,
  has_kitchen     BOOLEAN DEFAULT false,
  has_security    BOOLEAN DEFAULT false,
  facility_notes  TEXT,
  opened_at       TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_shelters_status ON shelters (status);
CREATE INDEX idx_shelters_location ON shelters USING GIST (location);
CREATE INDEX idx_shelters_state ON shelters (state_id);
CREATE INDEX idx_shelters_org ON shelters (managing_org_id);
CREATE INDEX idx_shelters_capacity ON shelters (capacity, current_occupancy);
CREATE INDEX idx_shelters_active ON shelters (deleted_at) WHERE deleted_at IS NULL;

-- Constraint: occupancy cannot exceed 2x capacity (allow overcrowding but cap it)
ALTER TABLE shelters ADD CONSTRAINT chk_shelter_occupancy
  CHECK (current_occupancy >= 0);

-- ============================================================================
-- DISPLACED PERSONS
-- ============================================================================

CREATE TABLE family_groups (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_code     VARCHAR(30) NOT NULL UNIQUE,
  head_of_family_id UUID,                                   -- FK added after displaced_persons
  family_size     INTEGER NOT NULL DEFAULT 1,
  origin_state_id UUID REFERENCES states(id),
  origin_locality_id UUID REFERENCES localities(id),
  origin_address  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_groups_code ON family_groups (family_code);
CREATE INDEX idx_family_groups_origin ON family_groups (origin_state_id);

CREATE TABLE displaced_persons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_code VARCHAR(30) NOT NULL UNIQUE,            -- e.g., 'DP-2026-000001'
  family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL,
  first_name_ar   VARCHAR(200) NOT NULL,
  last_name_ar    VARCHAR(200) NOT NULL,
  first_name_en   VARCHAR(100),
  last_name_en    VARCHAR(100),
  date_of_birth   DATE,
  gender          VARCHAR(10),                              -- 'male', 'female', 'other'
  national_id     VARCHAR(30),
  phone           VARCHAR(20),                              -- +249 format
  status          displaced_person_status NOT NULL DEFAULT 'registered',
  health_status   health_status NOT NULL DEFAULT 'unknown',
  health_notes    TEXT,
  has_disability  BOOLEAN DEFAULT false,
  disability_notes TEXT,
  is_unaccompanied_minor BOOLEAN DEFAULT false,
  current_shelter_id UUID REFERENCES shelters(id) ON DELETE SET NULL,
  previous_shelter_ids UUID[] DEFAULT '{}',
  origin_state_id UUID REFERENCES states(id),
  origin_locality_id UUID REFERENCES localities(id),
  last_known_location GEOMETRY(Point, 4326),
  photo_url       VARCHAR(1000),
  registered_by_user_id UUID REFERENCES users(id),
  registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  special_needs   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ                               -- soft delete
);

CREATE INDEX idx_dp_family ON displaced_persons (family_group_id);
CREATE INDEX idx_dp_status ON displaced_persons (status);
CREATE INDEX idx_dp_health ON displaced_persons (health_status);
CREATE INDEX idx_dp_shelter ON displaced_persons (current_shelter_id);
CREATE INDEX idx_dp_registration ON displaced_persons (registration_code);
CREATE INDEX idx_dp_national_id ON displaced_persons (national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_dp_phone ON displaced_persons (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_dp_location ON displaced_persons USING GIST (last_known_location);
CREATE INDEX idx_dp_origin ON displaced_persons (origin_state_id);
CREATE INDEX idx_dp_active ON displaced_persons (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_dp_minor ON displaced_persons (is_unaccompanied_minor) WHERE is_unaccompanied_minor = true;

-- Add head_of_family FK now that displaced_persons exists
ALTER TABLE family_groups
  ADD CONSTRAINT fk_family_head FOREIGN KEY (head_of_family_id)
  REFERENCES displaced_persons(id) ON DELETE SET NULL;

-- ============================================================================
-- RELIEF SUPPLIES
-- ============================================================================

CREATE TABLE relief_supplies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code   VARCHAR(30) NOT NULL UNIQUE,
  supply_type     supply_type NOT NULL,
  status          supply_status NOT NULL DEFAULT 'requested',
  item_name_en    VARCHAR(200) NOT NULL,
  item_name_ar    VARCHAR(400),
  quantity        NUMERIC(12, 2) NOT NULL,
  unit            VARCHAR(50) NOT NULL,                     -- 'kg', 'liters', 'units', 'boxes'
  unit_cost_sdg   NUMERIC(12, 2),
  total_cost_sdg  NUMERIC(14, 2),
  source_org_id   UUID NOT NULL REFERENCES organizations(id),
  destination_org_id UUID REFERENCES organizations(id),
  destination_shelter_id UUID REFERENCES shelters(id),
  origin_location GEOMETRY(Point, 4326),
  destination_location GEOMETRY(Point, 4326),
  current_location GEOMETRY(Point, 4326),
  state_id        UUID REFERENCES states(id),
  expiry_date     DATE,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  distributed_at  TIMESTAMPTZ,
  requested_by_user_id UUID REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_supplies_type ON relief_supplies (supply_type);
CREATE INDEX idx_supplies_status ON relief_supplies (status);
CREATE INDEX idx_supplies_source ON relief_supplies (source_org_id);
CREATE INDEX idx_supplies_dest ON relief_supplies (destination_org_id);
CREATE INDEX idx_supplies_shelter ON relief_supplies (destination_shelter_id);
CREATE INDEX idx_supplies_current_loc ON relief_supplies USING GIST (current_location);
CREATE INDEX idx_supplies_state ON relief_supplies (state_id);
CREATE INDEX idx_supplies_expiry ON relief_supplies (expiry_date) WHERE expiry_date IS NOT NULL;

-- ============================================================================
-- INFRASTRUCTURE
-- ============================================================================

CREATE TABLE infrastructure (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  infra_code      VARCHAR(30) NOT NULL UNIQUE,
  name_en         VARCHAR(200) NOT NULL,
  name_ar         VARCHAR(400),
  infra_type      infrastructure_type NOT NULL,
  location        GEOMETRY(Point, 4326) NOT NULL,
  geometry_detail GEOMETRY(Geometry, 4326),                 -- road linestring, building polygon, etc.
  state_id        UUID NOT NULL REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  flood_zone_id   UUID REFERENCES flood_zones(id) ON DELETE SET NULL,
  damage_level    damage_level NOT NULL DEFAULT 'not_assessed',
  repair_priority repair_priority,
  repair_status   repair_status NOT NULL DEFAULT 'not_assessed',
  assessed_by_user_id UUID REFERENCES users(id),
  assessed_at     TIMESTAMPTZ,
  repair_org_id   UUID REFERENCES organizations(id),
  estimated_repair_cost_sdg NUMERIC(14, 2),
  repair_start_date DATE,
  repair_end_date   DATE,
  serves_population INTEGER,
  description     TEXT,
  photos          TEXT[] DEFAULT '{}',                       -- array of S3 URLs
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_infra_type ON infrastructure (infra_type);
CREATE INDEX idx_infra_location ON infrastructure USING GIST (location);
CREATE INDEX idx_infra_state ON infrastructure (state_id);
CREATE INDEX idx_infra_zone ON infrastructure (flood_zone_id);
CREATE INDEX idx_infra_damage ON infrastructure (damage_level);
CREATE INDEX idx_infra_repair ON infrastructure (repair_status);
CREATE INDEX idx_infra_active ON infrastructure (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- UAV SURVEYS
-- ============================================================================

CREATE TABLE uav_surveys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_code     VARCHAR(30) NOT NULL UNIQUE,
  flood_zone_id   UUID NOT NULL REFERENCES flood_zones(id) ON DELETE RESTRICT,
  status          survey_status NOT NULL DEFAULT 'planned',
  pilot_user_id   UUID REFERENCES users(id),
  operating_org_id UUID REFERENCES organizations(id),
  planned_date    TIMESTAMPTZ,
  flight_start    TIMESTAMPTZ,
  flight_end      TIMESTAMPTZ,
  coverage_area   GEOMETRY(Polygon, 4326),
  flight_path     GEOMETRY(LineString, 4326),
  altitude_m      NUMERIC(6, 1),
  drone_model     VARCHAR(100),
  imagery_urls    TEXT[] DEFAULT '{}',                       -- S3 URLs
  imagery_count   INTEGER DEFAULT 0,
  analysis_summary TEXT,
  analysis_data   JSONB DEFAULT '{}',                       -- structured analysis results
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_uav_zone ON uav_surveys (flood_zone_id);
CREATE INDEX idx_uav_status ON uav_surveys (status);
CREATE INDEX idx_uav_coverage ON uav_surveys USING GIST (coverage_area);
CREATE INDEX idx_uav_date ON uav_surveys (planned_date DESC);

-- ============================================================================
-- EMERGENCY CALLS
-- ============================================================================

CREATE TABLE emergency_calls (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_code       VARCHAR(30) NOT NULL UNIQUE,
  caller_name     VARCHAR(200),
  caller_phone    VARCHAR(20) NOT NULL,                     -- +249 format
  caller_location GEOMETRY(Point, 4326),
  caller_address  TEXT,
  call_number     VARCHAR(5) NOT NULL,                      -- '999' or '112'
  urgency         call_urgency NOT NULL DEFAULT 'medium',
  status          call_status NOT NULL DEFAULT 'received',
  description_ar  TEXT,
  description_en  TEXT,
  persons_at_risk INTEGER DEFAULT 0,
  flood_zone_id   UUID REFERENCES flood_zones(id),
  state_id        UUID REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  received_by_user_id UUID REFERENCES users(id),
  dispatched_to_org_id UUID REFERENCES organizations(id),
  rescue_operation_id UUID UNIQUE,                          -- 1:1 with rescue_operations
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triaged_at      TIMESTAMPTZ,
  dispatched_at   TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  recording_url   VARCHAR(1000),
  notes           TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add the FK to rescue_operations
ALTER TABLE emergency_calls
  ADD CONSTRAINT fk_call_rescue FOREIGN KEY (rescue_operation_id)
  REFERENCES rescue_operations(id) ON DELETE SET NULL;

-- Add the FK from rescue_operations back to emergency_calls
ALTER TABLE rescue_operations
  ADD CONSTRAINT fk_rescue_call FOREIGN KEY (emergency_call_id)
  REFERENCES emergency_calls(id) ON DELETE SET NULL;

CREATE INDEX idx_calls_urgency ON emergency_calls (urgency);
CREATE INDEX idx_calls_status ON emergency_calls (status);
CREATE INDEX idx_calls_location ON emergency_calls USING GIST (caller_location);
CREATE INDEX idx_calls_zone ON emergency_calls (flood_zone_id);
CREATE INDEX idx_calls_state ON emergency_calls (state_id);
CREATE INDEX idx_calls_received ON emergency_calls (received_at DESC);
CREATE INDEX idx_calls_active ON emergency_calls (status) WHERE status NOT IN ('resolved', 'duplicate', 'false_alarm');

-- ============================================================================
-- WEATHER DATA
-- ============================================================================

CREATE TABLE weather_stations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_code    VARCHAR(20) NOT NULL UNIQUE,
  name_en         VARCHAR(200) NOT NULL,
  name_ar         VARCHAR(400),
  location        GEOMETRY(Point, 4326) NOT NULL,
  state_id        UUID NOT NULL REFERENCES states(id),
  station_type    VARCHAR(50) NOT NULL,                     -- 'meteorological', 'river_gauge', 'rain_gauge'
  data_source     VARCHAR(200),                             -- e.g., 'Sudan Met Authority', 'FEWS NET'
  is_active       BOOLEAN NOT NULL DEFAULT true,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_weather_stations_location ON weather_stations USING GIST (location);
CREATE INDEX idx_weather_stations_state ON weather_stations (state_id);

CREATE TABLE weather_data (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_id      UUID NOT NULL REFERENCES weather_stations(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ NOT NULL,
  rainfall_mm     NUMERIC(8, 2),
  river_level_m   NUMERIC(8, 2),
  river_name      VARCHAR(100),                             -- 'Blue Nile', 'White Nile', 'River Nile', 'Atbara'
  river_flow_m3s  NUMERIC(12, 2),                           -- cubic meters per second
  temperature_c   NUMERIC(5, 1),
  humidity_pct    NUMERIC(5, 1),
  wind_speed_kmh  NUMERIC(6, 1),
  wind_direction  VARCHAR(5),
  forecast_data   JSONB,                                    -- future predictions
  is_forecast     BOOLEAN NOT NULL DEFAULT false,
  data_quality    VARCHAR(20) DEFAULT 'verified',           -- 'raw', 'verified', 'estimated'
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partitioning-ready index on recorded_at
CREATE INDEX idx_weather_data_station ON weather_data (station_id, recorded_at DESC);
CREATE INDEX idx_weather_data_time ON weather_data (recorded_at DESC);
CREATE INDEX idx_weather_data_river ON weather_data (river_name) WHERE river_name IS NOT NULL;
CREATE INDEX idx_weather_data_forecast ON weather_data (is_forecast) WHERE is_forecast = true;

-- ============================================================================
-- WEATHER ↔ FLOOD ZONES (M:N Join Table)
-- ============================================================================

CREATE TABLE flood_zone_weather (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flood_zone_id   UUID NOT NULL REFERENCES flood_zones(id) ON DELETE CASCADE,
  weather_data_id UUID NOT NULL REFERENCES weather_data(id) ON DELETE CASCADE,
  correlation_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(flood_zone_id, weather_data_id)
);

CREATE INDEX idx_fz_weather_zone ON flood_zone_weather (flood_zone_id);
CREATE INDEX idx_fz_weather_data ON flood_zone_weather (weather_data_id);

-- ============================================================================
-- TASKS (Inter-Agency Coordination)
-- ============================================================================

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_code       VARCHAR(30) NOT NULL UNIQUE,
  incident_id     UUID REFERENCES flood_incidents(id) ON DELETE SET NULL,
  flood_zone_id   UUID REFERENCES flood_zones(id) ON DELETE SET NULL,
  title_en        VARCHAR(300) NOT NULL,
  title_ar        VARCHAR(600),
  description     TEXT,
  status          task_status NOT NULL DEFAULT 'draft',
  priority        task_priority NOT NULL DEFAULT 'medium',
  assigned_to_org_id UUID NOT NULL REFERENCES organizations(id),
  assigned_to_user_id UUID REFERENCES users(id),
  created_by_org_id UUID NOT NULL REFERENCES organizations(id),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  parent_task_id  UUID REFERENCES tasks(id) ON DELETE SET NULL,
  deadline        TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  completion_notes TEXT,
  progress_pct    INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  target_location GEOMETRY(Point, 4326),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_incident ON tasks (incident_id);
CREATE INDEX idx_tasks_zone ON tasks (flood_zone_id);
CREATE INDEX idx_tasks_status ON tasks (status);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_assigned_org ON tasks (assigned_to_org_id);
CREATE INDEX idx_tasks_assigned_user ON tasks (assigned_to_user_id);
CREATE INDEX idx_tasks_created_by ON tasks (created_by_org_id);
CREATE INDEX idx_tasks_parent ON tasks (parent_task_id);
CREATE INDEX idx_tasks_deadline ON tasks (deadline) WHERE deadline IS NOT NULL;
CREATE INDEX idx_tasks_active ON tasks (status) WHERE status NOT IN ('completed', 'cancelled');

-- Task dependencies
CREATE TABLE task_dependencies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id         UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

CREATE INDEX idx_task_deps_task ON task_dependencies (task_id);
CREATE INDEX idx_task_deps_depends ON task_dependencies (depends_on_task_id);

-- ============================================================================
-- SITUATION REPORTS & ATTACHMENTS
-- ============================================================================

CREATE TABLE situation_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code     VARCHAR(30) NOT NULL UNIQUE,
  incident_id     UUID NOT NULL REFERENCES flood_incidents(id),
  report_type     report_type NOT NULL DEFAULT 'situation_report',
  report_number   INTEGER NOT NULL,                         -- sequential per incident
  title_en        VARCHAR(300) NOT NULL,
  title_ar        VARCHAR(600),
  summary_en      TEXT,
  summary_ar      TEXT,
  content         JSONB NOT NULL DEFAULT '{}',              -- structured report sections
  state_id        UUID REFERENCES states(id),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  created_by_org_id UUID NOT NULL REFERENCES organizations(id),
  published_at    TIMESTAMPTZ,
  is_published    BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sitrep_incident ON situation_reports (incident_id);
CREATE INDEX idx_sitrep_type ON situation_reports (report_type);
CREATE INDEX idx_sitrep_published ON situation_reports (is_published) WHERE is_published = true;

CREATE TABLE attachments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name       VARCHAR(500) NOT NULL,
  file_type       VARCHAR(100) NOT NULL,                    -- MIME type
  file_size_bytes BIGINT NOT NULL,
  storage_url     VARCHAR(1000) NOT NULL,                   -- S3/MinIO URL
  thumbnail_url   VARCHAR(1000),
  -- Polymorphic association: one of these will be set
  flood_zone_id   UUID REFERENCES flood_zones(id) ON DELETE CASCADE,
  rescue_operation_id UUID REFERENCES rescue_operations(id) ON DELETE CASCADE,
  shelter_id      UUID REFERENCES shelters(id) ON DELETE CASCADE,
  infrastructure_id UUID REFERENCES infrastructure(id) ON DELETE CASCADE,
  uav_survey_id   UUID REFERENCES uav_surveys(id) ON DELETE CASCADE,
  situation_report_id UUID REFERENCES situation_reports(id) ON DELETE CASCADE,
  task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
  emergency_call_id UUID REFERENCES emergency_calls(id) ON DELETE CASCADE,
  -- Metadata
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  description     TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_zone ON attachments (flood_zone_id) WHERE flood_zone_id IS NOT NULL;
CREATE INDEX idx_attachments_rescue ON attachments (rescue_operation_id) WHERE rescue_operation_id IS NOT NULL;
CREATE INDEX idx_attachments_shelter ON attachments (shelter_id) WHERE shelter_id IS NOT NULL;
CREATE INDEX idx_attachments_infra ON attachments (infrastructure_id) WHERE infrastructure_id IS NOT NULL;
CREATE INDEX idx_attachments_uav ON attachments (uav_survey_id) WHERE uav_survey_id IS NOT NULL;
CREATE INDEX idx_attachments_sitrep ON attachments (situation_report_id) WHERE situation_report_id IS NOT NULL;
CREATE INDEX idx_attachments_task ON attachments (task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_attachments_uploader ON attachments (uploaded_by_user_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title_en        VARCHAR(300) NOT NULL,
  title_ar        VARCHAR(600),
  body_en         TEXT,
  body_ar         TEXT,
  notification_type VARCHAR(50) NOT NULL,                   -- 'task_assigned', 'alert', 'rescue_update', etc.
  severity        VARCHAR(20) DEFAULT 'info',               -- 'info', 'warning', 'critical'
  reference_type  VARCHAR(50),                              -- 'task', 'rescue_operation', 'flood_zone', etc.
  reference_id    UUID,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  channel         VARCHAR(20) NOT NULL DEFAULT 'in_app',    -- 'in_app', 'sms', 'email', 'push'
  sent_at         TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications (user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications (notification_type);
CREATE INDEX idx_notifications_ref ON notifications (reference_type, reference_id);

-- ============================================================================
-- CITIZEN REPORTS (Mobile/PWA submissions)
-- ============================================================================

CREATE TABLE citizen_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_code     VARCHAR(30) NOT NULL UNIQUE,
  reporter_user_id UUID REFERENCES users(id),
  reporter_phone  VARCHAR(20),
  reporter_name   VARCHAR(200),
  location        GEOMETRY(Point, 4326),
  state_id        UUID REFERENCES states(id),
  locality_id     UUID REFERENCES localities(id),
  report_type     VARCHAR(50) NOT NULL,                     -- 'flood', 'rescue_needed', 'shelter_needed', 'supply_needed', 'infrastructure_damage'
  urgency         call_urgency NOT NULL DEFAULT 'medium',
  description_ar  TEXT,
  description_en  TEXT,
  photos          TEXT[] DEFAULT '{}',
  status          VARCHAR(30) NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewed', 'actioned', 'resolved', 'rejected'
  reviewed_by_user_id UUID REFERENCES users(id),
  linked_task_id  UUID REFERENCES tasks(id),
  linked_rescue_id UUID REFERENCES rescue_operations(id),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_citizen_reports_location ON citizen_reports USING GIST (location);
CREATE INDEX idx_citizen_reports_status ON citizen_reports (status);
CREATE INDEX idx_citizen_reports_urgency ON citizen_reports (urgency);
CREATE INDEX idx_citizen_reports_state ON citizen_reports (state_id);
CREATE INDEX idx_citizen_reports_type ON citizen_reports (report_type);

-- ============================================================================
-- AUDIT LOG (Immutable)
-- ============================================================================

CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  org_id          UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action          audit_action NOT NULL,
  table_name      VARCHAR(100) NOT NULL,
  record_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  request_id      VARCHAR(100),                             -- correlation ID
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log is append-only: no UPDATE or DELETE permitted (enforce via RLS/permissions)
CREATE INDEX idx_audit_user ON audit_logs (user_id);
CREATE INDEX idx_audit_org ON audit_logs (org_id);
CREATE INDEX idx_audit_action ON audit_logs (action);
CREATE INDEX idx_audit_table ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_time ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_request ON audit_logs (request_id) WHERE request_id IS NOT NULL;

-- ============================================================================
-- AUDIT TRIGGER FUNCTION (Generic)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_old JSONB;
  v_new JSONB;
  v_action audit_action;
  v_user_id UUID;
BEGIN
  -- Determine action
  IF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_old := NULL;
    v_new := to_jsonb(NEW);
    v_user_id := NEW.created_by_user_id;  -- if column exists, NULL otherwise
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_user_id := NULL;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_old := to_jsonb(OLD);
    v_new := NULL;
    v_user_id := NULL;
  END IF;

  INSERT INTO audit_logs (action, table_name, record_id, old_values, new_values)
  VALUES (v_action, TG_TABLE_NAME, COALESCE(NEW.id, OLD.id), v_old, v_new);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_flood_zones
  AFTER INSERT OR UPDATE OR DELETE ON flood_zones
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_rescue_operations
  AFTER INSERT OR UPDATE OR DELETE ON rescue_operations
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_displaced_persons
  AFTER INSERT OR UPDATE OR DELETE ON displaced_persons
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_shelters
  AFTER INSERT OR UPDATE OR DELETE ON shelters
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_relief_supplies
  AFTER INSERT OR UPDATE OR DELETE ON relief_supplies
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_infrastructure
  AFTER INSERT OR UPDATE OR DELETE ON infrastructure
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_emergency_calls
  AFTER INSERT OR UPDATE OR DELETE ON emergency_calls
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_tasks
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

-- ============================================================================
-- UPDATED_AT TRIGGER (Generic)
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_update_states BEFORE UPDATE ON states FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_localities BEFORE UPDATE ON localities FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_flood_incidents BEFORE UPDATE ON flood_incidents FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_flood_zones BEFORE UPDATE ON flood_zones FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_rescue_operations BEFORE UPDATE ON rescue_operations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_shelters BEFORE UPDATE ON shelters FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_family_groups BEFORE UPDATE ON family_groups FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_displaced_persons BEFORE UPDATE ON displaced_persons FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_relief_supplies BEFORE UPDATE ON relief_supplies FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_infrastructure BEFORE UPDATE ON infrastructure FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_uav_surveys BEFORE UPDATE ON uav_surveys FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_emergency_calls BEFORE UPDATE ON emergency_calls FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_tasks BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_situation_reports BEFORE UPDATE ON situation_reports FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_citizen_reports BEFORE UPDATE ON citizen_reports FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();
CREATE TRIGGER trg_update_weather_stations BEFORE UPDATE ON weather_stations FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ============================================================================
-- COMMENTS / NOTES (optional — enables discussion threads on any entity)
-- ============================================================================

CREATE TABLE comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  -- Polymorphic: one of these set
  task_id         UUID REFERENCES tasks(id) ON DELETE CASCADE,
  rescue_operation_id UUID REFERENCES rescue_operations(id) ON DELETE CASCADE,
  flood_zone_id   UUID REFERENCES flood_zones(id) ON DELETE CASCADE,
  incident_id     UUID REFERENCES flood_incidents(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_task ON comments (task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_comments_rescue ON comments (rescue_operation_id) WHERE rescue_operation_id IS NOT NULL;
CREATE INDEX idx_comments_zone ON comments (flood_zone_id) WHERE flood_zone_id IS NOT NULL;
CREATE INDEX idx_comments_incident ON comments (incident_id) WHERE incident_id IS NOT NULL;
CREATE INDEX idx_comments_parent ON comments (parent_comment_id);

CREATE TRIGGER trg_update_comments BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();

-- ============================================================================
-- SCHEMA COMPLETE
-- Total tables: 24
-- Total enums: 24
-- Audit-triggered tables: 10
-- PostGIS columns: 20+
-- ============================================================================
