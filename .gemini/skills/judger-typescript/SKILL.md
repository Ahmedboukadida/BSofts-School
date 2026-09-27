---
name: judger-typescript
description: Enforces TypeScript strict mode, zero explicit any types, strict type syncing, and clean build exits.
---

# Judger TypeScript Skill

## Overview
This skill guides the audit and enforcement of strict type safety across both the NestJS backend and Next.js App Router frontend.

## Core Rules & Verification Procedures

### 1. Zero Explicit `any` Types
- Search codebase for `: any` or `as any`.
- Every entity, DTO, state variable, and API response shape must have an explicit TypeScript interface or type alias.
- Use generics (`PaginatedDto<T>`, `ApiResponse<T>`) rather than unstructured types.

### 2. DTO & Frontend Type Parity
- Frontend types in `frontend/src/types/` must strictly mirror the models in `backend/prisma/schema.prisma` and DTOs in `backend/src/*/`.
- Optional fields must be properly typed as `T | undefined` or `T | null`.

### 3. Compilation Build Gates
- Backend validation: `npm run build` in `backend/` must exit with code 0.
- Frontend validation: `npm run build` in `frontend/` must compile all routes with 0 TypeScript check errors and 0 ESLint errors.
