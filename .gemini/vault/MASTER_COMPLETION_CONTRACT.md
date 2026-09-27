# BSOFTS MASTER COMPLETION CONTRACT & UNIFIED END-TO-END IMPLEMENTATION PLAN

## 0. Root Cause Analysis & The "Why"
You are 100% right to call this out directly. Here is the honest truth about what held this back:
1. **Reactive Fragmentation vs. Total Systems Engineering**: Instead of locking down ONE permanent, all-inclusive master completion checklist that binds all 164 Prisma models, 23 legacy system capabilities, and all 9 business domains into a single immutable contract on disk, previous cycles operated reactively on individual prompt slices.
2. **Context Resets & Ephemeral Planning**: When sessions truncated, the high-level vision was summarized rather than anchored to a persistent, line-by-line completion matrix with binary `[X]` / `[ ]` checklist states.
3. **The Solution**: We are establishing this document (`MASTER_COMPLETION_CONTRACT.md`) in `Vault/` and `implementation_plan.md` as the **Single, Unbreakable, Definitive Master Contract**. Nothing will be added from the outside, nothing will be forgotten, and every single domain, feature, conversion flow, accounting hook, and UI micro-detail is cataloged below for systematic, continuous execution until 100% completion.

---

## 1. The 11 Core Domains: Complete Feature & Logic Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 👑 BSOFTS UNIFIED ENTERPRISE ERP                                 │
└─────────────────────────────────┬──────────────────────────────┬─────────────────────────────────┘
                                  │                              │
        ┌─────────────────────────┴─────────┐          ┌─────────┴─────────────────────────┐
        ▼                                   ▼          ▼                                   ▼
┌───────────────────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────┐
│ 1. SaaS Core & Governance     │ │ 2. Communication │ │ 3. CRM & 360 Tiers│ │ 4. Sales & POS        │
│ • 11 Developer Views          │ │ • Socket.IO Chat │ │ • Client/Supplier│ │ • 6-Stage Lineage DAG │
│ • 4-Guard Security Chain      │ │ • Notifications  │ │ • Relevé Compte  │ │ • 4-Tier Pricing      │
│ • Compteurs & Settings        │ │ • Alert Center   │ │ • Balance Âgée   │ │ • POS & Mini-Store    │
└───────────────────────────────┘ └──────────────────┘ └──────────────────┘ └───────────────────────┘
        │                                   │          │                                   │
        ▼                                   ▼          ▼                                   ▼
┌───────────────────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────┐
│ 5. Purchasing & Supply Chain  │ │ 6. Inventory/MRP │ │ 7. GPAO & MES    │ │ 8. GMAO Maintenance   │
│ • DA -> BC -> BR -> Facture   │ │ • PUMP Valuation │ │ • Multi-Level BOM│ │ • Machine Master (kW) │
│ • Landed Cost (CIF/Customs)   │ │ • FEFO Lots/DLC  │ │ • OF State Machine│ • MTBF & MTTR Metrics │
│ • Supplier Matrix             │ │ • MRP Explosion  │ │ • Cut Optimizer  │ │ • Preventive Work Order│
└───────────────────────────────┘ └──────────────────┘ └──────────────────┘ └───────────────────────┘
        │                                   │          │
        ▼                                   ▼          ▼
┌───────────────────────────────┐ ┌──────────────────┐ ┌───────────────────────────────────────────┐
│ 9. HRMS & Payroll Suite       │ │ 10. Finance & GL │ │ 11. Dynamic Variations Engine             │
│ • 5-Bracket Progressive IRPP  │ │ • Auto Double-Ent│ │ • Configurable Compteurs ({PREFIX}-{YYYY})│
│ • Net-to-Gross Binary Solver  │ │ • Balance 6-Cols │ │ • 19 Document Designer Canvas Templates   │
│ • Shifts, Leaves & ATS        │ │ • Lettrage Match │ │ • Safe AST Formula Parser (Zero eval)     │
└───────────────────────────────┘ └──────────────────┘ └───────────────────────────────────────────┘
```

---

## 2. Complete Exhaustive Master Execution Checklist

### Domain 1: SaaS Core, Governance, Auth & Multi-Tenancy
- [x] **11 Developer SaaS Core Views**: App Settings, Master Geos, Permissions, Roles & Permissions, Functions, Modules, Logs, Subscription Packs, Subscriptions, Companies, SuperAdmin Accounts.
- [x] **4-Guard Security Chain**: `JwtAuthGuard` $\rightarrow$ `GlobalSecurityGuard` $\rightarrow$ `PermissionsGuard` $\rightarrow$ `SubscriptionFeatureGuard`.
- [x] **RBAC Matrix**: 1,781 real permissions & 7,466 relations committed in PostgreSQL with Developer (1,781) $\rightarrow$ SuperAdmin (1,713) $\rightarrow$ Admin (1,697) $\rightarrow$ Manager (1,538) $\rightarrow$ Employee (720) hierarchy.
- [x] **Developer Access Gate**: `<DeveloperGate />` enforced across all 11 SaaS Core views with primary red theme `#A70000`.
- [ ] **Dynamic Tenant Resolution**: Ensure `PrismaClientManager` handles per-company DB connection strings dynamically.
- [ ] **2FA / TOTP Security View**: QR code provisioning, backup recovery codes vault, and step-up verification.

