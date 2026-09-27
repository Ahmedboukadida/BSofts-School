---
name: tenant-isolation-verifier
description: Validates TenantMiddleware, GlobalSecurityGuard, and x-company-id header injection.
---

# Tenant Isolation Verifier

## Overview

As the backend tenant agent, your responsibility is to ensure 100% data isolation between companies. BSOFTS uses a multi-tenant database approach where some clients might have dedicated DBs while others share a main DB (logically separated by `company_id`). The middleware and client manager govern this.

## The Tenant Middleware

The `TenantMiddleware` intercepts incoming requests, reads the `x-company-id` header, fetches the appropriate Prisma client context from `PrismaClientManager`, and sets up the execution context.

### Critical Bug Fix

When `x-company-id` is missing or invalid, the middleware previously called `next()` silently, executing queries against the default DB context and causing security leaks or logical errors.

**Rule**: The middleware MUST reject invalid headers with HTTP 503 (or 400).

```typescript
import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly prismaClientManager: PrismaClientManager) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const companyId = req.headers["x-company-id"] as string;

    if (!companyId) {
      // Must not silently fail.
      throw new ServiceUnavailableException("x-company-id header is required");
    }

    if (companyId === "ALL") {
      // 'ALL' mode uses main DB and scans all companies (for Superadmin/Devs)
      return next();
    }

    try {
      // Get the dedicated or shared Prisma client for this company
      const client =
        await this.prismaClientManager.getClientForCompany(companyId);

      // Execute the request within the context of this specific DB client
      this.prismaClientManager.runWithClient(client, next);
    } catch (err) {
      console.error("TenantMiddleware connection resolution failed:", err);
      throw new ServiceUnavailableException(
        "Failed to establish database connection for tenant",
      );
    }
  }
}
```

## `runWithClient` Pattern

The `PrismaClientManager` exposes a `runWithClient` pattern using `AsyncLocalStorage`.
When `TenantMiddleware` invokes `runWithClient(client, next)`, any subsequent injection of `PrismaService` during that request lifecycle will proxy to the tenant's specific client.

## Data Filtering (`company_id`)

Even with physical DB isolation, many tenants share the primary DB schema.
Therefore, **ALL** ERP service queries MUST still scope data by `company_id`.

```typescript
// ✅ ALWAYS include company_id in the where clause
async findAll(companyId: number) {
  return this.prisma.product.findMany({
    where: {
      company_id: companyId,
      is_deleted: false,
    }
  });
}
```

## Header Validation & Security

- `company_id` in the header must match the user's membership in the `users_companies_roles` table. This validation occurs in the `GlobalSecurityGuard`.
- If a user passes `x-company-id: 5` but does not belong to company 5, the `GlobalSecurityGuard` rejects it (403 Forbidden).
- Security Test: Attempting to access another company's data by spoofing `x-company-id` MUST return 403.

## Frontend Requirements

To make the tenant system work, the frontend (web/src/lib/apis/client.ts) Axios interceptor MUST inject the `x-company-id` header onto every single authenticated request.

```typescript
// web/src/lib/apis/client.ts
apiClient.interceptors.request.use((config) => {
  const activeCompanyId = getCookie("active_company_id");
  if (activeCompanyId) {
    config.headers["x-company-id"] = activeCompanyId;
  }
  return config;
});
```

## DONTs

- ❌ NEVER silently call `next()` if the tenant DB connection fails in middleware.
- ❌ NEVER omit `company_id: companyId` from Prisma queries, assuming the physical DB isolation is enough.
- ❌ NEVER allow users to query `company_id: 'ALL'` unless they explicitly pass the developer or superadmin checks.

---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Dual-Route Path Alias Rule**: All NestJS controllers handling hyphenated/underscored route paths MUST register dual route array paths via `@Controller(['canonical-path', 'alias-path'])`.
3. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` / `is_developer` god-mode bypass logic across all guards.
4. **Strict DTO Validation**: All Create & Update DTOs must enforce 100% `class-validator` decorator coverage. Optional fields require `@IsOptional()`. Money fields must be integer millimes (`@IsInt()`).


---

## 🛠️ Mandatory Workspace & Governance Directives (Upgraded Standards)

1. **Project Root & Paths**: Primary project workspace is E:\ToDo\BSofts.
2. **Auxiliary Workspace Directory Layout (.agents/bonus/)**:
   - **Scratch**: E:\ToDo\BSofts\.agents\bonus\Scratch — Scripting directory for creating temporary JS/TS scripts to inspect, verify, extract, or audit database & API components.
   - **Output**: E:\ToDo\BSofts\.agents\bonus\Scratch\Output — Deliverable directory for exported reports, data dumps, and persistent deliverables.
   - **Vault**: E:\ToDo\BSofts\.agents\bonus\Vault — Persistent memory vault directory holding state files (README.md, STATUS.md, PROGRESS.md, DECISIONS.md, DECLARATIONS.md, PROJECT.md).
3. **Autonomous Execution Loop (Rule #12)**:
   [1. Receive Goal] ➔ [2. Work & Implement] ➔ [3. Check & Verify (tsc --noEmit)] ➔ [4. Re-work if not complete] ➔ [5. Deliver Result] ➔ [6. Update Vault Memos].
4. **Autonomous Execution Permissions (Rule #13)**: Full permission to read, write, create, move files, and execute scripts/commands under E:\ToDo\BSofts without asking for permission.
5. **Mandatory Deletion Confirmation Guard (Rule #14)**: MUST ALWAYS ask user for explicit confirmation before deleting any file, folder, or database table.
6. **Zero Database Data Loss Guard (Rule #15)**: NEVER run commands that accept database data loss (such as prisma db push --accept-data-loss or forced table drops).


---

## 👥 BSOFT 5-Actor Role Architecture & Permanent Deletion Governance

1. **Developer (System Developer / Me)**:
   - Full platform god-mode access across all companies, tenants, endpoints, and system settings.
   - **Exclusive Permanent Deletion Authority**: Hard permanent deletes can ONLY be executed by Developer users. Non-developer delete requests default to soft-delete or throw ForbiddenException.
2. **Super Admin (Subscription Buyer & Owner)**:
   - Buyer of the SaaS subscription for his company/companies.
   - Full administrative control and feature configuration for his own company/companies only.
3. **Admin (Company Administrator)**:
   - Highest operational authority in a specific company right after Super Admin.
   - Manages day-to-day operations, employees, inventory, sales, and finance within his assigned company.
4. **Employees (Company Staff)**:
   - Operational staff members (Sales Agent, Accountant, Warehouse Manager) with role-restricted permissions.
5. **Third Parties (Clients & Providers / Suppliers)**:
   - External Customers (CLIENT) and Suppliers (FOURNISSEUR) operating in **Spectator Mode** — consult-only access restricted strictly to their own related records.

7. **Permanent Recursive File System Access Guarantee (Rule #16)**: Permanent, unrestricted, recursive read, write, create, and move permissions across all files, directories, subdirectories, and nested paths under E:\ToDo\BSofts at all times without asking for confirmation.
