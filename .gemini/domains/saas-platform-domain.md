# Domain 1: SaaS Platform & Multi-Tenancy

## 1. Domain Purpose
The SaaS Platform domain manages the top-level multi-tenant ecosystem. It governs tenant onboarding, subscription plan tiers, license quotas, platform-level recurring billing, global audit tracking, and system health oversight.

## 2. Core Entities & Data Models
- **`Tenant`**: The root organizational entity representing an educational group or school institution. Fields include name, code, status, ownerId, settings, soft-delete flags.
- **`SubscriptionPlan`**: Definition of pricing tiers (e.g., Starter, Pro, Enterprise) with quotas (max establishments, max students, storage limits, features enabled).
- **`Subscription`**: Active tenant subscription link with status (`ACTIVE`, `PAST_DUE`, `CANCELED`), billing cycle, startDate, endDate, and approverId.
- **`PlatformPaymentConfig`**: Root Level 1 payment gateway configuration storing ClicToPay merchant credentials and Stripe API keys for platform subscription collections.
- **`AuditLog`**: Tamper-evident ledger capturing user actions, IP addresses, entity mutations, and timestamps across the platform.
- **`SystemLog`**: Server runtime error tracker storing severity, stack traces, context, and triage resolution lifecycle (`resolved`, `resolvedAt`, `resolvedBy`).

## 3. Key Endpoints & APIs
- `GET /admin/tenants`: List all onboarded tenants with pagination and soft-delete toggle.
- `POST /admin/tenants`: Provision a new educational tenant.
- `GET /admin/subscriptions`: Review active and pending school subscriptions.
- `PATCH /admin/subscriptions/:id/approve`: Approve a pending subscription using the authenticated `@CurrentUser()`.
- `GET /billing/gateways`: Public active Level 1 payment methods.
- `GET /billing/config` & `PUT /billing/config`: Root management of Stripe and ClicToPay platform credentials.
- `POST /billing/checkout`: Initiate subscription payment via Stripe Checkout or ClicToPay.
- `GET /system-logs` & `PATCH /system-logs/:id/resolve`: System incident triage and resolution.

## 4. Frontend Views
- `/admin/tenants`: Tenant directory with quota visualization and onboarding wizard.
- `/admin/subscriptions`: Subscription management, renewal triggers, and approval modals.
- `/admin/plans`: SaaS pricing tiers, feature flags, and limits.
- `/admin/system-logs`: Incident monitor with stack trace drawer and resolution actions.
- `/admin/audit-logs`: Platform activity trails with search and actor filtering.
- `/admin/settings`: Root global platform configurations (dynamic SMTP test, Level 1 gateways).

## 5. Security & Isolation Rules
- Root access is strictly guarded by `RolesGuard` checking `user.isRoot === true`.
- Tenant boundary queries MUST filter by `tenantId` to prevent cross-tenant data leaks.
- Approver identifiers are strictly derived from JWT claims and never accepted from request body.
