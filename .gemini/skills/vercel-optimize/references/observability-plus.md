# Observability Plus Stop-And-Ask

Use this file only when `signals.observabilityPlusBlocker` is set. Do not silently continue into scanner-only mode unless the user chooses that path.

## Why This Check Exists

This is a data dependency, not an upgrade pitch. The skill ranks work by observed route behavior so it can separate hot, expensive paths from code that only looks suspicious. These gates need per-route metrics:

| Gate | Required signal |
|---|---|
| `slow_route` | Function duration and invocation count by route |
| `uncached_route` | Cache result and request count by route |
| `cold_start` | Function start type by route |
| `route_errors` | Function status by route |
| `isr_overrevalidation` | ISR reads and writes by route |
| `middleware_heavy` | Middleware invocations and duration |
| `cwv_poor` | Core Web Vitals by route |
| `platform_bot_protection` | Fast Data Transfer by bot category |

Scanner-only mode can still catch traffic-independent code issues, but it cannot rank the hottest routes or prove cost impact. Make that tradeoff explicit before continuing.

## User Template

Render this template first, then wait for the user's choice. Replace only `<detail>`. Do not add a preface; the heading is the opening line.

```md
**Per-route metrics are unavailable.**

<detail>

This audit needs route-level metrics to rank fixes by observed latency, cache hit rate, error rate, cold-start rate, and Incremental Static Regeneration reads and writes. Without them, I can run a scanner-only audit for traffic-independent code issues, but I cannot tell which routes matter most or prove cost impact.

Docs: https://vercel.com/docs/observability/observability-plus

Choose one:
1. Enable Observability Plus, then re-run the metric-backed audit.
2. Continue in scanner-only mode for a limited audit.
```

If the host supports a structured question tool, use this exact customer-facing copy. Do not rewrite it.

```json
{
  "question": "Enable Observability Plus and re-run, or continue with a limited scanner-only audit?",
  "header": "Observability Plus",
  "options": [
    {
      "label": "Enable and re-run",
      "description": "Use route-level metrics to rank the routes that matter most for cost and performance."
    },
    {
      "label": "Run scanner-only",
      "description": "Check traffic-independent code patterns without route ranking or proven cost impact."
    }
  ]
}
```

Use the full product name in this question. Do not abbreviate product names or metrics in customer-facing blocker copy.

## After The User Chooses

If the user chooses **Enable and re-run**, stop after this short response:

```md
Enable Observability Plus from the Vercel dashboard's Observability tab, then tell me to rerun. I'll restart the metric-backed audit once route-level metrics are available.
```

Do not include raw team IDs, org IDs, project IDs, pricing language, dashboard screenshots, or extra persuasion. The docs link in the blocker message already covers availability and billing details.

If the user chooses **Run scanner-only**, continue with the scanner-only steps below.

## Blocker Copy

| Blocker | Detail |
|---|---|
| `payment_required` | `Detected: route-level metrics were recognized for this team, but these metric queries are not usable.` |
| `no_oplus_probe` | `Detected: this team does not expose the route-level metrics this audit needs.` |
| `not_linked` | `Detected: this app directory is not linked to a Vercel project.` |
| `forbidden` | `Detected: the Vercel CLI is authenticated to a team that cannot read this project.` |
| `project_not_found` | `Detected: the project ID is not visible to the authenticated team.` |
| `project_disabled` | `Detected: route-level metrics are enabled for the team but disabled for this project.` |
| `all_failed_other` | `Detected: every per-route metric query failed. Error code: <code>.` |

For `not_linked`, do not use the Observability Plus template. Link the app directory first:

```bash
vercel link --yes --project <project-name-or-id> --cwd <app-dir>
```

Add `--team <team-id-or-slug>` when the team is known. If the user supplied both app path and project name, run the link command instead of asking them what to do.

For `forbidden` and `project_not_found`, ask the user to confirm the exact Vercel project and team/personal scope before presenting the Observability Plus choice.

For `project_disabled`, do not present it as a team subscription problem. Ask the user to enable Observability Plus for this project, then re-run.

For `no_traffic`, do not use this template. Tell the user the project has no meaningful traffic in the 14-day window, then ask whether to run scanner-only mode now or come back after traffic accumulates.

## Scanner-Only Mode

If the user picks scanner-only mode:

1. Re-run `node scripts/collect-signals.mjs [projectId] --continue-without-observability > "$RUN_DIR/vercel-signals.json" 2> "$RUN_DIR/collect.stderr"` if the current `signals.json` stopped at the fast blocker (`usageError=NOT_COLLECTED_OBSERVABILITY_BLOCKED` or `project=null`).
2. Run code scanners.
3. Launch only traffic-independent findings.
4. Render a clear data gap: per-route metric gates were skipped because Observability Plus data was unavailable.

Do not imply the scanner-only report is a complete optimization audit.


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
