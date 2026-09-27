# BSofts-School — Complete Remediation & Hardening Plan v4.0

> **Audit date:** 17 August 2026
> **Audit score (current state):** 432 / 1000
> **Target score (post-execution):** 850+ / 1000
> **Total tasks:** 78 across 4 phases + 1 Verification + Gate phases
> **Active agent roster:** 43 existing + 8 proposed-to-create

---

## Plan Overview

This plan remediates every bug (B1–B52) and gap identified in the Level 1 + Level 2 audits. Tasks are grouped into **Phases** ordered by risk/impact. Each task has:

- **Owner Agent** — existing (in `.gemini/AGENTS.md`) or proposed-to-create (marked 🆕)
- **Required Skills** — from `.gemini/skills/` catalog
- **Deliverable** — concrete artifact
- **Acceptance Criteria** — measurable, auditable

A **Master Judger** gate runs between each phase. No phase N+1 starts until phase N passes the gate.

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
| **Primary Goal** | Eliminate security vulnerabilities (B1–B14) and bring platform to GDPR/OWASP baseline |
| **Codified Skills** | `jwt-auth-hardening`, `rate-limit-helmet`, `api-security-best-practices`, `secrets-management`, `broken-authentication`, `container-security-hardening`, `gdpr-data-handling`, `top-web-vulnerabilities`, `smtp-penetration-testing`, `sql-injection-testing`, `idor-testing`, `xss-html-injection`, `credentials`, `gha-security-review`, `pci-compliance`, `security-auditor`, `security-and-hardening` |
| **Operational Mandate** | (1) Fix B1 (subscription middleware); (2) Encrypt `SmtpConfig.password`, `stripeSecret`, `paypalSecret` at rest; (3) Remove `image/svg+xml` from upload allowlist; (4) Move uploads to S3-compatible storage (Cloudflare R2 or MinIO); (5) Add magic-byte sniffing on upload; (6) Implement `@nestjs/throttler` rate limiting; (8) Add CSRF, SameSite cookies, `helmet`; (9) Lock CORS to exact origins (kill `.vercel.app` wildcard); (10) Make `/auth/register` admin/invite-only; (11) Random temp passwords for auto-provisioned users + force first-login reset. |
| **Acceptance** | OWASP ZAP baseline scan = 0 high; secrets never appear in code; throttler blocks 100 rapid logins; CORS rejects `evil.vercel.app`; SVG upload returns 400. |

### 🆕 `tenant-isolation-pentester`

| Field | Value |
|---|---|
| **Role** | Owns cross-tenant data-leak detection and proof |
| **Primary Goal** | Prove no API endpoint leaks data across tenants/establishments |
| **Codified Skills** | `tenant-isolation-verifier`, `tenant-switcher-governance`, `saas-multi-tenant`, `web-security-testing`, `idor-testing`, `broken-authentication` |
| **Operational Mandate** | (1) Embed `establishmentId` claim in JWT; (2) Build `EstablishmentScopeGuard` interceptor that compares JWT claim vs query/body `establishmentId`; (3) Centralize `where.establishmentId = req.establishmentId` in all `findAll` via a helper; (4) Fix B2 (reports), B5 (student-payments), B6 (student-attendance), B7 (bulk attendance session); (5) Pentest script that proves Tenant A cannot read Tenant B data via any endpoint. |
| **Acceptance** | Pentest script passes (Tenant A token with Tenant B establishment header returns 403 or empty); 100% of controllers have `@EstablishmentScoped()` decorator or equivalent; `establishmentId` in every JWT payload. |

### 🆕 `seed-data-steward`

| Field | Value |
|---|---|
| **Role** | Owns `prisma/seed.ts` correctness, hygiene, and reproducibility |
| **Primary Goal** | Make seeding idempotent, transactional, secure, and content-correct |
| **Codified Skills** | `prisma-expert`, `prisma-schema-engineer`, `database-migrations-sql-migrations`, `database-migrations-migration-observability`, `clean-code`, `data-quality-frameworks` |
| **Operational Mandate** | (1) Wrap entire seed in `prisma.$transaction`; (2) Remove hardcoded credentials from seed (read `SEED_ROOT_EMAIL`/`SEED_ROOT_PASSWORD` from env, fail-fast if missing); (3) Fix garbage data `'La殖民isation'` and country/currency/address incoherence (TND currency, Algerian addresses, country TN); (4) Use `upsert` consistently; (5) Add `--reset` flag for prod safety. |
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

