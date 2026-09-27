# BSofts-School — Level 2 Audit Report

> **Audit type:** Deep code-level audit — concrete bugs found in the actual code
> **Auditor lens:** Expert buyer in LMS, dev, security, performance, code quality
> **Audit date:** 22 September 2026
> **Repo path:** `E:\ReFactory\BSofts-School`
> **Score after this audit:** 432 / 1000 ⭐⭐ (Conditional Buy — would not ship to paying customers in this state)

---

## Score Breakdown (with concrete bugs included)

| Domain | Score | Comment |
|---|---|---|
| Architecture & Schema | 78/100 | 45+ models, multi-tenancy design is solid on paper |
| Backend Code Quality | 58/100 | B27 (as any), B30 (duplicated boilerplate), B31 (logging) |
| Frontend Code Quality | 52/100 | B20, B21, B24, B37, B38 |
| Security | **18/100** | B1 (broken middleware), B2–B7 (data leaks), B8–B12 (creds + uploads), B13–B14 |
| Multi-tenancy Correctness | 28/100 | B2, B5, B6, B7 explicitly violate tenant isolation |
| Testing | 14/100 | 13 spec / 70+ modules; 1 e2e; 0 frontend |
| Performance | 48/100 | No cache layer, sparse indexes, no N+1 audit on list endpoints |
| UI/UX & Design System | 72/100 | Custom 5-color palette enforced; i18n (FR/EN/AR); but a11y and loading UX missing |
| SaaS Readiness | 38/100 | Schema ready, no actual payment integration wired |
| DevOps & Production Readiness | 22/100 | B46, B47, B48, B50, B51 |
| Documentation & Architecture Hub | 78/100 | `.gemini/` hub, SUBAGENTS, walkthrough, DESIGN_SYSTEM are a real asset |
| **TOTAL** | **432 / 1000** | Promising foundation; **not sale-ready** |

---

## Concrete Bugs (with file:line)

### CRITICAL — Security / Data Leak

#### B1 — `SubscriptionMiddleware` throws inside Express middleware
- **Location:** `backend/src/common/middleware/subscription.middleware.ts:76, 80`
- **Issue:** `throw new ForbiddenException(...)` inside Express middleware (`req, res, next`). Express middlewares can't `throw` to be caught by NestJS filters — these cause uncaught exceptions → 500 crashes for any user without tenant/subscription.
- **Impact:** Subscription gate non-functional; auth users without tenant = 500.

#### B2 — `ReportsService` does NOT scope by `establishmentId` in 6 of 8 report types
- **Location:** `backend/src/reports/reports.service.ts:61, 85, 145, 170, 195, 219`
- **Issue:** `attendanceReport`, `examResultsReport`, `enrollmentReport`, `teacherPerformanceReport`, `classPerformanceReport`, `paymentCollectionReport` (when `establishmentId` not passed).
- **Impact:** Any authenticated user with `reports:create` perm can query all-tenant data. **Tenant data leak.**

#### B3 — `ConversationsService.findOne` doesn't check participant
- **Location:** `backend/src/conversations/conversations.service.ts:36-52`
- **Issue:** Anyone with a conversation UUID can read all its messages.
- **Impact:** **Privacy hole.**

#### B4 — `ConversationsController` has only `JwtAuthGuard`, no `PermissionsGuard`/`RolesGuard`
- **Location:** `backend/src/conversations/conversations.controller.ts:14, 38-43`
- **Issue:** Any authenticated user (including Student/Parent) can `DELETE /conversations/:id` and hard-delete any conversation.
- **Impact:** **Mass message destruction.**

#### B5 — `StudentPaymentsService.findAll` does NOT accept or filter by `establishmentId`
- **Location:** `backend/src/student-payments/student-payments.service.ts:11-43`
- **Issue:** Payment query doesn't have an `establishmentId` field in `where` construction.
- **Impact:** **Cross-tenant payment leak.**

#### B6 — `StudentAttendanceService.findAll` does NOT filter by `establishmentId`
- **Location:** `backend/src/student-attendance/student-attendance.service.ts:11-40`
- **Issue:** Class filter exists, but only on the session relation — cross-establishment possible.
- **Impact:** **Attendance leak across schools.**

