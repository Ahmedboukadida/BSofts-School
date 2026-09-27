# BSofts-School — Remediation & Hardening Plan v4.1

> **Plan version:** 4.1 (supersedes v4.0 after re-audit delta v2)
> **Audit date:** 25 September 2026
> **Current score:** 912 / 1000 (Phase 2 Gate 2 Passed)
> **Target score:** 870+ / 1000 (Target Exceeded)
> **Total tasks:** 78 (49 completed, 29 remaining)
> **Active agent roster:** 43 existing + 8 proposed-to-create

---

## Plan Overview

This plan is the **v4.1 refresh** of the Master Plan v3.0 active execution, incorporating the v2 audit delta. It tracks every bug (B1–B52) and gap, marking which have been **completed** since v1 and which are **remaining**.

- **33 tasks COMPLETED** since v1 audit
- **45 tasks REMAINING** across 4 phases

A **Master Judger** gate runs between each phase. No phase N+1 starts until phase N passes the gate.

---

## Delta vs v4.0

Since v4.0 was published, the following changes were made:

| Bug | Status | Notes |
|---|---|---|
| B1 (SubscriptionMiddleware throw) | ✅ Completed | `subscription.middleware.ts:76-89` now uses `res.status(403).json()` |
| B2 (Reports tenant scoping) | ✅ Completed | All 8 report types now scope by `establishmentId` |
| B4 (Conversations permissions) | ✅ Completed | Now has `RolesGuard` + `@Roles()` |
| B5 (Student-payments scoping) | ✅ Completed | Filters by `establishmentId` |
| B6 (Student-attendance scoping) | ✅ Completed | Filters by `establishmentId` |
| B7 (bulkMark attendance scoping) | ✅ Completed | Scopes `academicPeriod` to establishment |
| B10 (Upload SVG) | ✅ Completed | Removed from allowlist |
| B14 (Student default password) | ⚠ Partial | Random password now, but no forced change |
| B23 (Dashboard mocks) | ✅ Completed | `/reports/stats` endpoint + clean empty state |
| B24 (api.ts cache) | ✅ Completed | Bounded to 50 with overflow clear |
| B25 (Username collision) | ✅ Completed | Timestamp suffix on `uniqueUsername` |
| **NEW: Phase 1.2 JWT_SECRET Fallback** | ✅ Completed | Throws fatal error on production boot if missing |
| **NEW: Phase 1.3 JWT_REFRESH_SECRET** | ✅ Completed | Dedicated refresh token secret in `auth.service.ts` |
| **NEW: Phase 1.4 JWT establishmentId** | ✅ Completed | Injected into JWT claims on login/refresh |
| **NEW: Phase 1.5 Seed Credentials** | ✅ Completed | Parameterized via `SEED_ROOT_EMAIL` & `SEED_ROOT_PASSWORD` |
| **NEW: Phase 1.7 CORS Wildcard** | ✅ Completed | Eliminated `.vercel.app` wildcard; exact origin whitelist |
| **NEW: Phase 1.8 Meetings RBAC** | ✅ Completed | RolesGuard + `@Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')` |
| **NEW: Neon Seed Connection Pooler** | ✅ Completed | Direct unpooled URL + batched `rolePermission.createMany` |
| **NEW: Seed User Schema Validation** | ✅ Completed | Removed invalid `tenantId` from `prisma.user.create` calls |
| **NEW: Dynamic SMTP & Fail-Fast** | ✅ Completed | Fast validation, port 465 SSL preference, platform sync |
| **NEW: LiveKit Dynamic Cloud Config** | ✅ Completed | Database-driven config via `PlatformSetting` + Root view |
| **NEW: Meetings module** | 🆕 Added | Full LiveKit WebRTC integration with tenant scoping |
| **NEW: `/api/reports/stats`** | 🆕 Added | Backend method `getDashboardStats()` |
| **NEW: Student username fix** | ✅ Completed | `uniqueUsername` at `students.service.ts:258` |

See `.gemini/AUDIT_DELTA_v2.md` for the full diff.

---

## Proposed New Agents (8)

These agents do **not** currently exist in your roster. Rules, goals, and skills below are copy-paste-ready for `.gemini/AGENTS.md` and `.gemini/subagents/SUBAGENTS.md`.

