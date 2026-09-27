---
name: base-service-extender
description: Implements custom business logic, soft-delete rules, and BaseService overrides.
---

# Base Service Extender

## Overview
As the backend services agent, you are responsible for implementing core business logic inside NestJS services. You must follow strict paradigms regarding database interaction (Prisma), pagination, error handling, soft deletes, and multi-tenant scoping.

## Core Rules

1. **Standard Signatures**: All services must implement standard CRUD signatures.
2. **Soft Deletes**: NEVER use `prisma.model.delete()`. Always update the record with `is_deleted: true`.
3. **Tenant Scoping**: All ERP service queries MUST filter by `company_id` from the active tenant context.
4. **Pagination Pattern**: Implement a standard `{ data, total, page, limit }` return object for list endpoints.
5. **Search Logic**: Use case-insensitive Prisma filters across relevant string fields.
6. **Error Handling**: Use explicit NestJS HTTP exceptions (`NotFoundException`, `ConflictException`).
7. **Transactions**: Use `prisma.$transaction([])` when mutating multiple tables simultaneously.
8. **Caching**: Inject `CacheService` and call `cacheService.invalidate(cacheKey)` for writes.
9. **Tenant Operations**: Leverage `runWithClient` from `PrismaClientManager`.

## Method Signatures
Ensure the following standard methods exist in your service:
```typescript
async findAll(query: PaginationQuery, companyId: number): Promise<PaginatedResult<Entity>>
async findOne(id: number, companyId: number): Promise<Entity>
async create(dto: CreateDto, companyId: number): Promise<Entity>
async update(id: number, dto: UpdateDto, companyId: number): Promise<Entity>
async remove(id: number, companyId: number): Promise<void>
async restore(id: number, companyId: number): Promise<void>
```

## Soft Delete Pattern
**Rule**: NEVER permanently delete records unless you are writing a developer-only `hardDelete` function.

```typescript
// ❌ DONT:
await this.prisma.user.delete({ where: { id } });

// ✅ DO:
await this.prisma.user.update({
  where: { id },
  data: { is_deleted: true, deleted_at: new Date() },
});
```
Furthermore, ALL `findMany` queries MUST exclude soft-deleted records unless explicitly requested:
```typescript
const users = await this.prisma.user.findMany({
  where: { 
    company_id: companyId,
    is_deleted: false 
  }
});
```

## Pagination and Search
Implement precise pagination offset/limit and flexible search logic:
```typescript
async findAll(query: PaginationDto, companyId: number) {
  const { page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    company_id: companyId,
    is_deleted: false,
  };

  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { ref: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, total] = await this.prisma.$transaction([
    this.prisma.product.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [query.sortBy || 'id']: query.sortOrder || 'desc' },
    }),
    this.prisma.product.count({ where: whereCondition })
  ]);

  return { data, total, page, limit };
}
```

## Status Toggle
Common utility method for activating/deactivating records:
```typescript
async toggleStatus(id: number, companyId: number) {
  const record = await this.findOne(id, companyId);
  return this.prisma.product.update({
    where: { id },
    data: { status: record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' },
  });
}
```

## Error Handling
Throw appropriate HTTP exceptions:
```typescript
const record = await this.prisma.product.findUnique({ where: { id } });
if (!record || record.company_id !== companyId || record.is_deleted) {
  throw new NotFoundException(`Product with ID ${id} not found`);
}

const duplicate = await this.prisma.product.findFirst({ where: { ref: dto.ref, company_id: companyId } });
if (duplicate) {
  throw new ConflictException(`Product with reference ${dto.ref} already exists`);
}
```

## Caching
Invalidate the cache when modifying data:
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly cacheService: CacheService
) {}

async create(dto: CreateDto, companyId: number) {
  const record = await this.prisma.product.create({ data: { ...dto, company_id: companyId } });
  await this.cacheService.invalidate(`products_company_${companyId}`);
  return record;
}
```

## Tenant Manager Context (`runWithClient`)
If you require tenant-specific schema operations dynamically:
```typescript
await this.prismaClientManager.runWithClient(client, async () => {
  // Client is now implicitly bound for inner queries if properly set up
});
```

## DONTs
- ❌ NEVER omit `company_id` scoping in `where` clauses for multi-tenant data.
- ❌ NEVER use raw error throwing; rely on `@nestjs/common` exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`).
- ❌ NEVER query without `is_deleted: false` unless building a trash/recycle bin view.


---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Single English REST Route Standard**: All NestJS controllers MUST use **1 single clean English kebab-case string route** (e.g. `@Controller('countries')`, `@Controller('employes-contracts')`, `@Controller('leave-requests')`, `@Controller('payroll')`). No multi-route array decorators.
3. **Soft Delete List Filtering & Developer Permanent Delete**:
   - Regular Users (Non-Developers): List queries (`findAll`, `findOne`) MUST enforce `{ is_deleted: false }`. Soft-deleted records are hidden permanently.
   - Developer Users (`isDeveloper === true` / `hardDelete === true`): Calling `DELETE /:id` triggers `this.model.delete({ where: { id } })`, permanently purging the record from PostgreSQL.
4. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` / `is_developer` god-mode bypass logic across all guards.
5. **Strict DTO Validation**: All Create & Update DTOs must enforce 100% `class-validator` decorator coverage. Optional fields require `@IsOptional()`. Money fields must be integer millimes (`@IsInt()`).


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
