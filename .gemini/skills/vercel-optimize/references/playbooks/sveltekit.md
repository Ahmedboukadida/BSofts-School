# SvelteKit

Framework-specific playbook for SvelteKit projects on Vercel. Applies in
addition to whichever application-profile playbook fits (saas, ecommerce,
content-site, etc.). SvelteKit-on-Vercel ships through
`@sveltejs/adapter-vercel`, so most platform-level recs map to adapter
config rather than per-route framework APIs.

## Typical billing shape

Function Duration dominates server-rendered routes (every `+page.server.ts`
`load` + `+server.ts` POST handler runs as a function). Edge Requests grow
with API surface (`+server.ts` and form actions). ISR is supported via the
adapter; when enabled, it converts to a cache_result HIT after first render.
Image Optimization is rarely a SvelteKit-specific lever (it's the same
Vercel image service Next.js uses).

## Priority patterns

1. **Adapter ISR for cacheable content.** Routes that don't depend on
   per-request data are still served as functions by default. The
   adapter accepts an `isr: { expiration: 60 }` option per route (set
   in `+page.server.ts` via `export const config`). This converts
   function invocations to cache hits. Cite
   `https://kit.svelte.dev/docs/adapter-vercel` +
   `https://vercel.com/docs/incremental-static-regeneration`.
2. **Prerender what's static.** `export const prerender = true` in
   `+page.server.ts` or `+page.ts` moves a route from function to CDN.
   Cite `https://kit.svelte.dev/docs/page-options`.
3. **Parallel `load` fetches.** A `load` function with multiple
   sequential `await fetch(...)` calls leaves wall-clock time on the
   table — wrap them in `Promise.all` (or return promises directly
   from `load`, which SvelteKit streams). Cite
   `https://kit.svelte.dev/docs/load`.
4. **Move per-request work to `+server.ts` action handlers and run
   them via `fetch` from the client.** Reduces SSR cost when only a
   slice of the page actually needs server data on every request.
5. **`hooks.server.ts` matcher hygiene.** Like Next.js middleware, the
   `handle` hook intercepts every request unless filtered. Heavy
   `handle` code multiplies cost by request volume. Move work into the
   specific route's `load` when only that route needs it.
6. **Adapter runtime + region config.** Single-region default; if the
   project's users skew to a different region, set `regions: [...]` on
   the adapter to reduce TTFB by 100-300ms.

## Frequent gotchas

- **Per-route SSR when prerender would do.** Marketing pages, docs,
  blog posts often end up as functions because nobody added
  `prerender = true`. The scanner flags these.
- **`+layout.server.ts` data fetches blocking every child route.**
  Auth-check + user-load in a layout makes EVERY function invocation
  wait on those queries — even routes that don't read user. Push
  user-load into the routes that need it.
- **Adapter version drift.** `adapter-vercel@5` adds new options (ISR,
  split). `adapter-vercel@3` doesn't. The recommender must check the
  installed version before suggesting `isr: ...`.
- **`fetch` calls in `load` to your own SvelteKit routes.** SvelteKit
  optimizes these into direct module calls during SSR, but only if
  the URL is relative. A hardcoded `https://your-domain.tld/api/...`
  defeats this optimization.
- **No connection pooling on serverless.** Same as Next.js — Postgres
  without a pooler exhausts the database under load.

## Cross-references

- `https://kit.svelte.dev/docs/adapter-vercel` — adapter config (ISR, regions, runtime)
- `https://kit.svelte.dev/docs/page-options` — prerender, ssr, csr
- `https://kit.svelte.dev/docs/load` — parallel fetches in load
- `https://kit.svelte.dev/docs/routing` — file conventions
- `https://kit.svelte.dev/docs/hooks` — handle / handleFetch
- `https://kit.svelte.dev/docs/form-actions` — server-side form handling
- `https://kit.svelte.dev/docs/state-management` — request-scoped state
- `https://vercel.com/docs/incremental-static-regeneration` — ISR on Vercel
- `https://vercel.com/docs/fluid-compute` — Fluid Compute (framework-agnostic)


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
