---
name: openapi-swagger-decorator
description: Decorates controllers with ApiTags, ApiOperation, and ApiResponse OpenAPI specs.
---

# OpenAPI Swagger Decorator

## Overview
As the backend Swagger agent, you are responsible for maintaining complete, accurate, and highly-detailed API documentation for the NestJS backend using `@nestjs/swagger`. The frontend developers and third-party integrations rely entirely on this specification.

## Core Rules

1. **Controller Tagging**: Every controller must be tagged with `@ApiTags('ModuleName')`.
2. **Auth Declaration**: Every controller must include `@ApiBearerAuth()` (unless public).
3. **Endpoint Descriptions**: Every endpoint method must include `@ApiOperation({ summary: '...', description: '...' })`.
4. **Responses**: Document all possible HTTP status codes (`@ApiResponse`).
5. **Request Bodies**: Use `@ApiBody()` to document payloads.
6. **Query & Path Params**: Document pagination params and URL variables using `@ApiQuery()` and `@ApiParam()`.
7. **DTO Documentation**: All DTO fields MUST be decorated with `@ApiProperty()` or `@ApiPropertyOptional()`.

## Controller-Level Decorators

```typescript
import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory - Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  // ...
}
```

## Method-Level Decorators

Document success and common error cases. Be explicit about expected types.

```typescript
import { 
  ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody 
} from '@nestjs/swagger';

@Get()
@ApiOperation({ 
  summary: 'Get all products', 
  description: 'Retrieve a paginated list of products for the active company.' 
})
@ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
@ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
@ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
@ApiResponse({ status: 200, description: 'Success', type: PaginatedProductsDto })
@ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
findAll(@Query() query: PaginationDto) {
  // ...
}

@Get(':id')
@ApiOperation({ summary: 'Get a single product' })
@ApiParam({ name: 'id', type: Number, description: 'Product ID' })
@ApiResponse({ status: 200, description: 'Success', type: ProductDto })
@ApiResponse({ status: 404, description: 'Not Found' })
findOne(@Param('id') id: number) {
  // ...
}

@Post()
@ApiOperation({ summary: 'Create a product' })
@ApiBody({ type: CreateProductDto })
@ApiResponse({ status: 201, description: 'Product created successfully', type: ProductDto })
@ApiResponse({ status: 400, description: 'Validation failed' })
@ApiResponse({ status: 409, description: 'Conflict - Reference already exists' })
create(@Body() dto: CreateProductDto) {
  // ...
}
```

## DTO Property Documentation
Without `@ApiProperty()`, properties will NOT appear in the Swagger UI.

```typescript
export class ProductDto {
  @ApiProperty({ description: 'Primary ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Unique Reference Code', example: 'PRD-001' })
  ref: string;

  @ApiProperty({ description: 'Product Name', example: 'Laptop Pro 15"' })
  name: string;

  @ApiPropertyOptional({ description: 'Price in millimes/cents', example: 1500000 })
  price?: number;
  
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  status: string;
}
```

## Swagger UI Configuration Context
Ensure developers know where to test:
- The Swagger setup is accessible at `http://localhost:3006/api/docs`.
- The configuration uses `persistAuthorization: true` in `main.ts` so developers don't have to repeatedly re-enter their JWT token when the page refreshes.

## DONTs
- ❌ NEVER leave an endpoint undocumented without an `@ApiOperation()`.
- ❌ NEVER forget `@ApiProperty()` in DTOs. Validation decorators (`@IsString()`) do NOT automatically generate Swagger schema details.
- ❌ NEVER forget to document common error responses (400 for bad requests, 403 for permissions, 404 for not found).


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