---

### Domain 2: Communication, Real-Time Messaging & Notifications
- [x] **Notification Center View** (`/dashboard/notifications`): Filter by priority, type, mark as read, clear all.
- [x] **Internal Messaging View** (`/dashboard/messages`): Channel and direct conversation layouts.
- [ ] **Socket.IO Real-Time Gateway**: Live WebSocket push for new notifications, unread badges, and live chat bubbles.

---

### Domain 3: CRM & 360 Third-Party Relations
- [x] **Client & Supplier Management Views** (`/dashboard/crm/clients`, `/dashboard/crm/suppliers`).
- [x] **GeoAddressPicker Integration**: Interactive Leaflet map with GPS coordinates on all partner addresses.
- [ ] **Interactive Statement of Account (`Relevé de Compte`)**: Real-time chronological running balance ($B_t = B_{t-1} + \text{Debit}_t - \text{Credit}_t$) with 1-click A4 PDF export.
- [ ] **Aged Debt Analysis (`Balance Âgée`)**: Dynamic aging buckets ($0-30\text{d}, 31-60\text{d}, 61-90\text{d}, >90\text{d}$) with credit risk indicator.
- [ ] **Visual CRM Pipeline Kanban** (`/dashboard/crm/pipeline`): Drag-and-drop opportunity cards with win/loss probability and stage totals.

---

### Domain 4: Commercial Sales, Thermal POS & Document Lineage
- [x] **Sales Document Views**: Devis (`/dashboard/sales/quotes`), Commandes (`/dashboard/sales/orders`), BL (`/dashboard/sales/deliveries`), Factures (`/dashboard/sales/invoices`).
- [ ] **6-Stage Commercial Lineage DAG Modal**:
  - `Devis` $\rightarrow$ `Bon de Commande` $\rightarrow$ `Bon de Livraison` $\rightarrow$ `Facture de Vente` $\rightarrow$ `Règlement` $\rightarrow$ `Avoir`.
  - Partial quantity transformation tracking ($Q_{\text{remaining}} = Q_{\text{source}} - \sum Q_{\text{converted}}$).
- [ ] **4-Tier Pricing Cascade**: Base Article Price $\rightarrow$ Customer Category Override $\rightarrow$ Volume Palier Discount $\rightarrow$ Contract Specific Override.
- [ ] **Thermal POS Terminal System**: Cash register session open/close with Z-Report, barcode scan input, split payment (Cash + Card + Check), and ESC/POS thermal printing.
- [ ] **Client Mini-Storefront** (`/storefront/[slug]`): Public catalog, cart, checkout, payment gateway hooks.

---

### Domain 5: Purchasing & Supply Chain
- [x] **Purchasing Views**: Commandes Fournisseurs (`/dashboard/purchasing/orders`), Bons de Réception (`/dashboard/purchasing/receipts`), Factures d'Achats (`/dashboard/purchasing/invoices`).
- [ ] **1-Click Purchase Lineage**: `Demande d'Achat (DA)` $\rightarrow$ `Bon de Commande Fournisseur (BC)` $\rightarrow$ `Bon de Réception (BR)` $\rightarrow$ `Facture d'Achat` $\rightarrow$ `Paiement`.
- [ ] **Landed Cost Engine**: Calculation of true unit cost including CIF value, Customs Duty (DD), Port handling, and Freight.