### 🆕 `devops-platform-engineer`

| Field | Value |
|---|---|
| **Role** | Owns Docker, Render, CI/CD, GitHub Actions, healthchecks, observability stack |
| **Primary Goal** | Make the project production-deployable on Render + Docker-compatible (no ephemeral file loss); wire Sentry for errors; Pino for logs; `/health` endpoints; GitHub Actions CI |
| **Codified Skills** | `docker-expert`, `devops-deploy`, `ci-cd-and-automation`, `github`, `vercel-deployment`, `prometheus-configuration`, `grafana-dashboards`, `secrets-management`, `distributed-tracing`, `cicd-automation-workflow-automate`, `deployment-engineer`, `vps-server-management`, `gitlab-ci-patterns` |
| **Operational Mandate** | (1) Dockerfile + docker-compose (backend + frontend + Postgres + Redis + MinIO); (2) GitHub Actions: lint + test + build on PR; (3) `/health/db` + `/health/redis` + `/ready` endpoints; (4) Sentry + Pino structured logging; (5) Wire Prometheus metrics endpoint; (6) Remove `postinstall: prisma generate && nest build` from package.json — only `prisma generate` in postinstall; full build in build stage. |
| **Acceptance** | Docker Compose up brings entire stack to green health; CI green on first run; `/health` returns 200 with DB+Redis status; Sentry receives a test event; Render deploy log shows no `postinstall` build step. |

### 🆕 `frontend-test-engineer`

| Field | Value |
|---|---|
| **Role** | Owns frontend test infrastructure (Vitest + React Testing Library + Playwright) |
| **Primary Goal** | Bring frontend coverage from 0% to ≥60% on critical paths (auth, dashboard, payment, attendance, student CRUD) |
| **Codified Skills** | `jest-skill` (adapt for Vitest), `vitest-skill`, `cypress-skill`, `playwright-skill`, `e2e-testing-patterns`, `tdd-workflow`, `react-best-practices`, `react-component-performance`, `unit-testing-test-generate` |
| **Operational Mandate** | (1) Wire Vitest + RTL into Next.js 16; (2) Component tests for `data-table.tsx`, `form-modal.tsx`, `confirm-dialog.tsx`, all form components; (3) Hook tests for `useAuthStore`, `usePermissionsStore`, `useEstablishmentStore`; (4) Playwright E2E for: login → dashboard, student create flow, attendance mark, payment record, role-switch tenant isolation test; (5) Coverage report in CI; (6) Mock `api` axios instance. |
| **Acceptance** | `npm run test:cov` exits 0; coverage ≥60% on `components/ui/`, `store/`, `lib/`; Playwright suite of 5+ flows passes; report uploaded to CI artifact. |

### 🆕 `accessibility-a11y-engineer`

| Field | Value |
|---|---|
| **Role** | Owns WCAG 2.1 AA compliance, keyboard nav, screen reader support |
| **Primary Goal** | Make the platform usable by keyboard-only, screen-reader, and high-contrast users |
| **Codified Skills** | `frontend-ui-engineering`, `react-best-practices`, `baseline-ui`, `web-security-testing`, `senior-frontend` |
| **Operational Mandate** | (1) Run axe-core in CI on every page; (2) Add `aria-label`/`role`/`tabindex` to all interactive cards-as-buttons, modals, dropdowns; (3) Keyboard navigation for sidebar, header, modals, data-table (arrow keys, Enter, Esc); (4) Focus trap in modals; (5) Visible focus rings (no `outline: none` without alternative); (6) Color contrast audit on the 5-color palette. |
| **Acceptance** | axe-core CI passes with 0 serious/critical violations; manual keyboard walkthrough of every page passes; NVDA/VoiceOver smoke test on login + dashboard + student list passes. |

### 🆕 `perf-budget-guardian`

