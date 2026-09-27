# Content site

Documentation, blogs, knowledge bases, marketing-adjacent content with mostly static pages. Authoring may be headless-CMS-driven or markdown-in-repo.

## Typical billing shape

Edge Requests dominate (every page view is an edge request; static assets even more). Image Optimization is often the #2 line item. Function Duration tends to be low — most pages should be static or ISR.

## Priority patterns

1. **Pre-render everything that can be pre-rendered.** Blog index, individual posts, docs pages, category pages. Use `generateStaticParams` for App Router or `getStaticPaths` for Pages Router. Anything CMS-driven should run on a webhook revalidation, not on every request.
2. **ISR with a sensible cadence.** Pages that need fresh-ish content but don't need real-time accuracy go ISR. `revalidate: 3600` (hourly) is a good starting point for docs; `60s` for blog index pages.
3. **`next/image` for every image asset.** Hero images, author photos, post inline images, OG images. Even thumbnail-only sites benefit from format negotiation (WebP/AVIF).
4. **`next/font` for self-hosted fonts.** Eliminates FOIT/FOUT, eliminates the third-party request, prevents CLS.
5. **Prefetch on hover.** `next/link` does this by default. For other frameworks, consider intersection-observer-based prefetch on the visible link set.

## Frequent gotchas

- **`force-dynamic` on the blog index.** Almost never necessary. The index can ISR or be fully static.
- **Markdown rendering on every request.** If you're parsing MDX at request time, you're paying function-duration cost on what should be a static asset. Build-time MDX → static HTML.
- **Search rebuilt on every request.** Site search backed by a function that queries a CMS on every keystroke. Move to a search index (Algolia, Pagefind, build-time generated) and serve from the CDN.
- **CMS preview routes leaking into production traffic.** A `/preview/[slug]` route that's effectively another rendering path; sometimes called from production by mistake. Audit referrers.

## Cross-references

- `https://nextjs.org/docs/app/api-reference/functions/generate-static-params` — for pre-rendering
- `https://vercel.com/docs/incremental-static-regeneration` — for the ISR fix
- `https://nextjs.org/docs/app/api-reference/components/image` — image optimization
- `https://nextjs.org/docs/app/api-reference/components/font` — self-hosted fonts
- `vercel-react-best-practices:bundle-defer-third-party` — defer analytics/cookie banners


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
