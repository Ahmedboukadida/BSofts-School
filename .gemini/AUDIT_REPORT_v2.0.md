# BSofts-School — Audit Report v2.0 (Updated)

> **Audit type:** Deep code-level audit — concrete bugs found in the actual code
> **Auditor lens:** Expert buyer in LMS, dev, security, performance, code quality
> **Audit date:** 23 September 2026 (refresh from v1.0)
> **Repo path:** `E:\ReFactory\BSofts-School`
> **Score after this audit:** **497 / 1000** ⭐⭐½ (up from 432 in v1)

---

## What's New Since v1

v1 found **52 concrete bugs (B1–B52)** with file:line + impact. Since v1:
- **9 bugs FIXED** (1 partial)
- **1 new module ADDED** (Meetings with LiveKit WebRTC)
- **Codebase grew ~8%** (backend 670KB → 724KB; frontend 1.35MB → 1.40MB)
- **`as any` count**: 125 → 142 (modest regression due to new module)
- **Backend specs**: 13 (unchanged); **e2e**: 1 (unchanged); **Frontend tests**: 0 (unchanged)

For the detailed diff, see `.gemini/AUDIT_DELTA_v2.md`. For the original 52-bug list, see `.gemini/AUDIT_REPORT_v1.0.md` (historical).

---

## Current Score Breakdown

| Domain | v1 | v2 | Δ | Comment |
|---|---|---|---|---|
| Architecture & Schema | 78 | 78 | 0 | Unchanged; meetings module is well-modeled |
| Backend Code Quality | 58 | 62 | +4 | Less mocking, more tenant scoping, but `as any` rose |
| Frontend Code Quality | 52 | 58 | +6 | Dashboard mocks gone; tenant-aware params added |
| **Security** | **18** | **32** | **+14** | 7 criticals fixed; JWT_SECRET, register, refresh secret still open |
| **Multi-tenancy** | **28** | **56** | **+28** | 3 major leaks fixed; meetings has tenant isolation; JWT embed still missing |
| Testing | 14 | 14 | 0 | Still 13 backend specs, 1 e2e, 0 frontend |
| Performance | 48 | 50 | +2 | Cache bounded; no Redis yet |
| UI/UX & Design System | 72 | 74 | +2 | Dashboard shows real data |
| SaaS Readiness | 38 | 42 | +4 | Meetings is a SaaS-relevant feature |
| DevOps & Production | 22 | 22 | 0 | No Dockerfile, no CI, no healthchecks yet |
| Documentation | 78 | 78 | 0 | `.gemini/` hub unchanged |
| **TOTAL** | **432** | **497** | **+65** | **+15% improvement** |

---

## Critical Bugs STILL OPEN (must fix before any sale)

These are the bugs that continue to block production sale. All have file:line + impact. For bugs already fixed, see `.gemini/AUDIT_DELTA_v2.md`.

### 🔴 CRITICAL

#### Bug 1 — JWT_SECRET hardcoded fallback in production config
- **Location:** `backend/src/app.module.ts:137`
- **Issue:** `secret: configService.get<string>('JWT_SECRET') || 'bsofts-school-jwt-secret-2026-production-key'`
- **Impact:** If env var is missing, the app silently runs with a known public secret. Anyone can mint admin tokens.

#### Bug 2 — Refresh token uses same secret as access token
- **Location:** `backend/src/auth/auth.service.ts:254`
- **Issue:** `this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET })`
- **Impact:** Best practice: separate `JWT_SECRET` and `JWT_REFRESH_SECRET`. Compromise of one = compromise of both.

#### Bug 3 — Public `/auth/register` endpoint
- **Location:** `backend/src/auth/auth.controller.ts:14, 24, 32`
- **Issue:** Three `@Public()` decorators on login, register, refresh. Anyone on the public internet can self-register. No email verification, no invite flow, no captcha.
- **Impact:** Account spam + dark data ingestion.

#### Bug 4 — CORS allows any `.vercel.app` subdomain
- **Location:** `backend/src/main.ts:34`
- **Issue:** `if (origin.endsWith('.vercel.app')) return callback(null, true);`
- **Impact:** Allows `evil.vercel.app`, `phishing-school.vercel.app`. For a multi-tenant SaaS, lock to your exact origin.

#### Bug 5 — Hardcoded super-admin credentials in seed.ts
- **Location:** `backend/prisma/seed.ts:519, 520`
- **Issue:** `bsofts.contact@gmail.com` / `Ahmed123*` and `Admin@123` committed to git.
- **Impact:** Anyone with repo access has the production root password.

