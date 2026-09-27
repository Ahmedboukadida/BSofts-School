# Project Conversation History & Architectural Directives

This document maintains a continuous, cumulative record of all conversations, user requirements, design choices, and technical constraints established for BSofts-School.

## 1. Immutable Directives & Core Rules

1. **Database Data Preservation**:
   - **CRITICAL**: Never execute `npx prisma db push --accept-data-loss` or force reset.
   - All migrations must be non-destructive (`npx prisma migrate deploy` or safe `prisma db push` without loss flags).
   - Soft-delete pattern (`isDeleted`, `deletedAt`, `deletedBy`) applied uniformly across all 45 domain models.

2. **Communication & Response Protocol**:
   - Mandatory 4-section response format:
     - `- Done:`
     - `- undone:`
     - `- What user should do:`
     - `- Questions:`
   - Numbered items (`01-`, `02-`), sub-bullets with `-`, empty line breaks between headers and items.
   - English language exclusively.
   - Never execute `git push` directly; always provide git commands for the user to execute.

3. **Brand Identity & Visual Design System**:
   - Strict 5-solid-color palette with **zero gradients**:
     - Navy Primary: `#242F40`
     - Charcoal Dark: `#363636`
     - Warm Ochre Accent: `#CCA43B`
     - Platinum Surface: `#E5E5E5`
     - Pure White: `#FFFFFF`

4. **Repository Asset Persistence (`.gemini/`)**:
   - The `.gemini` folder in the project root (`E:\ReFactory\BSofts-School\.gemini`) must always be maintained, updated, and upgraded.
   - Contains all domains, agents, skills, conversation logs, and master markdown files.

---

## 2. Chronological Milestones & Architectural Decisions

### Milestone 1: Multi-Tenancy & Data Isolation
- Enforced row-level data isolation via `TenantMiddleware` and `GlobalSecurityGuard`.
- Client requests inject `x-tenant-id` and `x-establishment-id` headers.
- Actor tracking with `createdBy`, `updatedBy`, `deletedBy` on all mutations.

### Milestone 2: Server-Side Pagination & Performance
- Standardized `PaginationQueryDto` and `PaginatedDto` in `common/dto/`.
- Pre-computed database aggregations for `GET /dashboard/stats` and `GET /reports/stats` backed by Redis caching.
- Date-range query boundary enforcement on weekly schedule sessions (`startDate`, `endDate`).

### Milestone 3: Real-Time Meetings & WebRTC
- Integrated LiveKit Cloud / Server SDK for virtual classrooms and administrative meetings.
- Deliberative agenda voting (`MeetingPoint`, `MeetingVote`) with instant quorum tallying.
- Participant speaker queue (`MeetingTurn`) for hand-raising and moderation.

### Milestone 4: Decoupled Dual Payment Gateways
- **Level 1 (SaaS Platform)**: `PlatformPaymentConfig` for subscription plans and tenant renewals via Stripe and ClicToPay.
- **Level 2 (School Establishment)**: `PaymentConfig` for student tuition fees and registration via ClicToPay (Tunisian Dinars in millimes) and Stripe (International cards).
- Physical caisse management (`/payments/caisse`) with daily cash reconciliation.

### Milestone 5: Observability & Health Probes
- Zero raw console policy: all services inject `AppLogger` for structured JSON output.
- Comprehensive health endpoints: `/health` (liveness), `/health/ready` (DB & Redis readiness), `/health/live`.
- In-database audit ledger (`audit_logs`) and system error triage (`system_logs`) with resolution persistence.

### Milestone 6: Multi-Stage Containerization & CI/CD
- Production multi-stage Dockerfiles (`backend/Dockerfile`, `frontend/Dockerfile`).
- Production Docker Compose orchestration (`docker-compose.yml`) linking Postgres 16, Redis 7, Backend, and Frontend.
- GitHub Actions workflow (`.github/workflows/ci.yml`) covering Prisma validation, Vitest unit tests (97 tests), TypeScript verification, and Next.js Turbopack build.
- Vercel standalone output conditional handling to prevent `ENOENT` build failure.

### Milestone 7: Wave 3 Systemic Quality Hardening
- Complete elimination of silent `.catch(() => {})` blocks across frontend views.
- Dynamic form defaults resolving from active stores (`useEstablishmentStore`, `useAuthStore`).
- Data-driven select options powered by `useDynamicEnums` hook and `/dynamic-enums` backend catalog.
