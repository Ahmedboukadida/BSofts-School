---
name: ui-component
description: Generate a new UI component following the StyleSeed design conventions
risk: unknown
source: https://github.com/bitjaru/styleseed/tree/main/engine/.claude/skills/ss-component
source_repo: bitjaru/styleseed
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/bitjaru/styleseed/blob/main/LICENSE
---

# UI Component Generator
## When to Use

Use this skill when you need generate a new UI component following the StyleSeed design conventions.


## When NOT to use

- For full-page scaffolding → use `/ss-page`
- For composed multi-component patterns → use `/ss-pattern`
- For tweaking an existing component — just edit the file directly
- For non-StyleSeed projects (no `components/ui/` directory or no Tailwind v4)

Generate a new component: **$0**
Description: $ARGUMENTS

## Instructions

1. First, read the design system seed for context:
   - Read `CLAUDE.md` for component conventions
   - Read `css/theme.css` for available design tokens
   - Read `components/ui/button.tsx` as a reference pattern

2. Follow these conventions strictly:
   - Use `function` declaration (not `const`)
   - Add `data-slot="component-name"` attribute
   - Use `cn()` from `@/components/ui/utils` for all className merging
   - Use `React.ComponentProps<>` for prop typing
   - Always support `className` prop for overrides
   - Use CVA (`class-variance-authority`) if the component has variants
   - Use semantic color tokens (`bg-card`, `text-foreground`) — never inline hex

3. Design token usage:
   - Colors: `text-foreground`, `bg-card`, `text-brand`, `text-muted-foreground`, `border-border`
   - Shadows: `shadow-[var(--shadow-card)]`, `shadow-[var(--shadow-elevated)]`
   - Radius: `rounded-md`, `rounded-lg`, `rounded-2xl`
   - Spacing: multiples of 6px (`p-1.5`, `p-3`, `p-6`)
   - Motion: `duration-[var(--duration-fast)]`, `ease-[var(--ease-default)]`

4. Typography rules:
   - Display (36-48px): `leading-none tracking-[-0.02em]`
   - Heading (18-24px): `leading-snug tracking-[-0.01em]`
   - Body (14-17px): `leading-normal` (default tracking)
   - Caption uppercase (10-13px): `tracking-[0.05em]`
   - Use `size-*` shorthand instead of `w-* h-*`
   - Use `ms-*/me-*` instead of `ml-*/mr-*` (logical properties)

5. Accessibility requirements:
   - Minimum touch target: 44x44px (`min-h-11 min-w-11`)
   - Support `aria-*` attributes passthrough
   - Use `focus-visible:ring-2 focus-visible:ring-ring` for keyboard focus
   - Respect `prefers-reduced-motion` for animations

6. Export the component as a named export (not default)

7. Place the file in the appropriate directory:
   - Primitive/reusable → `src/components/ui/`
   - Composed pattern → `src/components/patterns/`

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
