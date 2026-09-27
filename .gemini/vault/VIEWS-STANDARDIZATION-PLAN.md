# BSOFTS Views Standardization & Optimization Plan
Version 1.0 — Scope: 50 view files under `web/src/app/` + shared UI kit upgrades.

---

## 1. The Standard View Contract (Single Source of Truth)

Every dashboard view MUST follow this exact anatomy. Encoded in skill `bsoft-view-standard`.

### Layer 1 — Header (`<ViewHeader>` upgraded)
- Breadcrumbs (active path)
- Icon + short Title + subtitle **on one line**
- Actions: icon-only buttons with hover tooltips, fixed order:
  1. **Reload** (mandatory) — refresh data
  2. **Export** (if view has data) — opens ExportModal (CSV or PDF)
  3. **Import** (if entity supports it) — opens DataImportModal, handler MUST persist via API layer
  4. **Expand/Collapse All** toggle (only tree/hierarchy/accordion views)
  5. **Display mode selector** (mandatory): table / grid / split / matrix / hierarchy — only modes the view supports
  6. **Create/Add** (mandatory on CRUD views) — opens create modal

### Layer 2 — Stats cards (`KpiStrip`)
- 4 to 6 cards. All values computed from real data (no fake numbers like "98.4% TRS").
- Minimum: Total records, Active count, Filtered/matching count, + domain metric(s).

### Layer 3 — Filters (`FilterBar`)
- Mandatory: search input + date range on `created_at` (From / To pickers).
- Optional per view: status dropdown, category dropdown.
- Desktop ≥1024px inline; <1024px collapsed into `FilterModal` with active-filter badge + Reset.

### Layer 4 — Data section
- Modes: table (default desktop), grid/DataCard (<1024px default), plus split / matrix / hierarchy where applicable.
- Multi-select checkboxes → BulkActionBar ("N selected", Delete Selected, Clear).
- Table: sortable `<th>` asc/desc with arrow icons; row actions = View + Edit + Delete (+ record-specific extras) via `TableActions`.
- Pagination (`PaginationBar` v2): First ⏮ Prev ◀ page-number input Next ▶ Last ⏭; per-page dropdown **5 / 10 / 25 / 50 / 100** (default 10).

### Layer 5 — Modals
| Modal | Rule |
|---|---|
| Create | Wizard allowed |
| Edit | MUST be same wizard if create is a wizard (identical steps) |
| Detail | Tabs: Information / Statistics / Activity / Related items / Attachments |
| Delete | Role-aware: role ≠ Developer → **soft delete** with note "contact your Developer within 2 days to get it back"; Developer → hard-delete confirm |
| Confirm | Generic confirm for bulk/dangerous ops |
| Import | CSV via DataImportModal; columns match model schema; persists to API |
| Export | Choose format (CSV/PDF) + scope (all / filtered / selected) |

### Layer 6 — Toasts (`notify` service over useToast)
- **2xx → success**: clean message + next action ("Pack created — assign its modules next").
- **4xx → warning**: problem message from server.
- **5xx → error**: problem message.

### Cross-cutting rules
- Zero hardcoded colors: `#A70000/#8B0000/#FF4D4D` → Tailwind tokens `brand`, `brand-dark`, `brand-light`.
- Money = integer millimes; display via `formatTND()` util. Dates via `formatDate()` util.
- No inline toolbar/table/KPI markup duplication — everything through shared primitives.
- API calls via `@/lib/apis/*` service layer (no raw apiClient.get in pages where a service exists); `invalidateCache()` after mutations.
- Types from `@/types`; progressively remove blanket `eslint-disable no-explicit-any`.
- i18n: strings via locale dictionaries (next-intl namespaces already used in auth/inventory chrome); no mixed FR/EN/AR literals in one file.

---

## 2. Phases

### Phase 0 — Foundation primitives (owner: web-components)
| # | Deliverable | Files |
|---|---|---|
| 0.1 | Brand tokens in globals/tailwind config + replace hardcoded hexes repo-wide | `globals.css`, tailwind config |
| 0.2 | Format utils: TND millimes, dates, relative time | `web/src/lib/utils/format.ts` |
| 0.3 | `ViewHeader` v2 (breadcrumbs/title-line/actions contract, RTL aware) | `view-header.tsx` |
| 0.4 | `HeaderActions` composable icon-buttons w/ tooltips | new `page-header-actions.tsx` |
| 0.5 | `FilterBar` + mobile FilterModal integration | new `filter-bar.tsx` |
| 0.6 | `useListPage` hook (viewMode+responsive, sort, pagination 5-100, filters, selection, reset-on-change) | new `hooks/use-list-page.ts` |
| 0.7 | `DataTable` v2 on TanStack (sorting icons, select column, action slot, pagination First/Prev/input/Next/Last, empty/loading, dark mode) | upgrade `data-tables.tsx` |
| 0.8 | `PaginationBar` v2 (first/last/page input/per-page 5-100) | upgrade `pagination-bar.tsx` |
| 0.9 | `BulkActionBar` | new |
| 0.10 | `DetailModal` shell (tabs) | new `detail-modal.tsx` |
| 0.11 | `DeleteConfirmModal` (role-aware soft/hard delete copy) | new `delete-confirm-modal.tsx` |
| 0.12 | `ExportModal` (format + scope; exportToCSV / printA4Html) | new `export-modal.tsx` |
| 0.13 | `notify` toast service mapping status codes | new `lib/utils/notify.ts` |
| 0.14 | Status-badge maps per domain | constants files |
Gate: tsc --noEmit clean, all existing pages still compile.

