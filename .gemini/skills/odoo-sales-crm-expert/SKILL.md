---
name: odoo-sales-crm-expert
description: "Expert guide for Odoo Sales and CRM: pipeline stages, quotation templates, pricelists, sales teams, lead scoring, and forecasting."
risk: safe
source: "self"
---

# Odoo Sales & CRM Expert

## Overview

This skill helps you configure and optimize Odoo Sales and CRM. It covers opportunity pipeline setup, automated lead assignment, quotation templates, pricelist strategies, sales team management, and the sales-to-invoice workflow.

## When to Use This Skill

- Designing CRM pipeline stages for your sales process.
- Creating a quotation template with optional products and bundles.
- Setting up pricelists with customer-tier pricing.
- Configuring automated lead assignment by territory or salesperson.

## How It Works

1. **Activate**: Mention `@odoo-sales-crm-expert` and describe your sales scenario.
2. **Configure**: Receive step-by-step Odoo setup instructions.
3. **Optimize**: Get recommendations for improving pipeline velocity and deal closure rate.

## Examples

### Example 1: Configure CRM Pipeline Stages

```text
Menu: CRM → Configuration → Stages → New

Typical B2B Pipeline:
  Stage 1: New Lead          (probability: 10%)
  Stage 2: Qualified         (probability: 25%)
  Stage 3: Proposal Sent     (probability: 50%)
  Stage 4: Negotiation       (probability: 75%)
  Stage 5: Won               (is_won: YES — marks opportunity as closed-won)
  Stage 6: Lost              (mark as lost via the "Mark as Lost" button)

Tips:
  - Enable "Rotting Days" in CRM Settings to flag stale deals in red
  - In Odoo 16+, Predictive Lead Scoring (AI) auto-updates probability
    based on historical data. Disable it in Settings if you prefer manual
    stage-based probability.
```

### Example 2: Create a Quotation Template

```text
Menu: Sales → Configuration → Quotation Templates → New
(Requires the "Sales Management" module — enabled in Sales Settings)

Template Name: SaaS Annual Subscription
Valid for: 30 days

Lines:
  1. Platform License   | Qty: 1 | Price: $1,200/yr | (required)
  2. Onboarding Package | Qty: 1 | Price: $500       | Optional
  3. Premium Support    | Qty: 1 | Price: $300/yr    | Optional
  4. Extra User License | Qty: 0 | Price: $120/user  | Optional

Signature & Payment:
  ☑ Online Signature required before order confirmation
  ☑ Online Payment (deposit) — 50% upfront

Notes section:
  "Prices valid until expiration date. Subject to Schedule A terms."
```

### Example 3: Customer Tier Pricelist (VIP Discount)

```text
Menu: Sales → Configuration → Settings
  ☑ Enable Pricelists

Menu: Sales → Configuration → Pricelists → New

Name: VIP Customer — 15% Off
Currency: USD
Discount Policy: Show public price & discount on quotation

Rules:
  Apply To: All Products
  Compute Price: Discount
  Discount: 15%
  Min. Quantity: 1

Assign to a customer:
  Customer record → Sales & Purchase tab → Pricelist → VIP Customer
```

## Best Practices

- ✅ **Do:** Use **Lost Reasons** (CRM → Configuration → Lost Reasons) to build a dataset of why deals are lost — invaluable for sales coaching.
- ✅ **Do:** Enable **Sales Teams** with revenue targets so pipeline forecasting is meaningful per team.
- ✅ **Do:** Set **Expected Revenue** and **Closing Date** on every opportunity — these feed the revenue forecast dashboard.
- ✅ **Do:** Use **Quotation Templates** to standardize offers and reduce quoting time across the team.
- ❌ **Don't:** Skip the CRM opportunity when selling — going directly from lead to invoice breaks pipeline analytics.
- ❌ **Don't:** Manually edit prices on quotation lines as a workaround — set up proper pricelists instead.
- ❌ **Don't:** Ignore the **Predictive Lead Scoring** feature in v16+ — configure it with historical data for accurate forecasting.

## Limitations

- **Commission rules** are not built into Odoo CRM out of the box — they require custom development or third-party modules.
- The **Quotation Template** optional product feature requires the **Sale Management** module; it is not available in the base `sale` module.
- **Territory-based lead assignment** (geographic routing) requires custom rules or the Enterprise Leads module.
- Odoo CRM does not have native **email sequence / cadence** automation — use the **Email Marketing** or **Marketing Automation** modules for drip campaigns.


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