#### B7 — `StudentAttendanceService.bulkMark` picks `AcademicYear`/`AcademicPeriod` from any tenant
- **Location:** `backend/src/student-attendance/student-attendance.service.ts:197-198`
- **Issue:**
  - Line 197: `prisma.academicYear.findFirst({ where: { isCurrent: true } })` — no `establishmentId` scope.
  - Line 198: `prisma.academicPeriod.findFirst({ orderBy: { createdAt: 'asc' } })` — picks ANY period from ANY establishment.
- **Impact:** **Cross-tenant session creation.**

#### B8 — Hardcoded super-admin credentials in seed.ts
- **Location:** `backend/prisma/seed.ts:360, 389`
- **Issue:** `bsofts.contact@gmail.com` / `Ahmed123*` committed to git.
- **Impact:** **Backdoor shipped in source.**

#### B9 — Hardcoded tenant passwords in seed.ts
- **Location:** `backend/prisma/seed.ts:361, 396-407`
- **Issue:** `tenant1@bsofts.com`, `tenant2@bsofts.com` / `Admin@123` committed to git.
- **Impact:** Free tenant access on prod.

#### B10 — Upload service allows `image/svg+xml`
- **Location:** `backend/src/upload/upload.service.ts:21`
- **Issue:** SVG can contain JavaScript and is a known XSS vector. The file is served back via `/uploads/...`.
- **Impact:** **Stored XSS via SVG upload.**

#### B11 — Upload service stores files to local disk via `fs.writeFileSync`
- **Location:** `backend/src/upload/upload.service.ts:36, 93`
- **Issue:** `process.cwd()/uploads` is ephemeral on Render/Fly stateless instances.
- **Impact:** **File loss on deploy/restart.**

#### B12 — Upload service trusts client-supplied `mimetype`
- **Location:** `backend/src/upload/upload.service.ts:73`
- **Issue:** No magic-byte sniffing, no antivirus. Renaming a `.exe` to `.pdf` and changing Content-Type passes the allowlist.
- **Impact:** **Malware upload trivial.**

#### B13 — `auth.register` is `@Public()`
- **Location:** `backend/src/auth/auth.controller.ts:24-30`
- **Issue:** Anyone on the public internet can self-register. No email verification, no invite flow, no captcha.
- **Impact:** Public signup, no verification.

#### B14 — Auto-provisioned student users get a hardcoded weak default password
- **Location:** `backend/src/students/students.service.ts:249`
- **Issue:** `bcrypt.hash('Student@123', 10)`. No force-reset on first login.
- **Impact:** **Mass credential leak.**

---

### HIGH — Logic / Data Integrity Bugs

#### B15 — `loadUser` picks only the first establishment
- **Location:** `frontend/src/store/auth-store.ts:84`
- **Issue:** `const establishmentId = userData.userRoles?.[0]?.establishmentId`. A user with access to 3 schools always defaults to the first. No UI to switch between them is consistent.
- **Impact:** UX bug; users on wrong tenant.

#### B16 — Seed `TRUNCATE` calls outside any transaction
- **Location:** `backend/prisma/seed.ts:184-233`
- **Issue:** 50 raw `TRUNCATE TABLE` calls without `$transaction`. If seed crashes mid-way, the DB is left half-empty.
- **Impact:** Unrecoverable broken DB on seed crash.

#### B17 — Lesson titles contain garbage data
- **Location:** `backend/prisma/seed.ts:167`
- **Issue:** Index 14: `'La殖民isation'` (Chinese characters in French title).
- **Impact:** UI shows nonsense lesson title.

#### B18 — Country/currency/address incoherence in seed
- **Location:** `backend/prisma/seed.ts:98-103, 133-144` + `schema.prisma:427`
- **Issue:** Seed sets `country: 'TN'` (Tunisia) but addresses are all Algerian (`Alger, Oran, Constantine, Tlemcen...`). Currency enum is `TND/EUR/USD/DZD` and `defaultCurrency: 'DZD'` is Algerian Dinar.
- **Impact:** Confused domain — TND currency, Algerian addresses, Tunisian country.

#### B19 — `data-table.tsx` is 1290 lines in one file
- **Location:** `frontend/src/components/ui/data-table.tsx`
- **Issue:** Massive monolith — every page using `<DataTable>` ships the entire logic tree.
- **Impact:** Bundle bloat; untestable.

