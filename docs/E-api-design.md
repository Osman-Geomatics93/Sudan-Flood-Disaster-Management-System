# Deliverable E — API Design (tRPC Routers)

## Convention

- **Router naming**: `<entity>.router.ts` → merged into root `appRouter`
- **Procedure naming**: `<entity>.<action>` (e.g., `floodZone.create`)
- **Auth context**: Every procedure receives `ctx.user` (or null for public)
- **Middleware stacks**: `publicProcedure`, `protectedProcedure`, `adminProcedure`, `superAdminProcedure`
- **Zod schemas**: All inputs/outputs validated; shared from `packages/shared`
- **Real-time**: Socket.io events emitted from services after successful mutations

---

## Root Router Structure

```typescript
// packages/api/src/routers/index.ts
export const appRouter = router({
  auth:           authRouter,
  organization:   organizationRouter,
  floodZone:      floodZoneRouter,
  rescue:         rescueRouter,
  emergencyCall:  emergencyCallRouter,
  shelter:        shelterRouter,
  displacedPerson: displacedPersonRouter,
  supply:         supplyRouter,
  task:           taskRouter,
  notification:   notificationRouter,
  infrastructure: infrastructureRouter,
  weather:        weatherRouter,
  uavSurvey:      uavSurveyRouter,
  citizenReport:  citizenReportRouter,
  report:         reportRouter,
  upload:         uploadRouter,
});
```

---

## M01: Auth Router (`auth.*`)

| Procedure | Type | Role Access | Input (Zod shape) | Output | Real-time Event |
|-----------|------|-------------|-------------------|--------|-----------------|
| `auth.login` | mutation | public | `{ email: string, password: string }` | `{ user, accessToken, refreshToken }` | — |
| `auth.register` | mutation | public | `{ email, password, phone, firstName_ar, lastName_ar, role?, orgId? }` | `{ user }` | — |
| `auth.refresh` | mutation | public | `{ refreshToken: string }` | `{ accessToken, refreshToken }` | — |
| `auth.logout` | mutation | protected | `{}` | `{ success: boolean }` | — |
| `auth.me` | query | protected | `{}` | `{ user with org and permissions }` | — |
| `auth.changePassword` | mutation | protected | `{ currentPassword, newPassword }` | `{ success }` | — |
| `auth.resetPasswordRequest` | mutation | public | `{ email: string }` | `{ success }` | — |
| `auth.resetPassword` | mutation | public | `{ token, newPassword }` | `{ success }` | — |

---

## M02: Organization Router (`organization.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `organization.list` | query | protected | `{ page, limit, search?, type?, stateId? }` | `{ items: Org[], total, page }` | — |
| `organization.getById` | query | protected | `{ id: uuid }` | `{ org with stats }` | — |
| `organization.create` | mutation | super_admin | `{ name_en, name_ar, acronym, orgType, contactEmail?, contactPhone?, headquartersStateId?, operatingStates? }` | `{ org }` | — |
| `organization.update` | mutation | super_admin, agency_admin (own) | `{ id, ...partial fields }` | `{ org }` | — |
| `organization.delete` | mutation | super_admin | `{ id }` | `{ success }` (soft delete) | — |
| `organization.listUsers` | query | super_admin, agency_admin (own) | `{ orgId, page, limit, role? }` | `{ users[] }` | — |

---

## M03: Location Router (implicit — seeded data, read-only)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `organization.listStates` | query | public | `{}` | `{ states[] }` | — |
| `organization.listLocalities` | query | public | `{ stateId: uuid }` | `{ localities[] }` | — |

> Note: Locations are bundled into the org router since they're lightweight reference data.

---

