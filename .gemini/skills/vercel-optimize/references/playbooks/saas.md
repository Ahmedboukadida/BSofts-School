# SaaS

Multi-tenant applications with authenticated dashboards, settings, billing. Auth-gated by default. Traffic skews toward function duration (per-user data fetches) over edge requests.

## Typical billing shape

Function Duration dominates (every dashboard request runs the function fully — no edge caching for auth-gated content). Edge Requests grow with API surface. ISR rarely applies. Image Optimization rarely material.

## Priority patterns

1. **Per-request memoization with React.cache().** Server Components called from multiple places in the same request tree often re-query the database. `React.cache()` dedupes within the request. Cite `vercel-react-best-practices:server-cache-react`.
2. **Parallel data loads in Server Components.** Dashboards typically load user + org + billing + recent-activity. Run all four in parallel via `Promise.all`. Cite `vercel-react-best-practices:async-parallel` and `:server-parallel-fetching`.
3. **Fluid Compute.** Auth-gated routes have higher cold-start sensitivity (every cold start is a user waiting). If cold-start signal shows up in observability, Fluid Compute is usually the right account-level rec.
4. **Async work after response.** Activity logs, audit trails, analytics events — anything that doesn't block the user — should run via `after()` (Next 15+) or `waitUntil()` from `@vercel/functions`. Cite `vercel-react-best-practices:server-after-nonblocking`.
5. **Suspense boundaries around expensive widgets.** The dashboard shell renders fast; widgets stream in. This shifts perceived latency without changing the underlying queries.

## Frequent gotchas

- **N+1 ORM queries.** A list page that loops over results and fetches related records per-item. Especially common with Prisma's `.findUnique` inside a `.map`. Use `include` or batch via DataLoader.
- **Sequential session+permission checks.** `await getSession()` then `await checkPermissions()` then `await loadData()` — these can often be parallelized when the permissions check doesn't depend on the data load.
- **No connection pooling on serverless.** Prisma without a pooler exhausts the database under load. Connection pooling is mandatory.
- **Polling for state from the client.** Every poll is a function invocation. Replace with SWR + on-demand revalidation, or with `revalidateTag` triggered by the mutation that actually changes state.

## Cross-references

- `vercel-react-best-practices:server-cache-react` — per-request dedup
- `vercel-react-best-practices:server-parallel-fetching` — restructure for Promise.all
- `vercel-react-best-practices:async-suspense-boundaries` — stream the dashboard shell
- `vercel-react-best-practices:server-after-nonblocking` — defer audit/analytics writes (Next 15+)
- `vercel-react-best-practices:client-swr-dedup` — replace polling with SWR
- `https://vercel.com/docs/fluid-compute` — when cold starts hurt


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