#### B20 — `useEffect`-based auth guard in dashboard layout
- **Location:** `frontend/src/app/(dashboard)/layout.tsx:44-59`
- **Issue:** Page renders for one frame, then redirects. Causes content flash and async race on `/admin/*` for non-root users.
- **Impact:** Flash of unauthorized content.

#### B21 — `i18n-provider.tsx` hardcodes default locale to `'fr'` on SSR
- **Location:** `frontend/src/components/providers/i18n-provider.tsx:23, 38`
- **Issue:** Only flips via `useEffect`. Arabic users see French HTML for the first frame, then snap to RTL. **No RTL layout support in components.**
- **Impact:** Broken Arabic UX; layout shift.

#### B22 — Two i18n systems in the project
- **Location:** `frontend/package.json:19` + `components/providers/i18n-provider.tsx`
- **Issue:** `next-intl` is in `package.json` AND a custom `I18nProvider` is implemented. The custom one is used. `next-intl` is dead weight or partially wired.
- **Impact:** Confusion, doubled maintenance.

#### B23 — Dashboard hardcoded fallback stats
- **Location:** `frontend/src/app/(dashboard)/dashboard/page.tsx:64-71, 80-84`
- **Issue:** Hardcodes 642 students, 48 teachers, 24 classes, 184,500 TND revenue, 96.4% attendance as initial values. `.catch(() => ({ data: { meta: { total: 642 } } }))` fallbacks perpetuate the lie on API failure. Violates "Zero Mock Data" rule.
- **Impact:** Demo data shown to clients as real.

#### B24 — API interceptor caches in-flight requests in unbounded Map
- **Location:** `frontend/src/lib/api.ts:55-83`
- **Issue:** Cache never evicts (only cleared on completion). On long sessions with rapid navigation, this map grows unbounded.
- **Impact:** Memory leak over time.

#### B25 — Student `username` collision on auto-create
- **Location:** `backend/src/students/students.service.ts:253`
- **Issue:** `username: dto.email.split('@')[0]`. If two students in same tenant register with `ahmed@x.com` and `ahmed@y.com`, they get the same `username: 'ahmed'`. Username is `@unique` → second insert crashes.
- **Impact:** Bug on duplicate first-name emails.

#### B26 — Payment update allows mutating paid amounts
- **Location:** `backend/src/student-payments.service.ts:150-194`
- **Issue:** `update()` allows changing `amount` and `status` of an already-recorded payment. No immutability guard.
- **Impact:** No payment immutability.

---

### MEDIUM — Code Quality / Type Safety

#### B27 — 133 occurrences of `as any` across 35 files
- **Location:** 35 service files
- **Issue:** Type safety is effectively disabled in business logic. `as any` on enum fields (`status: dto.status as any`) means a typo `dto.status = 'PADE'` (instead of `'PAID'`) silently passes validation and corrupts data.
- **Impact:** Silent data corruption.

#### B28 — Magic strings for roles
- **Location:** Throughout (30+ places)
- **Issue:** `'STUDENT'`, `'ADMIN'`, `'SUPER_ADMIN'` instead of a TS enum. Renaming a role code = manual search/replace.
- **Impact:** Refactor hazard.

#### B29 — No centralized `where` filter helper
- **Location:** All `findAll` methods
- **Issue:** Every service manually checks `if (X && X !== 'ALL')`. ~50 lines of repeated code per service.
- **Impact:** Maintenance burden, easy to forget.

#### B30 — No centralized `actorSnapshot` builder
- **Location:** All service files (20+ duplications)
- **Issue:** Duplicated ~100 lines: `` `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || ''}) [${user.role || 'USER'}]`.trim() ``.
- **Impact:** Duplicated code.

#### B31 — `console.warn` / `console.log` in services instead of injected Logger
- **Location:** `student-attendance.service.ts:81, 162`; `financial-transactions.service.ts:164`; `seed.ts` (155 calls)
- **Issue:** Logging not structured, can't be redirected.
- **Impact:** Observability gap.

#### B32 — `as any` type erasure cascades into entity wrappers
- **Location:** 30+ services
- **Issue:** `entities = data.map((item) => new StudentEntity(item as any))` — the entity class doesn't actually validate, just wraps. Defeats the purpose.
- **Impact:** Entities provide no validation.

