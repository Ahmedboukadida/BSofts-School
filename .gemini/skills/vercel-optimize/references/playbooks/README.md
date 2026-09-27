# Playbooks

Application-profile-specific advice that shapes how recommendations are phrased and ordered. Playbooks never invent claims — every rec still traces to a verified candidate or finding. They tell the recommender what to emphasize when a project matches a profile.

## How a playbook gets applied

1. Step 1 detects the project's stack + dependencies.
2. The recommender heuristics infer an application profile (best guess from frameworks + dep signals).
3. The matching playbook(s) are included in the recommender's context.
4. Recommendations are shaped: ordering tilts toward the profile's priority list; phrasing nods to profile-specific concerns.

## Profile detection (best-effort heuristics)

| Signals → | Profile |
|---|---|
| `@vercel/sandbox`, `@ai-sdk/*`, `ai`, `openai`, `@anthropic-ai/sdk` deps OR AI Gateway / Sandbox SKU active in `usage.services` | `ai-application` |
| `stripe`, `@shopify/*`, `react-stripe-js`, "cart"/"checkout" routes | `ecommerce` |
| `next-auth`, `clerk`, dashboard routes, multi-tenant headers | `saas` |
| Only `pages/api/**` or `app/api/**`, no UI routes | `api-service` |
| Heavy MDX / markdown, mostly static routes | `content-site` |
| Lots of `/(marketing)/` route groups, A/B test deps | `marketing` |

`ai-application` is checked first — AI-shaped customers often share routes with SaaS/ecommerce surfaces, but the billing shape (AI Gateway dominant) and remediation set (provider failover, sandbox reuse, OIDC keyless) belong to this profile.

When detection is uncertain, no playbook is applied. The recommender works fine without one — the playbook is a tilt, not a requirement.

## Playbook schema

Each playbook is a Markdown file with a fixed shape so the recommender can parse it reliably. Required sections:

```markdown
# {Profile name}

## Typical billing shape
(Which dimensions dominate — e.g., "Edge Requests > Function Duration > Image Optimization")

## Priority patterns
(Ordered list of patterns this profile particularly benefits from)

## Frequent gotchas
(Anti-patterns specific to this profile)

## Cross-references
(Rec IDs from recommendations.md or rule names from vercel-react-best-practices)
```

## Contributing a new playbook

1. Identify a clear application profile and one or two representative project profiles that exemplify it.
2. Create `references/playbooks/<profile>.md` matching the schema.
3. Add detection signals to the table above (the heuristics live in the recommender code; document them here).
4. Update the playbook selection matrix in `references/scoring.md`.
5. Run `node --test packages/vercel-optimize-tests/test/support-topics.test.mjs packages/vercel-optimize-tests/test/investigation-brief.test.mjs`. No tests directly cover playbooks (they're content), but the schema validator runs in CI.


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
