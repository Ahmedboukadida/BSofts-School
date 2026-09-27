---
name: bsoft-project-governance
description: Updates PROJECT.md milestones, synchronizes priority lists, manages task dependencies, and enforces BSOFTS enterprise swarm architectural standards.
---

# BSOFTS Project Governance Skill

Governs project progress tracking in `PROJECT.md`, swarm subagent coordination, and architectural compliance.

## Core Rules & Execution Standards

1. **Single English REST Route Standard**:
   - 100% of NestJS controllers MUST use **1 single clean English kebab-case string route** (e.g. `@Controller('countries')`, `@Controller('employes-contracts')`, `@Controller('leave-requests')`, `@Controller('payroll')`). No multi-route array decorators.
2. **Soft Delete List Filtering & Developer Hard Delete**:
   - Regular Users (Non-Developers): List queries (`findAll`, `findOne`) MUST enforce `{ is_deleted: false }`. Soft-deleted rows are hidden permanently.
   - Developer Users (`isDeveloper === true` / `hardDelete === true`): Calling `DELETE /:id` triggers `this.model.delete(...)`, permanently purging the row from PostgreSQL.
3. **Full Action Audit Logging**:
   - `AuditLogInterceptor` captures 100% of platform actions (`LOGIN`, `LOGOUT`, `INSCRIPTION`, `VERIFICATION`, `CREATE`, `UPDATE`, `DELETE`, `SEND`) into the `logs` table.
4. **Specialized Enterprise Subagents**:
   - `saas-expert`: Multi-tenant data isolation, subscription feature gates, billing quotas, and organization scoping.
   - `microservice-expert`: Distributed system domain boundaries, BullMQ worker queues, Socket.IO gateways, and Redis TTL caching.

## 1. Single Source of Truth

The `PROJECT.md` file (located at the root of the project) is the single source of truth for all progress tracking.

**CRITICAL RULE:** Only the `project-manager` agent is allowed to update the `Development Progress` and `Priority Roadmap` sections of `PROJECT.md`. Other subagents must report to the `project-manager` rather than modifying this file directly.

## 2. Important File Locations

- **PROJECT.md:** `E:/ToDo/BSofts/PROJECT.md`
- **implementation_plan.md:** `C:/Users/M.ZITOUNI/.gemini/antigravity/brain/fdcaefcc-2b6c-401d-abc7-d6705100e888/implementation_plan.md`
- **task.md:** `C:/Users/M.ZITOUNI/.gemini/antigravity/brain/fdcaefcc-2b6c-401d-abc7-d6705100e888/task.md`
- **Scratch Output Directory:** `E:/ToDo/BSofts/Scratch/Output/`

All temporary scripts, dumps, and scratch output MUST go into the Scratch Output directory.

## 3. Task Tracking Format

Tasks are tracked in `task.md` using the following exact format:

- `[ ]` Todo
- `[/]` In-progress
- `[x]` Done

When a phase completes, you must first mark the phase tasks as done (`[x]`) in `task.md`.

## 4. Progress Reporting Format

When the `project-manager` updates `PROJECT.md`, it must use this exact format for completed phases:

`[x] Phase N: Description (completed YYYY-MM-DD)`

## 5. Dependency Chains and Phase Ordering

- **Phase 0:** The shared utilities phase (Phase 0) MUST be completed entirely before any work begins on specific pages.
- **Strict Ordering:** The phase ordering defined in `implementation_plan.md` MUST be respected. You are never allowed to skip phases.

## 6. Subagent Reporting Duties

When a subagent completes its assigned task, it must send a message back to the `project-manager` agent containing:

1. The exact files that were modified.
2. A summary of the functions/components changed.
3. Confirmation that TypeScript errors were resolved.

## 7. Quality Gates

After every phase is completed, the agent must run the TypeScript compiler to ensure code quality.

Command: `npx tsc --noEmit`

This command must be run in both the `web/` and `backend/` directories.
The phase is NOT complete unless both commands return exactly zero errors.

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
