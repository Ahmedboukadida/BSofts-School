# AI application

LLM-backed apps, agents, code-sandbox tools, RAG pipelines. Cost shape is dominated by per-token AI Gateway spend and Sandbox active-compute time, not edge requests or function duration. Many AI customers also have a SaaS surface (auth, dashboards), but the cost lever lives upstream of the dashboard.

## Typical billing shape

AI Gateway > Sandbox Active Compute > Function Duration > Function Invocations. Edge Requests usually quiet; ISR rarely applies. Observability Events can climb fast if every tool-call span is captured at full fidelity.

## Priority patterns

1. **Provider failover.** Configure AI Gateway with an active-active fallback chain across providers (OpenAI + Anthropic, or model-family pairs). Critical-path agents must not be single-provider — a 429 from one provider becomes a user-visible outage otherwise. Field example: MELI runs homegrown active-active routing because retry-on-error against a single provider degraded their NLP-on-support flow.
2. **OIDC keyless auth, not explicit API keys.** In production, use the AI Gateway OIDC binding so requests are signed by deployment identity. In local dev, `vercel env run -- <cmd>` rotates OIDC each run. An explicit `AI_GATEWAY_API_KEY` in repo env vars is a regression — it bypasses keyless and creates a long-lived secret.
3. **Sandbox reuse over per-request `Sandbox.create`.** Each fresh sandbox costs at least 1 minute of billed compute (boot + teardown rounded up). When isolation isn't required (single-tenant agents, shared workspaces), pool sandboxes by name (`sandbox.get(name)`) — auto-snapshot on death + auto-resume on next get is the persistence model.
4. **`after()` / `waitUntil()` for tool logging.** Tool-call telemetry, audit writes, and analytics should never block the user response. Use `after()` (Next 15+) or `waitUntil()` from `@vercel/functions` for any write that doesn't affect the streamed response.
5. **Fluid Compute for JIT/process warmth.** Streaming LLM responses benefit from warm processes; the GraphQL/Apollo JIT cache + persisted-document plans only pay back when processes survive across requests. Fluid is the default; disabling it on AI workloads is almost always wrong.

## Frequent gotchas

- **Single-provider lock-in.** "We're using AI Gateway" doesn't imply failover — the provider list still has to be configured. A single-provider gateway is a thinner wrapper, not multi-provider resilience.
- **Sandbox-per-request.** `new Sandbox(...)` inside a per-request handler with no `id` argument creates a fresh microVM each time. Cheaper to pool when isolation allows.
- **BYOK fallback cost invisible.** AI Gateway with BYOK silently falls back to system credits on 429 / provider outage; cost migrates from "free BYOK" to "billed credits" without a separate signal unless tracked.
- **Observability Events runaway.** Captured every tool call + every streamed delta at 100% sampling — events SKU climbs above 30% of bill. Cap span cardinality before scaling traffic.

## Cross-references

- [external-api-critical-path](../support-topics/external-api-critical-path.md) — sequential vs parallel calls; AI Gateway is one external API among others
- [fluid-compute-caveats](../support-topics/fluid-compute-caveats.md) — module-state hazards and shared-instance caveats
- [function-duration-io-and-after](../support-topics/function-duration-io-and-after.md) — `after()` for post-response tool logging
- [observability-events-cost-attribution](../support-topics/observability-events-cost-attribution.md) — when Observability Events climb above 20% of bill
- [use-cache-remote-shared-origin-data](../support-topics/use-cache-remote-shared-origin-data.md) — caching shared LLM context or embedding lookups
- `https://vercel.com/docs/ai-gateway` — provider configuration, failover chain
- `https://vercel.com/docs/vercel-sandbox` — `sandbox.get(name)` and active-compute billing


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
