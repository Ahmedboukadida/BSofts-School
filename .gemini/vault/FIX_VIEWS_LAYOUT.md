# Implementation Plan — Repository-Wide Frontend Views & Layouts Standardization

Systematic, repository-wide standardization across **all 108 frontend view and layout files** under `web/src/app/`, enforcing strict compliance with the 5-layer canonical architecture, uniform typography, theme styling, and data-table specifications.

---

## 1. Scope & Categorized File Inventory (108 Files)

### A. Core SaaS Platform & System Settings (20 Files)
- [x] [`web/src/app/dashboard/saas-core/app-settings/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/app-settings/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/companies/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/companies/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/countries/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/countries/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/functions/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/functions/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/geos/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/geos/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/logs/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/logs/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/modules/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/modules/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/municipalities/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/municipalities/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/packs/[id]/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/packs/[id]/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/packs/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/packs/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/permissions/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/permissions/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/roles/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/roles/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/states/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/states/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/subscriptions/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/subscriptions/page.tsx)
- [x] [`web/src/app/dashboard/saas-core/superadmins/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/saas-core/superadmins/page.tsx)
- [x] [`web/src/app/dashboard/settings/branding/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/branding/page.tsx)
- [x] [`web/src/app/dashboard/settings/contact/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/contact/page.tsx)
- [x] [`web/src/app/dashboard/settings/document-designer/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/document-designer/page.tsx)
- [x] [`web/src/app/dashboard/settings/finance/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/finance/page.tsx)
- [x] [`web/src/app/dashboard/settings/formula-builder/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/formula-builder/page.tsx)
- [x] [`web/src/app/dashboard/settings/hierarchy/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/hierarchy/page.tsx)
- [x] [`web/src/app/dashboard/settings/identity/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/identity/page.tsx)
- [x] [`web/src/app/dashboard/settings/modules/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/modules/page.tsx)
- [x] [`web/src/app/dashboard/settings/security/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/security/page.tsx)
- [x] [`web/src/app/dashboard/settings/sequences/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/sequences/page.tsx)
- [x] [`web/src/app/dashboard/settings/team/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/team/page.tsx)
- [x] [`web/src/app/dashboard/settings/workflows/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/workflows/page.tsx)
- [x] [`web/src/app/dashboard/settings/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/settings/page.tsx)

### B. CRM & Commercial Pipelines (5 Files)
- [x] [`web/src/app/dashboard/crm/clients/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/crm/clients/page.tsx)
- [x] [`web/src/app/dashboard/crm/leads/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/crm/leads/page.tsx)
- [x] [`web/src/app/dashboard/crm/pipeline/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/crm/pipeline/page.tsx)
- [x] [`web/src/app/dashboard/crm/portfolio/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/crm/portfolio/page.tsx)
- [x] [`web/src/app/dashboard/crm/suppliers/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/crm/suppliers/page.tsx)

### C. Finance, Accounting & Treasury (10 Files)
- [x] [`web/src/app/dashboard/finance/balance/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/balance/page.tsx)
- [x] [`web/src/app/dashboard/finance/balance-agee/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/balance-agee/page.tsx)
- [x] [`web/src/app/dashboard/finance/bank-accounts/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/bank-accounts/page.tsx)
- [x] [`web/src/app/dashboard/finance/caisses/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/caisses/page.tsx)
- [x] [`web/src/app/dashboard/finance/financial-reports/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/financial-reports/page.tsx)
- [x] [`web/src/app/dashboard/finance/grand-livre/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/grand-livre/page.tsx)
- [x] [`web/src/app/dashboard/finance/journal-entries/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/journal-entries/page.tsx)
- [x] [`web/src/app/dashboard/finance/lettrage/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/lettrage/page.tsx)
- [x] [`web/src/app/dashboard/finance/liasse-fiscale/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/liasse-fiscale/page.tsx)
- [x] [`web/src/app/dashboard/finance/payments/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/finance/payments/page.tsx)