## M04: Flood Zone Router (`floodZone.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `floodZone.list` | query | protected | `{ page, limit, severity?, status?, stateId?, bbox?: [w,s,e,n] }` | `{ items: FloodZone[], total }` | — |
| `floodZone.getById` | query | protected | `{ id }` | `{ zone with incident, weather, rescueOps, infrastructure }` | — |
| `floodZone.getByBounds` | query | protected | `{ bbox: [west, south, east, north] }` | `{ zones[] as GeoJSON FeatureCollection }` | — |
| `floodZone.create` | mutation | super_admin, agency_admin | `{ name_en, name_ar?, severity, geometry: GeoJSON Polygon, stateId, localityId?, incidentId?, waterLevel? }` | `{ zone }` | `flood:zone:created` |
| `floodZone.update` | mutation | super_admin, agency_admin | `{ id, ...partial }` | `{ zone }` | `flood:zone:updated` |
| `floodZone.updateSeverity` | mutation | super_admin, agency_admin, field_worker | `{ id, severity, waterLevel? }` | `{ zone }` | `flood:zone:severity_changed` |
| `floodZone.archive` | mutation | super_admin | `{ id }` | `{ success }` | `flood:zone:archived` |
| `floodZone.getStats` | query | protected | `{ stateId?, incidentId? }` | `{ totalZones, bySeverity, totalAffected, activeRescues }` | — |

### Flood Incidents (sub-router)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `floodZone.incident.list` | query | protected | `{ page, limit, status?, stateId? }` | `{ incidents[] }` | — |
| `floodZone.incident.create` | mutation | super_admin, agency_admin | `{ title_en, incidentType, severity, stateId, startDate, affectedArea?: GeoJSON }` | `{ incident }` | `flood:incident:created` |
| `floodZone.incident.update` | mutation | super_admin, agency_admin | `{ id, ...partial }` | `{ incident }` | `flood:incident:updated` |

---

## M05: Rescue Router (`rescue.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `rescue.list` | query | protected | `{ page, limit, status?, zoneId?, orgId?, priority? }` | `{ items[], total }` | — |
| `rescue.getById` | query | protected | `{ id }` | `{ op with team, zone, call, timeline }` | — |
| `rescue.create` | mutation | super_admin, agency_admin | `{ floodZoneId, assignedOrgId, operationType, priority, title_en, targetLocation: [lng,lat], estimatedPersons?, teamLeaderId? }` | `{ operation }` | `rescue:created` |
| `rescue.dispatch` | mutation | super_admin, agency_admin | `{ id }` | `{ operation }` | `rescue:dispatched` |
| `rescue.updateStatus` | mutation | super_admin, agency_admin, field_worker (assigned) | `{ id, status, personsRescued?, notes? }` | `{ operation }` | `rescue:status_changed` |
| `rescue.updateLocation` | mutation | field_worker (assigned) | `{ id, currentLocation: [lng,lat] }` | `{ success }` | `rescue:location_updated` |
| `rescue.assignTeam` | mutation | super_admin, agency_admin | `{ operationId, userIds: uuid[], leaderId?: uuid }` | `{ team[] }` | `rescue:team_assigned` |
| `rescue.complete` | mutation | super_admin, agency_admin, field_worker (leader) | `{ id, personsRescued, notes? }` | `{ operation }` | `rescue:completed` |
| `rescue.getActiveByZone` | query | protected | `{ zoneId }` | `{ operations[] }` | — |

---

## M06: Emergency Call Router (`emergencyCall.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `emergencyCall.list` | query | protected | `{ page, limit, status?, urgency?, stateId? }` | `{ items[], total }` | — |
| `emergencyCall.getById` | query | protected | `{ id }` | `{ call with rescue op }` | — |
| `emergencyCall.create` | mutation | super_admin, agency_admin, field_worker | `{ callerName?, callerPhone, callerLocation?: [lng,lat], callNumber: '999'\|'112', urgency, description_ar?, personsAtRisk?, stateId?, floodZoneId? }` | `{ call }` | `emergency:call:received` |
| `emergencyCall.triage` | mutation | super_admin, agency_admin | `{ id, urgency, floodZoneId?, notes? }` | `{ call }` | `emergency:call:triaged` |
| `emergencyCall.dispatch` | mutation | super_admin, agency_admin | `{ id, dispatchToOrgId, createRescue?: boolean }` | `{ call, rescueOperation? }` | `emergency:call:dispatched` |
| `emergencyCall.resolve` | mutation | super_admin, agency_admin | `{ id, notes? }` | `{ call }` | `emergency:call:resolved` |
| `emergencyCall.getActive` | query | protected | `{}` | `{ calls[] }` | — |