| Field | Value |
|---|---|
| **Role** | Owns bundle size, Core Web Vitals, lazy-loading, code-splitting |
| **Primary Goal** | Ship a frontend bundle that scores ≥90 on Lighthouse Performance on every dashboard page |
| **Codified Skills** | `pagespeed-enhancer`, `web-performance-optimization`, `performance-engineer`, `performance-profiling`, `performance-optimization`, `react-component-performance`, `nextjs-best-practices`, `frontend-architecture` |
| **Operational Mandate** | (1) Split `data-table.tsx` (1290 LOC) into per-feature subcomponents; (2) `next/dynamic` lazy load `hero-3d-scene`, `auth-3d-scene`, `command-palette`; (3) Replace `framer-motion` for non-essential animations with CSS; (4) Code-split per dashboard route; (5) `@next/bundle-analyzer` in CI; (6) Cap main chunk at 250KB gzip. |
| **Acceptance** | Main bundle ≤250KB gzip; LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 on all `(dashboard)/*` pages; bundle-analyzer report committed on each PR. |

### 🆕 `production-hardening-sre`

| Field | Value |
|---|---|
| **Role** | Owns production reliability, secrets management, rate limiting, security headers |
| **Primary Goal** | Eliminate security vulnerabilities (remaining: JWT_SECRET fallback, refresh secret separation, public register, CORS wildcard) and bring platform to GDPR/OWASP baseline |
| **Codified Skills** | `jwt-auth-hardening`, `rate-limit-helmet`, `api-security-best-practices`, `secrets-management`, `broken-authentication`, `container-security-hardening`, `gdpr-data-handling`, `top-web-vulnerabilities`, `smtp-penetration-testing`, `sql-injection-testing`, `idor-testing`, `xss-html-injection`, `credentials`, `gha-security-review`, `pci-compliance`, `security-auditor`, `security-and-hardening` |
| **Operational Mandate** | (1) Fix JWT_SECRET fallback at `app.module.ts:137`; (2) Add `JWT_REFRESH_SECRET` separate from access secret; (3) Encrypt `SmtpConfig.password`, `stripeSecret`, `paypalSecret` at rest; (4) Move uploads to S3-compatible storage (Cloudflare R2 or MinIO); (5) Add magic-byte sniffing on upload; (6) Implement `@nestjs/throttler` rate limiting; (7) Add CSRF, SameSite cookies, `helmet`; (8) Lock CORS to exact origins (kill `.vercel.app` wildcard); (9) Make `/auth/register` admin/invite-only; (10) Random temp passwords + force first-login reset (complete B14). |
| **Acceptance** | OWASP ZAP baseline scan = 0 high; secrets never appear in code; throttler blocks 100 rapid logins; CORS rejects `evil.vercel.app`; no hardcoded JWT fallback. |

### 🆕 `tenant-isolation-pentester`

| Field | Value |
|---|---|
| **Role** | Owns cross-tenant data-leak detection and proof |
| **Primary Goal** | Prove no API endpoint leaks data across tenants/establishments; embed establishmentId in JWT |
| **Codified Skills** | `tenant-isolation-verifier`, `tenant-switcher-governance`, `saas-multi-tenant`, `web-security-testing`, `idor-testing`, `broken-authentication` |
| **Operational Mandate** | (1) Embed `establishmentId` claim in JWT; (2) Build `EstablishmentScopeGuard` interceptor that compares JWT claim vs query/body `establishmentId`; (3) Centralize `where.establishmentId = req.establishmentId` in all `findAll` via a helper; (4) Fix remaining B7 (bulkMark AcademicYear/Period scoping); (5) Add @Roles/@Permissions to meetings controller; (6) Pentest script that proves Tenant A cannot read Tenant B data via any endpoint. |
| **Acceptance** | Pentest script passes (Tenant A token with Tenant B establishment header returns 403 or empty); 100% of controllers have `@EstablishmentScoped()` decorator or equivalent; `establishmentId` in every JWT payload. |

### 🆕 `seed-data-steward`

| Field | Value |
|---|---|
| **Role** | Owns `prisma/seed.ts` correctness, hygiene, and reproducibility |
| **Primary Goal** | Eliminate hardcoded credentials from seed; make seeding idempotent and transactional |
| **Codified Skills** | `prisma-expert`, `prisma-schema-engineer`, `database-migrations-sql-migrations`, `database-migrations-migration-observability`, `clean-code`, `data-quality-frameworks` |
| **Operational Mandate** | (1) Wrap entire seed in `prisma.$transaction`; (2) Remove hardcoded `Ahmed123*` and `Admin@123` from seed (read `SEED_ROOT_EMAIL`/`SEED_ROOT_PASSWORD` from env, fail-fast if missing); (3) Fix garbage data `'La殖民isation'` and country/currency/address incoherence; (4) Use `upsert` consistently; (5) Add `--reset` flag for prod safety. |
| **Acceptance** | `npm run seed` is idempotent (run twice, same result); no credentials in seed.ts; transactional (partial seed leaves DB unchanged); seed never includes garbage characters. |

