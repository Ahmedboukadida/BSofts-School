# BSofts-School — Live System Status

> Current operational health, verified baseline metrics, route verification, and deployment status.  
> **Last Verified**: 2026-09-22

---

## 1. System Baseline Metrics

| Metric | Verified Value | Status |
| :--- | :---: | :---: |
| **Prisma Models** | 68 | ✅ Synced to Neon Cloud |
| **Prisma Enums** | 31 | ✅ Synced to Neon Cloud |
| **Backend Modules** | 53 | ✅ Clean DI graph |
| **Backend Controllers** | 52 | ✅ Swagger docs generated |
| **Backend Services** | 53 | ✅ 100% compilation pass |
| **Frontend Routes** | 41 | ✅ 0 ESLint errors |
| **TypeScript Strictness** | Zero `any` in DTOs | ✅ Pass |
| **Backend Build** | `nest build` | ✅ Exit Code 0 |
| **Frontend Build** | `next build` (Turbopack) | ✅ Exit Code 0 |

---

## 2. Infrastructure & Endpoints Status

| Component | Target URL | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Neon PostgreSQL** | `ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech` | 🟢 Online | 68 tables, 45 models with soft-delete & audit fields |
| **Render Backend** | `https://bsofts-school.onrender.com` | 🟢 Online | NestJS on `0.0.0.0:10000`, CORS configured |
| **Vercel Frontend** | `https://bsofts-school.vercel.app` | 🟢 Online | Next.js 16.3.4, dynamic baseUrl detection |
| **Swagger UI** | `https://bsofts-school.onrender.com/swagger` | 🟢 Online | Documented REST API endpoints |
| **Local Backend** | `http://localhost:3025` | 🟢 Ready | Dev environment |
| **Local Frontend** | `http://localhost:3026` | 🟢 Ready | Dev environment |

---

## 3. Frontend Route Verification Summary

* **Dashboard Core**: `/dashboard` (Live stats need server aggregation).
* **Admin Platform**: `/admin/tenants` (Active), `/admin/subscriptions` (Active), `/admin/plans` (Active), `/admin/modules` (Active), `/admin/roles` (Active), `/admin/permissions` (Active), `/admin/functions` (Pending backend module), `/admin/settings` (Active with Dynamic SMTP), `/admin/audit-logs` (Active), `/admin/system-logs` (Needs PATCH resolve).
* **Academic & People**: `/students` (Active), `/teachers` (Active), `/parents` (Active), `/employees` (Active, DTO being aligned), `/classes` (Active, DTO being aligned), `/classes/promotion` (Active), `/establishments` (Active), `/rooms` (Active, DTO being aligned), `/academic-modules` (Active, DTO being aligned), `/exams` (Active), `/homework` (Active).
* **Portals**: `/portal/student` (Active), `/portal/teacher` (Active), `/portal/parent` (Active).
* **Finance**: `/payments` (Active), `/payments/caisse` (Active).
* **Schedule & Attendance**: `/schedule` (Active), `/attendance` (Active), `/holidays` (Active).
* **Communication**: `/community/messages` (Routing to `/messages`), `/community/notifications` (Routing to `/notifications`), `/community/meetings` (Pending module).
* **User Settings**: `/settings` (Needs `PUT /auth/profile` and `PUT /auth/change-password`).
