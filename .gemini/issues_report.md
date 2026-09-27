# BSofts-School — Frontend Issues Report & Remediation Status

> Comprehensive audit of all 41 routes cross-referenced against backend controllers.  
> Status updated: 2026-09-27

---

## 🔴 CRITICAL — Pages That Are Completely Broken (404 / No Backend)

| # | Route | Problem | Status | Resolution |
|---|-------|---------|--------|------------|
| C1 | `/admin/functions` | `GET/POST/PUT/DELETE /saas-functions` has no backend controller | **Pending** | Needs `SaasFunctionsModule` OR page retirement |
| C2 | `/community/messages` | Backend prefix was `/messages` | **RESOLVED** | Frontend updated to call `/messages` directly |
| C3 | `/community/notifications` | Backend prefix was `/notifications` | **RESOLVED** | Frontend updated to call `/notifications` directly |
| C4 | `/community/meetings` | No backend controller existed | **RESOLVED** | Implemented full `MeetingsModule` with LiveKit WebRTC, agenda voting, and speaking turns |
| C5 | `/settings` (user profile) | Missing `PUT /auth/profile` and `PUT /auth/change-password` | **RESOLVED** | Added `UpdateProfileDto` and `PUT /auth/profile` + `PUT /auth/change-password` with unit tests |
| C6 | `/reports` | Fake charts with hardcoded data and client-side sums | **RESOLVED** | Implemented `GET /reports/stats` and `GET /dashboard/stats` with PostgreSQL aggregations and Redis cache |

---

## 🟠 MAJOR — Features That Are Broken or Insecure

| # | Route | Problem | Status | Resolution |
|---|-------|---------|--------|------------|
| M1 | `/admin/subscriptions` | `approvedBy` was constructed client-side and sent in payload | **RESOLVED** | Backend now resolves approver identity from JWT token (`@CurrentUser()`) |
| M2 | `/admin/system-logs` | `handleMarkResolved` only updated local React state | **RESOLVED** | Added `resolved`, `resolvedAt`, `resolvedBy` to schema and created `PATCH /system-logs/:id/resolve` |
| M3 | `/dashboard` | Revenue stat fetched 200 payments and calculated in JS | **RESOLVED** | Created `GET /dashboard/stats` with PostgreSQL aggregation and 60s Redis cache |
| M4 | `/schedule` | Fetched sessions without date filtering | **RESOLVED** | Scoped `GET /sessions` call with active week's `startDate` and `endDate` |
| M5 | `/attendance` | Fetches full class entity via `GET /classes/:id` to extract roster | **Pending** | Scope class roster fetching |
| M6 | `/portal/teacher` | Same issue — `GET /classes/:id` over-fetches class aggregate | **Pending** | Scope to teacher's own assignments |

---

## 🟡 SYSTEMIC — Recurring Patterns Across Pages

### S1: Client-Side Pagination (~30 pages)
- **Status**: Backend fully supports `PaginationQueryDto` and `PaginatedDto`. Frontend DataTables will be transitioned from client pagination to query param server pagination.

### S2: Hardcoded Form Defaults in Create Modals
- **Status**: **RESOLVED**. Form creation defaults now dynamically resolve from `useEstablishmentStore` (`currentEstablishmentId`, `currentAcademicYearId`, `academicYears`) and `useAuthStore` across students, establishments, rooms, homework, etc.

### S3: Silent Error Handling (`.catch(() => {})`)
- **Status**: **RESOLVED**. All silent error swallowing blocks (`.catch(() => {})`) eliminated from frontend codebase. Every operation triggers feedback via `showToast.error()` or `showApiErrorToast()`.

### S4: Hardcoded Dropdown Options Instead of Dynamic Fetch (~10 pages)
- **Status**: In Progress. Wiring select inputs to `/dynamic-enums/category/:category` and domain CRUD endpoints.

### S5: Missing Backend Features
- **Status**: **RESOLVED** (Profile update, password change, dashboard stats, reports stats, system log resolution, meetings suite all implemented).

