# BSofts-School — Master Plan v6.0: Frontend Dataflow, Dynamic Configs & Zero-Error Stability

> **User Directives & Absolute Execution Constraints**:
> 1. **STRICT TOOLING RULE**: AI does **NOT** run `git add`, `git commit`, `git push`, `npx prisma db push`, or `npm run db:push:neon`. The AI prepares all code, writes all files, and outputs the exact command lines for the **USER** to run locally and on production.
> 2. **EXECUTION ORDER**:
>    - **Phase 1**: Configure backend for Dynamic SMTP & Dynamic LiveKit (DB-backed + Root Settings UI).
>    - **Phase 2**: Frontend UI/UX Dataflow & Fixes (Remove demo credentials from login, fix Register packs loading, fix Landing page plans, fix SMTP live email link).
>    - **Phase 3**: Multi-Tenant & Multi-Establishment Data Charging (Heavy seeding with multiple tenants, schools, years, students, teachers).
>    - **Phase 4**: Zero-Error DTO Validation Shield (Fix `POST /api/employees` 400, fix `GET /api/homework` 400, align Classes, Rooms, Modules).
>    - **Phase 5**: Dynamic RBAC & Functions Re-Routing (`/admin/functions` ➔ dynamic capabilities).
>    - **Phase 6**: Server-Side Aggregations (Dashboard & Reports).
>    - **Phase 7 (LAST)**: LiveKit Meetings Suite (AxiaMeetings architecture, token generation, live conference, voting & agenda).

---

## 1. Dynamic LiveKit & SMTP Configurations

### 1.1 Dynamic LiveKit Configuration in Database
LiveKit settings will be managed dynamically like SMTP, stored in the DB (via `PlatformSetting` with key `LIVEKIT_CONFIG` or dedicated table) with a fallback to `.env`.

**Credentials provided**:
```env
LIVEKIT_URL=wss://bsofts-yid6ey9o.livekit.cloud
LIVEKIT_API_KEY=APIusw2GoZsh792
LIVEKIT_API_SECRET=mlPDCxP4fayL3O0ZHpHKQxCl1PYnMfjrdr1R49nfxW3A
```