---

## M07: Displaced Person Router (`displacedPerson.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `displacedPerson.list` | query | protected | `{ page, limit, status?, shelterId?, healthStatus?, stateId?, search? }` | `{ items[], total }` | — |
| `displacedPerson.getById` | query | protected | `{ id }` | `{ person with family, shelter }` | — |
| `displacedPerson.register` | mutation | super_admin, agency_admin, field_worker | `{ firstName_ar, lastName_ar, dateOfBirth?, gender?, nationalId?, phone?, healthStatus, hasDisability?, familyGroupId?, shelterId?, originStateId? }` | `{ person }` | `dp:registered` |
| `displacedPerson.update` | mutation | super_admin, agency_admin, field_worker | `{ id, ...partial }` | `{ person }` | `dp:updated` |
| `displacedPerson.assignShelter` | mutation | super_admin, agency_admin, field_worker | `{ personId, shelterId }` | `{ person }` | `dp:shelter_assigned` |
| `displacedPerson.updateHealth` | mutation | super_admin, agency_admin, field_worker | `{ id, healthStatus, healthNotes? }` | `{ person }` | `dp:health_updated` |
| `displacedPerson.search` | query | protected | `{ query: string }` (name, phone, national ID) | `{ results[] }` | — |
| `displacedPerson.getStats` | query | protected | `{ stateId?, shelterId? }` | `{ total, byStatus, byHealth, unaccompaniedMinors }` | — |

### Family Group Sub-Router

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `displacedPerson.family.create` | mutation | protected | `{ headOfFamilyId?, familySize, originStateId? }` | `{ familyGroup }` | — |
| `displacedPerson.family.addMember` | mutation | protected | `{ familyGroupId, personId }` | `{ familyGroup }` | — |
| `displacedPerson.family.getById` | query | protected | `{ id }` | `{ family with members }` | — |

---

## M08: Shelter Router (`shelter.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `shelter.list` | query | protected | `{ page, limit, status?, stateId?, hasCapacity?: boolean }` | `{ items[], total }` | — |
| `shelter.getById` | query | protected | `{ id }` | `{ shelter with org, occupants count, supplies }` | — |
| `shelter.getByBounds` | query | protected | `{ bbox }` | `{ shelters[] as GeoJSON }` | — |
| `shelter.create` | mutation | super_admin, agency_admin | `{ name_en, name_ar?, location: [lng,lat], stateId, managingOrgId, capacity, facilities: { water, electricity, medical, sanitation, kitchen, security } }` | `{ shelter }` | `shelter:created` |
| `shelter.update` | mutation | super_admin, agency_admin (managing) | `{ id, ...partial }` | `{ shelter }` | `shelter:updated` |
| `shelter.updateOccupancy` | mutation | super_admin, agency_admin, field_worker | `{ id, currentOccupancy }` | `{ shelter }` | `shelter:occupancy_changed` |
| `shelter.updateStatus` | mutation | super_admin, agency_admin | `{ id, status }` | `{ shelter }` | `shelter:status_changed` |
| `shelter.getStats` | query | protected | `{ stateId? }` | `{ total, byStatus, totalCapacity, totalOccupancy, utilizationPct }` | — |
| `shelter.findNearest` | query | protected | `{ location: [lng,lat], radiusKm?: number, limit?: number }` | `{ shelters[] with distance }` | — |

---

