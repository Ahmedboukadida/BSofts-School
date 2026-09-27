# BSofts School — Master Project Specification & Knowledge Graph

> Production Educational SaaS Management Platform (ERP, LMS, Timetabling, Multi-Caisse, Student Lifecycle, HRMS).  
> **Ground-Truth Baseline**: 2026-09-22

---

## 1. Executive Summary

**BSofts School** is an enterprise multi-tenant Educational Management Platform built for Tunisian schools and multi-campus institutions. It delivers:
* Academic Hierarchy (Cycles, ClassLevels, Classes, Matières with coefficients).
* 3-Tier Timetable Collision Prevention Engine (Teacher, Class, Room).
* Continuous Evaluation Math (40% CC + 60% Exam) & Bulletins with Rachat deliberation.
* Double-entry Multi-Caisse cash drawers with atomic inter-caisse transfers in millimes (TND).
* Multi-Tenancy Scoping (`x-tenant-id`, `x-establishment-id`, `x-academic-year-id`).
* Standardized Audit Trail (`createdBy`, `updatedBy`) and Soft-Delete (`isDeleted`, `deletedAt`, `deletedBy`) across 45 domain models.
* Dynamic Enum engine and Root Dynamic SMTP configuration.

---

## 2. Verified Ground-Truth Metrics (2026-09-22)

* **Prisma Models**: **68**
* **Prisma Enums**: **31**
* **Backend Modules**: **53** (including `DynamicEnumsModule`)
* **Backend Controllers**: **52**
* **Backend Services**: **53**
* **Frontend Routes**: **41** (Next.js 16.3.4 App Router with Turbopack)
* **Backend Compilation**: **PASS** (`npm run build` -> Exit Code 0)
* **Frontend Compilation**: **PASS** (`npm run build` -> Exit Code 0, 0 ESLint errors)
* **Neon PostgreSQL Database**: **68 tables deployed & synced**

---

## 3. Technology Stack

* **Backend**: NestJS 12 + TypeScript 6 + Prisma 7.10 + `@prisma/adapter-pg`
* **Database**: PostgreSQL 18 (Neon Serverless Cloud Pooler)
* **Frontend**: Next.js 16.3.4 + React 19 + Tailwind CSS v4 + Zustand + Axios
* **Internationalization**: Trilingual support (`fr`, `en`, `ar` with RTL layout support)
* **Deployment**:
  * Cloud Database: Neon PostgreSQL US-East-2
  * Cloud Backend: Render (`https://bsofts-school.onrender.com`)
  * Cloud Frontend: Vercel (`https://bsofts-school.vercel.app`)
  * Local: Backend `3025`, Frontend `3026`

---

## 4. Current Work: Master Plan v3.0

* **Wave 1**: Zero-Error Validation Shield (ValidationPipe softening + DTO alignment).
* **Wave 2**: Route Alignment & 404 Eradication (`/messages`, `/notifications`, `PUT /auth/profile`, `PUT /auth/change-password`, `MeetingsModule`, `SaasFunctionsModule`).
* **Wave 3**: Real Backend Aggregations (`GET /dashboard/stats`, `GET /reports/stats`).
* **Wave 4**: Dynamic Enum UI Wiring & Error Toast Feedback.
* **Wave 5**: Verification & Judger Panel Gate.