### Phase 1 — Critical bug fixes (landed with/before rollout, owner per file's batch agent)
- roles/page.tsx: rewrite corrupted handlers (≈L150-171, 350-368, 524-530, 686-702, 827-828, 1070-1078).
- setup-account: fix toast signature + write cookie `bsoft_auth_token`.
- settings contact & identity: catch → toast.error.
- warehouses: payload keys `latitude/longitude`; remove `\|\| true` dead filter.
- messages: unify selection IDs (root), real resize listener, retire offcanvas OR global drawer (pick one).
- permissions: swapped RTL Prev/Next labels; SearchableParentSelect props; UserHoverTooltip render.
- leaves: persist approve/reject; align status enums; attendance: wire date-range filter + sorting setters.
- logs & geos & production/orders: replace stubbed APIs with real endpoints (backend coordination if needed).
- Remove dead states/unreachable modals everywhere; replace fake "Page 1 of 1" footers with PaginationBar v2.

### Phase 2 — Pilots (prove pattern end-to-end)
- Pilot A simple CRUD: `saas-core/states` (table/grid, full modal set, soft delete).
- Pilot B complex: `hr/employees` (5-step wizard create/edit parity, Detail tabs, import/export, bulk select).
Gates: judger-typescript + judger-ui-ux conformance checklist pass; manual smoke by view-qa-tester rules.

### Phase 3 — Batch rollout (parallel agents, each loads skill bsoft-view-standard)
| Batch | Files | Owner agent |
|---|---|---|
| B1 Auth (public variant: no breadcrumbs/stats; keep lang/theme switcher) | login, register, forgot-password, reset-password, setup-account | web-views |
| B2 saas-core A | companies, subscriptions, packs, packs/[id], superadmins | saas-expert |
| B3 saas-core B | roles, permissions, functions, modules, app-settings | web-views |
| B4 saas-core C | countries, states, municipalities, geos (wire real APIs) | web-views |
| B5 HR | employees(finalize), contracts, payroll, rubriques, leaves, attendance | domain-subagent-hrms-payroll |
| B6 Inventory | articles, warehouses, lots-serials, movements, adjustments, valuation | domain-subagent-inventory |
| B7 Production | orders, shopfloor | domain-subagent-gpao |
| B8 Settings | hub + identity/contact/branding/document-designer/sequences/finance/modules/hierarchy/team/security (fix phantom bank CRUD, dead fields, GeoAddressPicker shadowing) | web-views |
| B9 Core dashboard | dashboard overview, notifications, messages | web-views + realtime-messenger-agent |
Per-batch gate: tsc --noEmit + eslint on changed files + conformance checklist + update Vault PROGRESS.md/STATUS.md.

### Phase 4 — Final audit
master-judger multi-pass: zero-regression diff review, hardcoding scan (rg '#A70000' outside tokens = fail), duplicate-toolbar scan, toast-contract scan, then sign-off. Archive decisions in Vault DECISIONS.md.

---

## 3. Agent / Skill upgrades required
1. **NEW skill** `.agents/skills/bsoft-view-standard/SKILL.md` — embeds Section 1 contract + code templates (useListPage usage, DataTable v2 columns, DeleteConfirmModal copy) + acceptance checklist. Every batch agent loads it first.
2. **Upgrade `.agents/agents/web-views/agent.md`** — mandate the contract; forbid hand-rolled toolbars/pagination/KPI shells.
3. **Upgrade `.agents/agents/web-components/agent.md`** — owns primitives; UI changes must extend contracts, not fork patterns.
4. **Upgrade `view-qa-tester.md`** — add checklist rows: pagination controls set, per-page options {5,10,25,50,100}, soft-delete note for non-developers, ExportModal present when Export button exists, toast code mapping, stats values are live-computed.
5. **Upgrade `judger-ui-ux/agent.md`** — add automated greps: raw brand hex outside tokens, duplicated resize-effect blocks (>2 occurrences), `toast.success` inside catch blocks, `Math.max(1 - 1)` style pagination math.
6. Domain subagents (hrms-payroll, inventory, gpao, saas-expert): append pointer to the new skill as mandatory pre-read.

## 4. Open decisions (confirm before Phase 0 lands)
1. Soft delete backend support: does API accept `is_deleted`/status flag per entity, or frontend-only pending backend task? (Affects DeleteConfirmModal wiring.)
2. i18n target: migrate all views to next-intl dictionaries now vs keep bilingual ternaries but centralized per view? Recommend progressive: extract during refactor, one namespace per module.
3. Display-mode applicability matrix approval (which views get split/matrix/hierarchy):
   - matrix: roles only · hierarchy/tree: packs, modules, functions, permissions, geos · split: packs, modules, roles, messages(folders+list) · others: table|grid.
4. Logs/geos/orders stubs: confirm backend endpoints exist before wiring (else coordinate with backend-* agents first).

## 5. Acceptance criteria (per view, final)
- [ ] Header matches contract (breadcrumbs, one-line title, icon buttons w/ tooltips, correct subset)
- [ ] 4-6 live-computed stat cards
- [ ] Search + created_at range mandatory; optional selects per spec
- [ ] Table sortable; grid responsive; supported modes selectable; selection + bulk soft-delete works
- [ ] Pagination First/Prev/input/Next/Last + per-page {5,10,25,50,100}
- [ ] Create/Edit wizard parity; Detail tabs; Import persists; Export offers CSV/PDF
- [ ] Toasts mapped to 2xx/4xx/5xx with next-action line on success
- [ ] Zero hardcoded brand hexes; zero duplicated boilerplate; tsc/eslint clean