## PHASE 1 — Stop the Bleeding (Week 1, before any new feature work)

> **Goal:** Eliminate the 14 critical security/data-leak bugs (B1–B14). After this phase, a penetration test should reveal no critical vulnerabilities.

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 1.1 | **Fix B1: SubscriptionMiddleware** — replace `throw` in Express middleware with proper 403 response or convert to NestJS Guard | `backend-access-control` | `jwt-auth-hardening`, `api-security-best-practices`, `clean-code` | Patched `subscription.middleware.ts` OR new `SubscriptionGuard` | Tenant-less user gets clean 403 JSON, not 500; existing happy-path tests pass |
| 1.2 | **Fix B3: Conversation privacy** — verify participant in `findOne`; add `PermissionsGuard` to conversations controller | `backend-security` | `rbac-permissions-matrix`, `broken-authentication` | Patched `conversations.service.ts` + `conversations.controller.ts` | Non-participant gets 403; non-admin cannot `DELETE /conversations/:id` |
| 1.3 | **Fix B13/B14: Public register + weak default password** — make `/auth/register` admin/invite-only; random temp passwords | `backend-access-control` + `saas-expert` | `jwt-auth-hardening`, `api-security-best-practices`, `secrets-management`, `broken-authentication` | `auth.controller.ts` patched; `RegisterDto` requires `invitationToken`; new `forcePasswordChange` flag on User | Public POST `/auth/register` returns 401; student auto-create produces random 16-char temp password; first-login flag set |
| 1.4 | **Fix B8/B9: Seed credentials** — read from env, fail-fast, document rotation | `seed-data-steward` | `prisma-expert`, `secrets-management`, `data-quality-frameworks` | Patched `prisma/seed.ts`; `.env.example` updated | No plaintext password in seed.ts; `npm run seed` fails without `SEED_ROOT_PASSWORD` env |
| 1.5 | **Fix B10/B11/B12: Upload security** — remove SVG, move to S3/R2, add magic-byte sniffing | `production-hardening-sre` + `devops-platform-engineer` | `container-security-hardening`, `xss-html-injection`, `secrets-management`, `docker-expert` | `upload.service.ts` patched; new `S3UploadProvider`; tests for MIME spoofing | SVG upload returns 400; `.exe` renamed to `.pdf` returns 400; upload survives container restart |
| 1.6 | **Fix B23: Remove dashboard mocks** — replace hardcoded stats with `/dashboard/stats` endpoint | `analytics-stats-architect` | `kpi-dashboard-design`, `sql-optimization-patterns`, `postgres-best-practices` | New `GET /api/dashboard/stats`; patched `frontend/src/app/(dashboard)/dashboard/page.tsx` | No hardcoded 642/48/24 numbers in frontend; endpoint aggregates in single SQL query |
| 1.7 | **Embed establishmentId in JWT + TenantGuard** | `tenant-isolation-pentester` + `backend-access-control` | `tenant-isolation-verifier`, `tenant-switcher-governance`, `jwt-auth-hardening` | Patched `auth.service.ts` `generateTokens`; new `EstablishmentScopeGuard` interceptor | JWT payload contains `establishmentId`; guard rejects mismatched header; A→B token returns 403 |
| 1.8 | **Fix CORS** — kill `.vercel.app` wildcard suffix; require exact origin match | `production-hardening-sre` | `api-security-best-practices`, `top-web-vulnerabilities` | Patched `main.ts:34-36` | `evil.vercel.app` returns CORS rejection; production domain works |
| 1.9 | **Add helmet + rate limiting** — `@nestjs/throttler` on `/auth/login`, `/auth/register`, `/auth/refresh` | `production-hardening-sre` | `rate-limit-helmet`, `api-security-best-practices`, `broken-authentication` | New `ThrottlerGuard` global; helmet middleware in `main.ts` | 100 rapid logins blocked; security headers present (HSTS, X-Frame-Options, etc.) |
| 1.10 | **Fix B25: Student username collision** — append random suffix or use `(email + '_' + establishmentId)` | `backend-services-manager` + `backend-entities-manager` | `clean-code`, `base-service-extender` | Patched `students.service.ts:253` | Two `ahmed@x.com` and `ahmed@y.com` create distinct usernames |
| 1.11 | **Rotate admin credentials** — invalidate the seeded super admin and tenant passwords in Neon | `production-hardening-sre` | `secrets-management`, `credentials` | Updated Neon DB; new admin password issued via 1Password | Old `Ahmed123*` no longer works |
| 1.12 | **Master Judger Gate 1** | `master-judger` | `judger-security`, `judger-api-contracts`, `judger-typescript`, `judger-ui-ux` | Phase 1 sign-off report | OWASP ZAP = 0 criticals; vitest 100% pass; `tsc --noEmit` clean; build green |