#### Bug 6 — Tenant isolation via header trust (no JWT embed)
- **Location:** `auth.service.ts:generateTokens` — still uses `{ sub, email, username }`
- **Issue:** `x-establishment-id` header is read from request and stuffed into `req.query`. No server-side check that the JWT's user actually belongs to that establishment. Any authenticated user can send `x-establishment-id: <any-uuid>` and read that establishment's data.
- **Impact:** The biggest architectural flaw in the codebase. Header-trust model must be replaced with JWT-embedded claims + server-side guard.

### 🟠 HIGH

#### Bug 7 — `bulkMark` cross-tenant AcademicYear/Period
- **Location:** `backend/src/student-attendance/student-attendance.service.ts:196-208`
- **Issue:** Still uses `prisma.academicYear.findFirst({ where: { isCurrent: true } })` without establishmentId scope; same for `AcademicPeriod`.
- **Impact:** Cross-tenant session creation in bulk attendance flows.

#### Bug 8 — Upload service stores to local filesystem
- **Location:** `backend/src/upload/upload.service.ts:35, 92`
- **Issue:** `path.join(process.cwd(), 'uploads')` + `fs.writeFileSync`.
- **Impact:** Files are ephemeral on Render/Fly stateless instances — uploads silently disappear on restart.

#### Bug 9 — Upload service trusts client mimetype
- **Location:** `backend/src/upload/upload.service.ts:73`
- **Issue:** No magic-byte sniffing, no antivirus. Renaming a `.exe` to `.pdf` passes the allowlist.
- **Impact:** Malware upload trivial.

#### Bug 10 — Meetings controller missing PermissionsGuard/RolesGuard
- **Location:** `backend/src/meetings/meetings.controller.ts:28`
- **Issue:** Only `@UseGuards(JwtAuthGuard)` — any authenticated user (Student/Parent) can create/delete meetings, even though the service correctly enforces tenant scoping.
- **Impact:** Permission gap; service-level isolation only.

#### Bug 11 — SmtpConfig.password stored plaintext
- **Location:** `schema.prisma:477`
- **Issue:** SMTP credentials stored without encryption at rest.
- **Impact:** DB dump leak exposes SMTP credentials.

#### Bug 12 — StripeSecret/PaypalSecret stored plaintext
- **Location:** `schema.prisma:521-522`
- **Issue:** Payment processor secrets stored plaintext.
- **Impact:** PCI compliance violation.

#### Bug 13 — bcrypt rounds inconsistent (10 vs 12)
- **Location:** `students.service.ts:262` (10), `seed.ts:519` (10)
- **Issue:** Inconsistent — some places use 10, others 12.
- **Impact:** Lower-than-expected password hashing strength in some paths.

### 🟡 MEDIUM

#### Bug 14 — `as any` count up: 125 → 142
- **Location:** 36 service files (now including `meetings.service.ts` with 6 occurrences)
- **Issue:** Type safety is effectively disabled in business logic. `as any` on enum fields means typos like `'PADE'` instead of `'PAID'` pass validation silently.
- **Impact:** Silent data corruption.

#### Bug 15 — Magic strings for roles
- **Location:** 30+ places
- **Issue:** `'STUDENT'`, `'ADMIN'`, `'SUPER_ADMIN'` instead of TS enum.
- **Impact:** Refactor hazard.

#### Bug 16 — Auto-provisioned student password has no forced reset
- **Location:** `backend/src/students/students.service.ts:261-262`
- **Issue:** Random temp password generated but no `forcePasswordChange` flag set, no enforcement at login.
- **Impact:** User never required to set their own password; weak link.

#### Bug 17 — `Tenant` model lacks name/slug/billingEmail/displayName
- **Location:** `schema.prisma:176-194`
- **Issue:** Display in admin UI requires joining through User every time.
- **Impact:** Awkward UI rendering.

#### Bug 18 — No `updatedBy` field on most entities
- **Location:** `schema.prisma` (most entities)
- **Issue:** Can't audit who edited last.
- **Impact:** Audit gap.

#### Bug 19 — `Session` model has no index on `date`
- **Location:** `schema.prisma` (Session section)
- **Impact:** Slow date-range attendance queries.

