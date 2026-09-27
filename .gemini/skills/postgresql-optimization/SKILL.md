---
name: postgresql-optimization
description: "PostgreSQL database optimization workflow for query tuning, indexing strategies, performance analysis, and production database management."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---

# PostgreSQL Optimization Workflow

## Overview

Specialized workflow for PostgreSQL database optimization including query tuning, indexing strategies, performance analysis, vacuum management, and production database administration.

## When to Use This Workflow

Use this workflow when:
- Optimizing slow PostgreSQL queries
- Designing indexing strategies
- Analyzing database performance
- Tuning PostgreSQL configuration
- Managing production databases

## Workflow Phases

### Phase 1: Performance Assessment

#### Skills to Invoke
- `database-optimizer` - Database optimization
- `postgres-best-practices` - PostgreSQL best practices

#### Actions
1. Check database version
2. Review configuration
3. Analyze slow queries
4. Check resource usage
5. Identify bottlenecks

#### Copy-Paste Prompts
```
Use @database-optimizer to assess PostgreSQL performance
```

### Phase 2: Query Analysis

#### Skills to Invoke
- `sql-optimization-patterns` - SQL optimization
- `postgres-best-practices` - PostgreSQL patterns

#### Actions
1. Run EXPLAIN ANALYZE
2. Identify scan types
3. Check join strategies
4. Analyze execution time
5. Find optimization opportunities

#### Copy-Paste Prompts
```
Use @sql-optimization-patterns to analyze and optimize queries
```

### Phase 3: Indexing Strategy

#### Skills to Invoke
- `database-design` - Index design
- `postgresql` - PostgreSQL indexing

#### Actions
1. Identify missing indexes
2. Create B-tree indexes
3. Add composite indexes
4. Consider partial indexes
5. Review index usage

#### Copy-Paste Prompts
```
Use @database-design to design PostgreSQL indexing strategy
```

### Phase 4: Query Optimization

#### Skills to Invoke
- `sql-optimization-patterns` - Query tuning
- `sql-pro` - SQL expertise

#### Actions
1. Rewrite inefficient queries
2. Optimize joins
3. Add CTEs where helpful
4. Implement pagination
5. Test improvements

#### Copy-Paste Prompts
```
Use @sql-optimization-patterns to optimize SQL queries
```

### Phase 5: Configuration Tuning

#### Skills to Invoke
- `postgres-best-practices` - Configuration
- `database-admin` - Database administration

#### Actions
1. Tune shared_buffers
2. Configure work_mem
3. Set effective_cache_size
4. Adjust checkpoint settings
5. Configure autovacuum

#### Copy-Paste Prompts
```
Use @postgres-best-practices to tune PostgreSQL configuration
```

### Phase 6: Maintenance

#### Skills to Invoke
- `database-admin` - Database maintenance
- `postgresql` - PostgreSQL maintenance

#### Actions
1. Schedule VACUUM
2. Run ANALYZE
3. Check table bloat
4. Monitor autovacuum
5. Review statistics

#### Copy-Paste Prompts
```
Use @database-admin to schedule PostgreSQL maintenance
```

### Phase 7: Monitoring

#### Skills to Invoke
- `grafana-dashboards` - Monitoring dashboards
- `prometheus-configuration` - Metrics collection

#### Actions
1. Set up monitoring
2. Create dashboards
3. Configure alerts
4. Track key metrics
5. Review trends

#### Copy-Paste Prompts
```
Use @grafana-dashboards to create PostgreSQL monitoring
```

## Optimization Checklist

- [ ] Slow queries identified
- [ ] Indexes optimized
- [ ] Configuration tuned
- [ ] Maintenance scheduled
- [ ] Monitoring active
- [ ] Performance improved

## Quality Gates

- [ ] Query performance improved
- [ ] Indexes effective
- [ ] Configuration optimized
- [ ] Maintenance automated
- [ ] Monitoring in place

## Related Workflow Bundles

- `database` - Database operations
- `cloud-devops` - Infrastructure
- `performance-optimization` - Performance

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


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
