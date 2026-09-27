# REPORTING CONTEXT — Statistics Inside & Outside Establishments
Ratified requirement from owner. This defines the Reporting bounded context (Step-3 target, read-model approach).

## INSIDE establishment(s) — operational reports
| Domain | Reports |
|---|---|
| Employees | headcount by department/site/role, hires & exits timeline, operator productivity |
| Contracts | active/expiring (45-day radar), by type CDI/CDD/SIVP, salary mass per site |
| Attendance | presence rate per day/shift/site, lateness, overtime hours (4 tiers) |
| Payroll | monthly salary mass, CNSS/IRPP/CSS totals, employer cost, net paid vs period |
| Leaves | balances, consumption by type, pending approvals |
| Purchases | buy volume by provider/article, delivery delays |
| Sales | volume by customer/article/period, top movers |
| Documents | counts by type/status, print activity |

## OUTSIDE establishment(s) — commercial & network reports
| Domain | Reports |
|---|---|
| Customers | account statements, balances (solde), aging, top customers by revenue |
| Providers | account statements, balances, payables aging |
| Factories (network view) | output per plant/line, OEE/TRS comparison across sites |
| Inventories | stock levels & valuation per warehouse, movements between sites, dead stock |
| Logistics | transfers in transit, delays, carrier performance |

## Architecture decision
Read-models (scheduled aggregates), NOT live OLTP queries:
- backend/src/erp/reporting/domain/*        report definitions (pure)
- application/generate-report.usecase.ts    runs definitions against repositories
- infrastructure/read-models/               materialized aggregates refreshed on schedule + on domain events (outbox feeds it)
- presentation/reporting.controller.ts      endpoints: /reporting/:key?companyId&range&groupBy
Frontend: src/app/dashboard/reports consuming typed results; charts reuse recharts primitives.
Scoping: company_id mandatory; group owner gets roll-up across companies via same identifier.
