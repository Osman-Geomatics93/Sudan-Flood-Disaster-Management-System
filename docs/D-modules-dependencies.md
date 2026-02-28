# Deliverable D — Feature Modules + Dependencies

## Module Priority Matrix

### P0 — Critical Path (Must ship for MVP)

| Module                             | Description                                                          | Key Entities                           |
| ---------------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| **M01: Auth & RBAC**               | User authentication, session management, role-based access control   | users, sessions                        |
| **M02: Org Management**            | Organization CRUD, hierarchy, operating areas                        | organizations                          |
| **M03: Location Hierarchy**        | Sudan states + localities reference data                             | states, localities                     |
| **M04: Flood Zone Management**     | Create/edit/monitor flood zones with map polygons, severity tracking | flood_zones, flood_incidents           |
| **M05: Rescue Dispatch**           | Create/assign/track rescue operations, team management               | rescue_operations, rescue_team_members |
| **M06: Emergency Call Processing** | Intake 112/999 calls, triage, dispatch to rescue                     | emergency_calls                        |

### P1 — High Priority (Needed for operational effectiveness)

| Module                           | Description                                                           | Key Entities                     |
| -------------------------------- | --------------------------------------------------------------------- | -------------------------------- |
| **M07: Displaced Persons**       | Register individuals/families, track shelter placement, health status | displaced_persons, family_groups |
| **M08: Shelter Dashboard**       | Manage shelters, capacity tracking, facility status                   | shelters                         |
| **M09: Relief Supplies**         | Track supplies from source → destination, inventory management        | relief_supplies                  |
| **M10: Task Assignment**         | Inter-agency task creation, assignment, progress tracking             | tasks, task_dependencies         |
| **M11: Real-time Notifications** | In-app + push notifications for critical events                       | notifications                    |

### P2 — Medium Priority (Enhanced capabilities)

| Module                             | Description                                             | Key Entities                   |
| ---------------------------------- | ------------------------------------------------------- | ------------------------------ |
| **M12: Infrastructure Assessment** | Damage assessment, repair tracking, priority management | infrastructure                 |
| **M13: Weather Integration**       | Weather station data, river levels, forecasts           | weather_stations, weather_data |
| **M14: UAV Survey Management**     | Plan/track drone surveys, manage imagery, link to zones | uav_surveys                    |
| **M15: Situation Reports**         | Create/publish sitreps, attachments, structured content | situation_reports, attachments |
| **M16: Reports & Analytics**       | Dashboard KPIs, CSV/PDF exports, cross-module analytics | (views/aggregates)             |

### P3 — Lower Priority (Future enhancements)

| Module                            | Description                                                   | Key Entities    |
| --------------------------------- | ------------------------------------------------------------- | --------------- |
| **M17: Citizen Mobile/PWA**       | Public reporting interface, shelter finder, personal tracking | citizen_reports |
| **M18: AI Flood Prediction**      | ML-based flood forecasting from weather + historical data     | (derived)       |
| **M19: SMS Alerts**               | SMS gateway integration for mass alerts, 2-way messaging      | (external)      |
| **M20: Offline-First Field Mode** | Full offline data entry, background sync, conflict resolution | (client-side)   |

---

## Dependency Graph