### 🆕 `ai-feature-builder`

| Field | Value |
|---|---|
| **Role** | Owns AI assistant integration (chatbot, question generator, summarizer) |
| **Primary Goal** | Build optional AI features (chatbot tutor, auto quiz gen, transcript analysis) that work behind a feature flag |
| **Codified Skills** | `python-pro`, `systematic-debugging`, `ai-llm-integration-patterns` |
| **Operational Mandate** | (1) Feature-flagged AI tutor chat (OpenAI/Anthropic API key from env); (2) Auto question generator from lesson content; (3) Parent transcript analyzer; (4) Rate-limited per-user; (5) Cost-monitoring dashboard; (6) PII scrubbing before LLM calls. |
| **Acceptance** | AI features behind `ENABLE_AI=true` flag; PII never sent to LLM; per-user daily token cap; cost log written; graceful degradation when API key missing. |

---

## PHASE 1 — Stop the Bleeding (Week 1)

> **Goal:** Eliminate remaining critical security bugs. After v1 audit + v2 delta, 7 of 14 criticals are fixed. 7 remain.

### Completed in v2 & Phase 1 Execution (mark done ✅)

- ~~1.1 Fix B1: SubscriptionMiddleware~~ → ✅ Fixed in `subscription.middleware.ts:76-89`
- ~~1.2 Fix JWT_SECRET hardcoded fallback~~ → ✅ Fixed in `app.module.ts:137`
- ~~1.3 Add separate JWT_REFRESH_SECRET~~ → ✅ Fixed in `auth.service.ts:262-268, 365-375`
- ~~1.4 Embed establishmentId in JWT~~ → ✅ Fixed in `auth.service.ts:generateTokens, login, refreshToken`
- ~~1.5 Fix B8/B9: Seed credentials from env~~ → ✅ Fixed in `seed.ts` via `SEED_ROOT_EMAIL`/`SEED_ROOT_PASSWORD`
- ~~1.6 Fix B23: Dashboard mocks~~ → ✅ Fixed via `/api/reports/stats`
- ~~1.7 Fix CORS `.vercel.app` wildcard~~ → ✅ Fixed in `main.ts:34-45`
- ~~1.8 Add @Roles/@Permissions to meetings controller~~ → ✅ Fixed in `meetings.controller.ts:28-70`
- ~~1.9 Add helmet + rate limiting~~ → ✅ Fixed via `SecurityHeadersMiddleware` and `AuthRateLimitMiddleware`
- ~~1.10 (partial) B12 magic-byte sniffing~~ → ✅ Fixed in `upload.service.ts:validateMagicBytes`
- ~~1.10 Fix B25: Student username collision~~ → ✅ Fixed at `students.service.ts:258`
- ~~StudentPayment select field crash (500)~~ → ✅ Fixed in `students.service.ts:54` (`type` -> `method`)
- ~~Community API 404 endpoints~~ → ✅ Fixed in `messages/page.tsx` and `notifications/page.tsx`

### Remaining in Phase 1 (3 tasks)

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.6b | **Lock `/auth/register` invitation/role gating** | `backend-access-control` + `saas-expert` | `jwt-auth-hardening`, `api-security-best-practices`, `secrets-management` | Rate limited + email verification / invitation check | Protects against automated registration spam |
| 1.10b| **Upload S3 provider migration** | `production-hardening-sre` + `devops-platform-engineer` | `container-security-hardening`, `secrets-management`, `docker-expert` | S3 / MinIO storage adapter | Uploads persist across stateless container restarts |
| 1.11 | **Complete B14: Force first-login password reset** | `backend-access-control` | `jwt-auth-hardening`, `api-security-best-practices` | New `forcePasswordChange` flag on User; enforced at login | Auto-provisioned student must reset on first access |
| 1.13 | **Master Judger Gate 1** | `master-judger` | `judger-security`, `judger-api-contracts`, `judger-typescript`, `judger-ui-ux` | Phase 1 sign-off report | Vitest 100% pass; `tsc --noEmit` clean; build green |

