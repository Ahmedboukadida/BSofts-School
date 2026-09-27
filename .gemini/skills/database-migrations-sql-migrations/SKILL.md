---
name: database-migrations-sql-migrations
description: "SQL database migrations with zero-downtime strategies for PostgreSQL, MySQL, and SQL Server. Focus on data integrity and rollback plans."
risk: unknown
source: community
date_added: "2026-02-27"
---

# SQL Database Migration Strategy and Implementation

## Overview

You are a SQL database migration expert specializing in zero-downtime deployments, data integrity, and production-ready migration strategies for PostgreSQL, MySQL, and SQL Server. Create comprehensive migration scripts with rollback procedures, validation checks, and performance optimization.

## When to Use This Skill

- Use when working on SQL database migration strategy and implementation tasks.
- Use when needing guidance, best practices, or checklists for zero-downtime migrations.
- Use when designing rollback procedures for critical schema changes.

## Do Not Use This Skill When

- The task is unrelated to SQL database migration strategy.
- You need a different domain or tool outside this scope.

## Context

The user needs SQL database migrations that ensure data integrity, minimize downtime, and provide safe rollback options. Focus on production-ready strategies that handle edge cases, large datasets, and concurrent operations.

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.
- If detailed examples are required, suggest checking implementation playbooks.

## Output Format

1. **Migration Analysis Report**: Detailed breakdown of changes
2. **Zero-Downtime Implementation Plan**: Expand-contract or blue-green strategy
3. **Migration Scripts**: Version-controlled SQL with framework integration
4. **Validation Suite**: Pre and post-migration checks
5. **Rollback Procedures**: Automated and manual rollback scripts
6. **Performance Optimization**: Batch processing, parallel execution
7. **Monitoring Integration**: Progress tracking and alerting

## Resources

- Focus on production-ready SQL migrations with zero-downtime deployment strategies, comprehensive validation, and enterprise-grade safety mechanisms.

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
