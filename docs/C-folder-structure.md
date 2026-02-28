# Deliverable C — Project Folder Structure (Monorepo)

## Monorepo Tooling: Turborepo + pnpm workspaces

```
sudanflood/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # GitHub Actions: lint + type-check + test on PR
│   │   ├── e2e.yml                   # E2E tests against Docker Compose
│   │   └── deploy-staging.yml        # Deploy to staging on merge to develop
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── apps/
│   ├── web/                          # Next.js 14+ App Router application
│   │   ├── public/
│   │   │   ├── locales/
│   │   │   │   ├── ar/              # Arabic translation JSON files
│   │   │   │   └── en/              # English translation JSON files
│   │   │   ├── icons/               # PWA icons (192x192, 512x512)
│   │   │   ├── manifest.json        # PWA manifest
│   │   │   └── sw.js                # Service worker (generated)
│   │   ├── src/
│   │   │   ├── app/                 # Next.js App Router pages
│   │   │   │   ├── [locale]/        # i18n dynamic segment
│   │   │   │   │   ├── layout.tsx   # Root layout with RTL/LTR, theme, auth
│   │   │   │   │   ├── page.tsx     # Dashboard home
│   │   │   │   │   ├── (auth)/      # Route group: login, register
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   └── register/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── layout.tsx
│   │   │   │   │   ├── flood-zones/
│   │   │   │   │   │   ├── page.tsx            # List + map view
│   │   │   │   │   │   ├── [id]/
│   │   │   │   │   │   │   └── page.tsx        # Detail + real-time
│   │   │   │   │   │   └── new/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── rescue/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   ├── shelters/
│   │   │   │   │   ├── displaced-persons/
│   │   │   │   │   ├── supplies/
│   │   │   │   │   ├── emergency-calls/
│   │   │   │   │   ├── tasks/
│   │   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── weather/
│   │   │   │   │   ├── uav-surveys/
│   │   │   │   │   ├── organizations/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── settings/
│   │   │   │   ├── api/
│   │   │   │   │   ├── trpc/[trpc]/
│   │   │   │   │   │   └── route.ts           # tRPC HTTP handler
│   │   │   │   │   ├── auth/[...nextauth]/
│   │   │   │   │   │   └── route.ts           # NextAuth handler
│   │   │   │   │   └── upload/
│   │   │   │   │       └── route.ts           # S3 presigned URL endpoint
│   │   │   │   └── middleware.ts              # Auth + i18n + rate limiting middleware
│   │   │   ├── components/
│   │   │   │   ├── ui/                        # shadcn/ui components (auto-generated)
│   │   │   │   ├── layout/
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── footer.tsx
│   │   │   │   │   └── breadcrumbs.tsx
│   │   │   │   ├── maps/
│   │   │   │   │   ├── map-container.tsx      # Leaflet wrapper
│   │   │   │   │   ├── flood-zone-layer.tsx
│   │   │   │   │   ├── shelter-markers.tsx
│   │   │   │   │   ├── rescue-routes.tsx
│   │   │   │   │   └── heatmap-layer.tsx
│   │   │   │   ├── forms/                     # Reusable form components
│   │   │   │   ├── tables/                    # Data tables with sorting/filtering
│   │   │   │   ├── charts/                    # Dashboard chart components
│   │   │   │   └── shared/                    # Common: loading, error, empty states
│   │   │   ├── hooks/
│   │   │   │   ├── use-trpc.ts               # tRPC React hooks setup
│   │   │   │   ├── use-socket.ts             # Socket.io connection hook
│   │   │   │   ├── use-offline.ts            # Offline detection + sync
│   │   │   │   ├── use-geolocation.ts        # GPS position
│   │   │   │   └── use-locale.ts             # i18n locale switching
│   │   │   ├── lib/
│   │   │   │   ├── trpc-client.ts            # tRPC client configuration
│   │   │   │   ├── auth.ts                   # NextAuth configuration
│   │   │   │   ├── socket.ts                 # Socket.io client singleton
│   │   │   │   ├── offline-store.ts          # Dexie.js IndexedDB setup
│   │   │   │   ├── map-utils.ts              # Leaflet utility functions
│   │   │   │   └── utils.ts                  # General utilities (cn, formatDate, etc.)
│   │   │   ├── providers/
│   │   │   │   ├── trpc-provider.tsx          # tRPC + React Query provider
│   │   │   │   ├── auth-provider.tsx          # Session provider
│   │   │   │   ├── theme-provider.tsx         # Dark/light mode
│   │   │   │   ├── socket-provider.tsx        # Socket.io context
│   │   │   │   └── i18n-provider.tsx          # next-intl provider
│   │   │   ├── styles/
│   │   │   │   └── globals.css               # Tailwind base + custom Arabic fonts
│   │   │   └── types/
│   │   │       └── next-auth.d.ts            # NextAuth type augmentation
│   │   ├── next.config.ts                    # Next.js config (i18n, images, webpack)
│   │   ├── tailwind.config.ts                # Tailwind with RTL + shadcn theme
│   │   ├── tsconfig.json                     # TypeScript strict mode
│   │   ├── postcss.config.js
│   │   ├── components.json                   # shadcn/ui configuration
│   │   └── package.json
│   │
│   └── mobile/                               # PWA-specific overrides (if needed)
│       ├── src/
│       │   ├── sw/
│       │   │   ├── service-worker.ts         # Service worker: cache strategies
│       │   │   ├── sync-manager.ts           # Background sync for offline ops
│       │   │   └── cache-config.ts           # Which routes/assets to cache
│       │   └── pwa/
│       │       ├── install-prompt.tsx         # "Add to home screen" prompt
│       │       └── offline-indicator.tsx      # Network status banner
│       └── package.json
│
├── packages/
│   ├── db/                                   # Database package
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql        # ← Deliverable B output
│   │   ├── seeds/
│   │   │   ├── 001_sudan_states.ts           # 18 states with boundaries
│   │   │   ├── 002_localities.ts             # Localities per state
│   │   │   ├── 003_organizations.ts          # 14+ orgs (NEMA, UNHCR, WFP, etc.)
│   │   │   ├── 004_demo_users.ts             # Test users per role
│   │   │   ├── 005_demo_flood_data.ts        # Sample flood zones for Khartoum
│   │   │   └── index.ts                      # Seed runner
│   │   ├── src/
│   │   │   ├── schema/                       # Drizzle schema definitions
│   │   │   │   ├── enums.ts                  # All enum definitions
│   │   │   │   ├── locations.ts              # states, localities
│   │   │   │   ├── organizations.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── flood-zones.ts
│   │   │   │   ├── rescue-operations.ts
│   │   │   │   ├── shelters.ts
│   │   │   │   ├── displaced-persons.ts
│   │   │   │   ├── relief-supplies.ts
│   │   │   │   ├── infrastructure.ts
│   │   │   │   ├── uav-surveys.ts
│   │   │   │   ├── emergency-calls.ts
│   │   │   │   ├── weather.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── citizen-reports.ts
│   │   │   │   ├── audit-logs.ts
│   │   │   │   ├── attachments.ts
│   │   │   │   ├── comments.ts
│   │   │   │   └── index.ts                  # Re-exports all schemas
│   │   │   ├── client.ts                     # Drizzle client + connection pool
│   │   │   ├── migrate.ts                    # Migration runner script
│   │   │   └── index.ts                      # Package entry point
│   │   ├── drizzle.config.ts                 # Drizzle Kit configuration
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                                  # tRPC API layer
│   │   ├── src/
│   │   │   ├── routers/                      # tRPC routers (one per module)
│   │   │   │   ├── auth.router.ts
│   │   │   │   ├── organization.router.ts
│   │   │   │   ├── flood-zone.router.ts
│   │   │   │   ├── rescue.router.ts
│   │   │   │   ├── shelter.router.ts
│   │   │   │   ├── displaced-person.router.ts
│   │   │   │   ├── supply.router.ts
│   │   │   │   ├── infrastructure.router.ts
│   │   │   │   ├── uav-survey.router.ts
│   │   │   │   ├── emergency-call.router.ts
│   │   │   │   ├── weather.router.ts
│   │   │   │   ├── task.router.ts
│   │   │   │   ├── notification.router.ts
│   │   │   │   ├── citizen-report.router.ts
│   │   │   │   ├── report.router.ts          # Situation reports, analytics
│   │   │   │   ├── upload.router.ts          # File upload presigned URLs
│   │   │   │   └── index.ts                  # Root router merging all sub-routers
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts         # JWT verification + user loading
│   │   │   │   ├── rbac.middleware.ts         # Role-based access control
│   │   │   │   ├── rate-limit.middleware.ts   # Redis-backed rate limiting
│   │   │   │   ├── audit.middleware.ts        # Automatic audit log writing
│   │   │   │   └── i18n.middleware.ts         # Locale detection for error messages
│   │   │   ├── services/                     # Business logic layer
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── flood-zone.service.ts
│   │   │   │   ├── rescue.service.ts
│   │   │   │   ├── shelter.service.ts
│   │   │   │   ├── displaced-person.service.ts
│   │   │   │   ├── supply.service.ts
│   │   │   │   ├── emergency-call.service.ts
│   │   │   │   ├── task.service.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── weather.service.ts
│   │   │   │   └── report.service.ts
│   │   │   ├── socket/
│   │   │   │   ├── server.ts                 # Socket.io server setup
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── flood-zone.handler.ts # Real-time flood updates
│   │   │   │   │   ├── rescue.handler.ts     # Rescue status changes
│   │   │   │   │   ├── notification.handler.ts
│   │   │   │   │   └── location.handler.ts   # Field worker GPS tracking
│   │   │   │   └── rooms.ts                  # Room naming conventions
│   │   │   ├── jobs/                         # BullMQ background jobs
│   │   │   │   ├── queue.ts                  # Queue definitions
│   │   │   │   ├── workers/
│   │   │   │   │   ├── report-generator.ts   # CSV/PDF generation
│   │   │   │   │   ├── sms-sender.ts         # SMS dispatch
│   │   │   │   │   ├── image-processor.ts    # UAV image thumbnails
│   │   │   │   │   └── weather-fetcher.ts    # Periodic weather data pull
│   │   │   │   └── schedules.ts              # Cron-like job schedules
│   │   │   ├── trpc.ts                       # tRPC initialization + context
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                               # Shared types, schemas, utilities
│       ├── src/
│       │   ├── schemas/                      # Zod schemas (used by API + client)
│       │   │   ├── auth.schema.ts
│       │   │   ├── organization.schema.ts
│       │   │   ├── flood-zone.schema.ts
│       │   │   ├── rescue.schema.ts
│       │   │   ├── shelter.schema.ts
│       │   │   ├── displaced-person.schema.ts
│       │   │   ├── supply.schema.ts
│       │   │   ├── infrastructure.schema.ts
│       │   │   ├── uav-survey.schema.ts
│       │   │   ├── emergency-call.schema.ts
│       │   │   ├── weather.schema.ts
│       │   │   ├── task.schema.ts
│       │   │   ├── citizen-report.schema.ts
│       │   │   ├── common.schema.ts          # Pagination, sorting, UUID, phone
│       │   │   └── index.ts
│       │   ├── types/                        # Inferred TypeScript types from Zod
│       │   │   └── index.ts                  # z.infer<> re-exports
│       │   ├── constants/
│       │   │   ├── roles.ts                  # Role definitions + permissions matrix
│       │   │   ├── sudan.ts                  # State codes, emergency numbers, etc.
│       │   │   ├── enums.ts                  # Enum values matching DB
│       │   │   └── config.ts                 # Shared config constants
│       │   ├── utils/
│       │   │   ├── phone.ts                  # +249 phone validation/formatting
│       │   │   ├── date.ts                   # Date formatting (Hijri optional)
│       │   │   ├── geo.ts                    # GeoJSON helpers
│       │   │   └── id.ts                     # Code generators (FZ-KRT-2026-001)
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── docker/
│   ├── docker-compose.yml                    # ← Deliverable G
│   ├── docker-compose.prod.yml               # Production overrides
│   ├── postgres/
│   │   └── init.sql                          # PostGIS extension + initial setup
│   ├── redis/
│   │   └── redis.conf                        # Custom Redis config (maxmemory, etc.)
│   └── nginx/
│       └── nginx.conf                        # Reverse proxy config (production)
│
├── scripts/
│   ├── setup.sh                              # One-command dev setup script
│   ├── seed.ts                               # Database seeding runner
│   ├── generate-codes.ts                     # Generate state/locality codes
│   └── health-check.sh                       # Service health verification
│
├── .env.example                              # Environment variable template
├── .env.local                                # Local overrides (gitignored)
├── .eslintrc.cjs                             # ESLint config (TypeScript strict)
├── .prettierrc                               # Prettier config
├── .gitignore
├── turbo.json                                # Turborepo pipeline configuration
├── pnpm-workspace.yaml                       # pnpm workspace packages list
├── tsconfig.base.json                        # Shared TypeScript base config
├── package.json                              # Root package.json (scripts, devDeps)
└── README.md                                 # Project overview + quick start
```

## Key File Purposes

| File                                     | Purpose                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `turbo.json`                             | Defines build/lint/test pipelines with caching; `build` depends on `^build`; `lint` and `type-check` run in parallel      |
| `pnpm-workspace.yaml`                    | Declares `apps/*` and `packages/*` as workspace packages                                                                  |
| `tsconfig.base.json`                     | Shared strict TS config: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`             |
| `.env.example`                           | All env vars with placeholder values: `DATABASE_URL`, `REDIS_URL`, `MINIO_*`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_SOCKET_URL` |
| `docker/postgres/init.sql`               | Runs on first container start: creates DB, enables PostGIS + uuid-ossp extensions                                         |
| `scripts/setup.sh`                       | Runs: `pnpm install` → `docker compose up -d` → wait for healthy → `pnpm db:migrate` → `pnpm db:seed`                     |
| `packages/shared/src/constants/roles.ts` | Permissions matrix mapping each role to allowed actions per module                                                        |
