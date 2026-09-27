---
name: glassmorphic-ui-designer
description: Enforces BSOFTS state-of-the-art glassmorphism design tokens, rich high-density layouts, interactive micro-animations, and complete form modal schemas.
---

# Glassmorphic UI Designer Skill

This skill enforces the BSOFTS dual-theme design system. **You MUST handle both Dark AND Light mode simultaneously.** NEVER hardcode dark-only classes without a light mode counterpart.

---

## 1. Dual-Theme Token Reference

Use these EXACT class combinations:

| Element                 | Required Classes (Light + Dark)                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card / Container**    | `bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl rounded-2xl`                                                                     |
| **Form Input / Search** | `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#A70000]/30 rounded-xl px-4 py-2.5` |
| **Table Header Row**    | `bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-500 tracking-wider px-6 py-3.5`                                  |
| **Table Body Row**      | `hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-700 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/60 px-6 py-3.5`                             |
| **Table Row Divider**   | `divide-y divide-slate-100 dark:divide-slate-800`                                                                                                                                                 |
| **Section Label**       | `text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest`                                                                                                                 |
| **KPI Banner**          | `bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 text-slate-900 dark:text-white`                                                |

---

## 2. Forbidden Patterns (NEVER USE)

- `bg-slate-900/60 border border-white/10 text-white` (Pitch-black input on white page)
- Hidden action buttons that only reveal on row hover (Action buttons MUST remain **always visible** with high contrast)
- Dark green text on red status badges (Active status badges MUST use **white text on emerald background**)
- `window.alert()` or `window.confirm()` — ALWAYS use `<Modal>` + `toast.error()`/`toast.success()`

---

## 3. The 5-Layer Page Anatomy

Every Dashboard module page follows this structure:

1. **Header:** `ViewHeader` with page title, icon, breadcrumbs, badge, primary action button.
2. **KPI Banner:** 3-4 key metrics with glassmorphic cards.
3. **Filter Toolbar:** Search input (`lg:flex-1`), responsive filter controls (`< 1024px` Filter Modal button vs `>= 1024px` inline bar), view mode switchers.
4. **Data Presentation:** High-density DataTable (Permissions blueprint), Cards Grid, Split View, Tree View, or Matrix.
5. **Modals:** Create (`3xl`), Edit (`3xl`), Delete Confirm (`md`), Bulk Delete (`md`), Filter Modal.

---

## 4. Status Badges & Contrast Rules

- `ACTIVE`: High contrast white text on emerald badge (`bg-emerald-600 dark:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full text-[10px] uppercase`)
- `INACTIVE`: `bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30`
- `SUSPENDED` / `EXPIRED`: `bg-red-500/10 text-red-500 border-red-500/30`
- `PENDING`: `bg-amber-500/10 text-amber-500 border-amber-500/30`

---

## 5. Responsiveness & Filter Modal Rules

- **< 1024px**: Filter controls are collapsed behind a dedicated "Filters" button with active badge indicator opening `<Modal title="Filter Records">`.
- **>= 1024px**: Filter controls are displayed inline in the search toolbar.
- **Table View**: Tables scroll horizontally (`overflow-x-auto`) with minimum table width (`min-w-[850px]`).

---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Dual-Route Path Alias Rule**: All NestJS controllers handling route paths register single canonical kebab-case routes.
3. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` god-mode bypass logic across all guards.
4. **Strict DTO Validation**: All Create & Update DTOs must enforce 100% `class-validator` decorator coverage.


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
