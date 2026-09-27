# Shopify Development Skill

Comprehensive skill for building on Shopify platform: apps, extensions, themes, and API integrations.

## Features

- **App Development** - OAuth authentication, GraphQL Admin API, webhooks, billing integration
- **UI Extensions** - Checkout, Admin, POS customizations with Polaris components
- **Theme Development** - Liquid templating, sections, snippets
- **Shopify Functions** - Custom discounts, payment, delivery rules

## Structure

```
shopify-development/
├── SKILL.md              # Main skill file (AI-optimized)
├── README.md             # This file
├── references/
│   ├── app-development.md    # OAuth, API, webhooks, billing
│   ├── extensions.md         # UI extensions, Functions
│   └── themes.md             # Liquid, theme architecture
└── scripts/
    ├── shopify_init.py       # Interactive project scaffolding
    ├── shopify_graphql.py    # GraphQL utilities & templates
    └── tests/                # Unit tests
```

## Validated GraphQL

All GraphQL queries and mutations in this skill have been validated against Shopify Admin API 2026-01 schema using the official Shopify MCP.

## Quick Start

```bash
# Install Shopify CLI
npm install -g @shopify/cli@latest

# Create new app
shopify app init

# Start development
shopify app dev
```

## Usage Triggers

This skill activates when the user mentions:

- "shopify app", "shopify extension", "shopify theme"
- "checkout extension", "admin extension", "POS extension"
- "liquid template", "polaris", "shopify graphql"
- "shopify webhook", "shopify billing", "metafields"

## API Version

Current: **2026-01** (Quarterly releases with 12-month support)

## License

MIT


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
