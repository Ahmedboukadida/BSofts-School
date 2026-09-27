---
title: Choose the Right Index Type for Your Data
impact: HIGH
impactDescription: 10-100x improvement with correct index type
tags: indexes, btree, gin, brin, hash, index-types
---

## Choose the Right Index Type for Your Data

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
-- B-tree cannot optimize containment operators
create index products_attrs_idx on products (attributes);
select * from products where attributes @> '{"color": "red"}';
-- Full table scan - B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
-- GIN supports @>, ?, ?&, ?| operators
create index products_attrs_idx on products using gin (attributes);
select * from products where attributes @> '{"color": "red"}';
```

Index type guide:

```sql
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
create index users_created_idx on users (created_at);

-- GIN: arrays, JSONB, full-text search
create index posts_tags_idx on posts using gin (tags);

-- BRIN: large time-series tables (10-100x smaller)
create index events_time_idx on events using brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
create index sessions_token_idx on sessions using hash (token);
```

Reference: [Index Types](https://www.postgresql.org/docs/current/indexes-types.html)


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