---

## PHASE 2 — Make It a Real LMS (Week 2-3)

> **Goal:** Fix cross-tenant data leaks (B2, B5, B6, B7), build the missing LMS features (Meetings, Gradebook, Promotion Wizard, Password Reset, 2FA, Stripe), fix UX bugs (B15, B21, B22, B24, B38).

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 2.1 | **Fix B2/B5/B6/B7: Tenant scoping in payments, attendance, reports, bulk attendance session** | `tenant-isolation-pentester` + `backend-services-manager` | `tenant-isolation-verifier`, `saas-multi-tenant`, `clean-architecture-guardrails` | Patched services; centralized `TenantWhereBuilder` helper | Pentest suite confirms no cross-tenant leakage |
| 2.2 | **Centralize where-helper + actorSnapshot helper** — kill duplication | `backend-services-manager` | `clean-code`, `clean-architecture-guardrails`, `code-refactoring-refactor-clean` | New `src/common/builders/tenant-where.builder.ts` + `actor-snapshot.builder.ts` | DRY across 30+ services; zero duplicated patterns |
| 2.3 | **Build `/api/meetings` module** — controller + service + DTO + module | `auth-core-specialist` + `realtime-messenger-agent` | `class-validator-expert`, `api-design-principles`, `nestjs-expert` | Full `backend/src/meetings/` module wired in `AppModule` | Swagger shows `CRUD /meetings`; frontend `(dashboard)/community/meetings/page.tsx` connects |
| 2.4 | **Build gradebook average + bulletin generator** — weighted-average per period; rank students; honor coefficients | `academic-school-expert` | `database`, `base-service-extender`, `clean-code` | New `GET /api/notes/gradebook?classId&periodId` + `POST /api/bulletins/generate` | Endpoint returns ranked students with averages; bulletin PDF generated |
| 2.5 | **Build student promotion wizard** — promote to next class with audit trail, multi-year transitions | `academic-school-expert` | `database`, `clean-architecture-guardrails`, `tdd-workflow` | `POST /api/students/promote` with bulk payload | Frontend `(dashboard)/classes/promotion/page.tsx` works end-to-end |
| 2.6 | **Add password reset flow** — `POST /auth/forgot-password`, `POST /auth/reset-password` with email token | `backend-access-control` + `backend-email-agent` | `jwt-auth-hardening`, `mailtrap-sending-emails`, `api-security-best-practices` | 2 new endpoints + email template | User receives reset email; token expires in 1h; single-use enforced |
| 2.7 | **Add email verification on register** | `backend-access-control` + `backend-email-agent` | `jwt-auth-hardening`, `mailtrap-sending-emails` | Email verification token + verify endpoint | Unverified users cannot access protected routes |
| 2.8 | **Add 2FA (TOTP) for Admin/SuperAdmin** | `backend-access-control` | `jwt-auth-hardening`, `api-security-best-practices`, `broken-authentication` | `POST /auth/totp/enable`, `POST /auth/totp/verify` with QR provisioning | Admin must complete 2FA on first login after enable |
| 2.9 | **Wire Stripe for SaaS subscription payments** — checkout session + webhook | `domain-subagent-payments` + `production-hardening-sre` | `stripe-integration`, `payment-integration`, `pci-compliance`, `webhooks` | New `billing/` module; `/billing/checkout`, `/billing/webhook` | Test mode payment completes; subscription status updates on webhook |
| 2.10 | **Fix B15/B24/B38: Auth-store + API interceptor** | `web-contexts` + `web-apis` | `react-context-manager`, `react-state-management`, `zustand-store-ts`, `api-patterns` | Patched `auth-store.ts` + `api.ts` | Establishment picker UI; tenant switcher persists choice; cache evicts on switch |
| 2.11 | **Fix B21/B22: i18n — drop next-intl, keep custom provider, fix RTL** | `i18n-multilingual-agent` | `next-intl-localizer`, `react-patterns` | `package.json` cleaned; all UI components RTL-aware | Arabic users see correct UI on first frame; no layout shift on locale switch |
| 2.12 | **Add pagination max + sorted indexes** | `backend-db-engineer` + `backend-controllers-manager` | `postgresql`, `postgres-best-practices`, `prisma-index-auditor`, `nest-route-organizer` | Migration adding missing indexes; `Math.min(limit, 100)` in all list endpoints | `?limit=100000` capped at 100; EXPLAIN ANALYZE shows index usage on hot queries |
| 2.13 | **Add Redis + cache hot list endpoints** | `backend-services-manager` + `devops-platform-engineer` | `redis-cache-strategy`, `docker-expert` | Redis client; 60s TTL on `/students/list`, `/teachers/list`, `/classes/list` | List endpoints ≤50ms p95 on cache hit |
| 2.14 | **Build online exam engine (basic)** — question bank, MCQ taking, time limit, simple scoring | `academic-school-expert` | `clean-code`, `database-design`, `base-service-extender` | `backend/src/online-exams/` module; student exam-taking UI | Student can take a published MCQ exam; answers scored; submission stored |
| 2.15 | **Master Judger Gate 2** | `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Phase 2 sign-off report | Tenant pentest suite green; new modules Swagger-documented; reset + 2FA flows work end-to-end; Stripe test mode passes |

---

## PHASE 3 — Production Hardening (Week 4-6)

> **Goal:** Code quality (B19, B27–B35), frontend UX (B20, B36–B41), infrastructure (B46–B52), tests.

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 3.1 | **Split data-table.tsx (1290 LOC) into per-feature components** | `perf-budget-guardian` + `ui-component-architect` | `react-component-performance`, `tanstack-table-builder`, `ui-component`, `baseline-ui` | `components/ui/data-table/` directory with `<DataTableCore>`, `<FilterBar>`, `<GridView>`, `<SplitView>`, `<MatrixView>` | Per-feature code-splitting reduces dashboard bundle ≥30% |
| 3.2 | **Eliminate `as any` (133 occurrences) — replace with proper types/enums** | `judger-typescript` + `backend-services-manager` | `typescript-advanced-types`, `typescript-expert`, `typescript-pro`, `clean-code` | PR per service; new Prisma enum imports | `grep -r "as any" backend/src` returns ≤5 (legit interface casts only); `tsc --noEmit` clean |
| 3.3 | **Extract role/permission enums (kill magic strings)** | `judger-typescript` + `backend-access-control` | `typescript-expert`, `rbac-permissions-matrix` | `src/common/enums/role.enum.ts`, `permission.enum.ts` | All `@Roles()` use enum imports; magic strings gone |
| 3.4 | **Replace `console.*` in services with Logger** | `backend-services-manager` | `clean-code`, `modern-javascript-patterns`, `nodejs-best-practices` | All `console.warn/log` removed from `src/**/*.ts` (excluding seed) | Grep returns 0; structured logs in production |
| 3.5 | **Frontend test infra: Vitest + RTL** | `frontend-test-engineer` | `jest-skill` (adapt), `vitest-skill`, `tdd-workflow` | `vitest.config.ts`, `setup.ts`, mock factories | `npm run test` exits 0; first 20 component tests pass |
| 3.6 | **Frontend tests: components + hooks** | `frontend-test-engineer` | `vitest-skill`, `react-best-practices`, `react-component-performance` | Test files for `data-table/`, `form-modal`, `confirm-dialog`, `useAuthStore`, `usePermissionsStore`, `useEstablishmentStore` | Coverage ≥60% on `components/ui/`, `store/`, `lib/` |
| 3.7 | **Playwright E2E: 5 critical journeys** | `frontend-test-engineer` | `playwright-skill`, `cypress-skill`, `e2e-testing-patterns` | `tests/e2e/` with: login → dashboard, student CRUD, attendance mark, payment record, tenant isolation test | All 5 flows green in CI |
| 3.8 | **Backend tests: 60+ unit + 30+ e2e** | `e2e-api-verifier` | `unit-testing-test-generate`, `tdd-workflow`, `vitest-skill`, `nodejs-backend-patterns` | Test files for all services + e2e for all controllers | Coverage ≥60% backend; `npm run test:cov` exits 0 |
| 3.9 | **Add Suspense + per-route loading.tsx** | `web-views-loading` + `web-views-skeleton` | `nextjs-best-practices`, `react-ui-patterns`, `baseline-ui` | `loading.tsx` in every `(dashboard)/*` route group | Skeleton shown on every route transition; LCP improved |
| 3.10 | **Fix B37: AbortController in useEffect data fetches** | `web-views` + `web-hooks` | `react-patterns`, `react-ui-patterns`, `tanstack-query-expert` | Custom `useFetch` hook with AbortController | No stale-data flashes on rapid nav |
| 3.11 | **Accessibility sweep + axe-core CI** | `accessibility-a11y-engineer` | `frontend-ui-engineering`, `react-best-practices`, `baseline-ui` | axe-core in CI; ARIA pass on all components | axe-core 0 serious/critical; manual keyboard walkthrough passes |
| 3.12 | **Dockerfile + docker-compose** | `devops-platform-engineer` | `docker-expert`, `container-security-hardening`, `devops-deploy`, `deployment-engineer` | `Dockerfile` (backend), `Dockerfile.frontend`, `docker-compose.yml` (postgres + redis + minio + backend + frontend) | `docker-compose up` brings full stack green; healthcheck passes |
| 3.13 | **GitHub Actions CI** | `devops-platform-engineer` | `ci-cd-and-automation`, `github`, `gitlab-ci-patterns`, `git-pr-review` | `.github/workflows/ci.yml`, `pr-check.yml`, `release.yml` | PR shows lint + test + build status; main branch protected |
| 3.14 | **Health/Readiness endpoints** | `devops-platform-engineer` | `prometheus-configuration`, `distributed-tracing`, `grafana-dashboards` | `/health`, `/health/db`, `/health/redis`, `/metrics` (Prometheus) | K8s probes work; metrics scraped by Prometheus |
| 3.15 | **Sentry + Pino structured logging** | `devops-platform-engineer` | `distributed-tracing`, `monitoring-observability`, `secrets-management` | Sentry SDK init in `main.ts`; Pino logger global; sentry releases | Test error reaches Sentry; logs in JSON; trace IDs propagate |
| 3.16 | **Prisma pool config + DB indexes** | `backend-db-engineer` + `backend-prisma-head` | `prisma-expert`, `prisma-index-auditor`, `postgres-best-practices`, `postgresql-optimization` | Prisma `connection_limit` set to 25; migration adding 12+ composite indexes | EXPLAIN ANALYZE confirms index usage on top 20 queries |
| 3.17 | **Bundle analyzer + lazy-load three.js** | `perf-budget-guardian` | `pagespeed-enhancer`, `web-performance-optimization`, `performance-engineer`, `react-component-performance` | `@next/bundle-analyzer` wired; `next/dynamic` for 3D scenes; framer-motion replaced with CSS for non-essentials | Main chunk ≤250KB gzip; LCP ≤2.5s; bundle report in CI |
| 3.18 | **Master Judger Gate 3** | `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Phase 3 sign-off report | All gates green: type clean, tests 60%+, bundle budget met, axe-core clean, Docker up, CI green, OWASP scan clean |

---

## PHASE 4 — Differentiate (Week 7+)

> **Goal:** Advanced LMS features that make you competitive vs. competitors.

| # | Task | Owner Agent | Required Skills | Deliverable | Acceptance Criteria |
|---|---|---|---|---|---|
| 4.1 | **Online exam engine (full)** — anti-cheat tab-switch, time limits, randomized question order, auto-grade with partial credit, question bank UI | `academic-school-expert` + `production-hardening-sre` | `clean-code`, `database-design`, `base-service-extender`, `web-security-testing` | `online-exams/` module + student exam UI + teacher results UI | Student takes exam; tab switch detected; result posted to bulletin |
| 4.2 | **Parent-teacher meeting booking** — calendar slot picker, email confirmation, ICS export | `academic-school-expert` + `realtime-messenger-agent` | `database-design`, `mailtrap-sending-emails`, `modern-javascript-patterns` | `meetings/booking` sub-module + frontend slot picker | Parent picks slot; both parties get email; ICS downloads |
| 4.3 | **Realtime notifications via WebSocket** | `realtime-messenger-agent` + `backend-email-agent` | `websocket-gateway`, `nodejs-backend-patterns`, `modern-javascript-patterns` | Socket.IO gateway; `notification` channel; client subscribes | User sees notification within 1s of event; offline messages queued |
| 4.4 | **PDF generation** — bulletins, invoices, transcripts using `@react-pdf/renderer` or `pdfkit` | `document-print-designer` + `reporting-audit-expert` | `clean-code`, `baseline-ui`, `api-patterns` | PDF endpoints for bulletins, invoices, transcripts | Downloaded PDFs match design system; multi-language |
| 4.5 | **Mobile-first student/parent portal polish** | `judger-ui-ux` + `web-views` | `flutter-build-responsive-layout`, `baseline-ui`, `senior-frontend`, `nextjs-app-router-builder` | Bottom-sheet nav, swipe actions, mobile-optimized tables | Lighthouse mobile ≥90; parent portal usable on 360px viewport |
| 4.6 | **BullMQ workers for async jobs** | `backend-services-manager` + `devops-platform-engineer` | `nodejs-backend-patterns`, `docker-expert`, `redis-cache-strategy` | BullMQ for email queue, payment reminders, attendance threshold alerts | Reminder emails sent at scheduled time; failed jobs retry |
| 4.7 | **Storybook for design system docs** | `ui-component-architect` | `shadcn`, `ui-component`, `baseline-ui` | Storybook setup; stories for all `components/ui/` | `npm run storybook` opens; designers can browse components |
| 4.8 | **AI tutor + auto quiz gen (feature-flagged)** | `ai-feature-builder` | `python-pro`, `systematic-debugging`, `ai-llm-integration-patterns` | AI tutor chat endpoint; question generator from lesson content; transcript analyzer | AI features work when `ENABLE_AI=true`; PII scrubbed; cost logged |
| 4.9 | **PWA for offline bulletins** | `web-views` + `frontend-design` | `nextjs-best-practices`, `web-performance-optimization`, `frontend-architecture` | Service worker, manifest, offline cache for bulletins | Student can view last bulletin offline |
| 4.10 | **Master Judger Gate 4 (Final)** | `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Final release readiness report | Target: 850/1000 score; ready for paid pilot |

---

## VERIFICATION (Continuous, every phase)

| Activity | Owner | Cadence | Tool |
|---|---|---|---|
| Code review on every PR | `code-reviewer` + `pr-merge-champion` | Every PR | GitHub |
| Penetration test | `tenant-isolation-pentester` + `production-hardening-sre` | After Phase 1, 2, 3, 4 | OWASP ZAP, custom pentest script |
| Performance audit | `perf-budget-guardian` | After Phase 2, 3, 4 | Lighthouse CI, `@next/bundle-analyzer` |
| Accessibility audit | `accessibility-a11y-engineer` | After Phase 2, 3, 4 | axe-core, NVDA smoke |
| Security audit | `production-hardening-sre` + `judger-security` | After every phase | OWASP ZAP, Snyk, npm audit |
| API contract check | `judger-api-contracts` | Every PR | Swagger diff |
| TypeScript strictness | `judger-typescript` | Every PR | `tsc --noEmit --strict` |

---

## Success Metrics (re-score after each phase)

| Phase | Expected Score | Critical bugs remaining |
|---|---|---|
| Current | 432/1000 | 14 |
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
8. No `as any`, no `console.*`, no TODO/FIXME introduced

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

## How to Start (Today)

1. Create the 8 new agents in `.gemini/AGENTS.md` and `.gemini/subagents/SUBAGENTS.md` (copy-paste the rules/skills above).
2. Spin up Master Judger on current repo → confirm baseline 432/1000.
3. Begin Phase 1, Task 1.1: Fix B1 (SubscriptionMiddleware).
4. After each task: small commit (local only — never `git push` per your policy).
5. End of each phase: trigger Master Judger Gate.

---

> **Reminder:** This plan is copy-paste-ready. Paste it as-is into a new conversation. The receiving agent has zero prior context; everything needed (agent identities, skills, deliverables, acceptance criteria, gate policy) is contained in this document.