---
name: tenant-switcher-governance
description: Governs single vs multi-company top navbar switchers, developer platform-wide "ALL" company mode, and multi-tenant HTTP headers.
---

# Tenant Switcher Governance Skill

This skill enforces rules for multi-tenant switching, single-company direct display, and platform-wide Developer "ALL" mode.

## Core Rules & Standards

### 1. Developer Role Platform-Wide "ALL" Mode
- Developer role users (`isDeveloper === true` or role `Developer`) MUST be granted access to **all companies across the entire platform** via `companiesApi.findAll()`.
- The top option in their company dropdown list MUST be **"ALL Companies"** (`"ALL"` mode).
- Selecting `"ALL"` mode sets `bsoft_active_company_id = "ALL"` in cookies and sends header `X-Company-ID: ALL`.
- In NestJS backend `GlobalSecurityGuard` and `BaseService`, tenant filtering is bypassed when `"ALL"` mode is active.

### 2. Single-Company Direct Display Rule
- For all non-developer users (SuperAdmin, Admin, Employee, Client, Provider) associated with a single company (`companies.length <= 1`), **DO NOT display any dropdown arrow or dropdown list**.
- Display **only the company name directly** in a clean, non-interactive status badge:
  ```tsx
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm select-none">
    <Building className="w-4 h-4 text-[#A70000]" />
    <span className="truncate max-w-[140px] sm:max-w-none">
      {activeCompany?.name || companies[0]?.name || "My Company"}
    </span>
  </div>
  ```


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
