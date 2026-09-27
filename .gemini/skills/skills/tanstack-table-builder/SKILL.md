---
name: tanstack-table-builder
description: Builds high-density, sortable, filterable, and paginated data tables using @tanstack/react-table and standardized BSOFTS table blueprints.
---

# TanStack Table Builder & Standardized DataTable Blueprint Skill

This skill defines the mandatory design patterns, column standards, sorting logic, and responsive layout rules for all BSOFTS Data Tables across Next.js dashboard pages.

---

## 1. Canonical BSOFTS DataTable Blueprint (Permissions Table Standard)

All management tables (`permissions`, `functions`, `logs`, `companies`, `packs`, `modules`, `subscriptions`, `notifications`, `messages`) MUST conform to the exact visual design standard set by the Permissions Table:

- **Container Header (`thead tr`)**: `<tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">`
- **Cell Padding**: Standardized to `px-6 py-3.5` for all table headers and cells.
- **Row Styling**: High-density rows with hover state `<tr className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">`.
- **Zebra Striping / Contrast**: Clean glassmorphism backdrop with slate borders (`border-slate-200/60 dark:border-slate-800/60`).

---

## 2. Click-to-Sort DataTable Header Standard

All interactive table headers MUST support click-to-sort with visual direction indicators:

```tsx
<th className="px-6 py-3.5">
  <button
    onClick={() => handleSort("column_name")}
    className="flex items-center gap-1 font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
  >
    Column Label <SortIcon field="column_name" />
  </button>
</th>
```

`SortIcon` rendering standard:
```tsx
const SortIcon = ({ field }: { field: SortField }) => {
  if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="w-3 h-3 text-[#A70000]" />
  ) : (
    <ArrowDown className="w-3 h-3 text-[#A70000]" />
  );
};
```

---

## 3. Always-Visible Action Buttons Rule

- **No Hover-Only Hidden Actions**: Action buttons (Edit, View, Delete, Toggle Status) in data tables MUST remain **always visible** with high contrast and explicit icon tooltips. Hovering should enhance interaction (e.g. slight background tint or glow), never reveal hidden buttons.
- **Actions Header Alignment**: Standardized to `<th className="px-6 py-3.5 w-36 text-right font-bold text-slate-500 uppercase tracking-wider">Actions</th>`.

---

## 4. Standardized Responsive Filter Blueprint (`< 1024px` Modal vs `>= 1024px` Inline Bar)

Every management table page MUST handle responsive filters cleanly:

1. **Desktop & Large Screens (`>= 1024px` / `hidden lg:flex`)**:
   - Search input (`lg:flex-1`) + Inline filters (`hidden lg:flex items-center gap-2.5` containing Status select, Start/End Date range pickers, Reset button) + `View Mode Switcher`.

2. **Mobile & Tablet Screens (`< 1024px` / `flex lg:hidden`)**:
   - Search input + **"Filters" button** (`flex lg:hidden items-center gap-2`) with `Filter` icon and active filters indicator (`<span className="w-2 h-2 rounded-full bg-[#A70000]" />` / active counter badge).
   - Clicking the "Filters" button opens a clean `<Modal title="Filter Records" isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>`.

---

## 5. Status Badges & Contrast Rules

- **Contrast Rule**: Never use dark green text on dark red backgrounds or poor contrast badges.
- **Active Badges**: High contrast white text on emerald backgrounds (`bg-emerald-600 dark:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full text-[10px] uppercase`).
- **Money Formatting**: Storage as integer millimes (TND). Always display as `(value / 1000).toFixed(3) + ' TND'`.

---

## 6. RemoteDataTable vs Hand-rolled Table

- Use `RemoteDataTable` (`web/src/components/ui/remote-data-table.tsx`) for server-side paginated data.
- Use hand-rolled HTML tables conforming to Section 1 for customized multi-mode views (Table / Split / Cards / Tree).

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