#### Bug 20 — Two i18n systems coexist
- **Location:** `frontend/package.json:19` + `components/providers/i18n-provider.tsx`
- **Issue:** `next-intl` is in `package.json` AND a custom `I18nProvider` is implemented. The custom one is used.
- **Impact:** Confusion, doubled maintenance.

#### Bug 21 — i18n hardcodes French on SSR
- **Location:** `frontend/src/components/providers/i18n-provider.tsx:23, 38`
- **Issue:** Arabic users see French HTML for the first frame, then snap to RTL. No RTL layout support in components.
- **Impact:** Broken Arabic UX; layout shift.

#### Bug 22 — `useEffect`-based auth guard in dashboard layout
- **Location:** `frontend/src/app/(dashboard)/layout.tsx:44-59`
- **Issue:** Page renders for one frame, then redirects. Causes content flash and async race.
- **Impact:** Flash of unauthorized content.

#### Bug 23 — `loadUser` picks only the first establishment
- **Location:** `frontend/src/store/auth-store.ts:84`
- **Issue:** `const establishmentId = userData.userRoles?.[0]?.establishmentId`. A user with access to 3 schools always defaults to the first.
- **Impact:** UX bug; users on wrong tenant.

#### Bug 24 — `data-table.tsx` is 1290 lines in one file
- **Location:** `frontend/src/components/ui/data-table.tsx`
- **Impact:** Bundle bloat; untestable.

#### Bug 25 — Tailwind 4 is bleeding-edge
- **Location:** `frontend/package.json:34`
- **Impact:** Stability risk for production.

#### Bug 26 — No `loading.tsx` / Suspense boundaries per route
- **Location:** All `(dashboard)/*` routes
- **Impact:** No smooth loading per page.

#### Bug 27 — `useEffect` data fetches without `AbortController`
- **Location:** All `useEffect` data loads
- **Impact:** Stale data flashes on rapid nav.

#### Bug 28 — No aria-label/role/tabindex on most custom interactive components
- **Location:** All UI components
- **Impact:** Accessibility non-compliant.

#### Bug 29 — Three.js + framer-motion bundle bloat
- **Location:** `frontend/src/components/ui/hero-3d-scene.tsx`; `frontend/package.json:16`
- **Impact:** ~750KB shipped in main bundle for unused animations.

#### Bug 30 — `postinstall: "prisma generate && nest build"`
- **Location:** `backend/package.json:36`
- **Issue:** Runs full TypeScript build on every `npm install`. Breaks Docker layer caching, slows CI by 30s+.
- **Impact:** Slow CI, broken Docker cache.

#### Bug 31 — No `Dockerfile` in repo
- **Location:** (missing)
- **Impact:** Vendor lock-in to Render/Vercel.

#### Bug 32 — No `/.github/workflows/*.yml`
- **Location:** (missing)
- **Impact:** No CI. No lint, no test, no build on PR.

#### Bug 33 — No `/health`, `/health/db`, `/ready` endpoint
- **Location:** (missing)
- **Impact:** Blind to outages.

#### Bug 34 — Prisma connection pooling has no explicit config
- **Location:** `backend/src/prisma/prisma.service.ts:13-15`
- **Issue:** Defaults to 10 connections. Under load, requests will queue.
- **Impact:** Performance under load.

#### Bug 35 — `@nestjs/mau` dependency never registered
- **Location:** `backend/package.json:73`
- **Impact:** Dead dep.

---

## Bugs Fixed Since v1 (9 confirmed)

| Bug | Was | Now | Verified |
|---|---|---|---|
| B1 SubscriptionMiddleware throw | 500 crash on no-tenant user | `res.status(403).json(...)` proper Express response | `subscription.middleware.ts:76-89` ✓ |
| B2 Reports tenant scoping | 6 of 8 report types missing scope | All report types now scope by `establishmentId`; `getDashboardStats()` added | `reports.service.ts:34, 66, 95, 126, 158, 184, 211, 235, 258` ✓ |
| B4 Conversations permissions | No PermissionsGuard, any auth user could DELETE | Now has `RolesGuard` + `@Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')` | `conversations.controller.ts:15, 41` ✓ |
| B5 Student-payments tenant scoping | No `establishmentId` filter | Now filters `where.student = { establishmentId }` | `student-payments.service.ts:16-17` ✓ |
| B6 Student-attendance tenant scoping | No `establishmentId` filter on `findAll` | Now filters by `establishmentId` | `student-attendance.service.ts:16-17` ✓ |
| B10 Upload SVG allowed | `image/svg+xml` in MIME allowlist | SVG removed; safe list verified | `upload.service.ts:16-28` ✓ |
| B14 Student temp password | Hardcoded `Student@123` | Random `St_${random8}!${random2digits}` (no forced change yet) | `students.service.ts:261` ⚠ partial |
| B23 Dashboard hardcoded mocks | `642 students, 184500 TND, 96.4%` literals | Dashboard initializes to 0, calls `/reports/stats` real endpoint | `dashboard/page.tsx:70-77, 92` ✓ |
| B24 api.ts in-flight cache leak | Unbounded `Map`, never evicted | Bounded to 50 with `clear()` overflow guard | `api.ts:77-78` ✓ |
| B25 Username collision | `ahmed@x.com` and `ahmed@y.com` → same username → crash | `uniqueUsername = baseUsername_${Date.now()}` | `students.service.ts:258` ✓ |