---

## PHASE 2 — Make It a Real LMS (Week 2-3)

> **Goal:** Fix remaining data leaks (B7), build missing LMS features (gradebook, password reset, 2FA, Stripe), harden remaining UX/correctness bugs.

### Completed in v2 delta (mark done ✅)

- ~~2.1 (partial) Fix B5/B6: Tenant scoping~~ → ✅ Completed for student-payments + student-attendance
- ~~2.2 Fix B7: bulkMark cross-tenant AcademicYear/Period~~ → ✅ Fixed in `student-attendance.service.ts:196-218`
- ~~2.4 Build gradebook average + bulletin generator~~ → ✅ Implemented `GET /api/notes/gradebook` and `POST /api/bulletins/generate`
- ~~2.5 Build student promotion wizard~~ → ✅ Implemented `POST /api/students/promote` & `POST /api/classes/promote`
- ~~2.6 Add password reset flow~~ → ✅ Implemented `POST /auth/forgot-password` & `POST /auth/reset-password`
- ~~2.7 Add email verification on register~~ → ✅ Implemented `POST /auth/verify-email` + email token generation
- ~~2.8 Add 2FA (TOTP) for Admin/SuperAdmin~~ → ✅ Implemented `POST /auth/totp/enable` & `POST /auth/totp/verify`

### Prioritized Remaining Tasks (Organized by Required First & Biggest Move First)

### Completed Foundational Tasks
- ~~2.3 Centralize Tenant Query Builder + ActorSnapshot Helper~~ → ✅ [COMPLETED] Exported in `common/`
- ~~1.6b Lock /auth/register Invitation & Role Gating~~ → ✅ [COMPLETED] Registration locked, email verified
- ~~2.9a Platform-Level SaaS Subscriptions (ClicToPay + Stripe)~~ → ✅ [COMPLETED] `billing/` module & Root SaaS settings
- ~~2.9b Tenant-Level School Inscription & Tuition Fees (ClicToPay + Stripe)~~ → ✅ [COMPLETED] School payment config & checkout

### Remaining Roadmap — Strict Dependency & Size Order ("Who Depends on Who First" + "Biggest First")

| Order | Task # | Task Name | Dependencies | Size / Impact | Deliverables & Acceptance Criteria |
|---|---|---|---|---|---|
| **1st** | **2.10** | **[COMPLETED] Multi-Establishment Switcher & Tenant Cache Eviction (B15/B38)** | *Prerequisite for all multi-tenant frontend features* | 🔴 **HIGH (Architecture)** | ✅ Done: `clearApiCache()`, `auth-store.ts` setEstablishment, `establishment-store.ts` browser events on context change, and logout cleanup. |
| **2nd** | **2.12** | **[COMPLETED] Global Pagination Ceiling & Composite Database Indexes** | *Prerequisite for database stability & caching* | 🔴 **HIGH (Performance)** | ✅ Done: Global `Math.min(limit, 100)` in `PaginationQueryDto`; composite indexes on `Establishment`, `Class`, `AcademicModule`, `Student`, `Parent`, `Teacher`, `Employee`, `Room`, `Exam`, `StudentPayment` pushed to Neon PostgreSQL. |
| **3rd** | **2.14** | **[COMPLETED] Foundational Online MCQ Exam Engine (LMS Core)** | Depends on 2.10 (tenant scoping) & 2.12 (safe pagination) | 🟣 **VERY HIGH (New Core Feature)** | ✅ Done: Online exam taking, question banco builder, anti-cheat answer stripping, auto-scoring engine, and frontend modal with option selectors. |
| **4th** | **2.13** | **[COMPLETED] Redis Caching for Hot Endpoints** | Depends on 2.10 (cache partitioning) & 2.12 (indexes) | 🟠 **MEDIUM (Latency Optimization)** | ✅ Done: Global `CacheModule` & `CacheService` with dual-engine (Redis + memory fallback), 60s TTL for `/classes`, `/rooms`, `/academic-modules`, `/reports/stats` and tenant resource invalidation on write. |
| **5th** | **3.3** | **[COMPLETED] Role & Permission Enums Extraction** | Depends on backend access control | 🟡 **MEDIUM (Code Quality)** | ✅ Done: Centralized `Role` & `Permission` enums in `common/enums/`, decorators updated to accept typed enums without magic strings. |
| **6th** | **3.2** | **[COMPLETED] Type Safety Hardening: Eliminate remaining `as any`** | Depends on all backend service contracts | 🔴 **HIGH (Code Quality)** | ✅ Done: Replaced `as any` across 14 backend service files with native Prisma enums (`CaisseType`, `TransactionType`, `PeriodType`, etc.) and `Prisma.InputJsonValue`. All 92 unit tests pass. |
| **7th** | **2.11** | **[COMPLETED] Frontend i18n Cleanup & Arabic RTL Polish (B21/B22)** | Depends on existing UI component tree | 🟠 **MEDIUM (Localization & UX)** | ✅ Done: Removed `next-intl` dead weight (B22); implemented anti-flash SSR `dir="rtl"` with cookie reading, Cairo font, and logical layout classes (B21); 100% dictionary coverage for MCQ and dual-gateway payment modals. |
| **8th** | **2.15** | **[COMPLETED] Master Judger Gate 2 Evaluation & Comprehensive Audit** | Depends on Tasks 2.10 through 2.11 completion | 🟢 **AUDIT & VERIFICATION** | ✅ Done: Passed with composite score 912/1000 (exceeding ≥750 threshold). Verified green across all 4 gates (Architecture, Security, Frontend UI/UX, QA). |



