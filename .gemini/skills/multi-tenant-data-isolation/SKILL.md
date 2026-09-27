---
name: multi-tenant-data-isolation
description: 'Architecture patterns for multi-tenant data partitioning, header-based tenant resolution, Prisma query isolation, and security guardrail enforcement.'
---

# Multi-Tenant Data Partitioning & Isolation

## 1. Principles
BSofts-School employs a shared-database, shared-schema, row-level tenant partitioning model. Every tenant's data is isolated logically by mandatory `tenantId` and `establishmentId` constraints.

## 2. Request Lifecycle
1. **Header Injection (Frontend)**:
   - `frontend/src/lib/api.ts` attaches `x-tenant-id` and `x-establishment-id` headers from `useEstablishmentStore`.
2. **Context Resolution (Backend)**:
   - `TenantMiddleware` extracts headers and validates:
     - Root users (`user.isRoot`) may specify any tenant or use `ALL`.
     - Non-root users can ONLY access entities belonging to their assigned `tenantId`.
3. **Query Scoping**:
   - Backend services apply `TenantWhereBuilder` to inject `{ tenantId, establishmentId, isDeleted: false }` into every Prisma `where` clause.
   - Example:
     ```typescript
     const where = TenantWhereBuilder.forTenant(req.user.tenantId, req.headers['x-establishment-id'])
       .withSoftDelete()
       .build();
     return this.prisma.student.findMany({ where });
     ```

## 3. Actor Snapshot Pattern
Every mutation MUST capture the acting user:
- `createdBy`: User ID who created the record.
- `updatedBy`: User ID who last modified the record.
- `deletedBy`: User ID who soft-deleted the record.
- `deletedAt`: Exact ISO timestamp of deactivation.
- `isDeleted`: Boolean flag (`true` = soft-deleted, hidden from operational views).

## 4. Root Platform Governance
- Root superadmins can operate platform-wide (`x-tenant-id: ALL`) for analytics, system monitoring, and tenant management.
- When creating resources on behalf of a tenant, Root must supply an explicit `tenantId`.