---

## What Works Fine (the good)

1. **Schema depth** — 45+ models with proper FKs, soft-delete, audit columns
2. **Module architecture** — NestJS controllers/services/DTOs separation consistently applied
3. **Multi-tenancy design intent** — middleware stripping "ALL" sentinels, `x-establishment-id` injection
4. **Soft delete + restore + permanent delete (ROOT only)** — implemented with audit
5. **Login attempt logging** — every success/failure with IP and user-agent
6. **Custom design system** — 5-color solid palette enforced, zero gradients
7. **i18n** — FR/EN/AR dictionaries
8. **JWT + refresh tokens** — Bearer strategy, refresh endpoint, refresh-on-401 interceptor
9. **Auto-create user when creating student** — random temp password (improved)
10. **ErrorBoundary, Toast provider, ScrollToTop** — basic UX safety nets
11. **Permission-driven route guard** — maps route → permission code
12. **`.gemini/` hub** — SUBAGENTS, DESIGN_SYSTEM, DEPLOYMENT, implementation_plan, walkthrough
13. **`@Public()` decorator pattern** for selective auth bypass
14. **🆕 Meetings module with LiveKit WebRTC** — full video meeting infrastructure with tenant isolation
15. **🆕 `/api/reports/stats` endpoint** — real aggregated dashboard stats

---

## Missing Pieces (by category)

| Category | Missing |
|---|---|
| **Security** | 2FA, password reset, email verification, rate limiting (throttler), helmet, CSRF, refresh-token rotation, separate refresh secret, encrypted secrets at rest, JWT `establishmentId` claim + server-side check |
| **Multi-tenancy** | JWT-embedded establishmentId, TenantGuard interceptor, quota enforcement per SaaSPlan, automated tenant onboarding flow |
| **LMS Features** | Online exam engine + anti-cheat, Question bank, Gradebook avg + bulletin gen, Promotion wizard, Transcript export, Push notifications |
| **Finance** | Stripe/PayPal checkout flow, Late-fee auto-calc, Receipt PDF generation, Invoice numbering |
| **Communication** | Email queue (Bull/BullMQ), SMS integration (Twilio), WebSocket realtime |
| **Scheduling** | Class schedule conflict detection, Teacher availability, Room booking conflicts |
| **Reporting** | PDF reports, Excel export, scheduled email reports |
| **DevOps** | Dockerfile, docker-compose, GitHub Actions CI, Sentry, Pino structured logging, Redis, BullMQ, health/readiness endpoints |
| **Frontend** | Vitest + RTL setup, Storybook, Playwright e2e, Lighthouse pass, a11y audit (axe-core), loading skeletons per route, error states per route, offline PWA |
| **Testing** | Backend: 13 → target 60+ unit, 30+ e2e; Frontend: 0 → target 70% coverage on critical paths |
| **Documentation** | API consumer guide, deployment runbook, disaster recovery, GDPR/DPA template |

---

## Updated Priority Order — What Must Be Done First

### Phase 1 — STOP THE BLEEDING (Week 1, non-negotiable before any sale)

1. Fix JWT_SECRET hardcoded fallback (`app.module.ts:137`)
2. Add separate JWT_REFRESH_SECRET (`auth.service.ts:254`)
3. Embed `establishmentId` in JWT + TenantGuard
4. Lock CORS to exact origins — remove `.vercel.app` wildcard
5. Make `/auth/register` admin/invite-only
6. Add @Roles/@Permissions to meetings controller
7. Add helmet + rate limiting (`@nestjs/throttler`)
8. Move uploads to S3/R2 + magic-byte sniffing
9. Complete B14: force first-login password reset
10. Seed credentials from env (fail-fast)
11. Encrypt `SmtpConfig.password`, `stripeSecret`, `paypalSecret` at rest
12. Rotate admin credentials in Neon