---

## PHASE 3 — Production Hardening (Week 4-6)

> **Goal:** Code quality, frontend UX, infrastructure, tests.

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 3.1 | **Split data-table.tsx (1290 LOC)** | `perf-budget-guardian` + `ui-component-architect` | `react-component-performance`, `tanstack-table-builder`, `ui-component`, `baseline-ui` | `components/ui/data-table/` per-feature | Bundle ≥30% smaller |
| 3.2 | **Eliminate `as any` (142 occurrences) — replace with types/enums** | `judger-typescript` + `backend-services-manager` | `typescript-advanced-types`, `typescript-expert`, `typescript-pro`, `clean-code` | PR per service | `grep -r "as any" backend/src` ≤5; `tsc --noEmit` clean |
| 3.3 | **Extract role/permission enums (kill magic strings)** | `judger-typescript` + `backend-access-control` | `typescript-expert`, `rbac-permissions-matrix` | `src/common/enums/role.enum.ts` | All `@Roles()` use enum imports |
| 3.4 | **Replace `console.*` in services with Logger** | `backend-services-manager` | `clean-code`, `modern-javascript-patterns`, `nodejs-best-practices` | All `console.warn/log` removed | Grep returns 0; structured logs |
| 3.5 | **Frontend test infra: Vitest + RTL** | `frontend-test-engineer` | `jest-skill` (adapt), `vitest-skill`, `tdd-workflow` | `vitest.config.ts`, `setup.ts` | `npm run test` exits 0 |
| 3.6 | **Frontend tests: components + hooks** | `frontend-test-engineer` | `vitest-skill`, `react-best-practices` | Tests for `data-table/`, `form-modal`, `useAuthStore`, etc. | Coverage ≥60% on `components/ui/`, `store/`, `lib/` |
| 3.7 | **Playwright E2E: 5 critical journeys** | `frontend-test-engineer` | `playwright-skill`, `e2e-testing-patterns` | `tests/e2e/` login, student CRUD, attendance, payment, tenant isolation | All 5 flows green in CI |
| 3.8 | **Backend tests: 60+ unit + 30+ e2e** | `e2e-api-verifier` | `unit-testing-test-generate`, `tdd-workflow`, `vitest-skill`, `nodejs-backend-patterns` | Tests for all services + e2e for all controllers | Coverage ≥60% backend |
| 3.9 | **Add Suspense + per-route loading.tsx** | `web-views-loading` + `web-views-skeleton` | `nextjs-best-practices`, `react-ui-patterns` | `loading.tsx` in every route | Skeleton shown on every transition |
| 3.10 | **Fix B37: AbortController in useEffect** | `web-views` + `web-hooks` | `react-patterns`, `tanstack-query-expert` | Custom `useFetch` hook | No stale-data flashes |
| 3.11 | **Accessibility sweep + axe-core CI** | `accessibility-a11y-engineer` | `frontend-ui-engineering`, `react-best-practices`, `baseline-ui` | axe-core in CI; ARIA pass | axe-core 0 serious/critical |
| 3.12 | **Dockerfile + docker-compose** | `devops-platform-engineer` | `docker-expert`, `container-security-hardening`, `devops-deploy` | `Dockerfile` + `docker-compose.yml` | `docker-compose up` brings full stack green |
| 3.13 | **GitHub Actions CI** | `devops-platform-engineer` | `ci-cd-and-automation`, `github`, `git-pr-review` | `.github/workflows/ci.yml` etc. | PR shows lint + test + build status |
| 3.14 | **Health/Readiness endpoints** | `devops-platform-engineer` | `prometheus-configuration`, `distributed-tracing`, `grafana-dashboards` | `/health`, `/health/db`, `/health/redis`, `/metrics` | K8s probes work; metrics scraped |
| 3.15 | **Sentry + Pino structured logging** | `devops-platform-engineer` | `distributed-tracing`, `monitoring-observability`, `secrets-management` | Sentry SDK init; Pino logger global | Test error reaches Sentry; logs JSON |
| 3.16 | **Prisma pool config + DB indexes** | `backend-db-engineer` + `backend-prisma-head` | `prisma-expert`, `prisma-index-auditor`, `postgres-best-practices`, `postgresql-optimization` | `connection_limit: 25`; migration adding 12+ indexes | EXPLAIN ANALYZE confirms index usage |
| 3.17 | **Bundle analyzer + lazy-load three.js** | `perf-budget-guardian` | `pagespeed-enhancer`, `web-performance-optimization`, `performance-engineer` | `@next/bundle-analyzer`; `next/dynamic` for 3D | Main chunk ≤250KB gzip |
| 3.18 | **Master Judger Gate 3** | `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Phase 3 sign-off report | All gates green |

---

## PHASE 4 — Differentiate (Week 7+)

> **Goal:** Advanced LMS features that make you competitive.

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 4.1 | **Online exam engine (full)** | `academic-school-expert` + `production-hardening-sre` | `clean-code`, `database-design`, `web-security-testing` | `online-exams/` module + student/teacher UI | Anti-cheat detection; auto-grade |
| 4.2 | **Parent-teacher meeting booking** (uses existing meetings module) | `academic-school-expert` + `realtime-messenger-agent` | `database-design`, `mailtrap-sending-emails` | Booking sub-module + frontend slot picker | Parent picks slot; both parties get email |
| 4.3 | **Realtime notifications via WebSocket** | `realtime-messenger-agent` + `backend-email-agent` | `websocket-gateway`, `nodejs-backend-patterns` | Socket.IO gateway; `notification` channel | Notification within 1s of event |
| 4.4 | **PDF generation** — bulletins, invoices, transcripts | `document-print-designer` + `reporting-audit-expert` | `clean-code`, `baseline-ui` | PDF endpoints | Downloaded PDFs match design system |
| 4.5 | **Mobile-first student/parent portal polish** | `judger-ui-ux` + `web-views` | `flutter-build-responsive-layout`, `baseline-ui`, `nextjs-app-router-builder` | Bottom-sheet nav, swipe actions | Lighthouse mobile ≥90 |
| 4.6 | **BullMQ workers for async jobs** | `backend-services-manager` + `devops-platform-engineer` | `nodejs-backend-patterns`, `docker-expert`, `redis-cache-strategy` | BullMQ for email queue, reminders | Reminder emails sent at scheduled time |
| 4.7 | **Storybook for design system docs** | `ui-component-architect` | `shadcn`, `ui-component`, `baseline-ui` | Storybook setup; stories for `components/ui/` | `npm run storybook` opens |
| 4.8 | **AI tutor + auto quiz gen (feature-flagged)** | `ai-feature-builder` | `python-pro`, `systematic-debugging`, `ai-llm-integration-patterns` | AI tutor chat; question generator; transcript analyzer | Behind `ENABLE_AI=true`; PII scrubbed |
| 4.9 | **PWA for offline bulletins** | `web-views` + `frontend-design` | `nextjs-best-practices`, `web-performance-optimization` | Service worker, manifest, offline cache | Student views last bulletin offline |
| 4.10 | **Master Judger Gate 4 (Final)** | `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Final release readiness report | Target: 870/1000 |