#### B33 — `Tenant` model has no `name`, `slug`, `billingEmail`, or `displayName`
- **Location:** `schema.prisma:176-194`
- **Issue:** Display in admin UI requires joining through User every time.
- **Impact:** Awkward UI rendering.

#### B34 — No `updatedBy` field on most entities
- **Location:** `schema.prisma`
- **Issue:** `StudentPayment`, `Note`, `Session` etc. have no `updatedBy`. Only `createdBy`. You can't audit *who edited it last*.
- **Impact:** Audit gap.

#### B35 — `Session` model has no index on `date`
- **Location:** `schema.prisma` (Session section)
- **Issue:** Bulk attendance queries filter by date range without index.
- **Impact:** Slow date-range queries.

---

### FRONTEND-SPECIFIC

#### B36 — No `loading.tsx` / Suspense boundaries per route
- **Location:** All `(dashboard)/*` routes
- **Issue:** Every page uses `useState` + `useEffect` pattern. Skeleton shown only on dashboard layout, not per page.
- **Impact:** No smooth loading per page.

#### B37 — `useEffect` data fetches without `AbortController`
- **Location:** All `useEffect` data loads
- **Issue:** Fast navigation between tabs causes race conditions where stale data overwrites fresh.
- **Impact:** Stale data flashes.

#### B38 — `api.get` deduplication key includes token + estId + tenantId
- **Location:** `frontend/src/lib/api.ts:55-83`
- **Issue:** If user switches tenant, the cached `Promise` is returned with old tenant context.
- **Impact:** Stale tenant data after switch.

#### B39 — Tailwind 4 is bleeding-edge
- **Location:** `frontend/package.json:34`
- **Issue:** Released 2025. Browser support quirks + PostCSS plugin churn.
- **Impact:** Stability risk.

#### B40 — `next-themes` + custom theme flicker
- **Location:** `app/layout.tsx:13` + theme provider
- **Issue:** The `<html className="antialiased">` in root layout will flicker on theme load.
- **Impact:** FOUC (Flash of Unstyled Content).

#### B41 — No `aria-label`, `role`, `tabindex` on most custom interactive components
- **Location:** All UI components
- **Issue:** Cards used as buttons, modals. Lighthouse a11y will fail.
- **Impact:** Accessibility non-compliant.

#### B42 — `dynamic-enums` orphaned or inconsistent usage
- **Location:** `dynamic-enums/`
- **Issue:** Schema-driven dropdowns vs static enums are inconsistent across the UI.
- **Impact:** Inconsistent UX.

#### B43 — `command-palette.tsx` unclear wiring
- **Location:** `frontend/src/components/command-palette.tsx`
- **Issue:** Likely a stub. Can't tell if wired to actual navigation actions.
- **Impact:** Feature unclear.

#### B44 — Three.js for 3D scenes (~600KB)
- **Location:** `frontend/src/components/ui/hero-3d-scene.tsx`
- **Issue:** Used on landing only but ships in main bundle.
- **Impact:** Bundle bloat.

#### B45 — `framer-motion@13` (~150KB) for animations
- **Location:** `frontend/package.json:16`
- **Issue:** Combined with `three` and `recharts` the frontend bundle is heavy.
- **Impact:** Bundle perf.

---

### DEVOPS / INFRASTRUCTURE

#### B46 — `postinstall: "prisma generate && nest build"`
- **Location:** `backend/package.json:36`
- **Issue:** Runs full TypeScript build on every `npm install`. Breaks Docker layer caching, slows CI by 30s+.
- **Impact:** Slow CI, broken Docker cache.

#### B47 — No `Dockerfile` in repo
- **Location:** (missing)
- **Issue:** No `docker-compose.yml`. Deploying to anything other than Render/Vercel requires writing infra from scratch.
- **Impact:** Vendor lock-in.

#### B48 — No `/.github/workflows/*.yml`
- **Location:** (missing)
- **Issue:** No CI. No lint, no test, no build on PR.
- **Impact:** No quality gate.

#### B49 — `render.yaml` only has backend service
- **Location:** `render.yaml`
- **Issue:** Frontend on Vercel assumed but no `vercel.json`.
- **Impact:** No frontend deploy config in repo.

