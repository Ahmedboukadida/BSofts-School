---
title: Use Advisory Locks for Application-Level Locking
impact: MEDIUM
impactDescription: Efficient coordination without row-level lock overhead
tags: advisory-locks, coordination, application-locks
---

## Use Advisory Locks for Application-Level Locking

Advisory locks provide application-level coordination without requiring database rows to lock.

**Incorrect (creating rows just for locking):**

```sql
-- Creating dummy rows to lock on
create table resource_locks (
  resource_name text primary key
);

insert into resource_locks values ('report_generator');

-- Lock by selecting the row
select * from resource_locks where resource_name = 'report_generator' for update;
```

**Correct (advisory locks):**

```sql
-- Session-level advisory lock (released on disconnect or unlock)
select pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
select pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on commit/rollback)
begin;
select pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
commit;  -- Lock automatically released
```

Try-lock for non-blocking operations:

```sql
-- Returns immediately with true/false instead of waiting
select pg_try_advisory_lock(hashtext('resource_name'));

-- Use in application
if (acquired) {
  -- Do work
  select pg_advisory_unlock(hashtext('resource_name'));
} else {
  -- Skip or retry later
}
```

Reference: [Advisory Locks](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS)


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
