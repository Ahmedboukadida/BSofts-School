# BSofts-School — Execution Progress & Milestones

> Chronological log of engineering sprints, schema upgrades, cloud deployments, and Master Plan v3.0 progress.  
> **Last Updated**: 2026-09-22

---

## 1. Completed Sprints & Milestones

### Phase 0: Cloud Deployment Pipeline (Completed)
- **Render Backend Deployment**: Resolved build failures by configuring `postinstall: "prisma generate && nest build"` and relocating `@types` packages to production dependencies. Verified binding to `0.0.0.0:10000`.
- **Neon Cloud Database Sync**: Deployed full 68-table schema to Neon PostgreSQL with zero data loss. Seeded Root Admin (`bsofts.contact@gmail.com`), initial Tenant, Establishment, and Academic Year.
- **Vercel Frontend Deployment**: Configured auto-detection of production backend (`https://bsofts-school.onrender.com/api`) in `api.ts`. Compiled 41 routes with 0 ESLint errors and 0 TypeScript compilation warnings.

### Phase 1: Database Schema Integrity (Completed — Commit `e38c581`)
- Added standardized audit fields (`createdBy String?`, `updatedBy String?`) and soft-delete fields (`isDeleted Boolean @default(false)`, `deletedAt DateTime?`, `deletedBy String?`) to all **45 domain models**.
- Validated and formatted schema with Prisma.
- Synced changes directly to Neon Cloud PostgreSQL via `npm run db:push:neon`.

### Phase 2: Dynamic Enums & Dynamic SMTP Engine (Completed — Commit `511aac3`)
- Created backend `DynamicEnumsModule` (`dynamic-enum.dto.ts`, `dynamic-enums.service.ts`, `dynamic-enums.controller.ts`, `dynamic-enums.module.ts`).
- Exposed category-scoped lookups: `GET /api/dynamic-enums/category/:category`.
- Built the Root Dynamic SMTP configuration UI in `frontend/src/app/(dashboard)/admin/settings/page.tsx` with live diagnostic test email sending via `POST /api/mail/test`.

---

## 2. In-Progress Sprint: Master Plan v3.0 (Zero-Error Hardening)

### Problem Discovery & Root Cause
- Discovered 400 Bad Request ("property X should not exist") caused by `forbidNonWhitelisted: true` in NestJS `AppValidationPipe`.
- Discovered DTO field divergences in Employees, Classes, Rooms, and Academic Modules.
- Discovered route mismatches on Community paths (`/community/messages`, `/community/notifications`) and missing auth endpoints (`PUT /auth/profile`, `PUT /auth/change-password`).

### Execution Pipeline
* [ ] **Wave 1**: Zero-Error Validation Shield (Set `forbidNonWhitelisted: false`, align DTOs and handle persistence in services).
* [ ] **Wave 2**: Route Alignment & 404 Eradication (`/messages`, `/notifications`, `PUT /auth/profile`, `PUT /auth/change-password`, `MeetingsModule`, `SaasFunctionsModule`).
* [ ] **Wave 3**: Real Backend Aggregations (`GET /dashboard/stats`, `GET /reports/stats`).
* [ ] **Wave 4**: Dynamic Enum UI Wiring & Error Toast Feedback.
* [ ] **Wave 5**: Verification & Judger Panel Gate.