## M09: Supply Router (`supply.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `supply.list` | query | protected | `{ page, limit, type?, status?, sourceOrgId?, destOrgId? }` | `{ items[], total }` | — |
| `supply.getById` | query | protected | `{ id }` | `{ supply with source org, dest, tracking }` | — |
| `supply.request` | mutation | super_admin, agency_admin | `{ supplyType, itemName_en, quantity, unit, sourceOrgId, destinationOrgId?, destinationShelterId?, stateId? }` | `{ supply }` | `supply:requested` |
| `supply.approve` | mutation | super_admin, agency_admin (source org) | `{ id, unitCostSdg? }` | `{ supply }` | `supply:approved` |
| `supply.ship` | mutation | super_admin, agency_admin (source org) | `{ id, originLocation: [lng,lat] }` | `{ supply }` | `supply:shipped` |
| `supply.updateLocation` | mutation | field_worker | `{ id, currentLocation: [lng,lat] }` | `{ supply }` | `supply:location_updated` |
| `supply.deliver` | mutation | super_admin, agency_admin, field_worker | `{ id }` | `{ supply }` | `supply:delivered` |
| `supply.distribute` | mutation | super_admin, agency_admin, field_worker | `{ id }` | `{ supply }` | `supply:distributed` |
| `supply.getInventory` | query | protected | `{ orgId?, shelterId?, type? }` | `{ inventory summary by type }` | — |

---

## M10: Task Router (`task.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `task.list` | query | protected | `{ page, limit, status?, priority?, assignedToOrgId?, createdByOrgId?, incidentId? }` | `{ items[], total }` | — |
| `task.getById` | query | protected | `{ id }` | `{ task with subtasks, dependencies, comments }` | — |
| `task.create` | mutation | super_admin, agency_admin | `{ title_en, title_ar?, description?, priority, assignedToOrgId, assignedToUserId?, incidentId?, floodZoneId?, deadline?, parentTaskId? }` | `{ task }` | `task:created` |
| `task.update` | mutation | super_admin, agency_admin (creator or assignee) | `{ id, ...partial }` | `{ task }` | `task:updated` |
| `task.updateStatus` | mutation | super_admin, agency_admin, field_worker (assigned) | `{ id, status, progressPct?, notes? }` | `{ task }` | `task:status_changed` |
| `task.addDependency` | mutation | super_admin, agency_admin | `{ taskId, dependsOnTaskId }` | `{ task }` | — |
| `task.addComment` | mutation | protected | `{ taskId, body }` | `{ comment }` | `task:comment_added` |
| `task.getMyTasks` | query | protected | `{}` | `{ tasks[] assigned to current user }` | — |
| `task.getOrgTasks` | query | agency_admin | `{ status?, priority? }` | `{ tasks[] for current org }` | — |

---

## M11: Notification Router (`notification.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `notification.list` | query | protected | `{ page, limit, isRead?: boolean }` | `{ items[], total, unreadCount }` | — |
| `notification.markRead` | mutation | protected | `{ id }` | `{ success }` | — |
| `notification.markAllRead` | mutation | protected | `{}` | `{ success }` | — |
| `notification.getUnreadCount` | query | protected | `{}` | `{ count }` | — |

> Notifications are **created server-side** by services, not directly by users. Socket.io pushes to connected clients via `notification:new` event.

---

## M12: Infrastructure Router (`infrastructure.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `infrastructure.list` | query | protected | `{ page, limit, type?, damageLevel?, repairStatus?, stateId?, zoneId? }` | `{ items[], total }` | — |
| `infrastructure.getById` | query | protected | `{ id }` | `{ infra with photos, zone }` | — |
| `infrastructure.create` | mutation | super_admin, agency_admin | `{ name_en, infraType, location: [lng,lat], stateId, floodZoneId? }` | `{ infra }` | — |
| `infrastructure.assess` | mutation | super_admin, agency_admin, field_worker | `{ id, damageLevel, repairPriority?, description?, photos?: string[] }` | `{ infra }` | `infra:assessed` |
| `infrastructure.updateRepair` | mutation | super_admin, agency_admin | `{ id, repairStatus, repairOrgId?, estimatedCost?, startDate?, endDate? }` | `{ infra }` | `infra:repair_updated` |
| `infrastructure.getByBounds` | query | protected | `{ bbox }` | `{ infra[] as GeoJSON }` | — |

---

## M13: Weather Router (`weather.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `weather.getLatest` | query | protected | `{ stationId?, stateId?, riverName? }` | `{ data[] }` | — |
| `weather.getHistory` | query | protected | `{ stationId, from: date, to: date }` | `{ data[] }` | — |
| `weather.getRiverLevels` | query | protected | `{ riverName: 'Blue Nile'\|'White Nile'\|'River Nile'\|'Atbara' }` | `{ stations with latest levels }` | — |
| `weather.getForecasts` | query | protected | `{ stateId? }` | `{ forecasts[] }` | — |
| `weather.listStations` | query | protected | `{ stateId?, type? }` | `{ stations[] }` | — |

