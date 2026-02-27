# Deliverable F — Implementation Plan (Step-by-Step)

## Overview

- **Methodology**: 2-week sprints with weekly standups
- **Team assumption**: 2-4 full-stack developers
- **Total Phase 2 (build) estimate**: 12-16 weeks after Phase 1 sign-off
- **Testing strategy**: Unit (Vitest) → Integration (Vitest + testcontainers) → E2E (Playwright)

---

## Milestone 0: Project Bootstrap (Week 1)

### Tasks
1. Initialize monorepo with Turborepo + pnpm
2. Configure TypeScript strict mode (`tsconfig.base.json`)
3. Set up ESLint (typescript-eslint strict) + Prettier
4. Create `docker-compose.yml` (PostgreSQL+PostGIS, Redis, MinIO, pgAdmin)
5. Run database migration (001_initial_schema.sql)
6. Set up Drizzle ORM with schema definitions in `packages/db`
7. Create seed scripts for Sudan states (18) + localities + demo organizations
8. Verify all Docker services healthy + seed data loaded
9. Set up Git repository + branch strategy (main → develop → feature branches)
10. Configure CI pipeline (GitHub Actions: lint + type-check + test)

### Definition of Done
- [ ] `pnpm install` succeeds with zero warnings
- [ ] `docker compose up` starts all 4 services with health checks passing
- [ ] `pnpm db:migrate` applies schema to PostGIS database
- [ ] `pnpm db:seed` loads 18 states, 189 localities, 14 organizations, 8 demo users
- [ ] `pnpm lint` and `pnpm type-check` pass on all packages
- [ ] CI pipeline runs green on push to `develop`

### Seed Data Plan
```
States (18): Khartoum, River Nile, White Nile, Blue Nile, Kassala,
  Gedaref, North Kordofan, South Kordofan, West Kordofan, North Darfur,
  South Darfur, West Darfur, Central Darfur, East Darfur, Northern,
  Red Sea, Sennar, Al Jazira

Organizations (14+):
  - NEMA (National Emergency Management Authority) — government_federal
  - HAC (Humanitarian Aid Commission) — government_federal
  - Khartoum State Emergency Committee — government_state
  - UNHCR — un_agency
  - WFP (World Food Programme) — un_agency
  - UNICEF — un_agency
  - OCHA — un_agency
  - ICRC — red_cross_crescent
  - SRCS (Sudanese Red Crescent) — red_cross_crescent
  - MSF — international_ngo
  - Save the Children — international_ngo
  - World Vision — international_ngo
  - Sudanese Engineers Union — local_ngo
  - Sudan Armed Forces (Rescue Division) — military

Demo Users (8):
  - super_admin: NEMA coordinator
  - agency_admin x3: UNHCR, WFP, SRCS managers
  - field_worker x3: assigned to different states
  - citizen x1: Khartoum resident
```

---

## Milestone 1: Auth + Core Foundation (Weeks 2-3)

### Tasks
1. Implement `packages/shared` — Zod schemas, constants, phone validation, role permissions
2. Set up tRPC server with context, middleware pipeline
3. Implement NextAuth v5 with credentials provider
4. Build auth middleware (JWT verification, user loading)
5. Implement RBAC middleware with permissions matrix
6. Build rate limiting middleware (Redis-backed)
7. Set up audit logging middleware
8. Create Next.js app shell (App Router, layouts, providers)
9. Implement login/register pages
10. Build sidebar navigation with role-based menu items
11. Set up i18n (next-intl) with Arabic/English locale files
12. Implement RTL layout switching
13. Set up dark mode with theme provider
14. Configure Tailwind with shadcn/ui components

### Definition of Done
- [ ] Users can register, login, logout
- [ ] JWT access + refresh token flow works
- [ ] RBAC blocks unauthorized API calls (tested per role)
- [ ] Rate limiting returns 429 after threshold
- [ ] Audit log records login/logout events
- [ ] UI renders in Arabic (RTL) and English (LTR)
- [ ] Dark mode toggles correctly
- [ ] **Tests**: 30+ unit tests for auth/RBAC, 5 integration tests

