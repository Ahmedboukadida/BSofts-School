---
name: judger-api-contracts
description: Audits and enforces strict REST API contracts, Swagger documentation, and DTO whitelist consistency.
---

# Judger API Contracts Skill

## Overview
This skill guides the evaluation and enforcement of API contract parity between frontend client callers and backend NestJS controllers.

## Core Rules & Verification Procedures

### 1. DTO Whitelist & Sanitization Verification
- Ensure `AppValidationPipe` does not crash user requests with 400 Bad Request on unknown client properties:
  - `whitelist: true`: Unknown properties are automatically stripped from the incoming payload.
  - `forbidNonWhitelisted: false`: Unknown properties are NOT treated as errors in production.
- Every legitimate domain property must have an explicit `@IsString()`, `@IsNumber()`, `@IsBoolean()`, `@IsOptional()`, or `@IsArray()` decorator.

### 2. URL Prefix Parity
- Verify that frontend endpoints match controller route decorators exactly:
  - `@Controller('messages')` requires client calls to `/messages` (NOT `/community/messages`).
  - `@Controller('notifications')` requires client calls to `/notifications` (NOT `/community/notifications`).

### 3. Response Envelope Structure
- Single resource: `{ success: true, data: T, message?: string }`.
- Paginated collections: `{ data: T[], meta: { total, page, limit, totalPages, hasNextPage, hasPreviousPage } }`.
- Error envelope: `{ success: false, error: { code, message, timestamp, path } }`.

### 4. Swagger & OpenAPI Parity
- Every controller must have `@ApiTags()` and `@ApiOperation()` decorators.
- All query parameters in `PaginationQueryDto` must be documented with `@ApiPropertyOptional()`.