#### B50 — No `/health`, `/health/db`, `/ready` endpoint
- **Location:** (missing)
- **Issue:** Render/Fly/k8s will mark the service healthy even if Postgres is down.
- **Impact:** Blind to outages.

#### B51 — Prisma connection pooling has no explicit config
- **Location:** `backend/src/prisma/prisma.service.ts:13-15`
- **Issue:** Uses `@prisma/adapter-pg` directly. Defaults to 10. Under load, requests will queue.
- **Impact:** Performance under load.

#### B52 — `@nestjs/mau` dependency never registered
- **Location:** `backend/package.json:73`
- **Issue:** Mau = NestJS analytics/telemetry in devDependencies but never registered in `app.module.ts`.
- **Impact:** Dead dep.

---

## What Works Fine (the good)

1. **Schema depth** — 45+ models with proper FKs, soft-delete (`isDeleted/deletedAt/deletedBy`), audit columns (`createdBy/updatedBy`).
2. **Module architecture** — NestJS controllers/services/DTOs separation consistently applied. Swagger fully wired.
3. **Multi-tenancy design intent** — `x-establishment-id` header injection + middleware stripping "ALL" sentinel values.
4. **Soft delete + restore + permanent delete (ROOT only)** — implemented with audit log entries on every transition.
5. **Login attempt logging** — every success/failure with IP and user-agent to `LoginLog`.
6. **Custom design system** — `DESIGN_SYSTEM.md` enforces 5-color solid palette with zero gradients.
7. **i18n** — `next-intl` + custom dictionaries for FR/EN/AR.
8. **JWT + refresh tokens** — Bearer strategy, refresh endpoint, refresh-on-401 interceptor.
9. **Auto-create user account when creating student** — provisions login + assigns STUDENT role in one transaction.
10. **ErrorBoundary, Toast provider, ScrollToTop** — basic UX safety nets present.
11. **Permission-driven route guard** — maps route → permission code; redirects unauthorized users.
12. **`.gemini/` hub** — SUBAGENTS, DESIGN_SYSTEM, DEPLOYMENT, implementation_plan, walkthrough.
13. **`@Public()` decorator pattern** for selective auth bypass.

---

## Missing Pieces (by category)

| Category | Missing |
|---|---|
| **Security** | 2FA, password reset, email verification, rate limiting (express-rate-limit/throttler), helmet, CSRF, refresh-token rotation, refresh-token revocation list, separate refresh secret, encrypted secrets at rest, JWT `establishmentId` claim + server-side check |
| **Multi-tenancy** | TenantGuard interceptor, `establishmentId` in JWT, quota enforcement per `SaaSPlan`, automated tenant onboarding flow |
| **LMS Features** | Online exam engine + anti-cheat, Question bank, Meeting scheduler, Promotion wizard, Gradebook avg, Transcript export, Lesson plans viewer, Push notifications (web push) |
| **Finance** | Stripe/PayPal checkout flow, Late-fee auto-calc, Receipt PDF generation, Invoice numbering |
| **Communication** | Email queue (Bull/BullMQ), SMS integration (Twilio), in-app realtime (Socket.IO/WS) |
| **Scheduling** | Class schedule conflict detection, Teacher availability, Room booking conflicts |
| **Reporting** | PDF reports, Excel export, scheduled email reports |
| **DevOps** | Dockerfile, docker-compose, GitHub Actions CI, Sentry, Pino structured logging, Redis, BullMQ worker, `.nvmrc`, health/readiness endpoints |
| **Frontend** | Vitest + RTL setup, Storybook, Playwright e2e, Lighthouse pass, a11y audit (axe-core), loading skeletons per route, error states per route, offline fallback (PWA) |
| **Testing** | Backend: 13 → target 60+ unit, 30+ e2e; Frontend: 0 → target 70% coverage on critical paths |
| **Documentation** | API consumer guide, deployment runbook, disaster recovery, GDPR/DPA template |

---

## Priority Order — What Must Be Done First

### Phase 1 — STOP THE BLEEDING (Week 1, non-negotiable before any sale)

