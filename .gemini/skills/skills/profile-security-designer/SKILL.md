---
name: profile-security-designer
description: Governs user profile views, security credentials updates, show/hide password toggles, official role titles, and dual light/dark mode glassmorphism token enforcement.
---

# Profile & Security View Designer Skill

This skill enforces design standards for user profile views, password updates, security controls, and dual light/dark mode compliance.

## Core Rules & Standards

### 1. Dual Light/Dark Mode Compliance
- NEVER use hardcoded dark classes like `bg-slate-900` or `text-white` without light mode counterparts.
- Always use responsive dual-theme classes:
  ```tsx
  bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl
  bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white
  ```

### 2. Official Role Title & Brand Badges
- NEVER display raw database integer IDs (e.g. `Role ID: #2`).
- Always resolve and display official role titles (**System Developer**, **Super Admin**, **Admin**, **Employee**, **Client**, **Provider**).
- Use BSOFT brand role colors:
  - Developer: `#A70000` (Crimson)
  - Super Admin: `#0266C8` (Deep Blue)
  - Admin: `#F2B50F` (Gold)
  - Employee: `#00933B` (Green)
  - Client: `#FB2BF9` (Magenta)
  - Provider: `#2BFBD9` (Cyan)

### 3. Password Input Fields & Toggles
- All password inputs must include show/hide password toggle buttons (`Eye`/`EyeOff`).
- Validate minimum 6 characters before submission.

### 4. Rich Information Organization
- Structure user profile data into clear tabbed sections: Overview & Specs, Edit Profile, Security & Credentials, Company Scope, and Role Permissions Matrix.


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
