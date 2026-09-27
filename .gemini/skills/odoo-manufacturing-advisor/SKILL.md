---
name: odoo-manufacturing-advisor
description: "Expert guide for Odoo Manufacturing: Bills of Materials (BoM), Work Centers, routings, MRP planning, and production order workflows."
risk: safe
source: "self"
---

# Odoo Manufacturing Advisor

## Overview

This skill helps you configure and optimize Odoo Manufacturing (MRP). It covers Bills of Materials (BoM), Work Centers, routing operations, production order lifecycle, and Material Requirements Planning (MRP) runs to ensure you never run short of materials.

## When to Use This Skill

- Creating or structuring Bills of Materials for finished goods.
- Setting up Work Centers with capacity and efficiency settings.
- Running an MRP to automatically generate purchase and production orders from demand.
- Troubleshooting production order discrepancies or component availability issues.

## How It Works

1. **Activate**: Mention `@odoo-manufacturing-advisor` and describe your manufacturing scenario.
2. **Configure**: Receive step-by-step instructions for BoM setup, routing, and MRP configuration.
3. **Plan**: Get guidance on running MRP and interpreting procurement messages.

## Examples

### Example 1: Create a Bill of Materials

```text
Menu: Manufacturing → Products → Bills of Materials → New

Product: Finished Widget v2
BoM Type: Manufacture This Product
Quantity: 1 (produce 1 unit per BoM)

Components Tab:
  - Raw Plastic Sheet  | Qty: 0.5  | Unit: kg
  - Steel Bolt M6      | Qty: 4    | Unit: Units
  - Rubber Gasket      | Qty: 1    | Unit: Units

Operations Tab (requires "Work Orders" enabled in MFG Settings):
  - Operation: Injection Molding | Work Center: Press A   | Duration: 30 min
  - Operation: Assembly          | Work Center: Line 1    | Duration: 15 min
```

> **BoM Types explained:**
>
> - **Manufacture This Product** — standard production BoM, creates a Manufacturing Order
> - **Kit** — sold as a bundle; components are delivered separately (no MO created)
> - **Subcontracting** — components are sent to a subcontractor who returns the finished product

### Example 2: Configure a Work Center

```text
Menu: Manufacturing → Configuration → Work Centers → New

Work Center: CNC Machine 1
Working Hours: Standard 40h/week
Time Efficiency: 85%      (machine downtime factored in; 85% = 34 effective hrs/week)
Capacity: 2               (can run 2 production operations simultaneously)
OEE Target: 90%           (Overall Equipment Effectiveness KPI target)
Costs per Hour: $75.00    (used for manufacturing cost reporting)
```

### Example 3: Run the MRP Scheduler

```text
The MRP scheduler runs automatically via a daily cron job.
To trigger it manually:

Menu: Inventory → Operations → Replenishment → Run Scheduler
(or Manufacturing → Planning → Replenishment in some versions)

After running, review procurement exceptions:
Menu: Inventory → Operations → Replenishment

Message Types:
  "Replenish"   — Stock is below minimum; needs a PO or MO
  "Reschedule"  — An order's scheduled date conflicts with demand
  "Cancel"      — Demand no longer exists; the order can be cancelled
```

## Best Practices

- ✅ **Do:** Enable **Work Orders** in Manufacturing Settings to use routing and time-tracking per operation.
- ✅ **Do:** Use **BoM with variants** (via product attributes) for products that come in multiple configurations (color, size, voltage) — avoids duplicate BoMs.
- ✅ **Do:** Set **Lead Times** on components (vendor lead time + security lead time) so MRP schedules purchase orders in advance.
- ✅ **Do:** Use **Scrap Orders** when discarding defective components during production — never adjust stock manually.
- ❌ **Don't:** Manually create purchase orders for MRP-managed items — override MRP suggestions only when justified.
- ❌ **Don't:** Confuse **Kit** BoM with **Manufacture This Product** — a Kit never creates a Manufacturing Order.

## Limitations

- This skill targets **Odoo Manufacturing (mrp)** module. **Maintenance**, **PLM** (Product Lifecycle Management), and **Quality** modules are separate Enterprise modules not covered here.
- **Subcontracting** workflows (sending components to a third-party manufacturer) have additional receipt and valuation steps not fully detailed here.
- **Lot/serial number traceability** in production (tracking which lot was consumed per MO) adds complexity; test with small batches before full rollout.
- MRP calculations assume demand comes from **Sale Orders** and **Reordering Rules** — forecasts from external systems require custom integration.


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
