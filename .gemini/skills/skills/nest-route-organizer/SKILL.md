---
name: nest-route-organizer
description: Enforces strict route declaration ordering (e.g. /settings before /:id).
---

# Nest Route Organizer

## Overview
As the backend controller agent, your task is to correctly configure NestJS controllers, properly order route methods, enforce security guards, and apply appropriate parameter decorators. Controller route ordering is critical due to Express/NestJS routing mechanics.

## Route Ordering Logic (CRITICAL)
NestJS resolves routes top-to-bottom. If you place a parameterized route `/:id` before a static route like `/settings`, the static route will never be hit because "settings" will be parsed as the `:id`.

**Rule**: ALWAYS place static routes before parameterized routes.

```typescript
// ❌ WRONG ORDER
@Get(':id')
findOne() {}

@Get('active') // Unreachable! "active" becomes the :id parameter
getActive() {}

// ✅ CORRECT ORDER
@Get('bulk')
bulkAction() {}

@Get('active')
getActive() {}

@Get('settings')
getSettings() {}

@Get(':id')
findOne() {}
```

## Standard Controller Decorators
Every controller MUST be decorated with tags and security guards.
Note: If guards are registered globally in `app.module.ts`, you may not need `@UseGuards` on the controller, but refer to the project standards. The current standard specifies:

```typescript
import { Controller, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GlobalSecurityGuard } from '../common/guards/global-security.guard';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, GlobalSecurityGuard)
@Controller('inventory')
export class InventoryController {
  // ...
}
```

## Permission & Feature Guards
Every sensitive route must specify required permissions and optionally required features.

```typescript
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { RequireFeature } from '../common/decorators/require-feature.decorator';

@Get()
@RequirePermissions('inventory.read')
@RequireFeature('inventory') // Subscription gating
findAll() {}

@Post()
@RequirePermissions('inventory.write')
create() {}

@Delete(':id')
@RequirePermissions('inventory.delete')
remove() {}
```

## Public Routes
If an endpoint doesn't require authentication (e.g., login/register), bypass all global guards.

```typescript
import { Public } from '../common/decorators/public.decorator';

@Public()
@Post('login')
login() {}
```

## Standard CRUD Endpoints
Ensure controllers follow RESTful patterns.

```typescript
@Get()
@RequirePermissions('module.read')
findAll(@Query() query: PaginationQueryDto) {
  return this.service.findAll(query);
}

@Get(':id')
@RequirePermissions('module.read')
findOne(@Param('id', ParseIntPipe) id: number) {
  return this.service.findOne(id);
}

@Post()
@RequirePermissions('module.write')
create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}

@Patch(':id')
@RequirePermissions('module.write')
update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDto) {
  return this.service.update(id, dto);
}
```

## Delete Routes (Soft vs Hard)
Provide distinct routes for soft deletion vs permanent deletion.

```typescript
// Soft Delete (Default)
@Delete(':id')
@RequirePermissions('module.delete')
remove(@Param('id', ParseIntPipe) id: number) {
  return this.service.remove(id); // Performs soft delete in DB
}

// Permanent Delete (Developer/Superadmin only)
@Delete(':id/permanent')
@RequirePermissions('module.hard_delete') // Requires elevated privileges
hardDelete(@Param('id', ParseIntPipe) id: number) {
  return this.service.hardDelete(id); // Performs actual DELETE in DB
}
```

## Status Toggling Endpoints
Do not pass the full DTO when just toggling a status. Provide dedicated endpoints.

```typescript
@Patch(':id/toggle')
@RequirePermissions('module.write')
toggleStatus(@Param('id', ParseIntPipe) id: number) {
  return this.service.toggleStatus(id);
}

// Alternatively
@Patch(':id/activate')
activate(@Param('id', ParseIntPipe) id: number) {}

@Patch(':id/deactivate')
deactivate(@Param('id', ParseIntPipe) id: number) {}
```

## Response Serialization
- Return plain objects or paginated structures directly from the controller.
- Rely on the `GlobalExceptionFilter` for error mapping. Do NOT use `try-catch` blocks inside controllers to return custom JSON error structures. Let the framework catch the HTTP exceptions thrown by the service.

## DONTs
- ❌ NEVER put `@Get(':id')` before `@Get('custom-path')`.
- ❌ NEVER use `@Body() body: any` (handled by DTO agent, but relevant here).
- ❌ NEVER manually construct error response objects in the controller; use `throw new NotFoundException(...)`.


---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Single English REST Route Standard**: All NestJS controllers MUST use **1 single clean English kebab-case string route** (e.g. `@Controller('countries')`, `@Controller('employes-contracts')`, `@Controller('leave-requests')`, `@Controller('payroll')`). No multi-route array decorators.
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
