# BSOFTS Separation-of-Concerns Plan — Full Stack
Version 1.0 · Scope: database · backend · frontend · .agents governance
Principle: **the solution's logic must live in exactly ONE place (Domain), never inside UI, never inside SQL, never scattered across agents.**

---

## 1. Evidence — where logic leaks TODAY (measured)

| # | Violation | Evidence |
|---|---|---|
| V1 | Tunisian tax engine (CNSS 0.0918 etc.) duplicated **5× inside frontend UI files** | contracts/page.tsx, payroll/page.tsx, rubriques/page.tsx, document-designer-studio.tsx, types/Hrms.tsx |
| V2 | **20 frontend pages** import raw `apiClient.` directly (presentation → infrastructure bypass of lib/apis service layer) | grep across web/src/app/**/page.tsx |
| V3 | Backend `payroll.service.ts` is an **11-line shell** (1 prisma ref, 0 tax math) — business logic vacuum; modules are flat (controller/dto/entity/module/service) with no domain/application split | backend/src/erp/hr/payroll/ |
| V4 | DB models carry logic-adjacent conventions ad hoc (is_deleted/deleted_at/deleted_by present on some models, absent patterns elsewhere); 162 models / 66 enums with no enforced sync to FE types | backend/prisma/schema.prisma |
| V5 | 40 stack/feature agents have role text but **no layer-boundary matrix** — any agent can touch any layer | .agents/agents/*/agent.md |

---

## 2. Canonical layers (the contract)

Dependency rule: arrows point inward ONLY.
`Presentation → Application → Domain ← Infrastructure(implements ports)`

| Layer | Owns | Forbidden |
|---|---|---|
| **DOMAIN** (solution logic) | Pure business rules & invariants: payroll calculator, IRPP barème, leave-balance policy, clause interpolation, RBAC decision function, thread-grouping, geo-hierarchy builder, money-in-millimes helpers, status state machines | imports of react / next / @nestjs/* / @prisma / axios / socket.io / js-cookie / DOM |
| **APPLICATION** | Use-cases orchestrating domain + ports: `runPayroll(month)`, `approveLeave(id, actor)`; transaction boundaries; event emission; DTO↔domain mapping | HTTP status codes, SQL, UI concerns |
| **INFRASTRUCTURE** | Adapters implementing ports: Prisma repositories, `lib/apis/*` clients, sockets, cache invalidateCache, localStorage, printA4Html, exportToCSV | business rules (no rates, no policies) |
| **PRESENTATION** | NestJS controllers + DTO validation; frontend pages/components/hooks; formatting-only helpers (formatTND is display, allowed here) | fetch/axios calls, business formulas, direct entity shapes from DB |

**DATABASE** is not a layer that computes: schema.prisma holds structure, relations, constraints, indexes, enums. No business formulas in SQL/triggers. Soft-delete = standard mixin fields; every migration gets a one-line ADR note.

---

## 3. Target blueprints

### 3.1 Backend module template (strangler pattern — applied per module)
```
erp/<domain>/<module>/
  domain/          payroll-calculator.ts   ← pure functions/classes + *.types.ts   (zero nestjs/prisma imports)
  application/     run-payroll.usecase.ts  ← orchestration; payroll.service.ts becomes thin facade
  infrastructure/  payroll.repository.ts   ← all prisma calls move here
  presentation/    payroll.controller.ts   ← stays; DTO validation only
  payroll.module.ts                        ← wires providers
```
Rule: controller → use-case → repository. Controller never touches prisma; service never contains formulas.

### 3.2 Frontend
```
web/src/domain/<area>/   payroll-engine.ts  ← SINGLE source for CNSS/IRPP/CSS math; deletes the 5 duplicates
web/src/lib/apis/        THE only files allowed to import apiClient (20 violating pages get migrated)
web/src/hooks/           orchestration (useListPage pattern extended)
web/src/components/ui/   dumb primitives (done in previous phase)
web/src/app/**/page.tsx  composition only (target ≤ ~250 lines each)
```

### 3.3 Database
- Soft-delete mixin standardized: `is_deleted deleted_at deleted_by` via prisma generator/mixin doc; audit which of the 162 models lack it intentionally.
- Enum single-source: enums defined in schema → generated types consumed by BE+FE (script `prisma→types` if not already).
- Migration discipline: one concern per migration + ADR line.

### 3.4 .agents governance
- Add to EVERY agent.md an explicit **Allowed-Layers matrix** (e.g., `backend-db-engineer`: infrastructure+database only; `hrms-payroll-tunisian-expert`: domain+application only; `web-components`: presentation-primitives only).
- New skill `clean-architecture-guardrails`: the rules table (§4) + violation commands.
- `master-judger` gains a hard gate: dependency-cruiser report must be green before sign-off.

---

## 4. Enforceable rules (machine-checkable)

| Rule | Enforcement |
|---|---|
| R1 domain imports nothing outward | eslint-plugin-boundaries + dependency-cruiser element types |
| R2 only lib/apis imports apiClient | boundaries: forbid `apiClient` outside `src/lib/apis` (fixes V2) |
| R3 no tax/rate constants in UI (`0\.09\|\* 0\.\d\d`) | grep gate in CI + judger checklist (fixes V1) |
| R4 controller files contain zero `prisma.` | grep gate |
| R5 service/use-case files contain zero rate literals | grep gate |
| R6 schema changes ship with ADR line | PR template checkbox |
| R7 pages stay composition-thin | soft limit ~250 lines, warn-only initially |

Tooling: `npx dependency-cruiser init` + rules.cjs; `eslint-plugin-boundaries`; both wired into `npm run lint` and a new `npm run arch:check`. Existing violations go into a **frozen baseline file** (new code cannot add violations).

---

## 5. Phased execution

| Phase | Work | Gate |
|---|---|---|
| P0 Baseline | dep-cruiser scan; inventory ALL violations (V1–V5 quantified per file); freeze baseline | report in Vault |
| P1 Tooling | install boundaries+depcruiser; wire npm scripts + CI; ratify ARCHITECTURE.md per stack (from §2–§4) | gates run green vs baseline |
| P2 PILOT — Payroll E2E | backend: extract domain/calculator + repository + use-case (fills the 11-line-shell V3); frontend: create src/domain/hr/payroll-engine.ts, delete 4 duplicate engines, migrate payroll/rubriques/contracts/document-designer to import it | tsc+lint+arch:check green; outputs identical (golden test: same inputs → same payslip numbers) |
| P3 Backend strangler | apply module template across erp modules, priority: hr → inventory → gpao → finance → saas-core | per-module arch:check |
| P4 Frontend sweep | migrate 20 raw-apiClient pages to lib/apis; extract remaining domain pockets (thread-grouping, clauses, geo-hierarchy) | R2 grep = 0 |
| P5 Database pass | soft-delete mixin audit across 162 models; enum-sync script; ADR backfill for last 10 migrations | report |
| P6 Governance | agent matrices + guardrails skill + master-judger gate active | final sign-off |

---

## 6. Decisions needed before P0 starts
1. Approve §3 blueprints as-is?
2. Strangler order for P3 (proposed hr-first since pilot proves it)?
3. During migration: allow temporary re-export shims (old path → new path) to avoid big-bang imports? (recommended YES, removed at phase end)
4. Golden-output tests: OK to add vitest specs capturing current payroll/payslip numbers as regression anchors?

---

## 7. Definition of Done (whole project)
- `npm run arch:check` = 0 NEW violations (baseline shrinking each phase)
- One tax formula exists in the repo (grep count = 1 location, in domain)
- Zero pages/lib misuse of apiClient; zero prisma in controllers; zero rates in services/UI
- Every agent.md has its Allowed-Layers matrix; master-judger refuses sign-off otherwise

---

## 8. DOMAIN MAP v1 — SaaS Platform vs Tenant (ratified from owner requirements)

### 8.1 Identity & Structure hierarchy (single identifier across the group)
\\\
User (DEVELOPER | OWNER | EMPLOYEE | OPERATOR)
 └─ Group (owner's single identifier across all his companies)
     └─ Company[] (tenants)
         ├─ Establishment(s)/Site(s)  (inside & outside locations)
         │    ├─ Factory/Plant → Line → Workstation → Machine → Operator
         │    └─ Warehouse/Inventory → Zone → Bin
         ├─ Department(s): finance | production | inventory | commercial | hr ...
         └─ Role/Profile (owner-defined) → Permissions → Functions → Module
\\\

### 8.2 PLATFORM context (Developer-owned logic — 'our rights')
Lives in domain/platform/* on BOTH backend & frontend:
- **saas-config**: default roles, statuses, types (documents/users/inventories/factories...), tax values, print-module defaults — provisioned to a company at subscription time.
- **Reference data**: countries/states/municipalities, currencies, units.
- **Module catalog**: Function → Module grouping (permissions bound to functions).
- **Pack builder**: Pack = { modules[], settings-defaults[], quotas }.
- **Subscription engine**: buy pack → provisions company (owner user, default settings/values, enabled modules, access matrix). Guarantees platform rights + owner rights.
- **Developer god-mode**: cross-tenant access guarded by isDeveloper (never mixed into tenant rules).
Layer rule: platform provisioning runs ONLY in application use-cases (e.g. \provisionCompanyFromPack\); UI reads catalogs; DB stores catalogs as plain models.

### 8.3 TENANT contexts (per-company logic — 'owner rights')
Each becomes one bounded context = backend erp module + web feature area, all scoped by company_id (and readable roll-up at group level):
1. **commercial** — customers, providers, purchases (buys), sales
2. **inventory** — articles, lots/serials, warehouses/zones/bins, movements, adjustments, valuation
3. **hrms** — employees, contracts(+clauses), payroll(Tunisian engine), leaves, attendance, rubriques
4. **production/gpao** — factories, lines, workstations, machines, operators, OF orders, shopfloor tracking
5. **documents** — all document types + PER-COMPANY document-designer (user-defined print layouts/modules)
6. **finance/tracking** — money flows, resource & material consumption, machine tracking, logistics, statistics inside/outside establishments (reporting reads across the group)

### 8.4 Cross-cutting policies (enforced once, everywhere)
- Tenancy isolation: every tenant query scoped company_id; group owner gets read-rollup via same identifier.
- Entitlements: SubscriptionFeatureGuard checks pack.modules before any module route/use-case (already in the 4-guard chain).
- RBAC: owner-managed Profiles → Permissions(function-level); operators limited to production actions.
- Audit trail + soft-delete mixin on every tenant entity.
- Money = integer millimes invariant owned by domain helpers.

### 8.5 Layer placement summary
| Concern | Backend home | Frontend home |
|---|---|---|
| Payroll/tax math | erp/hr/payroll/domain/calculator | src/domain/hr/payroll-engine.ts |
| Provisioning defaults | erp/saas/application/provision.usecase | src/domain/platform/catalog.ts (read-only views) |
| Subscription entitlement check | core guards (application boundary) | route gates + hook useEntitlements |
| Document designer templates | erp/documents/domain/template.model | components/settings/document-designer-studio (presentation only) |
| Geo reference | erp/geo (infrastructure-backed reference) | lib/apis/geos.api only |

---

## 9. DECISIONS RATIFIED (owner, final)
1. **Backend reality**: mostly thin CRUD over Prisma (confirmed by audit D below). => Step-3 backend work means WRITING the domain layer server-side (promoting logic up from frontend), not just moving files.
2. **Languages**: FR first, EN second, AR third (RTL). All new UI strings follow this order; dictionaries structured fr->en->ar.
3. **Currency**: default TND everywhere; company can change currency in its settings (same pattern as language, dark/light mode, primary/secondary colors). Money stays integer millimes internally; display uses company.currency.
4. **Critical upgrades ALL approved** as part of Step 1 guardrails wave: CI pipeline, atomic number-sequence service, idempotency keys on money endpoints, server-side PDF rendering for documents.
5. **Reporting scope ratified** (see REPORTING-CONTEXT.md): inside-establishments reports (employees, documents, purchases, sales, contracts, attendance, salaries) + outside reports (customer/provider accounts & balances, factories, inventories, logistics).

---

## 10. REVISED STEPS (owner directives — override earlier step definitions)

### Step 1 REVISED — Dynamic Permission Registry (backend completion)
Goal: ALL backend services/functions become DB-driven permissions.
- Route scanner enumerates every controller route (114 controllers / 160 routes today) from NestJS metadata.
- Sync job upserts catalog: Function(code=METHOD /path) -> Permission, grouped into Module by controller folder. source=AUTO for scanned, MANUAL entries preserved; removed routes -> is_active=false (never deleted).
- PermissionsGuard: when @RequirePermissions absent (91 of 160 routes today), derive key from handler and validate against DB catalog + user's role assignments.
- Developer-only sync trigger (endpoint/CLI). Existing functions/modules admin pages display live data automatically.

### Step 2 REVISED — Engine + Parameters separation (configurable values in DB)
- Pure calculators take config as INPUT: payroll-calculator(input, PayrollConfig).
- PayrollConfig persisted PER COMPANY (HRMS settings screen), seeded from platform Tunisian defaults (saas-config provisioning), owner-editable, every change audit-logged.
- Applies identically to any future configurable domain (document masks already done this way).
- Golden tests run fixtures against default config AND a mutated config to prove parameterization works.

### Step 4 REVISED — Soft-delete policy SPLIT
- Tenant-operated entities (employees, documents, articles, movements...): soft-delete mixin REQUIRED (non-developer deletions must be recoverable within the 2-day window).
- Developer-only catalogs (permissions, functions, modules, packs, subscriptions): HARD delete allowed, guarded to developer role, with mandatory audit-log row.
- Geo reference data: soft-delete (referenced by tenants).

### Step order now: 1 (registry) -> 2 (payroll engine+config pilot) -> guardrails/CI -> 3 sweep -> 4 db split -> 5 agents matrices.