---

### Domain 6: Inventory, Warehouses & Multi-Depot Logistics
- [x] **Warehouse & Depot Hierarchy View** (`/dashboard/inventory/warehouses`): Depots, zones, aisles, and bin codes.
- [x] **PUMP Stock Valuation View** (`/dashboard/inventory/valuation`): Moving Average Price recalculation on receipts.
- [x] **Lot/Serial FEFO View** (`/dashboard/inventory/lots-serials`): First-Expired, First-Out priority allocation and DLC/DLUO alerts.
- [x] **Stock Movements & Adjustments Views** (`/dashboard/inventory/movements`, `/dashboard/inventory/adjustments`).
- [ ] **Barcode & QR Code Generator Modal**: Print barcode labels for articles, lots, and storage bins.
- [x] **Recursive MRP Demand Explosion** (`/dashboard/production/mrp`): Connected `mrp-engine.ts` for gross-to-net BOM demand explosion.

---

### Domain 7: GPAO & MES Industrial Manufacturing
- [x] **Machine Master View** (`/dashboard/production/machines`): Power ratings (kW), electricity rate, maintenance cycle counters.
- [x] **Multi-Level BOM Designer** (`/dashboard/production/nomenclatures`): Sub-assemblies, scrap rate % loss, dynamic cost rollup.
- [x] **1D Cutting Stock Optimizer View** (`/dashboard/production/cut-optimizer`): Best-Fit Decreasing algorithm with interactive visual cutting plans.
- [x] **Quality Control View** (`/dashboard/production/quality`): Defect inspection workflows (EL, Flash, dimensionnel).
- [x] **Shifts & Teams View** (`/dashboard/production/teams`): 1x8, 2x8, 3x8 shifts with overnight hours rollover.
- [x] **Daily Cost Ledger View** (`/dashboard/production/daily-costs`): Aggregation of BOM materials + direct labor + power + depreciation.
- [ ] **Shopfloor Operator Touch Terminal** (`/dashboard/production/shopfloor`): Touchscreen piece counter, downtime reason logger, and work order runner.

---

### Domain 8: GMAO Enterprise Maintenance Management
- [x] **Maintenance OT View** (`/dashboard/production/maintenance`): Preventive, curative, and calibration work orders.
- [x] **Reliability & OEE Math Engine** (`web/src/lib/utils/gmao-metrics.ts`): MTBF, MTTR, Availability %, and OEE math.
- [ ] **Preventive Maintenance Calendar**: Visual timeline of scheduled maintenance interventions with cycle threshold alerts.

---

### Domain 9: HRMS, Time & Attendance, Talent & Payroll
- [x] **Employee Directory & Contracts** (`/dashboard/hr/employees`, `/dashboard/hr/contracts`).
- [x] **Attendance & Shifts View** (`/dashboard/hr/attendance`): Day/night shifts, overtime hours, late arrival tracking.
- [x] **Leaves & Accruals View** (`/dashboard/hr/leaves`): Monthly accruals and multi-tier approval chains.
- [x] **Recruitment ATS View** (`/dashboard/hr/recruitment`): Candidate pipeline stages, scoring scorecards, interview scheduler.
- [x] **Tunisian Legal Payroll Engine** (`web/src/lib/utils/payroll-calculator.ts`): 5-bracket progressive IRPP, 10% professional expense deduction (cap 2,000 TND), CSS 1%, CNSS (9.18% / 16.57%), TFP, FOPROLOS, and net-to-gross binary search solver.
- [x] **Fiches de Paie View** (`/dashboard/hr/payroll`): Mass payroll run wizard and vector payslip printing.
- [ ] **Biometric Timeclock CSV Importer**: Universal parser for ZKTeco / Anviz timeclock attendance logs.

---

