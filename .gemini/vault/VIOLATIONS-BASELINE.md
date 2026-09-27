# STEP 0 — VIOLATIONS BASELINE (X-ray)
Date: audit run on full repo. This file is FROZEN: new work may not add violations; each Step-3 batch ticks items off.

## A. Frontend pages calling raw apiClient (must go through lib/apis services) — 19 pages
- dashboard/page.tsx · messages · notifications
- saas-core: companies, functions, modules, packs, permissions, roles, subscriptions, superadmins (10)
- settings: branding, contact, finance, identity, modules, security, sequences (7)
- setup-account (auth verify call)
Rule R2 target: zero.

## B. Backend controllers touching Prisma directly — 2
- core/auth/user-sessions.controller.ts
- core/public/public.controller.ts
Fix: move queries into their module service/repository.

## C. Business formulas living in the WRONG place
Frontend (the real logic today):
- CNSS/tax literals ×5 files: hr/contracts, hr/payroll, hr/rubriques, components/settings/document-designer-studio.tsx, types/Hrms.tsx
- Payroll cascade duplicated per page (gross→CNSS→IRPP→CSS→net + employer costs) — no single engine
Backend (thin-CRUD confirmation):
- Only 2 service files contain rate literals: saas-subscriptions/subscriptions.service.ts (1), gpao/solar-pv-mes.service.ts (1)
- Largest erp service = messages.service.ts (163 lines); payroll.service.ts = 11-line shell

## D. Consequence for the plan
Step-3 backend work = WRITE domain layer (port frontend math server-side), then frontend imports results instead of computing.
Pilot (Payroll) scope updated accordingly:
1. backend/src/erp/hr/payroll/domain/payroll-calculator.ts  ← authoritative engine (+ unit tests)
2. application/run-payroll.usecase.ts + infrastructure/payroll.repository.ts
3. web/src/domain/hr/payroll-engine.ts ← thin mirror for live preview ONLY (same tests, same fixtures)
4. Delete 5 duplicate formula sites; pages consume API/domain outputs
Golden gate: identical payslip numbers before/after on fixed fixture employees.

## E. Tally to reach Definition-of-Done
| Item | Count now | Target |
|---|---|---|
| Raw-apiClient pages | 19 | 0 |
| Controllers w/ prisma | 2 | 0 |
| Tax-formula locations | 6 (5 FE + 1 BE pricing) | 1 (BE domain calculator; FE mirror allowed as tested re-export) |
| CI workflows | 0 | ≥1 (lint+tsc+arch+tests) |
| Idempotency on money endpoints | none | payroll runs, payments |
| Atomic sequences service | none | 1 domain service |
| Server-side PDF for documents | none | renderer + stored copies |
