# Deliverable A — Architecture Decision Record (ADR)

## SudanFlood: Sudan Flood Disaster Management System

**Date:** 2026-02-27
**Status:** Accepted — Phase 1
**Authors:** Principal Engineer / Solution Architect

---

## 1. ADR Decision Table

| #   | Decision Area           | Choice                                                        | Alternatives Considered                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ----------------------- | ------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 001 | Frontend Framework      | **Next.js 14+ (App Router)**                                  | Remix, Nuxt 3                          | SSR + SSG flexibility; React ecosystem maturity; app router enables streaming + parallel routes for dashboard-heavy UIs; massive talent pool; built-in image optimization for low-bandwidth contexts.                                                                                                                                                                                                                           |
| 002 | UI Component Library    | **shadcn/ui + Tailwind CSS 3.4+**                             | MUI, Ant Design, Chakra                | shadcn/ui is copy-paste (no heavy runtime); Tailwind produces minimal CSS; tree-shakeable; perfect for bandwidth-constrained environments; native RTL support via Tailwind `rtl:` variant for Arabic.                                                                                                                                                                                                                           |
| 003 | API Layer               | **tRPC v11**                                                  | REST (Express/Fastify), GraphQL        | End-to-end type safety from DB→API→client eliminates an entire class of bugs; auto-generated types mean no OpenAPI spec maintenance; subscriptions built-in for real-time; smaller payload than REST+Swagger overhead. For external/3rd-party integrations we expose a thin REST adapter via `trpc-openapi` where needed.                                                                                                       |
| 004 | Database                | **PostgreSQL 16 + PostGIS 3.4**                               | MySQL+spatial, MongoDB+GeoJSON         | PostGIS is the industry standard for geospatial; native support for polygons, points, spatial indexes (GIST); SRID 4326 first-class; JSONB for flexible metadata; row-level security for multi-org; battle-tested in humanitarian GIS (OCHA, HDX).                                                                                                                                                                              |
| 005 | ORM                     | **Drizzle ORM**                                               | Prisma, Kysely, raw SQL                | Drizzle produces SQL-like TypeScript (no query abstraction mismatch); first-class PostGIS support via `drizzle-postgis`; generates zero runtime overhead; migrations are plain SQL files (auditable); Prisma's query engine binary adds cold-start latency problematic for constrained environments.                                                                                                                            |
| 006 | Real-time               | **Socket.io v4**                                              | Native WebSocket, SSE, Ably/Pusher     | Socket.io provides: automatic fallback to long-polling (critical for unreliable Sudan networks); built-in rooms/namespaces (perfect for per-agency channels); auto-reconnection with exponential backoff; binary support for compact payloads; client works in React Native + PWA. Native WS lacks reconnection/fallback. SSE is unidirectional. Managed services (Ably/Pusher) create vendor lock-in + cost at scale.          |
| 007 | Maps                    | **Leaflet 1.9 + React-Leaflet**                               | Mapbox GL JS, OpenLayers, Google Maps  | Leaflet is fully open-source (no token/billing); works offline with downloaded tile packs (MBTiles via leaflet-offline); lighter JS bundle (42kb vs Mapbox's 210kb); sufficient for polygon/marker/heatmap needs; OpenStreetMap tiles are free; Mapbox requires API key + per-load billing unsuitable for government/NGO budgets.                                                                                               |
| 008 | Auth                    | **NextAuth.js v5 (Auth.js) + custom RBAC**                    | Clerk, Supabase Auth, Keycloak         | Self-hosted (no external dependency for auth in unreliable networks); supports credentials (username/password for field workers without OAuth providers); JWT sessions with short expiry; custom RBAC middleware maps cleanly to the 4-tier role system; Keycloak is too heavy for local dev.                                                                                                                                   |
| 009 | Storage                 | **MinIO (S3-compatible)**                                     | Local filesystem, Cloudflare R2        | S3 API compatibility means production can swap to AWS S3/Cloudflare R2 with zero code changes; MinIO runs locally in Docker; handles UAV imagery, attachments, exports; presigned URLs for direct upload reduce server load.                                                                                                                                                                                                    |
| 010 | Deployment              | **Docker + Docker Compose (dev), Docker Swarm or K8s (prod)** | Bare metal, serverless                 | Docker Compose gives identical dev environments; PostGIS + Redis + MinIO orchestrated together; production can scale to Swarm (simpler) or K8s; Dockerfiles produce reproducible builds.                                                                                                                                                                                                                                        |
| 011 | Mobile Strategy         | **PWA (Progressive Web App)**                                 | React Native, Flutter, Capacitor       | PWA rationale: (1) Sudan has diverse low-end Android devices — PWA works on any browser; (2) no app store approval delays during emergencies; (3) offline via service worker + IndexedDB; (4) single codebase shared with web app; (5) installable on home screen; (6) React Native requires separate build pipeline + native toolchain adding complexity. Citizens need instant access during floods, not app store downloads. |
| 012 | Redis                   | **Redis 7 — caching + BullMQ job queues + rate limiting**     | RabbitMQ, in-memory only               | Redis serves triple duty: (1) API response caching for weather/map tiles reducing external API calls; (2) BullMQ for background jobs (report generation, SMS dispatch, image processing); (3) `express-rate-limit` + Redis store for distributed rate limiting. Single dependency, battle-tested.                                                                                                                               |
| 013 | Logging & Observability | **Pino (structured JSON logs) + OpenTelemetry**               | Winston, Bunyan, Datadog               | Pino is the fastest Node.js logger (5x Winston); structured JSON enables log aggregation; OpenTelemetry provides vendor-neutral tracing (can ship to Jaeger locally, Grafana Cloud in prod); no vendor lock-in.                                                                                                                                                                                                                 |
| 014 | Audit Logging           | **Dedicated `audit_logs` table + DB triggers**                | Application-level only, event sourcing | DB triggers ensure audit entries even for direct SQL operations; immutable append-only table; captures: who, what, when, before/after values; critical for humanitarian accountability (donor reporting, chain of custody for relief supplies).                                                                                                                                                                                 |
| 015 | i18n                    | **next-intl + ICU MessageFormat**                             | react-i18next, next-translate          | next-intl integrates natively with App Router; ICU MessageFormat handles Arabic pluralization rules (which differ from English); supports RTL layout switching; message files are JSON (easy for translators); namespace-based loading reduces bundle size.                                                                                                                                                                     |
| 016 | Offline/Low-Bandwidth   | **Service Worker + IndexedDB (Dexie.js) + CRDT-based sync**   | PouchDB/CouchDB, custom delta sync     | Strategy: (1) Service worker caches app shell + critical API responses; (2) Dexie.js provides IndexedDB wrapper for local data; (3) Background Sync API for deferred uploads; (4) Conflict resolution via last-write-wins with vector clocks for non-critical data, manual merge for critical data (displaced person records); (5) Compression (gzip/brotli) on all responses; (6) Image lazy-loading + WebP format.            |
| 017 | Monorepo Tooling        | **Turborepo**                                                 | Nx, Lerna, pnpm workspaces only        | Turborepo: zero-config caching, parallel task execution, simple `turbo.json` config; lighter than Nx; pnpm workspaces for package management (strict hoisting = smaller node_modules).                                                                                                                                                                                                                                          |
| 018 | Validation              | **Zod (universal)**                                           | Yup, Joi, ArkType                      | Zod: TypeScript-first; `z.infer<>` eliminates type duplication; works on server + client; tRPC native integration; shared schemas in `packages/shared` used everywhere.                                                                                                                                                                                                                                                         |
| 019 | Testing                 | **Vitest + Playwright + Testing Library**                     | Jest, Cypress                          | Vitest: native ESM + TypeScript, same config as Vite, fastest TS test runner; Playwright: cross-browser E2E; Testing Library: component testing without implementation details.                                                                                                                                                                                                                                                 |
| 020 | CSS Direction (RTL)     | **Tailwind `rtl:` variant + `dir` attribute**                 | Separate RTL stylesheet                | Tailwind's logical properties (`ms-4` instead of `ml-4`) handle RTL natively; `rtl:` variant for edge cases; `dir="rtl"` on `<html>` tag toggled by locale; no duplicate CSS files.                                                                                                                                                                                                                                             |

---

## 2. Architecture Narrative

### System Overview

SudanFlood is a **multi-tenant, geospatially-aware emergency coordination platform** designed for the unique constraints of Sudanese infrastructure. The system coordinates 14+ agencies (NEMA, state emergency committees, UNHCR, WFP, ICRC, MSF, etc.) through a centralized but resilient architecture.

### Key Architectural Principles

1. **Offline-First Design**: Every user-facing feature assumes the network may drop. Critical workflows (displaced person registration, emergency call intake, field reports) work fully offline and sync when connectivity returns.

2. **Progressive Enhancement**: The system delivers a functional experience on 2G connections with a 256KB initial bundle target. Features enhance as bandwidth allows (map tiles, imagery, real-time updates).

3. **Multi-Organization Isolation**: Data is partitioned by organization using PostgreSQL Row-Level Security (RLS). Super admins (NEMA) see across organizations; agency admins see only their data; field workers see their assigned tasks.

4. **Geospatial-Native**: PostGIS is not an afterthought — it's central. Flood zones are polygons, shelters are points, rescue operations have route geometries. Spatial queries (`ST_Contains`, `ST_DWithin`, `ST_Intersects`) drive core business logic.

5. **Auditability**: Every mutation to critical entities is logged with before/after snapshots. This satisfies donor accountability requirements and enables situation reconstruction.

6. **Arabic-First, English-Supported**: UI defaults to Arabic (RTL); all labels, errors, notifications are translated. Database stores multilingual content in JSONB where needed (e.g., organization names).

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │
│  │  Web App  │  │   PWA    │  │  External Systems   │   │
│  │ (Next.js) │  │ (Mobile) │  │ (SMS GW, Weather)   │   │
│  └─────┬─────┘  └─────┬────┘  └──────────┬──────────┘   │
│        │               │                  │              │
└────────┼───────────────┼──────────────────┼──────────────┘
         │               │                  │
    ┌────▼───────────────▼──────────────────▼────┐
    │              API GATEWAY LAYER               │
    │  ┌──────────┐  ┌────────────┐  ┌─────────┐ │
    │  │  tRPC    │  │ REST Adapter│  │Socket.io│ │
    │  │  Router  │  │(trpc-openapi)│ │  Server │ │
    │  └────┬─────┘  └──────┬─────┘  └────┬────┘ │
    │       │               │              │      │
    │  ┌────▼───────────────▼──────────────▼────┐ │
    │  │         Middleware Pipeline              │ │
    │  │  Auth → RBAC → Rate Limit → Validate   │ │
    │  │  → Audit Log → i18n Error Messages     │ │
    │  └─────────────────┬───────────────────────┘ │
    └────────────────────┼─────────────────────────┘
                         │
    ┌────────────────────▼─────────────────────────┐
    │              SERVICE LAYER                     │
    │  ┌─────────┐ ┌──────────┐ ┌───────────────┐  │
    │  │ Flood   │ │ Rescue   │ │ Displaced     │  │
    │  │ Service │ │ Service  │ │ Person Service│  │
    │  ├─────────┤ ├──────────┤ ├───────────────┤  │
    │  │ Shelter │ │ Supply   │ │ Emergency     │  │
    │  │ Service │ │ Service  │ │ Call Service  │  │
    │  ├─────────┤ ├──────────┤ ├───────────────┤  │
    │  │ Weather │ │ UAV      │ │ Task          │  │
    │  │ Service │ │ Service  │ │ Service       │  │
    │  └────┬────┘ └────┬─────┘ └──────┬────────┘  │
    └───────┼───────────┼──────────────┼────────────┘
            │           │              │
    ┌───────▼───────────▼──────────────▼────────────┐
    │              DATA LAYER                        │
    │  ┌──────────────┐  ┌───────┐  ┌───────────┐  │
    │  │ PostgreSQL   │  │ Redis │  │   MinIO   │  │
    │  │ + PostGIS    │  │       │  │ (S3)      │  │
    │  │              │  │ Cache │  │           │  │
    │  │ Drizzle ORM  │  │ Queue │  │ Images    │  │
    │  │ RLS Policies │  │ Rate  │  │ UAV Data  │  │
    │  │ Audit Triggers│ │ Limit │  │ Exports   │  │
    │  └──────────────┘  └───────┘  └───────────┘  │
    └───────────────────────────────────────────────┘
```

### Security Architecture

- **Authentication**: NextAuth v5 with credentials provider (username + password); JWT access tokens (15min expiry) + refresh tokens (7d, rotating).
- **Authorization**: 4-tier RBAC enforced at tRPC middleware level:
  - `super_admin` — NEMA national coordinators; full system access
  - `agency_admin` — Organization-level managers; CRUD within their org
  - `field_worker` — Assigned tasks, data entry, limited reads
  - `citizen` — Report submission, shelter info, personal tracking only
- **Row-Level Security**: PostgreSQL RLS policies filter queries by `org_id` claim in JWT.
- **API Security**: Zod validation on all inputs; rate limiting (100 req/min general, 10 req/min auth); CORS restricted; CSRF tokens; security headers via Helmet.
- **Data Security**: PII (displaced persons) encrypted at rest; passwords bcrypt with cost factor 12; audit logs immutable (no UPDATE/DELETE permissions on audit table).

### Assumptions

1. The system will initially be deployed on-premise or on a VPS in Khartoum with cloud failover (no assumption of reliable cloud access).
2. Up to 14 organizations with ~500 total concurrent users in peak disaster response.
3. Field workers use Android devices (90%+ Sudan mobile market) with Chrome browser.
4. SMS integration will use a local Sudanese gateway (e.g., Sudani, Zain, MTN APIs) — abstracted behind an interface.
5. UAV imagery is uploaded as files (JPEG/TIFF), not streamed live.
6. Weather data comes from Sudan Meteorological Authority API or OpenWeatherMap as fallback.
7. The 18 Sudanese states and their localities are seeded as reference data.
8. Arabic translations will be provided by domain experts; system ships with English + machine-translated Arabic placeholders initially.
9. No HIPAA/GDPR compliance required, but data protection follows Sudan's emerging data governance framework.
10. Monetary values (relief supply costs) are in SDG (Sudanese Pound) with USD equivalent tracked.
