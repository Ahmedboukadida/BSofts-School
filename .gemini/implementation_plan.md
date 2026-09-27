# BSofts-School — Implementation Plan (Master Plan v3.0)

> Technical Implementation Design for Zero-Error Hardening, DTO Synchronization, and 404 Route Eradication.

---

## 1. User Directives & Constraints

* **Strict 5-Color Solid Palette**: `#242F40` (Slate Navy), `#363636` (Charcoal), `#CCA43B` (Golden Bronze), `#E5E5E5` (Light Platinum), `#FFFFFF` (Pure White). Zero gradients.
* **No Remote Git Push**: All git commits must be made locally. The user will manually run `git push origin main`.
* **Zero Mock Data**: All dashboard views and tables must render from live database queries with clean empty states.
* **Currency**: Tunisian Dinar (TND) formatted with 3 decimal places for millimes.
* **Multi-Tenancy Scoping**: Strict header injection (`x-establishment-id`, `x-tenant-id`, `x-academic-year-id`).

---

## 2. Technical Modifications by Component

### Component 1: Validation Shield & DTOs (Backend)
- `backend/src/common/pipes/validation.pipe.ts`: Change `forbidNonWhitelisted: true` to `false`. Keep `whitelist: true`.
- `backend/src/employees/employee.dto.ts`: Add `matricule`, `department`, `contractType`, `salaryTnd`, `isActive`.
- `backend/src/employees/employees.service.ts`: Update `create()` to auto-create `EmployeeContract` when salary/contract are provided.
- `backend/src/classes/class.dto.ts`: Support `capacity`, `level`, `academicYear`, `isActive`, `roomName`, `mainTeacherName`.
- `backend/src/classes/classes.service.ts`: Add resolution from names to UUIDs for `classLevelId` and `academicYearId`.
- `backend/src/rooms/room.dto.ts`: Add `@IsOptional() @IsArray() equipment?: string[]`.
- `backend/src/academic-modules/academic-module.dto.ts`: Make `establishmentId` optional in DTO. Add `filiere`, `matieres`, `totalCoefficient`, `matieresCount`, `isActive`.

### Component 2: Missing Routes & Modules (Backend)
- `backend/src/auth/auth.controller.ts`: Add `@Put('profile')` and `@Put('change-password')`.
- `backend/src/auth/auth.service.ts`: Implement profile update and password change with bcrypt.
- `backend/src/saas-functions/`: Create `saas-functions.controller.ts`, `saas-functions.service.ts`, `saas-function.dto.ts`, and `saas-functions.module.ts`. Register in `AppModule`.
- `backend/src/meetings/`: Create `meetings.controller.ts`, `meetings.service.ts`, `meeting.dto.ts`, and `meetings.module.ts`. Register in `AppModule`.
- `backend/src/reports/reports.controller.ts`: Implement `@Get('stats')`.
- `backend/src/system-logs/system-logs.controller.ts`: Implement `@Patch(':id/resolve')`.

### Component 3: Frontend Route & URL Alignment
- `frontend/src/app/(dashboard)/community/messages/page.tsx`: Fix API path from `/community/messages` to `/messages`.
- `frontend/src/app/(dashboard)/community/notifications/page.tsx`: Fix API path from `/community/notifications` to `/notifications`.
- `frontend/src/app/(dashboard)/dashboard/page.tsx`: Switch to `/dashboard/stats`.
- `frontend/src/app/(dashboard)/reports/page.tsx`: Switch to `/reports/stats`.
- `frontend/src/app/(dashboard)/admin/system-logs/page.tsx`: Call `PATCH /system-logs/:id/resolve` on `handleMarkResolved`.

---

## 3. Assigned Agents & Skills

1. **DTO Integrity Specialist**: `class-validator-expert`, `backend-dev-guidelines`, `clean-code`
2. **Auth & Core Module Specialist**: `jwt-auth-hardening`, `saas-multi-tenant`, `clean-architecture-guardrails`
3. **Analytics Engine Specialist**: `kpi-dashboard-design`, `sql-optimization-patterns`, `postgres-best-practices`
4. **Frontend View & Data Specialist**: `frontend-dev-guidelines`, `react-ui-patterns`, `tanstack-table-builder`
5. **Judger Panel**: `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux`