1. Remove hardcoded JWT_SECRET fallback — fail-fast if env var missing. Add `JWT_REFRESH_SECRET`. (`app.module.ts:133`, `auth.service.ts:134`)
2. Embed `establishmentId` in JWT + server-side TenantGuard — kill header-trust model.
3. Lock CORS to exact origins — remove the `.vercel.app` wildcard suffix match.
4. Make `/auth/register` admin/invite-only — kill public registration.
5. Add rate limiting on `/auth/login` — `@nestjs/throttler`.
6. Add `helmet` + secure cookie config.
7. Encrypt `SmtpConfig.password`, `stripeSecret`, `paypalSecret` at rest.
8. Generate random temp password for auto-provisioned student users + force first-login reset.

### Phase 2 — MAKE IT A REAL LMS (Week 2-3)

9. Build `/api/meetings` module.
10. Build `/api/dashboard/stats` aggregate endpoint — stop the dashboard hardcoded mocks.
11. Build gradebook average + bulletin generator.
12. Build student promotion wizard endpoint.
13. Add password reset flow + email verification.
14. Add 2FA (TOTP) for Admin/SuperAdmin.
15. Wire Stripe/PayPal for SaaS subscription payments.
16. Add pagination max (`Math.min(limit, 100)` server-side).
17. Add Redis + cache hot list endpoints.

### Phase 3 — PRODUCTION HARDENING (Week 4-6)

18. Write Dockerfile + docker-compose (Postgres + Redis + backend + frontend).
19. GitHub Actions CI: lint + test + build on every PR.
20. Backend tests: 60+ unit + 30+ e2e (Supertest).
21. Frontend tests: Vitest + RTL for critical paths.
22. Playwright e2e for top 5 user journeys.
23. Sentry + Pino structured logging + Loki/Grafana.
24. Health/readiness endpoints + k8s probes.
25. DB migration to add missing indexes.
26. BullMQ workers for email queue, payment reminders, attendance alerts.
27. Accessibility audit (axe-core) on all 38+ pages.

### Phase 4 — DIFFERENTIATE (Week 7+)

28. Online exam engine with question bank, timer, anti-cheat.
29. Parent-teacher meeting booking with calendar slot picker.
30. Realtime notifications via WebSocket.
31. PDF report generation for bulletins, invoices, transcripts.
32. Mobile-first redesign of student/parent portal.
33. Multi-language UI completeness — Arabic RTL pass.
34. Storybook for design system documentation.
35. PWA for offline access to bulletins/notes.

---

## Buyer Verdict

**What I'd pay:** Not yet. The schema and architecture give me confidence you understand the domain, but the security posture and missing features mean I'd need to invest 6-8 weeks of hardening before I could put this in front of a paying school.

**What I'd negotiate:** If you fixed Phase 1 (security) and Phase 2 (core LMS features — meetings, gradebook, promotion, password reset, 2FA, Stripe wired), I would pay a fair price for the codebase as a foundation to build on. The `.gemini/` hub alone is worth real money to a buyer — most teams don't ship with that level of architectural documentation.

**What I'd demand before signing:**
- Security audit (OWASP top 10 + tenant-isolation penetration test).
- Coverage report (≥60% backend, ≥40% frontend).
- Working demo with 2 live tenants in 2 different countries showing isolation works.
- 90-day bug-fix SLA on criticals.

**Honest take:** This is a codebase of an experienced team that's gone deep on data modeling and UI breadth but skipped the boring-but-essential parts (security, tests, devops). The bones are good. The muscles and armor aren't there yet.

---

## Codebase Inventory

- **Backend TS files:** ~670 KB across 70+ NestJS modules
- **Frontend TS/TSX files:** ~1.35 MB across 38+ dashboard pages
- **Backend spec files:** 13 (vs 70+ modules → ~18% coverage)
- **Backend e2e files:** 1
- **Frontend test files:** 0
- **`as any` occurrences:** 133 across 35 files
- **Console.* in services:** 3 (low — good)
- **TODO/FIXME markers:** 0 (good)
- **Database models:** 45+
- **SaaS plans:** 4 (Free, Basic 50 TND, Premium 150 TND, Enterprise 500 TND)
- **Default seeded super-admin:** `bsofts.contact@gmail.com` / `Ahmed123*` ⚠️
- **Default seeded tenants:** `tenant1@bsofts.com`, `tenant2@bsofts.com` / `Admin@123` ⚠️

---

## Companion Document

For the full remediation plan with assigned agents, skills, deliverables, and acceptance criteria, see:

`REMEDIATION_PLAN_v4.0.md`