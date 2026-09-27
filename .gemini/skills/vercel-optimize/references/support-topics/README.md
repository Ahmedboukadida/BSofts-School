# Support Topics

Support topics are small, candidate-scoped investigation guardrails injected into sub-agent briefs.

They are not recommendations, gates, scanners, or broad documentation. A topic tells the investigator what evidence to check, what false positives to avoid, and when to abstain for one class of candidate.

## Add A Topic

Add one file: `references/support-topics/<id>.md`.

The filename must match the `id`. Frontmatter uses a strict subset of YAML: one `key: value` per line, arrays as JSON arrays.

```md
---
id: cdn-cache-auth-safety
title: CDN cache auth safety
status: active
candidateKinds: ["uncached_route", "cache_header_gap"]
frameworks: ["*"]
priority: 90
citations: ["https://vercel.com/docs/caching/cdn-cache"]
maxBriefChars: 900
---

## Investigation Brief
...

## Evidence To Check
...

## Do Not Recommend When
...

## Verification
...
```

## Rules

- Every active topic must cite only URLs or skill-rule refs already present in `references/docs-library.json`.
- Use `candidateKinds` to keep the topic narrow. Use `"*"` only for workflow/protocol topics that truly apply to every candidate.
- Use optional `metrics` only when a topic applies to a specific candidate metric, such as `["LCP"]`, `["INP"]`, or `["CLS"]` for Core Web Vitals.
- Use optional `routePatterns` as JavaScript regex source strings when a topic should appear only for specific candidate routes, such as `["(^|/)404$"]`.
- Keep the body below `maxBriefChars`; the brief renderer caps selected topics before they reach the sub-agent.
- Put URLs in frontmatter only. Topic bodies should describe checks and guardrails, not cite new sources.
- Do not include internal repository paths, service names, pricing tables, exact savings claims, or framework APIs without version gating.


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
