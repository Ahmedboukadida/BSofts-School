---
name: judger-security
description: Audits multi-tenant isolation, 4-tier guard chain, JWT authentication, and deletion governance.
---

# Judger Security Skill

## Overview
This skill provides comprehensive verification procedures for application security, multi-tenancy isolation, role-based access control, and password handling across BSofts-School.

## Core Rules & Verification Procedures

### 1. The 4-Tier Guard Chain
Every protected backend endpoint must enforce:
1. `JwtAuthGuard`: Rejects missing or expired Bearer tokens with 401 Unauthorized.
2. `EstablishmentContextMiddleware`: Extracts `x-establishment-id` and `x-tenant-id` and injects them into `req`.
3. `RolesGuard`: Verifies that the authenticated user holds an authorized role for the endpoint, or allows bypass if `user.isRoot === true`.
4. `PermissionsGuard`: Enforces fine-grained `@RequirePermissions()` checks for the active campus context.

### 2. Multi-Tenant Scoping & Actor Invariants
- Mutations must NEVER trust `req.body.createdBy`, `req.body.updatedBy`, or `req.body.approvedBy`.
- The backend service MUST resolve the actor ID directly from `req.user.id`.
- Queries must enforce `where: { establishmentId }` unless `user.isRoot === true` and `establishmentId === 'ALL'`.

### 3. Password Security Standards
- Passwords must be hashed using `bcrypt` with salt cost 10.
- Password hashes must NEVER be exposed in API query responses (`select: { password: false }`).
- Password updates must require prior verification of `oldPassword`.

### 4. Deletion Governance
- Soft-delete (`isDeleted = true`, `deletedAt = now()`, `deletedBy = user.id`) is standard.
- Permanent deletion (`?permanent=true`) is strictly gated to Root Administrators (`isRoot = true`).
