# API service

Headless API backend. No UI routes. Often consumed by mobile apps, partner integrations, or other Vercel projects via rewrites.

## Typical billing shape

Function Duration dominates (every request is a function invocation). Edge Requests scale with API traffic. External API costs matter when the service is a thin shim over third-party APIs (Stripe, Twilio, etc.).

## Priority patterns

1. **Cache GET responses at the edge.** Idempotent GET endpoints (catalog reads, status checks, public data) should ship with `Cache-Control: public, s-maxage=<seconds>, stale-while-revalidate=<longer>`. The CDN serves repeat callers without invoking the function.
2. **Rate-limit at the edge, not the function.** Middleware with proper matcher scoping handles abusive clients before they hit your function-duration bill.
3. **Parallel external API calls.** A "checkout-like" endpoint that calls Stripe + inventory + email-service sequentially is the most common slow_route in this profile. `Promise.all` is the obvious fix.
4. **Background work post-response.** `after()` (Next 15+) for analytics, webhooks-to-self, and any write that doesn't affect the response.
5. **Connection pooling.** Direct PG connections from serverless function instances exhaust the database. Use PgBouncer / Prisma Accelerate / Neon's pooler.

## Frequent gotchas

- **No `Cache-Control` on the public GETs.** This is the most common finding in this profile, and the easiest fix.
- **Auth check serialized with data load.** `await checkAuth()` then `await loadData()` — these are often independent and can run in parallel if your auth path doesn't depend on the data.
- **External API fan-out for one user.** A "build me a profile" endpoint that calls 5 third parties sequentially. Even small latency improvements multiplied by every user are huge.
- **Long-running async operations on the request path.** Image generation, PDF rendering, big report computation. Move these to background queues or `after()`.

## Cross-references

- `https://vercel.com/docs/caching/cdn-cache` — the GET-handler Cache-Control fix
- `vercel-react-best-practices:async-parallel` — parallelize external API calls
- `vercel-react-best-practices:server-after-nonblocking` — `after()` for post-response work
- `https://vercel.com/docs/fluid-compute` — when cold starts on infrequently-called endpoints hurt
- `https://nextjs.org/docs/app/building-your-application/routing/middleware` — for rate-limit middleware


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