```
M01: Auth & RBAC
 ├── (no dependencies — foundation module)
 │
M02: Org Management
 ├── depends on: M01 (users belong to orgs, auth required)
 │
M03: Location Hierarchy
 ├── (no dependencies — reference data, loaded via seed)
 │
M04: Flood Zone Management
 ├── depends on: M01 (auth), M02 (org assigns monitoring), M03 (state/locality)
 │
M05: Rescue Dispatch
 ├── depends on: M01, M02, M04 (rescue targets a flood zone)
 │
M06: Emergency Call Processing
 ├── depends on: M01, M03, M04 (links to zone), M05 (dispatches to rescue)
 │
M07: Displaced Persons
 ├── depends on: M01, M03, M08 (assigned to shelter)
 │
M08: Shelter Dashboard
 ├── depends on: M01, M02 (managing org), M03 (state/locality)
 │
M09: Relief Supplies
 ├── depends on: M01, M02 (source/dest org), M08 (destination shelter)
 │
M10: Task Assignment
 ├── depends on: M01, M02, M04 (zone-specific tasks)
 │
M11: Real-time Notifications
 ├── depends on: M01
 ├── triggered by: M04 (zone alerts), M05 (rescue status), M06 (new calls), M10 (task updates)
 │
M12: Infrastructure Assessment
 ├── depends on: M01, M02, M03, M04 (zone linkage)
 │
M13: Weather Integration
 ├── depends on: M03, M04 (weather ↔ zone correlation)
 │
M14: UAV Survey Management
 ├── depends on: M01, M02, M04 (surveys linked to zones)
 │
M15: Situation Reports
 ├── depends on: M01, M02, M04 (incident-linked)
 │
M16: Reports & Analytics
 ├── depends on: M04, M05, M07, M08, M09 (aggregates across modules)
 │
M17: Citizen Mobile/PWA
 ├── depends on: M01, M03, M08 (shelter lookup), M04 (zone info)
 │
M18: AI Flood Prediction
 ├── depends on: M04, M13 (historical weather + zone data)
 │
M19: SMS Alerts
 ├── depends on: M01, M11 (notification delivery channel)
 │
M20: Offline-First Field Mode
 ├── depends on: M01, M07 (offline DP registration), M05 (offline rescue updates)
```

## Visual Dependency Flow

```
                    ┌──────────┐     ┌──────────┐
                    │   M03    │     │   M01    │
                    │ Location │     │  Auth &  │
                    │Hierarchy │     │  RBAC    │
                    └────┬─────┘     └────┬─────┘
                         │                │
              ┌──────────┼────────────────┼──────────────┐
              │          │                │              │
         ┌────▼───┐ ┌───▼────┐     ┌────▼─────┐  ┌────▼────┐
         │  M02   │ │  M04   │     │   M08    │  │  M11   │
         │  Org   │ │ Flood  │     │ Shelter  │  │ Notif  │
         │ Mgmt   │ │ Zones  │     │Dashboard │  │        │
         └───┬────┘ └───┬────┘     └────┬─────┘  └────────┘
             │          │               │
    ┌────────┼──────┬───┼───────┬───────┤
    │        │      │   │       │       │
┌───▼──┐ ┌──▼──┐ ┌─▼───▼─┐ ┌──▼───┐ ┌─▼────┐
│ M05  │ │ M10 │ │ M06   │ │ M07  │ │ M09  │
│Rescue│ │Task │ │Emerg. │ │ DP   │ │Supply│
│Dispat│ │Assn │ │ Call  │ │ Reg  │ │Track │
└──┬───┘ └─────┘ └───────┘ └──────┘ └──────┘
   │
   │     ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
   │     │ M12  │  │ M13  │  │ M14  │  │ M15  │
   │     │Infra │  │Weath.│  │ UAV  │  │SitRep│
   │     └──────┘  └──┬───┘  └──────┘  └──────┘
   │                   │
   │              ┌────▼───┐     ┌──────┐
   │              │  M18   │     │ M16  │
   │              │AI Pred.│     │Report│
   │              └────────┘     └──────┘
   │
   │     ┌──────┐  ┌──────┐  ┌──────┐
   └────►│ M17  │  │ M19  │  │ M20  │
         │Citiz.│  │ SMS  │  │Offlin│
         └──────┘  └──────┘  └──────┘
```

## Implementation Order (Critical Path)

**Sprint 0 (Foundation):** M01 + M03 → M02
**Sprint 1 (Core Ops):** M04 → M05 + M06
**Sprint 2 (People & Shelters):** M08 → M07 + M09
**Sprint 3 (Coordination):** M10 + M11
**Sprint 4+ (Enhanced):** M12, M13, M14, M15, M16 (parallelizable)
**Sprint 6+ (Extended):** M17, M18, M19, M20