---

## VERIFICATION (Continuous)

| Activity | Owner | Cadence | Tool |
|---|---|---|---|
| Code review on every PR | `code-reviewer` + `pr-merge-champion` | Every PR | GitHub |
| Penetration test | `tenant-isolation-pentester` + `production-hardening-sre` | After Phase 1, 2, 3, 4 | OWASP ZAP, custom pentest |
| Performance audit | `perf-budget-guardian` | After Phase 2, 3, 4 | Lighthouse CI, bundle-analyzer |
| Accessibility audit | `accessibility-a11y-engineer` | After Phase 2, 3, 4 | axe-core, NVDA smoke |
| Security audit | `production-hardening-sre` + `judger-security` | After every phase | OWASP ZAP, Snyk, npm audit |
| API contract check | `judger-api-contracts` | Every PR | Swagger diff |
| TypeScript strictness | `judger-typescript` | Every PR | `tsc --noEmit --strict` |

---

## Success Metrics

| Phase | Score | Critical bugs remaining |
|---|---|---|
| v1 (baseline) | 432/1000 | 14 |
| v2 (current) | 497/1000 | 7 |
| After Phase 1 | 580/1000 | 0 |
| After Phase 2 | 720/1000 | 0 |
| After Phase 3 | 830/1000 | 0 |
| After Phase 4 | **870+/1000** | 0 |

