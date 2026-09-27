# Marketing site

Landing pages, lead-capture forms, A/B-tested variants, region-routed homepages. Traffic is bursty (campaigns drive spikes). Bot traffic can be substantial.

## Typical billing shape

Edge Requests dominate. Image Optimization is high (hero images, illustrations, product screenshots). Bandwidth matters for video content. Function Duration is usually low — most pages are static or ISR.

## Priority patterns

1. **Aggressive caching at the edge.** Marketing pages rarely change between campaign updates. `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800` keeps the CDN warm for 24h and stale-serves for a week.
2. **Bot Protection.** Marketing campaigns attract competitor scrapers and bot traffic that inflates edge requests without delivering value. If edge cost is > $100/month and Bot Protection is disabled, this is almost always the top platform rec.
3. **ISR for content-driven sections.** Customer logos, testimonials, "latest blog post" widgets, pricing tables — anything coming from a CMS. Revalidate hourly or on webhook.
4. **A/B test logic at the edge, not in the page.** Edge Middleware for the variant assignment; cached static page per variant. Don't render the variant choice on every request.
5. **Defer all third-party JS post-hydration.** Analytics, chat widgets, marketing pixels, cookie banners. None of them block the LCP. Cite `vercel-react-best-practices:bundle-defer-third-party`.

## Frequent gotchas

- **Hero images served at native resolution.** A 4MP hero image on every viewport, including mobile. `next/image` with `sizes` is mandatory.
- **Cookie banner blocks first paint.** GDPR-compliant cookie banners often render synchronously in the head. Defer; render after hydration; persist consent state via a tiny inline script.
- **Tracking pixel waterfalls.** Three different analytics services loaded in a chain. Load them after hydration in parallel; better yet, replace some with server-side tracking via webhook.
- **`/api/contact` is the only function but runs hot.** Marketing sites are mostly static but the contact form gets bot-spammed. Rate limit at middleware; consider a queue for outgoing emails.

## Cross-references

- `https://vercel.com/docs/bot-management` — almost always the right platform rec
- `https://vercel.com/docs/incremental-static-regeneration` — for CMS-driven sections
- `https://nextjs.org/docs/app/api-reference/components/image` — hero/illustration optimization
- `vercel-react-best-practices:bundle-defer-third-party` — defer analytics/pixels
- `https://nextjs.org/docs/app/building-your-application/routing/middleware` — A/B variant routing at the edge


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
