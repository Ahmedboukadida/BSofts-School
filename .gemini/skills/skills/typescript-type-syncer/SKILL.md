---
name: typescript-type-syncer
description: Syncs TypeScript types from backend Prisma models and NestJS DTOs to web/src/types.
---

# TypeScript Type Syncer Skill

This skill enforces strict typing across the BSOFTS application, ensuring that the frontend types are always perfectly synchronized with the backend Prisma models and DTOs.

## 1. Zero `any` Policy

There are currently over 127 TypeScript type files located in `web/src/types/`.
**You MUST USE THEM. The use of `any` or `any[]` is strictly forbidden.**

### Frontend React State

**Forbidden:**

```typescript
const [users, setUsers] = useState<any[]>([]);
const [item, setItem] = useState<any | null>(null);
```

**Always use strict typing:**

```typescript
import { ThirdParty } from "@/types/third-party";

const [users, setUsers] = useState<ThirdParty[]>([]);
const [item, setItem] = useState<ThirdParty | null>(null);
```

### Backend Controllers

**Forbidden:**

```typescript
@Post()
create(@Body() body: any) { ... }
```

**Always use a typed DTO:**

```typescript
@Post()
create(@Body() createDto: CreateUserDto) { ... }
```

## 2. Type Creation and Naming Conventions

If a type you need doesn't exist in `web/src/types/`, you MUST CREATE IT in the appropriate file.

### Interface Naming

The interface name MUST exactly match the Prisma model name in PascalCase.

Examples:

- `ThirdParty`
- `CompanyUser`
- `Notification`
- `Message`

### Field Naming

The field names inside the interface MUST exactly match the backend Prisma model field names.

## 3. Nullable Columns

If a column in the database is nullable (or optional in the DTO), the frontend interface MUST include an optional field with the `?` modifier.

```typescript
export interface CompanyUser {
  id: string;
  name: string;
  avatarUrl?: string; // Nullable in DB
  createdAt: string;
}
```

## 4. Handling Specific Data Types

### Money Fields

Money fields are stored as integer millimes (e.g., TND millimes) in the database.

- **Type:** ALWAYS `number`
- **Display Formatting:** Must be divided by 1000 and formatted to 3 decimal places.

```typescript
// Displaying money
const displayAmount = (value / 1000).toFixed(3) + " TND";
```

### Status Fields

Status fields correspond to enums on the backend.

- **Type:** ALWAYS `string` (or a specific string literal union / enum type).
- **Rule:** NEVER hardcode status strings in the frontend logic. Always type them properly.

```typescript
export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
```

### Date Fields

Dates are serialized as ISO8601 strings by the backend.

- **Type:** `string`
- **Display Formatting:** Parse to Date object before displaying.

```typescript
const displayDate = new Date(value).toLocaleDateString();
```

## 5. Synchronization Workflow

**The Sync Rule:** Whenever a backend DTO or Prisma model changes, the corresponding frontend interface in `web/src/types/` MUST be updated in the same PR or commit.

## 6. Build Enforcement

After every change to types, models, or components, you must run the TypeScript compiler to check for errors.

Command: `npx tsc --noEmit`

This command **MUST pass with 0 errors** in both the frontend and backend directories before a task can be considered complete.

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
