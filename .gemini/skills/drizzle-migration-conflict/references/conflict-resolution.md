# Conflict Resolution Playbook

Use this playbook after collecting repo facts. The goal is to preserve schema intent while replacing
stale generated migration artifacts with a migration generated from the merged schema.

## Decision tree

1. Is the repository currently in a merge or rebase?
   - Check `git status --short` and `git ls-files -u`.
   - If yes, identify whether the user is merging the parent branch into a feature branch, rebasing a
     feature branch, or merging a feature branch into the parent branch.
2. Which migration structure is present?
   - Legacy: `meta/_journal.json`, `meta/*_snapshot.json`, root SQL files.
   - Folder-based: migration directories with `migration.sql` and `snapshot.json`.
   - Mixed or unknown: stop and ask for the intended migration output path.
   - Transitioning (legacy artifacts plus a partial move to folder-based): do not repair until the
     user confirms the target structure. Treat the legacy artifacts and the folder-based artifacts
     as one logical history only after the intended end state is clear; otherwise a repair could
     discard the wrong side.
3. Are schema source files already resolved?
   - If not, resolve those first or tell the user the migration cannot be regenerated safely yet.
4. Is the user asking for diagnosis or repair?
   - Diagnosis stays read-only.
   - Repair can include file changes only after the exact generated files to discard are understood.

## Read-only inspection commands

```bash
git status --short
git ls-files -u
rg --files -g 'drizzle.config.*' -g 'package.json'
rg -n "drizzle-kit|drizzle-orm|db:generate|db:check|migrate" package.json pnpm-lock.yaml yarn.lock package-lock.json 2>/dev/null
python3 <skill-dir>/scripts/check_drizzle_migrations.py --root .
```

If `rg` is not available, use `find` and `grep` equivalents. Resolve `<skill-dir>` to the installed
skill directory before running the helper. Check in order and use the first match that contains
`scripts/check_drizzle_migrations.py`: the target repo's vendored
`skills/drizzle-migration-conflict`, then `~/.claude/skills/drizzle-migration-conflict`, then any
user-reported install location. If none resolve, fall back to the `git`/`rg` inspection commands
above and tell the user the helper was not found.

## Legacy structure repair

Legacy Drizzle output usually looks like this:

```text
drizzle/
  0000_initial.sql
  0001_add_user.sql
  meta/
    _journal.json
    0000_snapshot.json
    0001_snapshot.json
```

Safe flow for a feature branch updated from the parent branch:

1. Resolve schema source conflicts first.
2. Keep the parent branch's migration history as the baseline.
3. Discard generated migration files created on the feature branch after it diverged from the parent
   branch.
4. Re-run the project-approved `drizzle-kit generate` script from `package.json`.
5. Validate the regenerated history.

Do not hand-edit `_journal.json` or snapshot JSON unless the user explicitly asks for an emergency
manual repair and accepts the risk. The next generated migration depends on those snapshots.

### Ours/theirs warning

`ours` and `theirs` change meaning with merge direction:

| Situation | `ours` usually means | `theirs` usually means | Safe guidance |
| --- | --- | --- | --- |
| On feature branch, merging parent branch into it | current feature branch | parent branch being merged in | Parent branch is often `theirs`, but verify before checkout. |
| On parent branch, merging feature branch into it | current parent branch | feature branch | Parent branch is often `ours`, but verify before checkout. |
| Rebase | meaning can be unintuitive | meaning can be unintuitive | Avoid shorthand; use explicit branch/path restore if possible. |

When in doubt, ask which branch should be the migration-history source of truth. Do not guess.

## Folder-based structure repair

Folder-based Drizzle output usually looks like this:

```text
drizzle/
  20260618120000_add_user/
    migration.sql
    snapshot.json
```

Safe flow:

1. Inspect the Drizzle config and env first, then run `drizzle-kit check` or the project script
   wrapping it only with a non-production target.
2. If it reports a non-commutative migration conflict, identify the conflicting migration and any
   later migrations based on it.
3. Remove or regenerate only the generated migration artifacts that are downstream of the conflict,
   after user confirmation.
4. Re-run `drizzle-kit generate` from the merged schema.
5. Re-run the helper script, and re-run `drizzle-kit check` only after confirming the config/env
   target is still non-production.

Use `--ignore-conflicts` only for a known false positive after reviewing why the migrations commute
or why the check is wrong. Include that decision in the report.

## Validation after regeneration

Run validation in tiers so the agent does not accidentally touch a live database or run arbitrary
project scripts.

### Database-free checks

```bash
python3 <skill-dir>/scripts/check_drizzle_migrations.py --root . --migrations-dir <migration-dir>
```

### Loads project config or environment

Run `drizzle-kit check` only after inspecting `drizzle.config.*`, package scripts, and relevant env
variables. Confirm that any database URL or credentials point to a non-production or disposable
target before executing it. Work through this checklist before running the command:

1. Read `drizzle.config.*` and note any `url`, `dbCredentials`, `credentials`, or connection fields.
   Determine whether they are literal, read from `process.env`, or loaded via `dotenv`.
2. Identify which env vars feed those fields (common names: `DATABASE_URL`, `DB_URL`,
   `POSTGRES_URL`, `DRIZZLE_DATABASE_URL`). Check `.env`, `.env.local`, and the package script's
   environment for their values without echoing secrets.
3. If a value points at a production host (named `prod`/`production`, a managed cluster endpoint,
   or a host the user identifies as live), stop and ask for a disposable target. Do not run the check.
4. If `drizzle-kit check` needs a real connection for the configured dialect, prefer overriding the
   URL inline with a disposable/local database, or use a config that disables connection (some
   dialects allow a schema-only check). If neither is possible, fall back to the database-free
   helper script and report that `drizzle-kit check` could not be run safely.
5. Only after the target is confirmed non-production, run the project-approved check command.

```bash
# Project script names vary; inspect package.json first.
# Override with a disposable DATABASE_URL only if the config requires a connection.
DATABASE_URL=postgres://localhost/disposable pnpm exec drizzle-kit check --config <drizzle-config>
```

### Project tests

Run typechecks or tests only after inspecting the script definitions. Tests may run migrations,
connect to databases, mutate fixtures, or start services.

```bash
pnpm typecheck
pnpm test
```

Avoid live database commands unless the user names a disposable database or explicitly requests a
migration run.

## Anti-patterns

- Running `drizzle-kit push` to bypass migration history in production.
- Keeping both sides' generated migrations and manually renumbering files without regenerating from
  the merged schema.
- Resolving `_journal.json` by accepting both sides without verifying SQL and snapshot pairs.
- Using `git checkout --theirs drizzle/` without understanding merge direction.
- Ignoring `drizzle-kit check` with `--ignore-conflicts` as the default team workflow.


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