### D. HRMS & Tunisian Payroll (8 Files)
- [x] [`web/src/app/dashboard/hr/attendance/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/attendance/page.tsx)
- [x] [`web/src/app/dashboard/hr/contracts/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/contracts/page.tsx)
- [x] [`web/src/app/dashboard/hr/declaration-employeur/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/declaration-employeur/page.tsx)
- [x] [`web/src/app/dashboard/hr/employees/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/employees/page.tsx)
- [x] [`web/src/app/dashboard/hr/leaves/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/leaves/page.tsx)
- [x] [`web/src/app/dashboard/hr/payroll/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/payroll/page.tsx)
- [x] [`web/src/app/dashboard/hr/recruitment/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/recruitment/page.tsx)
- [x] [`web/src/app/dashboard/hr/rubriques/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/hr/rubriques/page.tsx)

### E. Inventory & Multi-Depot Stock (8 Files)
- [x] [`web/src/app/dashboard/inventory/adjustments/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/adjustments/page.tsx)
- [x] [`web/src/app/dashboard/inventory/articles/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/articles/page.tsx)
- [x] [`web/src/app/dashboard/inventory/lots-serials/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/lots-serials/page.tsx)
- [x] [`web/src/app/dashboard/inventory/movements/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/movements/page.tsx)
- [x] [`web/src/app/dashboard/inventory/reconciliation/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/reconciliation/page.tsx)
- [x] [`web/src/app/dashboard/inventory/stock-valuation/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/stock-valuation/page.tsx)
- [x] [`web/src/app/dashboard/inventory/valuation/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/valuation/page.tsx)
- [x] [`web/src/app/dashboard/inventory/warehouses/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/inventory/warehouses/page.tsx)

### F. Industrial Production GPAO & MES (16 Files)
- [x] [`web/src/app/dashboard/production/cut-optimizer/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/cut-optimizer/page.tsx)
- [x] [`web/src/app/dashboard/production/daily-costs/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/daily-costs/page.tsx)
- [x] [`web/src/app/dashboard/production/machines/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/machines/page.tsx)
- [x] [`web/src/app/dashboard/production/maintenance/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/maintenance/page.tsx)
- [x] [`web/src/app/dashboard/production/maintenance-schedules/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/maintenance-schedules/page.tsx)
- [x] [`web/src/app/dashboard/production/mrp/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/mrp/page.tsx)
- [x] [`web/src/app/dashboard/production/nomenclatures/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/nomenclatures/page.tsx)
- [x] [`web/src/app/dashboard/production/opti-coupe/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/opti-coupe/page.tsx)
- [x] [`web/src/app/dashboard/production/orders/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/orders/page.tsx)
- [x] [`web/src/app/dashboard/production/polystyrene/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/polystyrene/page.tsx)
- [x] [`web/src/app/dashboard/production/quality/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/quality/page.tsx)
- [x] [`web/src/app/dashboard/production/routings/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/routings/page.tsx)
- [x] [`web/src/app/dashboard/production/shopfloor/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/shopfloor/page.tsx)
- [x] [`web/src/app/dashboard/production/sites/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/sites/page.tsx)
- [x] [`web/src/app/dashboard/production/solar-pv/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/solar-pv/page.tsx)
- [x] [`web/src/app/dashboard/production/teams/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/production/teams/page.tsx)

