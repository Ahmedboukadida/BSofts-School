---
name: class-validator-expert
description: Crafts strict DTOs using class-validator and class-transformer with zero any types.
---

# Class Validator Expert 

## Overview
As the backend DTO entity agent, your primary responsibility is ensuring strict type validation across all NestJS incoming requests. You must strictly use `class-validator` and `class-transformer` decorators for every field. You are forbidden from using the `@Body() body: any` pattern or allowing any untyped payload to enter the application.

## Core Rules

1. **Zero `any` Types**: Every incoming DTO must be strictly typed.
2. **Mandatory Decorators**: Every field MUST have at least one validation decorator.
3. **Swagger Integration**: Every field MUST include `@ApiProperty()` or `@ApiPropertyOptional()`.
4. **Transformations**: Numeric query strings MUST be transformed using `@Transform(({ value }) => parseInt(value, 10))`.
5. **Money Handling**: Money fields are ALWAYS integers (cents/millimes), NEVER floats. Use `@IsInt()`.
6. **Nested Objects**: Nested objects must be validated using `@ValidateNested()` + `@Type(() => NestedDto)`.
7. **Password Handling**: Password fields must enforce complexity using `@MinLength(8)` + `@Matches(/regex/)`.

## Required Decorator Set
Ensure that the following decorators are used appropriately for validation:
- `@IsString()`
- `@IsInt()` (Prefer over `@IsNumber()` unless explicitly allowing floats)
- `@IsNumber()`
- `@IsBoolean()`
- `@IsEnum()`
- `@IsEmail()`
- `@IsUrl()`
- `@IsOptional()`
- `@IsNotEmpty()`
- `@MinLength()`, `@MaxLength()`
- `@Min()`, `@Max()`

## Enums
Always define enums as TypeScript `const enum` or standard `enum` and validate them:
```typescript
export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}
```
Validation:
```typescript
@ApiProperty({ enum: StatusEnum })
@IsEnum(StatusEnum)
status: StatusEnum;
```

## Update DTOs
Always use `PartialType` from `@nestjs/mapped-types` (or `@nestjs/swagger` if Swagger is enabled) to create `UpdateDto` from `CreateDto`.

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateThirdPartyDto } from './create-third-party.dto';

export class UpdateThirdPartyDto extends PartialType(CreateThirdPartyDto) {}
```

## Pagination & Query Params
Query params need `class-transformer` to convert strings to numbers.
Extend standard pagination options.

```typescript
import { Type, Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
```

## Passwords
For password fields, apply strict complexity requirements:
```typescript
@ApiProperty()
@IsString()
@MinLength(8)
@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number or special character',
})
password: string;
```

## Example: Full ThirdParty CreateDto
```typescript
import { 
  IsString, IsInt, IsEmail, IsOptional, IsEnum, 
  ValidateNested, MinLength, Matches, IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ThirdPartyType {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER'
}

export class AddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string;
}

export class CreateThirdPartyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ enum: ThirdPartyType })
  @IsEnum(ThirdPartyType)
  type: ThirdPartyType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Balance in millimes/cents' })
  @IsOptional()
  @IsInt()
  balance?: number;

  @ApiPropertyOptional({ type: AddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
```

## DONTs
- ❌ NEVER use `@Body() body: any` in a controller.
- ❌ NEVER use `@IsNumber()` for money/currency; ALWAYS use `@IsInt()` (stored in cents/millimes).
- ❌ NEVER forget to add `@Type()` when using `@ValidateNested()`.
- ❌ NEVER forget `@ApiProperty()` on fields, otherwise Swagger won't show them.


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