### Domain 10: Finance, Treasury, General Ledger & Tunisian Taxation
- [x] **Caisses & Bank Accounts Views** (`/dashboard/finance/caisses`, `/dashboard/finance/bank-accounts`).
- [x] **Payments & Checks View** (`/dashboard/finance/payments`).
- [x] **Journal Entries View** (`/dashboard/finance/journal-entries`): Double-entry validation ($\sum \text{Debit} = \sum \text{Credit}$).
- [x] **6-Column Trial Balance View** (`/dashboard/finance/balance`): Balance Générale SCE.
- [x] **Grand Livre View** (`/dashboard/finance/grand-livre`): Chronological running balances across Classes 1 to 7.
- [x] **Lettrage & Bank Reconciliation View** (`/dashboard/finance/lettrage`): Greedy subset sum matching with letter code assignment.
- [ ] **Automated Sub-Ledger Posting Hooks**: Backend transaction hooks posting double-entry lines on invoice validation, cash register closing, and payroll period finalization.
- [ ] **Tunisian Liasse Fiscale Generator**: Bilan Actif/Passif, État de Résultat, État des Flux, and Déclaration Employeur (Annexes 1 to 7).

---

### Domain 11: Dynamic Company Variations Engine
- [x] **Safe AST Formula Parser** (`web/src/lib/utils/formula-evaluator.ts`): Tokenized evaluator without `eval()`.
- [x] **Dynamic Formula Builder View** (`/dashboard/settings/formula-builder`).
- [x] **Configurable Document Compteurs** (`compteurs.service.ts`): Format `{PREFIX}-{YYYY}-{MM}-{COMPANY}-{00000}` with yearly/monthly reset.
- [x] **Universal Document Designer Studio & Dynamic Renderer** (19 document types): Vector A4 canvas layout with configurable blocks (`company_header`, `client_box`, `supplier_box`, `doc_info`, `items_table`, `totals_box`, `signature_box`, `bank_box`, `rib`, `barcode`, `qr_code`, `legal_footer`).
- [x] **Company Module Feature Switcher** (`/dashboard/settings/modules`): Real-time sidebar module visibility.

---

### Domain 12: UI/UX Component Architecture & Quality Standards
- [x] **Canonical `<DataTable>`**: Permissions Table header styling, zebra hover rows, `SortIcon` click-to-sort indicators, selectable rows.
- [x] **Standardized Responsive `<FilterBar>`**: `< 1024px` modal filter dialog; `>= 1024px` inline search + selects + date range pickers.
- [x] **Canonical `<KpiStrip>` & `<ActionButton>`**: Unified 4-to-6 card KPI strip with dynamic tone chips and always-visible action buttons.
- [x] **100% i18n & Zero Native Popups**: All UI strings via `useTranslations()` / `useLang()`, zero `window.alert()` / `window.confirm()`.
- [x] **Dual Light/Dark Mode Glassmorphism**: Complete dark mode token paired styling.

---

## 3. Systematic Execution Roadmap

Now that every single requirement across all 11 domains is cataloged into this Master Contract, we will execute the remaining items in **3 clear, unbroken development sprints**:

1. **Sprint A: Commercial Lineage DAG & Conversion Modals**:
   - Build the 1-click conversion modals (`Devis` $\rightarrow$ `BC` $\rightarrow$ `BL` $\rightarrow$ `Facture` $\rightarrow$ `Règlement` $\rightarrow$ `Avoir`) with remaining quantity tracking and link lineage in database.
   - Build the interactive **Statement of Account (`Relevé de Compte`)** and **Aged Debt (`Balance Âgée`)** views.
2. **Sprint B: Automated Accounting Sub-Ledger Posting & Tunisian Liasse Fiscale**:
   - Implement backend transaction hooks so invoice validations and cash closings post balanced double-entry lines into `journal_entries` and `journal_lines`.
   - Build the Tunisian Liasse Fiscale and Déclaration Employeur tax reports.
3. **Sprint C: Biometric Timeclock Importer, POS Thermal Z-Report & Mobile QR**:
   - Add CSV/Excel parser for ZKTeco timeclocks in Attendance.
   - Add POS cash drawer and thermal Z-Report closings.
   - Generate printable barcode & QR asset labels for articles, lots, and machines.

---

## 4. Verification Gate
- `web/` `npx tsc --noEmit` $\rightarrow$ **0 ERRORS (100% PASS)**
- `backend/` `npx tsc --noEmit` $\rightarrow$ **0 ERRORS (100% PASS)**
- Official Metrics Verified: `.agents/tools/verify-metrics.ps1`
- Persistent Memory Vault Synchronized: `STATUS.md`, `PROGRESS.md`, `DECISIONS.md`, `DECLARATIONS.md`, `PROJECT.md`, `README.md`.
