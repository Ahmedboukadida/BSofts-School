---
name: odoo-inventory-optimizer
description: "Expert guide for Odoo Inventory: stock valuation (FIFO/AVCO), reordering rules, putaway strategies, routes, and multi-warehouse configuration."
risk: safe
source: "self"
---

# Odoo Inventory Optimizer

## Overview

This skill helps you configure and optimize Odoo Inventory for accuracy, efficiency, and traceability. It covers stock valuation methods, reordering rules, putaway strategies, warehouse routes, and multi-step flows (receive → quality → store).

## When to Use This Skill

- Choosing and configuring FIFO vs AVCO stock valuation.
- Setting up minimum stock reordering rules to avoid stockouts.
- Designing a multi-step warehouse flow (2-step receipt, 3-step delivery).
- Configuring putaway rules to direct products to specific storage locations.
- Troubleshooting negative stock, incorrect valuation, or missing moves.

## How It Works

1. **Activate**: Mention `@odoo-inventory-optimizer` and describe your warehouse scenario.
2. **Configure**: Receive step-by-step configuration instructions with exact Odoo menu paths.
3. **Optimize**: Get recommendations for reordering rules and stock accuracy improvements.

## Examples

### Example 1: Enable FIFO Stock Valuation

```text
Menu: Inventory → Configuration → Settings

Enable: Storage Locations
Enable: Multi-Step Routes
Costing Method: (set per Product Category, not globally)

Menu: Inventory → Configuration → Product Categories → Edit

  Category: All / Physical Goods
  Costing Method: First In First Out (FIFO)
  Inventory Valuation: Automated
  Account Stock Valuation: [Balance Sheet inventory account]
  Account Stock Input:   [Stock Received Not Billed]
  Account Stock Output:  [Stock Delivered Not Invoiced]
```

### Example 2: Set Up a Min/Max Reordering Rule

```text
Menu: Inventory → Operations → Replenishment → New

Product: Office Paper A4
Location: WH/Stock
Min Qty: 100   (trigger reorder when stock falls below this)
Max Qty: 500   (purchase up to this quantity)
Multiple Qty: 50  (always order in multiples of 50)
Route: Buy    (triggers a Purchase Order automatically)
       or Manufacture (triggers a Manufacturing Order)
```

### Example 3: Configure Putaway Rules

```text
Menu: Inventory → Configuration → Putaway Rules → New

Purpose: Direct products from WH/Input to specific bin locations

Rules:
  Product Category: Refrigerated Goods
    → Location: WH/Stock/Cold Storage

  Product: Laptop Model X
    → Location: WH/Stock/Electronics/Shelf A

  (leave Product blank to apply the rule to an entire category)

Result: When a receipt is validated, Odoo automatically suggests
the correct destination location per product or category.
```

### Example 4: Configure 3-Step Warehouse Delivery

```text
Menu: Inventory → Configuration → Warehouses → [Your Warehouse]

Outgoing Shipments: Pick + Pack + Ship (3 steps)

Operations created automatically:
  PICK  — Move goods from storage shelf to packing area
  PACK  — Package items and print shipping label
  OUT   — Hand off to carrier / mark as shipped
```

## Best Practices

- ✅ **Do:** Use **Lots/Serial Numbers** for high-value or regulated items (medical devices, electronics).
- ✅ **Do:** Run a **physical inventory adjustment** at least quarterly (Inventory → Operations → Physical Inventory) to correct drift.
- ✅ **Do:** Set reordering rules on fast-moving items so purchase orders are generated automatically.
- ✅ **Do:** Enable **Putaway Rules** on warehouses with multiple storage zones — it eliminates manual location selection errors.
- ❌ **Don't:** Switch stock valuation method (FIFO ↔ AVCO) after recording transactions — it produces incorrect historical cost data.
- ❌ **Don't:** Use "Update Quantity" to fix stock errors — always use Inventory Adjustments to maintain a proper audit trail.
- ❌ **Don't:** Mix product categories with different costing methods in the same storage location without understanding the valuation impact.

## Limitations

- **Serial number tracking** at the individual unit level (SN per line) adds significant UI overhead; test performance with large volumes before enabling.
- Does not cover **landed costs** (import duties, freight allocation to product cost) — that requires the `stock_landed_costs` module.
- **Cross-warehouse stock transfers** have routing complexities (transit locations, intercompany invoicing) not fully covered here.
- Automated inventory valuation requires the **Accounting** module; Community Edition installations without it cannot post stock journal entries.


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
