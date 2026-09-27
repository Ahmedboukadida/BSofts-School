# BSOFTS View QA & Full-Stack Testing Agent (`view-qa-tester`)

## Role & Mission
The **`view-qa-tester`** is a specialized L1 Verification Subagent equipped with the complete blueprint of BSOFT (Backend Architecture, Frontend Matrix, and Prisma Schema). When given any view path (e.g. `/dashboard/inventory/articles`, `/dashboard/saas-core/companies`, `/dashboard/settings`), the agent performs a deep 360-degree audit and test across:

---

## 8 Exact System Architecture Directives

| Rule # | Domain / Layer | Exact Workspace Path | Key Directives & Enforcements |
| :--- | :--- | :--- | :--- |
| **01** | **Frontend Views** | `web\src\app\` | All pages are Next.js 16 App Router views. Must implement standard layout (`flex flex-col gap-6 w-full pb-16`), dual theme (`dark:`), and i18n (`useTranslations`). |
| **02** | **Frontend API Clients** | `web\src\lib\apis\` | All frontend network requests MUST go through API client files located here (or `apiClient` instance). Never hardcode raw fetch calls. |
| **03** | **Frontend Types & Interfaces** | `web\src\types\` | All TypeScript types, DTO shapes, and model interfaces are defined in this folder. Zero `any` allowed. |
| **04** | **Backend Modules & Services** | `backend\src\` | All NestJS modules, controllers, and services reside here. Route controllers enforce static-before-parameterized ordering. |
| **05** | **Prisma Master Schema** | `backend\prisma\schema.prisma` | Master source of truth for 162 models, 66 enums, relations, and foreign keys. All currency fields stored as integer millimes. |
| **06** | **Guards, Auth & RBAC** | `backend\src\common\guards\` & `backend\src\core\auth\` | 4-guard chain (`JwtAuthGuard`, `GlobalSecurityGuard`, `PermissionsGuard`, `SubscriptionFeatureGuard`). Permissions checked via `@RequirePermissions()`. |
| **07** | **Zero Token Wastage File Locators** | Direct directory paths above | Agent immediately reads target files without expensive directory crawls or recursive searches. |
| **08** | **Layout, i18n, & Action Reality Rules** | Cross-layer standards | No fake toasts! Buttons like `Export` must generate real CSV downloads (`exportToCSV`). Modals must use `<Modal>` with `z-[9999]` toasts. |

---

## 3 Core Knowledge Pillars Injected Into the Agent

```
                          ┌─────────────────────────────────────────────────────────────┐
                          │            🧪 view-qa-tester (View QA Agent)                │
                          └──────────────────────────────┬──────────────────────────────┘
                                                         │
         ┌───────────────────────────────────────────────┼───────────────────────────────────────────────┐
         │                                               │                                               │
┌────────┴─────────────────────────────┐  ┌──────────────┴─────────────────────────────┐  ┌──────────────┴─────────────────────────────┐
│ 1. ⚙️ Backend Architecture Engine     │  │ 2. 🎨 Frontend Matrix & UI Actions         │  │ 3. 🗄️ Prisma Schema & Model Relations      │
├──────────────────────────────────────┤  ├─────────────────────────────────────────────┤  ├─────────────────────────────────────────────┤
│ • `backend/src/` Modules/Controllers │  │ • `web/src/app/` Page Anatomy (`w-full`)    │  │ • `backend/prisma/schema.prisma` Models    │
│ • `backend/src/common/guards/` Chain │  │ • `web/src/lib/apis/` Client Calls          │  │ • 162 Models, 66 Enums, Foreign Keys       │
│ • Static-before-param route ordering │  │ • `web/src/types/` Strict Typings           │  │ • Integer Millimes Currency Rule (TND)      │
│ • Real HTTP Probes (GET/POST/DELETE) │  │ • Real Actions (No fake toasts! Real CSV)   │  │ • Soft-Delete & Cascade Rules (`is_deleted`)│
└──────────────────────────────────────┘  └─────────────────────────────────────────────┘  └─────────────────────────────────────────────┘
```

---

## Complete Verification & Action Testing Checklist

1. **Architecture Discovery**:
   - Locates the Next.js page component directly in `web\src\app\...`.
   - Locates API calls in `web\src\lib\apis\...`.
   - Locates types in `web\src\types\...`.
   - Locates backend controller/service in `backend\src\...`.
   - Locates database models in `backend\prisma\schema.prisma`.

2. **Frontend UI & Interactive Action Verification**:
   - Inspects state hooks (`useState`, `useEffect`, `useCallback`).
   - Checks that all action buttons (`+ Create`, `Edit`, `Delete`, `Reload`, `Bulk Actions`, `Export`) are connected to genuine, functional handlers.
   - **Zero Fake Actions Rule**: Any button displaying a toast without triggering actual logic (e.g. export without generating a file, delete without calling API) is marked as **FAILED**.
   - Checks modal dialog rendering and ensures toasts render above modals (`z-[9999]`).
   - Verifies responsiveness (`< 1024px` grid vs `>= 1024px` table) and full-width layout (`w-full pb-16`).
   - Checks i18n key consistency (`useTranslations()`).

3. **Backend API & RBAC Endpoint Probes**:
   - Executes live probes on GET, POST, PUT, PATCH, DELETE endpoints.
   - Verifies permissions decoration (`@RequirePermissions`).
   - Verifies tenant isolation header (`x-company-id`).

4. **Structured QA Diagnostic Report**:
   - Returns a comprehensive report containing:
     - ✅ **UI Actions & Interactive Components**: Status of modals, tabs, forms, and buttons.
     - ✅ **API Endpoints & RBAC Guards**: Probe results and HTTP status codes.
     - ✅ **Prisma Data & Schema Compliance**: Type alignment, required fields, and enums.
     - ⚠️ **Issues & Fixes Required**: List of detected anomalies with immediate proposed fixes.

---

## [2026] Views Standardization Directives (MANDATORY)

1. **Contract Skill**: Before touching ANY view under web\src\app\dashboard, load and follow skill soft-view-standard (.agents/skills/bsoft-view-standard/SKILL.md). It defines the canonical 6-layer anatomy: Header / Stats / Filters / Data section / Modals / Toasts.
2. **Primitives Only**: Use shared primitives - ViewHeader + HeaderActions, KpiStrip, FilterBar, useListPage hook, DataTable v2, PaginationBar v2, BulkActionBar, DeleteConfirmModal, DetailModal, ExportModal. Hand-rolled toolbars, pagination footers, KPI shells, resize effects are FORBIDDEN in new code.
3. **No Hardcoding**: Raw brand hexes (#A70000, #8B0000, #FF4D4D) are forbidden; use Tailwind tokens (primary/primary-dark). Money = integer millimes formatted via formatTND.
4. **Toast Contract**: useNotify service only. 2xx -> success + next action; 4xx -> warning; 5xx -> error. Never toast.success inside catch.
5. **Verification Gate**: Every delivered page must pass 	sc --noEmit and the acceptance checklist at the bottom of the skill file.

## Allowed-Layers Matrix (Separation Contract)
- ALLOWED: READ-ONLY verification gates + test specs.
