---
name: react-context-manager
description: Manages AuthContext and CompanyContext state, cookie persistence, and active company switching.
---

# React Context Manager Skill

This skill governs global state, session management, and context providers in BSOFT.

## 1. AuthContext

Manages the authenticated user's session.
*   **User Shape:** Must include `id`, `firstname`, `lastname`, `email`, `isDeveloper`, `role_name`, `active_company_id`, and `accessible_company_ids`.
*   **Initialization Flow:** On mount, the provider checks the `bsoft_auth_token` cookie. If it exists, it fetches the user profile (`/api/auth/profile`) and sets the Auth state.
*   **Token Expiry:** An Axios interceptor must catch 401 errors. On 401, call `clearAuth()` (removes token) and redirect to login (`router.push('/')`).

## 2. CompanyContext

Manages the currently active tenant company.
*   **State:** `activeCompany`, `isAllMode`.
*   **Actions:** `switchCompany(id)`, `switchToAll()`.
*   **Company Switching:** When switching companies, update the context and call `router.refresh()` to reload page data. **NEVER use `window.location.reload()`** as it destroys client-side state.

## 3. ThemeContext

Manages Dark/Light modes.
*   Provides `resolvedTheme` and `setTheme('dark' | 'light' | 'system')`.

## 4. Custom Hooks

### `useLang()`
*   Reads the `locale` cookie (e.g., via `Cookies.get('locale')`).
*   Returns `{ lang, isRtl }`.
*   Provides consistent directionality without relying solely on SSR.

### `usePermission()`
*   Returns `{ can: (permission: string) => boolean }`.
*   Evaluates the requested permission against the current user's `role_name` and explicit permissions.
*   Used to hide/show buttons (e.g., Create, Delete) on the frontend.

### `useRequireCompany()`
*   Call inside dashboard module pages.
*   If `activeCompany` is null/undefined, it interrupts rendering and displays a full-page prompt asking the user to select a company.

### `useWebSocket()`
*   Connects to the Socket.IO server at the `/ws` namespace.
*   Passes the JWT token in the connection auth header.
*   Handles real-time events (`'notification'`, `'message'`) to update badges and lists.

## 5. Cookie Persistence

*   `bsoft_auth_token`: Stores the JWT access token.
*   `locale`: Stores the preferred language (`en`, `fr`, `ar`).


---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Dual-Route Path Alias Rule**: All NestJS controllers handling hyphenated/underscored route paths MUST register dual route array paths via `@Controller(['canonical-path', 'alias-path'])`.
3. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` / `is_developer` god-mode bypass logic across all guards.
4. **Strict DTO Validation**: All Create & Update DTOs must enforce 100% `class-validator` decorator coverage. Optional fields require `@IsOptional()`. Money fields must be integer millimes (`@IsInt()`).


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
