# Domain 5: Security, RBAC & Observability

## 1. Domain Purpose
The Security, RBAC & Observability domain safeguards data integrity, enforces multi-tenant boundaries, manages access control, and guarantees 24/7 visibility into system health, performance metrics, and application errors.

## 2. Security & Access Control Architecture
- **JWT Authentication**: Secure tokens containing userId, email, isRoot, tenantId, establishmentId, and role claims.
- **Tenant Isolation**: `TenantMiddleware` extracts and validates `x-tenant-id` and `x-establishment-id` headers on every API request.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions matrix mapped across 7 user tiers:
  - Root Superadmin
  - Tenant Administrator
  - School Director / Administrator
  - Teacher / Faculty
  - Accountant / Caisse Agent
  - Parent / Guardian
  - Student
- **Security Headers & Rate Limiting**: Helmet security headers configured on Express; rate limiting applied to authentication endpoints (`/auth/login`, `/auth/register`) to prevent brute-force attacks.

## 3. Observability & Health Infrastructure
- **Structured JSON Logging**: Zero raw `console.log` / `console.error` policy. All application services inject `AppLogger` to output JSON structured logs (`{"level":"info","message":"...","context":"StudentService","timestamp":"..."}`).
- **Health Probes**:
  - `GET /health`: Process liveness probe, memory utilization, and application uptime.
  - `GET /health/ready`: Database connectivity check (`SELECT 1`) and Redis latency/fallback ping.
  - `GET /health/live`: Lightweight process liveness verification.
- **Dynamic Enums Catalog (`/dynamic-enums`)**: Centralized system metadata repository allowing dynamic addition and retrieval of dropdown values without schema migrations.
- **Dynamic SMTP Service (`MailService`)**: Dynamic runtime resolution of SMTP credentials from database configuration with live test probe (`POST /mail/test-connection`).
- **Resilient Error Handling**: Zero silent catch policy. All frontend catch blocks trigger user-facing toasts (`showApiErrorToast`), and backend unhandled exceptions are captured in `system_logs` for triage.

## 4. Key Endpoints & APIs
- `POST /auth/login` & `POST /auth/register`: Authentication and session creation.
- `GET /auth/me` & `PUT /auth/profile`: Authenticated user profile retrieval and self-service updates.
- `GET /health`, `GET /health/ready`, `GET /health/live`: Container health probes.
- `GET /dynamic-enums` & `GET /dynamic-enums/category/:category`: Dynamic options lookup.
- `POST /mail/test-connection`: Live verification of SMTP credentials.
- `GET /system-logs` & `PATCH /system-logs/:id/resolve`: Incident management.

## 5. Architectural Safeguards
- All mutation queries record actor snapshots (`createdBy`, `updatedBy`, `deletedBy`).
- Soft-delete pattern implemented uniformly: `isDeleted`, `deletedAt`, `deletedBy` on all 45 domain models.
- Database operations must never use `--accept-data-loss` to protect production tenant data.