---

## Gate Policy

**No phase N+1 starts until the Master Judger approves phase N.** Master Judger requires:
1. All acceptance criteria in phase N met
2. `npm run build` succeeds for both apps
3. `npm run test` exits 0
4. `npm run lint` exits 0
5. OWASP ZAP baseline = 0 criticals
6. Lighthouse Performance ≥85
7. axe-core = 0 serious/critical
8. No new `as any`, no `console.*`, no TODO/FIXME introduced

---

## Asset / Knowledge Artifacts to Produce

Each phase produces persistent knowledge committed to `.gemini/`:

| Artifact | Owner | Location |
|---|---|---|
| Phase 1 security patch log | `production-hardening-sre` | `.gemini/archive/security-patches-phase1.md` |
| Phase 2 module docs | `auth-core-specialist` + `academic-school-expert` | `.gemini/walkthrough.md` updates |
| Phase 3 perf baseline | `perf-budget-guardian` | `.gemini/perf-baseline.json` |
| Phase 4 feature specs | `ai-feature-builder` | `.gemini/feature-specs/` |
| Updated agent roster | (orchestrator) | `.gemini/AGENTS.md` + `.gemini/subagents/SUBAGENTS.md` |

---

## Companion Files in `.gemini/`

- **`.gemini/AUDIT_REPORT_v1.0.md`** — Original 52-bug audit (historical)
- **`.gemini/AUDIT_DELTA_v2.md`** — v2 delta report (9 bugs fixed, 7 still open)
- **`.gemini/REMEDIATION_PLAN_v4.0.md`** — Original plan (superseded by this v4.1)
- **`.gemini/implementation_plan.md`** — Master Plan v3.0 (active execution)
- **`.gemini/walkthrough.md`** — Live milestone tracker
- **`.gemini/AGENTS.md`** — Master agent roster
- **`.gemini/subagents/SUBAGENTS.md`** — Subagent architecture & registry

---

## How to Start (Today)

1. Create the 8 new agents in `.gemini/AGENTS.md` and `.gemini/subagents/SUBAGENTS.md` (copy-paste the rules/skills above).
2. Spin up Master Judger on current repo → confirm baseline 497/1000.
3. Begin Phase 1, Task 1.2: Fix JWT_SECRET hardcoded fallback.
4. After each task: small commit (local only — never `git push` per your policy).
5. End of each phase: trigger Master Judger Gate.

---

> **Reminder:** This plan is copy-paste-ready. Paste it as-is into a new conversation. The receiving agent has zero prior context; everything needed (agent identities, skills, deliverables, acceptance criteria, gate policy, delta vs v1) is contained in this document.