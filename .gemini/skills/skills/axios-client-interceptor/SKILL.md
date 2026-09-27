---
name: axios-client-interceptor
description: Configures apiClient methods to inject Authorization and x-company-id headers automatically.
---

# Axios Client Interceptor Skill

This skill governs the usage and configuration of the central API client in the BSOFTS web application.

## 1. Single API Client Rule

The `client.ts` file located at `web/src/lib/apis/client.ts` is the **SINGLE API client** for all web calls.
You must never instantiate a new axios instance or use raw `fetch` for communicating with the BSOFTS backend.

### Correct Import

Always import the client as follows:

```typescript
import apiClient from "@/lib/apis/client";
```

**DO NOT** import `@/lib/axios`, as this is merely an alias and should not be used directly in components or API wrappers.

## 2. Automatic Header Injection

The `apiClient` is pre-configured to handle authentication and multi-tenancy automatically:

- **Authorization**: It automatically injects `Authorization: Bearer {token}` using the token stored in the `bsoft_auth_token` cookie.
- **Tenant Context**: It automatically injects `x-company-id: {activeCompany.id}` using the currently active company stored in localStorage or the relevant cookie.

You do not need to manually attach these headers when making requests.

## 3. Usage in Page Files

**NEVER write raw `axios.get()` or `apiClient.get()` calls directly inside React component or page files.**

Instead, you must use the typed API functions that exist in `web/src/lib/apis/{module}.api.tsx`.

### Bad Practice (Do Not Use)

```typescript
// inside page.tsx
import apiClient from "@/lib/apis/client";

const fetchData = async () => {
  const res = await apiClient.get("/users");
  setUsers(res.data);
};
```

### Good Practice (Use This)

```typescript
// inside page.tsx
import { usersApi } from "@/lib/apis/users.api";

const fetchData = async () => {
  const res = await usersApi.getAll();
  setUsers(res);
};
```

## 4. Response Normalization

The BSOFTS backend can return data in two different shapes:

1. Paginated format: `{ data: T[], total, page, limit }`
2. Plain array: `T[]`

When writing wrapper functions in `web/src/lib/apis/`, you **ALWAYS** must normalize this data so the frontend receives a consistent array or object.

```typescript
// Example inside an API wrapper file
const getAll = async (): Promise<MyType[]> => {
  const res = await apiClient.get("/endpoint");
  return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
};
```

## 5. Error Handling

Errors returned by the backend `GlobalExceptionFilter` have the following shape:
`{ success: false, statusCode, error: { message } }`

Use the utility function `extractErrorMessage` to get the string message for toast notifications.

```typescript
import { extractErrorMessage } from "@/lib/utils/error";

try {
  await usersApi.create(data);
} catch (err) {
  toast.error(extractErrorMessage(err));
}
```

## 6. Authentication Expiry and 401 Interceptor

The axios interceptor is configured to handle `401 Unauthorized` responses. When a JWT expires:

1. It calls `clearAuth()` to clear local state and cookies.
2. It redirects the user to `/` (the login page).

**NOTE:** Token refresh is NOT implemented. Users must explicitly re-login when their session expires.

## 7. The Typed API Pattern

There are over 132 typed API files in `web/src/lib/apis/`. Each file exports a `{module}Api` object with standard CRUD methods. If you are creating a new one, follow this pattern:

```typescript
import apiClient from "./client";
import { MyType, CreateMyTypeDto } from "@/types/my-type";

export const myTypeApi = {
  getAll: async () => {
    const res = await apiClient.get("/my-type");
    return Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/my-type/${id}`);
    return res.data;
  },
  create: async (data: CreateMyTypeDto) => {
    const res = await apiClient.post("/my-type", data);
    return res.data;
  },
  update: async (id: string, data: Partial<CreateMyTypeDto>) => {
    const res = await apiClient.put(`/my-type/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/my-type/${id}`);
    return res.data;
  },
};
```

Never import `axios` directly in page files. Always route your requests through this pattern.

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