### G. Commercial Sales, Deliveries & Thermal POS (9 Files)
- [x] [`web/src/app/dashboard/sales/deliveries/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/deliveries/page.tsx)
- [x] [`web/src/app/dashboard/sales/invoices/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/invoices/page.tsx)
- [x] [`web/src/app/dashboard/sales/orders/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/orders/page.tsx)
- [x] [`web/src/app/dashboard/sales/pos/cashless/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/pos/cashless/page.tsx)
- [x] [`web/src/app/dashboard/sales/pos/karting/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/pos/karting/page.tsx)
- [x] [`web/src/app/dashboard/sales/pos/restaurant/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/pos/restaurant/page.tsx)
- [x] [`web/src/app/dashboard/sales/pos/retail/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/pos/retail/page.tsx)
- [x] [`web/src/app/dashboard/sales/quotes/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/sales/quotes/page.tsx)
- [x] [`web/src/app/dashboard/purchasing/invoices/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/purchasing/invoices/page.tsx)
- [x] [`web/src/app/dashboard/purchasing/orders/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/purchasing/orders/page.tsx)
- [x] [`web/src/app/dashboard/purchasing/receipts/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/purchasing/receipts/page.tsx)

### H. Vertical Industry Engines (11 Files)
- [x] [`web/src/app/dashboard/events/bookings/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/events/bookings/page.tsx)
- [x] [`web/src/app/dashboard/lims/geotechnique/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/lims/geotechnique/page.tsx)
- [x] [`web/src/app/dashboard/logistics/transport/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/logistics/transport/page.tsx)
- [x] [`web/src/app/dashboard/meetings/board/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/meetings/board/page.tsx)
- [x] [`web/src/app/dashboard/messages/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/messages/page.tsx)
- [x] [`web/src/app/dashboard/notifications/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/notifications/page.tsx)
- [x] [`web/src/app/dashboard/projects/chantiers/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/projects/chantiers/page.tsx)
- [x] [`web/src/app/dashboard/projects/interventions/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/projects/interventions/page.tsx)
- [x] [`web/src/app/dashboard/projects/kanban/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/projects/kanban/page.tsx)
- [x] [`web/src/app/dashboard/projects/timesheets/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/projects/timesheets/page.tsx)
- [x] [`web/src/app/dashboard/realestate/lots/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/realestate/lots/page.tsx)
- [x] [`web/src/app/dashboard/school/timetables/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/school/timetables/page.tsx)
- [x] [`web/src/app/dashboard/syndic/gestion-immeuble/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/syndic/gestion-immeuble/page.tsx)

### I. Layouts & Public Pages (8 Files)
- [x] [`web/src/app/dashboard/layout.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/layout.tsx)
- [x] [`web/src/app/dashboard/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/dashboard/page.tsx)
- [x] [`web/src/app/forgot-password/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/forgot-password/page.tsx)
- [x] [`web/src/app/login/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/login/page.tsx)
- [x] [`web/src/app/register/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/register/page.tsx)
- [x] [`web/src/app/reset-password/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/reset-password/page.tsx)
- [x] [`web/src/app/setup-account/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/setup-account/page.tsx)
- [x] [`web/src/app/layout.tsx`](file:///e:/ToDo/BSofts/web/src/app/layout.tsx)
- [x] [`web/src/app/page.tsx`](file:///e:/ToDo/BSofts/web/src/app/page.tsx)

---

## 2. Global Design Rules & Anatomical Standards

| Layer / Division | Standard Applied across All 108 Views |
| :--- | :--- |
| **Division 1: ViewHeader** | Contains **ONLY** the primary action (`+ Create` / `+ Add` in `#A70000` / `bg-primary`). Zero secondary buttons. |
| **Division 2: KpiStrip** | 4 domain KPI cards with Lucide icons, glassmorphic card styling, and dynamic metric formatting. |
| **Division 3: FilterBar** | Full-width search (`flex-1 w-full`), explicit filter labels (`categoryAllLabel`, `statusAllLabel`), start/end date range pickers (`startDate`/`endDate`), and right-aligned toolbar (`toolbarActions` with `ReloadButton`, `ViewModeSelector`, `ExportButton`, `ImportButton`, and `ExpandCollapseToggle` / Explore & Collapse toggle where hierarchical or expandable tree/card views exist). |
| **Division 4: BulkActionBar** | Shows multi-select count and bulk operations (`onDeleteSelected`, `onClear`). |
| **Division 5: DataTable** | Column 1 **MUST** always display `# ID / Code` formatted with `font-mono font-bold text-xs text-[#A70000] dark:text-red-400`. |
| **Modals & Dialogs** | Sized with `size="3xl"` or `size="4xl"`. Zero native popups (`window.alert`/`window.confirm`). |
| **Typography & Theme** | Dual dark/light mode (`dark:bg-slate-900`), zero hardcoded inline styles, 100% strict TypeScript typing (zero `any`). |

---

## 3. Verification Plan

1. **Automated Universal Validator**: Run the node validator scanning all 100+ files to ensure zero header violations, 100% column 1 ID compliance, and 100% FilterBar toolbarActions compliance.
2. **Frontend Type Check**: `npx tsc --noEmit` under `web/` (0 errors required).
3. **Backend Type Check**: `npx tsc --noEmit` under `backend/` (0 errors required).
4. **Next.js Production Build**: `npx next build` under `web/` (108/108 routes compiled).
5. **Metrics Verification**: Powershell script `.agents/tools/verify-metrics.ps1`.
