---
name: resolving-merge-conflicts
description: Use when you need to resolve an in-progress git merge/rebase conflict.
risk: unknown
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/resolving-merge-conflicts
source_repo: mattpocock/skills
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/mattpocock/skills/blob/main/LICENSE
---


## When to Use

Use when you need to resolve an in-progress git merge/rebase conflict.

1. **See the current state** of the merge/rebase. Check git history, and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made, and what the original intent was. Read the commit messages, check the PRs, check original issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour. Always resolve; never `--abort`.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests, then format. Fix anything the merge broke.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase process until all commits are rebased.

## Limitations

- Use this skill only when the task clearly matches its upstream source and local project context.
- Verify commands, generated code, dependencies, credentials, and external service behavior before applying changes.
- Do not treat examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.


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