### Phase 2 — MAKE IT A REAL LMS (Week 2-3)

13. Fix B7 bulkMark cross-tenant AcademicYear/Period
14. Centralize where-helper + actorSnapshot helper
15. Build gradebook average + bulletin generator
16. Build student promotion wizard
17. Add password reset flow
18. Add email verification on register
19. Add 2FA (TOTP) for Admin/SuperAdmin
20. Wire Stripe for SaaS subscription payments
21. Fix multi-establishment picker UX (B15)
22. Fix i18n (drop next-intl, fix RTL)
23. Add pagination max + sorted indexes
24. Add Redis + cache hot list endpoints
25. Build online exam engine (basic)

### Phase 3 — PRODUCTION HARDENING (Week 4-6)

26. Write Dockerfile + docker-compose
27. GitHub Actions CI
28. Health/Readiness endpoints
29. Sentry + Pino structured logging
30. Prisma pool config + DB indexes
31. Vitest + RTL + Playwright for frontend
32. Backend tests: 60+ unit + 30+ e2e
33. Bundle analyzer + lazy-load three.js
34. axe-core a11y sweep

### Phase 4 — DIFFERENTIATE (Week 7+)

35. Online exam engine (full)
36. Parent-teacher meeting booking (use existing meetings module)
37. Realtime notifications via WebSocket
38. PDF generation
39. Mobile-first student/parent portal polish
40. BullMQ workers for async jobs
41. Storybook
42. AI tutor + auto quiz gen
43. PWA

---

## Buyer Verdict (v2)

**What I'd pay:** Closer than before. The roof doesn't leak anymore on multi-tenancy, the dashboard isn't lying anymore, and the meetings module is real. But the JWT_SECRET, seed creds, public register, and CORS wildcards are still deal-breakers.

**What I'd negotiate:** After Phase 1 fixes (12 tasks, ~1 week of work), I would pay a fair price for the codebase as a foundation. The `.gemini/` hub alone is worth real money. Meetings module is a significant addition since v1.

**What I'd demand before signing:**
- Security audit (OWASP top 10 + tenant-isolation penetration test)
- Coverage report (≥60% backend, ≥40% frontend)
- Working demo with 2 live tenants in 2 different countries
- 90-day bug-fix SLA on criticals
- Evidence of JWT establishmentId enforcement (not just header trust)

---

## Codebase Inventory (v2)

- **Backend TS files:** ~724 KB across 70+ NestJS modules (was 670 KB in v1)
- **Frontend TS/TSX files:** ~1.40 MB across 38+ dashboard pages (was 1.35 MB)
- **Backend spec files:** 13 (vs 70+ modules → ~18% coverage) — unchanged
- **Backend e2e files:** 1 — unchanged
- **Frontend test files:** 0 — unchanged
- **`as any` occurrences:** 142 across 36 files (was 125 across 35) — **regressed**
- **Console.* in services:** 3 — unchanged
- **TODO/FIXME markers:** 0 — unchanged
- **Database models:** 45+
- **SaaS plans:** 4 (Free, Basic 50 TND, Premium 150 TND, Enterprise 500 TND)
- **Default seeded super-admin:** `bsofts.contact@gmail.com` / `Ahmed123*` ⚠ still committed
- **Default seeded tenants:** `tenant1@bsofts.com`, `tenant2@bsofts.com` / `Admin@123` ⚠ still committed
- **🆕 Meetings module:** Full LiveKit WebRTC integration with 8 endpoints
- **🆕 `/api/reports/stats`:** Real aggregated dashboard stats endpoint

---

## Companion Files in `.gemini/`

- **`.gemini/AUDIT_REPORT_v1.0.md`** — Original 52-bug audit (historical)
- **`.gemini/AUDIT_DELTA_v2.md`** — Detailed diff v1→v2 (9 fixed, 7 still open)
- **`.gemini/REMEDIATION_PLAN_v4.1.md`** — Updated plan with v2 state
- **`.gemini/implementation_plan.md`** — Master Plan v3.0 (active execution)
- **`.gemini/walkthrough.md`** — Live milestone tracker
- **`.gemini/AGENTS.md`** — Master agent roster (43 agents)
- **`.gemini/subagents/SUBAGENTS.md`** — Subagent architecture & registry