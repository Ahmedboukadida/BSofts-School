# BSofts-School — Master Task Tracker

## Phase 1: Schema Integrity — Soft-Delete & Audit Fields
- `[x]` Add `isDeleted`, `deletedAt`, `deletedBy`, `createdBy`, `updatedBy` to ALL domain models in `schema.prisma`
- `[x]` Run `npx prisma validate` to confirm schema is valid
- `[x]` Run `npm run build` to confirm backend compiles
- `[x]` Run `npm run db:push:neon` to sync schema to Neon
- `[x]` Commit changes locally (`e38c581`)

## Phase 2: Prisma Soft-Delete & Audit Capabilities
- `[x]` Establish audit and soft-delete fields across domain entities
- `[x]` Validate actor tracking and deactivation endpoints
- `[x]` Run `npm run build` to confirm backend compiles
- `[x]` Commit changes locally

## Phase 3: Server-Side Pagination Engine
- `[x]` Standardize `PaginationQueryDto` and `PaginatedDto` in `common/dto/`
- `[x]` Verify service `findAll()` methods return paginated response (`total`, `page`, `limit`)
- `[x]` Validate client and server pagination boundaries

## Phase 4: DynamicEnum Resolution & System Module
- `[x]` Create standalone `dynamic-enums` NestJS module (`controller`, `service`, `dto`, `module`)
- `[x]` Register in `AppModule` and expose Swagger documentation
- `[x]` Support category lookups (`/dynamic-enums/category/:category`) for UI dropdowns
- `[x]` Run `npm run build` for both backend and frontend
- `[x]` Commit changes locally (`511aac3`)

## Phase 5: Dynamic SMTP & LiveKit Cloud WebRTC
- `[x]` Dynamic `SmtpConfig` model and dynamic mail dispatch via `MailService`
- `[x]` Root dynamic SMTP configuration UI with live test trigger in `/admin/settings`
- `[x]` LiveKit Cloud WebRTC configuration and dynamic token signing
- `[x]` Real-time Meetings module with deliberative agenda voting and hand-raising
- `[x]` Run `npm run build` for both backend and frontend

## Phase 6: Dual-Gateway Separation (ClicToPay & Stripe)
- `[x]` Disentangle ClicToPay and Stripe gateways across database schema:
  - Level 1: `PlatformPaymentConfig` for SaaS platform subscriptions and renewals
  - Level 2: `PaymentConfig` for tenant school tuition fees
- `[x]` Update backend services (`BillingService`, `EstablishmentsService`, `StudentPaymentsService`)
- `[x]` Separate frontend settings tabs in `/admin/settings` and `/settings`
- `[x]` Commit changes locally (`6964414`)

## Phase 7: UI Component Modularization (DataTable)
- `[x]` Refactor 1,390-line monolith `data-table.tsx` into clean modular subcomponents in `@/components/ui/data-table/`:
  - `data-table-types.ts`
  - `data-table-toolbar.tsx`
  - `data-table-row-actions.tsx`
  - `data-table-pagination.tsx`
  - `data-table-modals.tsx`
  - `index.ts` barrel export
- `[x]` Verify 100% backward compatibility across all 21 consuming views
- `[x]` Commit changes locally (`2e40c05`)

## Phase 8: Observability, Structured Logging & Health Probes
- `[x]` Injected NestJS `Logger` across all backend services, eliminating raw `console.*` calls
- `[x]` Added cache health check method in `CacheService`
- `[x]` Implemented `/health`, `/health/db` (SQL ping), `/health/redis` (latency & fallback check), `/health/liveness`, `/health/readiness`
- `[x]` Unit tests for all health endpoints in `app.controller.spec.ts`
- `[x]` Commit changes locally (`0a5cb24`)

## Phase 9: Containerization & CI/CD Pipeline
- `[x]` Multi-stage production `backend/Dockerfile` with OpenSSL and healthcheck
- `[x]` Multi-stage production `frontend/Dockerfile` with standalone runner
- `[x]` Production `docker-compose.yml` (PostgreSQL 16, Redis 7, Backend, Frontend)
- `[x]` GitHub Actions workflow `.github/workflows/ci.yml` (Backend CI, Frontend CI, Docker verification)
- `[x]` Commit changes locally (`23fbf12`, `f4a4bd7`)

