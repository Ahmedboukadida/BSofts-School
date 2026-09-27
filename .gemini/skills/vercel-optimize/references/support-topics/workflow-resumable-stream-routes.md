---
id: workflow-resumable-stream-routes
title: Workflow resumable stream routes
status: active
candidateKinds: ["slow_route"]
frameworks: ["*"]
routePatterns: ["(^|/)api/.*/stream/?$", "(^|/)chat/.*/stream/?$", "\\[id\\].*/stream"]
priority: 98
citations: ["https://workflow-sdk.dev/docs/ai/resumable-streams", "https://workflow-sdk.dev/docs/foundations/streaming", "https://vercel.com/docs/workflow"]
maxBriefChars: 850
---

## Investigation Brief
Stream-shaped routes may be Workflow SDK reconnection endpoints. Long wall-clock duration can be the live client connection.

## Evidence To Check
Look for `WorkflowChatTransport`, `getRun`, `run.getReadable`, `startIndex`, `x-workflow-run-id`, `x-workflow-stream-tail-index`, `getWritable`, or `createUIMessageStreamResponse`. Compare CPU, TTFB, wall-clock. Check full replay, missing tail-index, unreleased locks, or unclosed streams.

## Do Not Recommend When
Do not cache stream endpoints or remove resumability. Do not call high duration a bug when CPU is low, TTFB is healthy, and the route only holds a client connection.

## Verification
Name whether the route starts or reconnects a run, then cite the exact waste: replay, missing tail-index, lock leak, unclosed stream, high CPU, or avoidable pre-first-byte work.


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