**Root Management Card in [`frontend/src/app/(dashboard)/admin/settings/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28dashboard%29/admin/settings/page.tsx)**:
- Add a new tab or section: **"Configuration LiveKit Cloud (WebRTC)"**.
- Inputs: Server URL (`wss://...`), API Key, API Secret, Default Token TTL (minutes).
- Action buttons: "Enregistrer la configuration" & "Tester la connexion LiveKit".
- Backend endpoint: `POST /saas-settings/upsert` or dedicated `/livekit/config`.

### 1.2 SMTP Dynamic Sending & Verification Link Fix
- Ensure `MailService.sendMail()` works dynamically from DB settings (`SmtpConfig` or `PlatformSetting`).
- Generate real, clickable verification / password reset links with the correct frontend domain (`NEXT_PUBLIC_APP_URL` or `https://bsofts-school.vercel.app` / `http://localhost:3026`).

---

## 2. Phase-by-Phase Execution Roadmap

### Phase 1: Dynamic Configuration Engine (LiveKit & SMTP)
> **Goal**: Enable Root admin to configure SMTP and LiveKit in `/admin/settings` with live DB persistence.

1. **Backend Dynamic LiveKit Module/Service**:
   - Create `backend/src/livekit/`:
     - `livekit.service.ts`: Fetches credentials from `PlatformSettingsService` (key `LIVEKIT_CONFIG`), falling back to process.env. Provides `generateToken(roomName, participantIdentity, participantName)` and `testConnection()`.
     - `livekit.controller.ts`: Endpoints for `GET /livekit/config`, `POST /livekit/config`, and `POST /livekit/test-connection`.
     - Register `LivekitModule` in `app.module.ts`.
2. **Frontend Root Admin Settings UI**:
   - In [`frontend/src/app/(dashboard)/admin/settings/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28dashboard%29/admin/settings/page.tsx):
     - Add `LiveKitConfig` form state alongside `smtpConfig`.
     - Build UI Card with Video / Radio icon, inputs for `url`, `apiKey`, `apiSecret`.
     - Implement live test connection button with success/error toast.

---

### Phase 2: Frontend UI/UX, Auth & Landing Dataflow Harmony
> **Goal**: Clean up user credentials leakage, fix plan loading in Register and Landing pages, ensure functional email links.

1. **Login Page Security Cleanup**:
   - In [`frontend/src/app/(auth)/login/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28auth%29/login/page.tsx):
     - **Remove** lines 115-180 containing the hardcoded demo credentials card (`Quick Demo Credentials`, emails and passwords).
     - Keep the login interface sleek, production-grade, and adhering to the 5-color palette.
2. **Register Page Plan Loading Fix**:
   - In [`frontend/src/app/(auth)/register/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28auth%29/register/page.tsx):
     - Fix `fetchPlans` to consume the real response structure from `GET /landing/plans`.
     - Handle array mapping correctly (price formatting in TND, features list from `features` relation).
     - If no plans or fetch fails, display friendly fallback cards instead of skipping Step 1.
3. **Landing Page Packs/Pricing Fix**:
   - In [`frontend/src/app/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/page.tsx):
     - Verify and align `fetchPlans()` to map `price`, `interval`, and `features` directly from the database response.
     - Ensure currency displays properly with Tunisian Dinar (`TND` / `DT`).
4. **SMTP Live Verification & Notification Link**:
   - In `backend/src/auth/` and `backend/src/mail/`:
     - Ensure outgoing emails (welcome, reset password, invitations) construct URLs using `APP_FRONTEND_URL` environment variable (defaulting to current request origin or configured frontend URL).

---

### Phase 3: Data Charging (Multi-Tenant, Multi-Establishment Seeding)
> **Goal**: Seed extensive realistic data so all tenants, establishments, academic years, classes, and user roles can be tested.

1. **Update `backend/prisma/seed.ts`**:
   - **Tenants**: Increase from 2 to 4 distinct tenants (e.g., "Groupe Scolaire Les Étoiles", "Institut Carthage", "Al Irfane Education", "BSofts Demo Academy").
   - **Establishments**: 2 to 3 establishments per tenant across different categories (`DAYCARE`, `PRIMARY`, `MIDDLE_SCHOOL`, `HIGH_SCHOOL`).
   - **Academic Years**: Current (2025-2026) and Previous (2024-2025) for each establishment.
   - **Users & Roles**: Dedicated accounts for each role (`TENANT_ADMIN`, `ESTABLISHMENT_ADMIN`, `TEACHER`, `STUDENT`, `PARENT`, `EMPLOYEE`, `ACCOUNTANT`).
   - **Classes, Modules, Matieres**: Realistic distribution of classes (e.g., 6ème A, 6ème B, 3ème Math, etc.) with real assigned teachers and rooms.
   - **Students & Payments**: 20+ students per class with varied payment statuses (`PAID`, `PENDING`, `OVERDUE`) and attendance records.
2. **User Instructions**:
   - AI outputs command for user to run: `npm run seed` (or `npx ts-node prisma/seed.ts`).

---

### Phase 4: Zero-Error DTO Validation Shield
> **Goal**: Eradicate all 400 Bad Request errors across forms and table queries.

1. **Global Validation Pipe Softening**:
   - In [`backend/src/common/pipes/validation.pipe.ts`](file:///e:/ReFactory/BSofts-School/backend/src/common/pipes/validation.pipe.ts):
     - Set `forbidNonWhitelisted: false` with `whitelist: true` and `transform: true`.
2. **Fix `POST /api/employees` 400 Error**:
   - In `backend/src/employees/employee.dto.ts`:
     - Add `@IsOptional() @IsString() matricule?: string;`
     - Add `@IsOptional() @IsString() department?: string;`
     - Add `@IsOptional() @IsString() contractType?: string;`
     - Add `@IsOptional() @IsNumber() salaryTnd?: number;`
     - Add `@IsOptional() @IsBoolean() isActive?: boolean;`
   - In `backend/src/employees/employees.service.ts`:
     - Destructure: `const { contractType, salaryTnd, ...employeeData } = dto;`
     - Force tenant isolation override: `employeeData.establishmentId = user.establishmentId;`
     - If `contractType` or `salaryTnd` provided, auto-create/update associated `EmployeeContract`.
3. **Fix `GET /api/homework` 400 Error**:
   - In [`frontend/src/app/(dashboard)/homework/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28dashboard%29/homework/page.tsx) line 51:
     - Change `{ limit: 100, isDeleted: isTrashMode }` to `{ limit: 100, includeDeleted: isTrashMode }`.
   - In [`backend/src/homework/homework.dto.ts`](file:///e:/ReFactory/BSofts-School/backend/src/homework/homework.dto.ts):
     - In `QueryHomeworkDto`, add `@IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() isDeleted?: boolean;`
   - In `backend/src/homework/homework.service.ts`:
     - Alias `const includeDeleted = query.includeDeleted ?? query.isDeleted;`
4. **Classes, Rooms & Academic Modules Alignment**:
   - **Classes**: Frontend sends dynamic `classLevelId` & `academicYearId` UUIDs; Service defaults `periodType = TRIMESTER`.
   - **Rooms**: Add `@IsOptional() @IsArray() equipment?: string[]` to DTO; Service maps to `RoomEquipment`.
   - **Academic Modules**: Typed `CreateMatiereItemDto` with `@ValidateNested`; Service creates child `Matiere` records.

---

### Phase 5: Dynamic RBAC & SaaS Functions Re-Routing
> **Goal**: Connect `/admin/functions` dynamically without 404s.

1. **SaaS Functions Module**:
   - Create `backend/src/saas-functions/`:
     - Controller, Service, DTO, Module.
     - Dynamically manages platform capabilities (`Permission` ➔ `Function` ➔ `Module`).
   - Register in `app.module.ts`.
2. **Community Route Alignment**:
   - Frontend `community/messages` ➔ `/messages`.
   - Frontend `community/notifications` ➔ `/notifications`.
3. **Auth Profile & Password Endpoints**:
   - `PUT /auth/profile` (updates user names and phone).
   - `PUT /auth/change-password` (bcrypt verification + rate limiting `@Throttle`).

---

### Phase 6: Server-Side Aggregations (Dashboard & Reports)
> **Goal**: Accurate counts and financial figures computed directly in PostgreSQL.

1. **Dashboard Stats**:
   - `GET /api/dashboard/stats`: Database aggregations for active students, teachers, classes, monthly paid revenue, and pending amounts.
   - Update `frontend/src/app/(dashboard)/dashboard/page.tsx` to consume it with clean loading & empty states.
2. **Reports Stats**:
   - `GET /api/reports/stats`: Database aggregations for revenue distribution and attendance rates.
   - Update `frontend/src/app/(dashboard)/reports/page.tsx`.
3. **Security Audit**:
   - Derive `approvedBy` in `tenant-subscriptions` from `req.user.id`.
   - Implement `PATCH /api/system-logs/:id/resolve`.

---

### Phase 7 (LAST): LiveKit Meetings Suite
> **Goal**: Complete real-time meeting room, scheduling, agenda voting, and participant management.

1. **Prisma Schema Update for Meetings**:
   - Models: `Meeting`, `MeetingPoint`, `MeetingDocument`, `MeetingParticipant`, `MeetingInvitation`, `MeetingAttendance`, `MeetingVote`, `MeetingTurnRequest`.
   - Enums: `MeetingType`, `MeetingStatus`, `MeetingMode`, `MeetingDuration`, `MeetingPointType`, `MeetingVoteResponse`, `MeetingTurnRequestStatus`.
   - Provide migration command to user.
2. **Backend Meetings Module**:
   - `backend/src/meetings/`:
     - Token generation using `livekit-server-sdk` and dynamic LiveKit DB configuration (`GET /meetings/:id/token`).
     - Meeting CRUD, agenda points, votes, and turn requests.
3. **Frontend Meeting Experience**:
   - In [`frontend/src/app/(dashboard)/community/meetings/page.tsx`](file:///e:/ReFactory/BSofts-School/frontend/src/app/%28dashboard%29/community/meetings/page.tsx):
     - Meeting list (Upcoming, Live, Finished).
     - Live conference view with `@livekit/components-react` (`LiveKitRoom`, `VideoConference`).
     - Interactive agenda and live voting side-panel.

---

## 3. User Execution Command Reference

When each phase requiring external actions is completed, the AI will provide the exact command for the user to execute:

```powershell
# When schema changes are ready (AI will explicitly instruct):
cd e:\ReFactory\BSofts-School\backend
npx prisma validate
npx prisma generate
npm run db:push:neon

# When seeding new multi-tenant data:
cd e:\ReFactory\BSofts-School\backend
npm run seed

# When verifying builds:
cd e:\ReFactory\BSofts-School\backend
npm run build

cd e:\ReFactory\BSofts-School\frontend
npm run build

# When committing and pushing:
git add -A
git commit -m "feat: [phase description]"
git push origin main
```