> Weather data is **ingested by background jobs** (BullMQ worker), not entered via API. The API is read-only.

---

## M14: UAV Survey Router (`uavSurvey.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `uavSurvey.list` | query | protected | `{ page, limit, status?, zoneId? }` | `{ items[], total }` | — |
| `uavSurvey.getById` | query | protected | `{ id }` | `{ survey with imagery, zone }` | — |
| `uavSurvey.plan` | mutation | super_admin, agency_admin | `{ floodZoneId, plannedDate, coverageArea?: GeoJSON, droneModel?, pilotUserId? }` | `{ survey }` | — |
| `uavSurvey.updateStatus` | mutation | super_admin, agency_admin, field_worker | `{ id, status, flightStart?, flightEnd?, altitude? }` | `{ survey }` | `uav:status_changed` |
| `uavSurvey.addImagery` | mutation | super_admin, agency_admin, field_worker | `{ id, imageryUrls: string[] }` | `{ survey }` | — |
| `uavSurvey.addAnalysis` | mutation | super_admin, agency_admin | `{ id, analysisSummary, analysisData: JSON }` | `{ survey }` | — |

---

## M15: Report Router (`report.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `report.sitrep.list` | query | protected | `{ incidentId?, page, limit }` | `{ items[], total }` | — |
| `report.sitrep.create` | mutation | super_admin, agency_admin | `{ incidentId, title_en, reportType, content: JSON }` | `{ report }` | — |
| `report.sitrep.publish` | mutation | super_admin | `{ id }` | `{ report }` | `report:published` |
| `report.export.csv` | mutation | super_admin, agency_admin | `{ module: string, filters: JSON }` | `{ jobId }` (async via BullMQ) | — |
| `report.export.pdf` | mutation | super_admin, agency_admin | `{ reportId }` | `{ jobId }` (async via BullMQ) | — |
| `report.dashboard` | query | protected | `{ stateId?, incidentId? }` | `{ KPIs: zones, rescues, shelters, DPs, supplies }` | — |

---

## M16: Citizen Report Router (`citizenReport.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `citizenReport.submit` | mutation | citizen, public | `{ reportType, urgency, description_ar?, location?: [lng,lat], reporterPhone?, photos?: string[] }` | `{ report }` | `citizen:report:new` |
| `citizenReport.list` | query | super_admin, agency_admin | `{ page, limit, status?, urgency?, stateId?, type? }` | `{ items[], total }` | — |
| `citizenReport.review` | mutation | super_admin, agency_admin | `{ id, status, linkedTaskId?, linkedRescueId? }` | `{ report }` | — |
| `citizenReport.myReports` | query | citizen | `{}` | `{ reports[] }` | — |

---

## Upload Router (`upload.*`)

| Procedure | Type | Role Access | Input | Output | Real-time |
|-----------|------|-------------|-------|--------|-----------|
| `upload.getPresignedUrl` | mutation | protected | `{ fileName, fileType, folder: string }` | `{ uploadUrl, fileUrl }` | — |
| `upload.confirmUpload` | mutation | protected | `{ fileUrl, entityType, entityId }` | `{ attachment }` | — |

---

## Socket.io Event Namespaces

```
/flood         — Flood zone updates, severity changes
/rescue        — Rescue operation status, location tracking
/emergency     — New emergency calls, dispatch notifications
/shelter       — Occupancy changes, status updates
/supply        — Supply tracking, delivery confirmations
/task          — Task assignments, status changes
/notification  — User-specific notification delivery
/location      — Field worker GPS position sharing
```

### Room Structure

```
org:{orgId}          — All events for a specific organization
state:{stateId}      — All events within a state
zone:{zoneId}        — All events for a specific flood zone
rescue:{operationId} — Real-time updates for a rescue op
user:{userId}        — Private notifications for a user
```