---

## Milestone 2: Flood Zones + Map (Weeks 4-5)

### Tasks
1. Implement flood zone tRPC router (CRUD + spatial queries)
2. Implement flood incident router
3. Set up Leaflet map container component
4. Build flood zone polygon drawing/editing on map
5. Implement zone list view with filtering
6. Build zone detail page with stats
7. Implement severity classification UI (color-coded)
8. Set up Socket.io server + client
9. Implement real-time zone updates (severity changes broadcast)
10. Build flood zone stats dashboard widget
11. Implement GeoJSON import/export for zones

### Definition of Done
- [ ] Can create flood zone by drawing polygon on map
- [ ] Zones display on map color-coded by severity
- [ ] Zone list filters by severity, status, state
- [ ] Spatial query `getByBounds` returns zones in viewport
- [ ] Real-time: zone severity change updates connected clients
- [ ] Zone stats show counts by severity + total affected population
- [ ] **Tests**: 20+ unit, 10 integration (spatial queries), 3 E2E

---

## Milestone 3: Rescue + Emergency Calls (Weeks 6-7)

### Tasks
1. Implement rescue operation tRPC router
2. Implement emergency call tRPC router
3. Build rescue dispatch interface (form + map)
4. Build emergency call intake form
5. Implement call triage workflow
6. Connect emergency calls to rescue dispatch (1:1)
7. Build rescue tracking map (real-time location)
8. Implement rescue status timeline view
9. Build team assignment interface
10. Real-time rescue status updates via Socket.io
11. Build active operations dashboard

### Definition of Done
- [ ] Can receive emergency call + auto-suggest nearest zone
- [ ] Can triage call and set urgency
- [ ] Can dispatch call → creates rescue operation
- [ ] Rescue operation shows on map with status
- [ ] Field workers can update rescue status from any device
- [ ] Real-time: dispatchers see rescue updates live
- [ ] Active operations dashboard shows all in-progress rescues
- [ ] **Tests**: 25+ unit, 10 integration, 5 E2E

---

## Milestone 4: Shelters + Displaced Persons (Weeks 8-9)

### Tasks
1. Implement shelter tRPC router
2. Implement displaced person + family group routers
3. Build shelter management interface
4. Build shelter map with capacity indicators
5. Implement `findNearest` shelter query (spatial)
6. Build displaced person registration form
7. Implement family grouping workflow
8. Build DP search (by name, phone, national ID)
9. Implement shelter assignment workflow
10. Build shelter capacity dashboard
11. Implement DP stats: by status, health, unaccompanied minors

### Definition of Done
- [ ] Can create shelter with location + facilities
- [ ] Shelter map shows capacity (green/yellow/red)
- [ ] Can register displaced person + assign to shelter
- [ ] Family groups link members together
- [ ] Search finds persons by name, phone, or national ID
- [ ] Shelter occupancy auto-updates when DPs assigned
- [ ] `findNearest` returns shelters sorted by distance
- [ ] DP dashboard shows registration stats
- [ ] **Tests**: 25+ unit, 10 integration, 5 E2E

---

## Milestone 5: Supplies + Tasks + Notifications (Weeks 10-11)

### Tasks
1. Implement supply tRPC router with full lifecycle
2. Implement task tRPC router with dependencies
3. Implement notification service + Socket.io push
4. Build supply request → approve → ship → deliver workflow
5. Build supply tracking map
6. Build supply inventory dashboard
7. Build inter-agency task board (Kanban-style)
8. Build task detail with comments + dependencies
9. Implement notification bell with unread count
10. Build notification preferences
11. Connect critical events to notification creation

### Definition of Done
- [ ] Full supply lifecycle: request → approve → ship → deliver → distribute
- [ ] Supply locations visible on map during transit
- [ ] Inventory view shows stock by type per org/shelter
- [ ] Tasks can be created by NEMA, assigned to agencies
- [ ] Task dependencies block status progression
- [ ] Comments work on tasks
- [ ] Notifications appear in real-time for assigned users
- [ ] Unread count badge updates live
- [ ] **Tests**: 30+ unit, 15 integration, 5 E2E

