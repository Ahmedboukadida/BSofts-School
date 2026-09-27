# Contributing to `vercel-optimize`

Keep changes small, metric-grounded, and fixture-tested. Runtime code lives in `skills/vercel-optimize`; tests and fixtures live in `packages/vercel-optimize-tests` so installed skills stay small.

## Common changes

| Change | Edit | Test |
|---|---|---|
| Gate | `lib/gates/<id>.mjs`, `lib/gates/index.mjs` | `node --test packages/vercel-optimize-tests/test/*gate*.test.mjs` |
| Scanner | `lib/scanners/<id>.mjs`, `lib/scanners/index.mjs` | Scanner-specific test in `packages/vercel-optimize-tests/test/` |
| Citation | `references/docs-library.json` | `node skills/vercel-optimize/scripts/check-citations.mjs` |
| Support topic | `references/support-topics/<id>.md` | `node --test packages/vercel-optimize-tests/test/support-topics.test.mjs` |
| Playbook | `references/playbooks/<profile>.md` and selection matrix in `references/scoring.md` | `node --test packages/vercel-optimize-tests/test/support-topics.test.mjs packages/vercel-optimize-tests/test/investigation-brief.test.mjs` |
| Renderer or verifier | `lib/render-report.mjs`, `lib/verify-claim.mjs`, or related module | Focused test plus full test suite |

Generated docs:

```bash
node skills/vercel-optimize/scripts/build-docs.mjs
node skills/vercel-optimize/scripts/check-docs-fresh.mjs
```

Full test loop:

```bash
node --test packages/vercel-optimize-tests/test/*.test.mjs
node skills/vercel-optimize/scripts/check-docs-fresh.mjs
node skills/vercel-optimize/scripts/check-citations.mjs
```

## Rules

- No runtime dependencies. Scripts use Node.js 20+ built-ins and the Vercel CLI.
- No recommendation without a Vercel metric signal, code evidence when code changes are proposed, and an allow-listed citation.
- No invented URLs, exact savings projections, or version-mismatched framework APIs.
- No internal repo paths, service names, customer names, or captured private output in fixtures.
- Keep generated report copy customer-facing. Put debug details behind `--debug-out`.

## Output contracts

Every JSON-emitting script must be deterministic: stable key order, stable sort order, 2-space indentation, trailing newline. If a consumed schema changes, update the schema version and the fixture tests in the same PR.


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
