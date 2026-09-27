---
name: nextjs-app-router-builder
description: Constructs Next.js App Router dashboard routes, page layouts, loading skeletons, interactive modal dialogs, and standardized responsive data views.
---

# Next.js App Router Builder Skill

This skill governs the construction of Next.js App Router pages, state management, API interactions, responsive filter layouts, and full CRUD operations in BSOFT.

---

## 1. Page Component Structure & Anatomy

Every page (`web/src/app/dashboard/[module]/page.tsx`) must follow this standard anatomical order:

1. **Imports**: React hooks, lucide-react icons, UI components (`ViewHeader`, `Modal`, `DataCard`), API client.
2. **Hooks**: `useAuthContext`, `useCompanyContext`, `useLang`, `useToast`.
3. **State**: Data arrays, pagination, search (`subSearch`/`q`), filter states (`statusFilter`, `startDate`, `endDate`, `isFilterModalOpen`), view mode (`"table" | "cards" | "split" | "tree" | "matrix"`), selection sets, modals (create/edit/delete).
4. **Effects**: Data fetching via `useCallback` + `useEffect` + WebSocket listeners (`useSocket`).
5. **Memoized Filter & Sort**: Client/server side filtering and click-to-sort logic (`useMemo`).
6. **Handlers**: CRUD operations (`handleCreate`, `handleEdit`, `handleDelete`, `handleBulkDelete`).
7. **JSX Structure**:
   - `ViewHeader` (title, description, icon, breadcrumbs, badge, refresh & view mode actions)
   - KPI Summary Cards grid (4 cards with icons & metrics)
   - Standardized Control & Search Toolbar (`< 1024px` Filter button vs `>= 1024px` inline filters)
   - Primary View Container (High-density DataTable, Cards Grid, Split view, Tree view, or Permission Matrix)
   - Modals (Create, Edit, Delete, Bulk Delete, Filter Modal)

---

## 2. Standardized Control & Search Toolbar Blueprint

Every dashboard list page MUST implement this responsive filter architecture:

```tsx
{/* ── Standardized Control & Search Toolbar ───────────────────────── */}
<div className="bg-white/80 dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-sm">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
    {/* Search Input */}
    <div className="relative w-full lg:flex-1">
      <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search records..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#A70000] font-mono h-10"
      />
      {search && (
        <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>

    {/* Small & Medium Screens (< 1024px): Open Filter Modal Button */}
    <div className="flex lg:hidden items-center gap-2 w-full">
      <button
        type="button"
        onClick={() => setIsFilterModalOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer h-10"
      >
        <Filter className="w-4 h-4 text-[#A70000]" />
        <span>Filters</span>
        {(statusFilter !== "ALL" || startDate || endDate) && (
          <span className="w-2 h-2 rounded-full bg-[#A70000]" />
        )}
      </button>
      {(statusFilter !== "ALL" || startDate || endDate) && (
        <button
          type="button"
          onClick={() => { setStatusFilter("ALL"); setStartDate(""); setEndDate(""); }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer h-10"
        >
          Reset
        </button>
      )}
    </div>

    {/* Large Screens (>= 1024px): Display filters directly inline */}
    <div className="hidden lg:flex items-center gap-2.5 w-auto">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#A70000] h-10 cursor-pointer"
      >
        <option value="ALL">All Statuses</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="EXPIRED">EXPIRED</option>
      </select>

      <div className="relative min-w-[135px]">
        <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#A70000] h-10"
          title="Start Date"
        />
      </div>

      <div className="relative min-w-[135px]">
        <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#A70000] h-10"
          title="End Date"
        />
      </div>

      {(statusFilter !== "ALL" || startDate || endDate) && (
        <button
          type="button"
          onClick={() => { setStatusFilter("ALL"); setStartDate(""); setEndDate(""); }}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-[#A70000] hover:bg-[#A70000]/10 transition-colors h-10"
          title="Clear filters"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
</div>
```

---

## 3. Mandatory Hooks and Utilities

- `useLang()`: Returns `{ lang, isRtl }`. Use for RTL layout direction.
- `useAuthContext()`: Returns `{ user, isDeveloper }`.
- `useCompanyContext()`: Returns `{ activeCompany, companyId, switchCompany }`.
- `useTranslations('Dashboard')`: For localizing all UI strings.
- `extractErrorMessage(err)`: Standard exception message extractor for `toast.error()`. NEVER use native `alert()`.

---

## 4. API Client & CRUD Integration

- Import standard API client: `import apiClient from '@/lib/apis/client'`.
- All CRUD calls automatically inject JWT Auth and `x-company-id` header via Axios interceptor.
- Create / Edit / Delete success handlers MUST trigger list refetch and call `invalidateCache()` where applicable.

---

## 5. High-Contrast Status Badges & Money Rules

- **Status Badges**: Use white text on emerald background (`bg-emerald-600 dark:bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full text-[10px] uppercase`). Avoid dark green on red background.
- **Money Values**: Database stores integer millimes (TND). Display formatted as `(price / 1000).toFixed(3) + ' TND'`.

---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Dual-Route Path Alias Rule**: All NestJS controllers handling route paths register single canonical kebab-case routes.
3. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` god-mode bypass logic.
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