---

## Milestone 6: P2 Modules (Weeks 12-14)

### Tasks — Infrastructure
1. Implement infrastructure router
2. Build damage assessment form with photo upload
3. Build repair tracking workflow
4. Infrastructure map layer

### Tasks — Weather
5. Set up BullMQ weather data fetcher (cron job)
6. Implement weather router (read-only)
7. Build river level charts (Blue Nile, White Nile, River Nile)
8. Build rainfall dashboard widget

### Tasks — UAV Surveys
9. Implement UAV survey router
10. Build survey planning interface
11. Build imagery gallery with zone linkage

### Tasks — Reports
12. Implement situation report CRUD
13. Build CSV export via BullMQ
14. Build PDF generation placeholder
15. Build main dashboard with KPIs

### Definition of Done
- [ ] Infrastructure: assess damage → plan repair → track progress
- [ ] Weather: river levels display with historical chart
- [ ] UAV: plan survey, upload imagery, link to zone
- [ ] Sitrep: create, publish, view per incident
- [ ] Dashboard: 6+ KPI cards with real data
- [ ] CSV export works for all major entities
- [ ] **Tests**: 40+ unit, 20 integration, 5 E2E

---

## Milestone 7: PWA + Polish (Weeks 15-16)

### Tasks
1. Set up service worker with cache strategies
2. Implement offline detection + sync queue
3. Build "Add to Home Screen" prompt
4. Implement citizen report form (PWA-friendly)
5. Build offline-indicator component
6. Performance optimization (bundle analysis, code splitting)
7. Accessibility audit (WCAG 2.1 AA)
8. Cross-browser testing (Chrome, Firefox, Safari Mobile)
9. Arabic translation review + corrections
10. Security audit (OWASP checklist)
11. Load testing with k6 (500 concurrent users)
12. Documentation: API reference, deployment guide, user manual outline

### Definition of Done
- [ ] PWA installable on Android Chrome
- [ ] App loads on simulated 2G connection in < 5 seconds
- [ ] Citizen can submit report offline; syncs when online
- [ ] Service worker caches app shell + critical routes
- [ ] Lighthouse: Performance > 80, A11y > 90, PWA > 90
- [ ] No critical/high security vulnerabilities
- [ ] All Arabic text displays correctly in RTL
- [ ] **Tests**: Full E2E suite passes, load test sustains 500 users

---

## Testing Strategy

### Unit Tests (Vitest)
- **Scope**: Individual functions, services, utilities, Zod schemas
- **Coverage target**: 80% on `packages/shared`, `packages/api/src/services`
- **Run**: `pnpm test` (all packages), `pnpm test --filter=api` (specific)

### Integration Tests (Vitest + testcontainers)
- **Scope**: tRPC procedures with real PostgreSQL + Redis (via Docker)
- **Coverage target**: Every router procedure has at least 1 happy-path + 1 auth-failure test
- **Setup**: `testcontainers` spins up PostGIS container per test suite

### E2E Tests (Playwright)
- **Scope**: Critical user flows end-to-end in browser
- **Coverage target**: 15-20 flows covering P0 + P1 features
- **Flows**: Login → create zone → dispatch rescue → register DP → assign shelter
- **Run**: Against Docker Compose stack

### Manual Testing
- **Device testing**: Android phones (low-end: Samsung A03, mid: A54)
- **Network testing**: Chrome DevTools throttling (2G, 3G, offline)
- **RTL testing**: Full Arabic locale navigation

---

## Definition of "Production-Ready" for Phase 2 Exit

1. All P0 + P1 modules functional with full test coverage
2. Zero critical bugs, <5 medium bugs
3. Arabic + English fully supported
4. PWA installable + works offline for critical flows
5. Security audit passed (no OWASP Top 10 vulnerabilities)
6. Load-tested for 500 concurrent users
7. Docker Compose deployment documented + tested
8. Seed data covers realistic Sudan disaster scenario
9. Admin can create/manage users, orgs, and all core entities
10. Audit log captures all critical operations
