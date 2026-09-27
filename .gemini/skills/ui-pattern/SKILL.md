---
name: ui-pattern
description: Generate a composed UI pattern (card layout, list, form section, grid, etc.) using design system primitives
risk: unknown
source: https://github.com/bitjaru/styleseed/tree/main/engine/.claude/skills/ss-pattern
source_repo: bitjaru/styleseed
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/bitjaru/styleseed/blob/main/LICENSE
---

# UI Pattern Generator
## When to Use

Use this skill when you need generate a composed UI pattern (card layout, list, form section, grid, etc.) using design system primitives.


## When NOT to use

- For a single primitive component → use `/ss-component`
- For a full mobile screen → use `/ss-page`
- For an entire multi-page user flow → use `/ss-flow`
- For design tokens and color/spacing decisions → use `/ss-tokens`

Pattern type: **$0**
Description: $ARGUMENTS

## Available Pattern Types

### Layout Patterns
- **card-section**: Card with title + content inside page section (`mx-6`)
- **grid-2col**: 2-column grid of cards (`grid grid-cols-2 gap-4 px-6`)
- **scroll-horizontal**: Horizontal scrolling card list (`flex gap-3 overflow-x-auto scrollbar-hide`)
- **list-section**: Vertical list of items inside a card
- **form-section**: Form with labeled inputs in a card
- **stat-grid**: Grid of StatCard components

### Data Display Patterns
- **data-table**: Table with header and rows
- **detail-card**: Key-value pair display
- **chart-card**: Card wrapper for a Recharts chart
- **ranking-list**: Numbered ranking with highlight

### Interactive Patterns
- **action-sheet**: Bottom sheet with action buttons
- **filter-bar**: Horizontal filter/tab bar
- **search-header**: Search input in header area

## Instructions

1. Read the design system reference:
   - `CLAUDE.md` for conventions
   - `components/ui/` for available primitives
   - `components/patterns/` for existing patterns

2. Compose the pattern from existing components — DO NOT recreate primitives.

3. Follow the design system layout rules:
   - Cards: `bg-card rounded-2xl p-6 shadow-[var(--shadow-card)]`
   - Section wrapper: `mx-6` for horizontal margin
   - Section title: `text-foreground font-bold text-[18px] mb-4`
   - List gap: `space-y-3`
   - Grid gap: `gap-4`

4. Use semantic tokens for all visual properties.

5. Make the pattern a reusable component with props for dynamic content.

## Limitations

- Use this skill only when the task clearly matches its upstream source and local project context.
- Verify commands, generated code, dependencies, credentials, and external service behavior before applying changes.
- Do not treat examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.


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