## Phase 10: Core Bug Remediation & Security Hardening
- `[x]` User Profile Update API: Implemented `UpdateProfileDto` and `PUT /auth/profile` in backend with unit tests (Issue C5)
- `[x]` Subscription Approver Security: Resolved approver identity strictly from `@CurrentUser()` in JWT (Issue M1)
- `[x]` System Logs Resolution Persistence: Added `resolved`, `resolvedAt`, `resolvedBy` to `SystemLog`, pushed to DB safely without data loss, created `PATCH /system-logs/:id/resolve`, and wired frontend (Issue M2)
- `[x]` Schedule Date Scoping: Added `startDate` and `endDate` parameters to `GET /sessions` call in `/schedule` (Issue M4)
- `[x]` Pre-Computed Stats Endpoints: Created `DashboardController` (`GET /dashboard/stats`) and enhanced `GET /reports/stats`, wired frontend `/dashboard` and `/reports` (Issues M3, C6, S5)
- `[x]` Commit changes locally (`ce840f3`)

## Phase 11: Vercel Standalone Deployment Fix
- `[x]` Conditioned `output: 'standalone'` in `frontend/next.config.ts` on `BUILD_STANDALONE === 'true' && !VERCEL` to prevent ENOENT crash on Vercel CLI
- `[x]` Added `ENV BUILD_STANDALONE=true` to `frontend/Dockerfile` builder stage
- `[x]` Tested Next.js production build with 41 static routes compiled
- `[x]` Commit changes locally (`3d0396e`)

## Phase 12: Wave 3 Systemic Quality Improvements
- `[x]` Replace `.catch(() => {})` silent error swallows with toast error notifications (Issue S3)
- `[x]` Replace hardcoded form defaults in creation modals with dynamic fetches (Issue S2)
- `[x]` Create `useDynamicEnums` hook and wire select dropdowns to `/dynamic-enums` with robust fallback (Issue S4)
- `[ ]` Real-time WebSocket event listeners hardening for notifications and messaging (Issue S6)

## Phase 13: Architecture Domains, Autonomous Agents & Skills Formalization
- `[x]` Establish 5 Core Domain Architecture Specifications in `docs/domains/`:
  - `saas-platform-domain.md`
  - `academic-institution-domain.md`
  - `pedagogy-community-domain.md`
  - `finance-billing-domain.md`
  - `security-observability-domain.md`
- `[x]` Create 3 New Specialized Engineering Agents:
  - `realtime-webrtc-specialist`
  - `dual-gateway-payments-engineer`
  - `systemic-quality-assurance`
- `[x]` Create 4 New Architectural Skills:
  - `livekit-webrtc-meetings`
  - `dynamic-enums-catalog`
  - `zero-silent-catch-error-resilience`
  - `multi-tenant-data-isolation`
- `[x]` Establish `docs/agents/README.md` and `docs/skills/README.md` catalogs in codebase

## Phase 14: Context Hierarchy & Universal Data Rendering
- `[x]` Implement strict Root vs Non-Root cascading top navbar hierarchy (`header.tsx`)
- `[x]` Conditional `'ALL'` visibility: present ONLY when count > 1 across Tenant, Establishment, and Academic Year
- `[x]` Universal data rendering fix across all dashboard views (`res.data?.data ?? res.data`)
- `[x]` Elimination of placeholder year UUIDs and inclusion of `tenantId` in JWT profile
- `[x]` Local user preference persistence (`bsofts_pref_${user.id}`)

## Phase 15: CI/CD & Production Containerization Hardening
- `[x]` Fix TS2322 nullability error in `AuthResponseDto` (`tenantId?: string | null`)
- `[x]` Move `typescript` to `devDependencies` (`^6.0.3`) and sync `backend/package-lock.json`
- `[x]` Decouple `nest build` from `postinstall` script in `backend/package.json` to preserve Docker cache layers
- `[x]` Add resilient `npm ci || npm install --no-audit` fallback in backend and frontend Dockerfiles
- `[x]` 100% backend test pass (14/14 suites, 97 tests) and 100% frontend static generation (41/41 routes)

## Phase 16: Immediate Feature Execution Roadmap (Undone)
- `[ ]` **Milestone 1 — LiveKit WebRTC Interactive Classroom**:
  - Implement full-screen video room UI with responsive tile grid, media controls, screen share, and participant list
  - Connect room creation and join flow to backend token generator with role-based permissions (host teacher vs participant student)
- `[ ]` **Milestone 2 — Dual-Gateway Payments (ClicToPay & Stripe)**:
  - Wire Tunisian domestic card processing via ClicToPay webhook verification and checkout redirect
  - Wire international card processing via Stripe Elements and webhook verification
  - Connect student tuition fees and SaaS plan renewals to payment modals
- `[ ]` **Milestone 3 — Academic Year Promotions & PDF Report Cards**:
  - Implement bulk student class promotion between academic years with grade-level advancement rules
  - Generate PDF school term report cards/bulletins with grades, attendance stats, and school header stamps
- `[ ]` **Milestone 4 — Real-Time WebSocket Push Notifications**:
  - Implement Socket.IO client connection for real-time absence alerts, homework deadlines, and administrative announcements



