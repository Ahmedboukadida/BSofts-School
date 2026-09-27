# Report Template

Use this template for diagnosis and repair recommendations. Keep reports short and evidence-based.

## Conclusion values

- `NO_CONFLICT_FOUND` - No migration conflict or structural inconsistency was found from available
  evidence.
- `SAFE_TO_REGENERATE` - The conflict is understood, schema source is resolved, and the recommended
  next step is to discard generated artifacts and regenerate migrations.
- `NEEDS_USER_CONFIRMATION` - A repair path exists, but a destructive step or branch-side decision
  requires confirmation.
- `BLOCKED_BY_AMBIGUITY` - The migration structure, source-of-truth branch, schema state, or
  migration directory cannot be determined safely.

## Template

````markdown
# Drizzle Migration Conflict Report

Conclusion: <NO_CONFLICT_FOUND | SAFE_TO_REGENERATE | NEEDS_USER_CONFIRMATION | BLOCKED_BY_AMBIGUITY>
Mode: <diagnose | repair | ci-hardening | explain>

## Detected Structure
- Migration directory: `<path>`
- Structure: <legacy | folder-based | mixed | unknown>
- Drizzle Kit version: <version or unable to verify>
- Git state: <clean | dirty | active merge | active rebase | unable to verify>

## Conflict State
- <confirmed conflict or inconsistency with file paths>
- <journal/snapshot/SQL mismatch, non-commutative check, or conflict marker evidence>

## Recommended Path
- <safe next step>
- <why this path preserves schema intent and migration history>

## Commands
```bash
# Read-only commands first.
<commands>

# Destructive commands only if confirmed by the user.
<commands requiring confirmation>
```

## Files At Risk
- `<path>` - <why it may be discarded or regenerated>

## Validation
- <drizzle-kit check or project script>
- <helper script command>
- <typecheck/test command if relevant>

## Unable To Verify
- <missing version, unavailable branch, unknown migration path, or external docs not refreshed>
````

## Reporting rules

- Put destructive commands in a clearly labeled block.
- Do not output `--ours` or `--theirs` commands unless the merge/rebase direction, source-of-truth
  branch, and exact file paths are confirmed. Otherwise use `BLOCKED_BY_AMBIGUITY`.
- If the project has multiple Drizzle configs, report each output independently.
- If no conflict is found but the worktree is dirty, state that uncommitted files were not repaired.
- Do not include clean checklist categories that are irrelevant to the user's conflict.
- Redact secrets. Never include database URLs, passwords, tokens, or connection strings in the
  report. When a config or env value matters, describe only whether it points at a production-like
  target and write the value as `<redacted>`.


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
