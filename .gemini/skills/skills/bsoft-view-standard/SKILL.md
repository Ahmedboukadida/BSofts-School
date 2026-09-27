---
name: bsoft-view-standard
description: Canonical layout contract for ALL BSOFTS dashboard views (header, stats, filters, data section, modals, toasts). Mandatory pre-read before creating or refactoring any page under web/src/app/dashboard.
---

# BSOFTS Standard View Contract v1

Apply this contract to every dashboard view. Public auth pages (/login, /register, /forgot-password, /reset-password, /setup-account) are exempt from Layers 1-4 but MUST follow Layer 5 modal rules and Layer 6 toasts.

## Layer 1 - Header (`ViewHeader` + `HeaderActions`)

Use `<ViewHeader>` with breadcrumbs, icon element, short title, one-line description. Compose actions with primitives from `@/components/ui/header-actions` in this exact order:

```
ReloadButton        (mandatory, every view)
ExportButton        (if the view lists exportable data -> opens ExportModal)
ImportButton        (if the entity supports CSV import -> DataImportModal, handler persists via API layer)
ExpandCollapseToggle (only tree/hierarchy/accordion views)
ViewModeSelector    (mandatory, modes limited to what the view supports)
CreateButton        (mandatory on CRUD views, opens create modal)
```

Icon-only buttons carry tooltips; CreateButton keeps its short label.

## Layer 2 - Stats cards (`KpiStrip`)

4-6 cards. Every value computed from real loaded data. Minimum set: Total records, Active count, Matching-filters count, plus domain metrics. NEVER hardcode fake numbers ("98.4%", "~88%").

## Layer 3 - Filters (`FilterBar`)

Mandatory: search input + created_at date range (From/To). Optional per view: status select, category select. `FilterBar` handles responsive collapse (<1024px into FilterModal with active-count badge + Reset).

## Layer 4 - Data section

State comes from `useListPage` hook (`@/hooks/use-list-page`). Never hand-roll viewMode/sort/pagination/selection again.

- Modes: table | grid(DataCard) | split | matrix | hierarchy. Responsive default: grid <1024px, table otherwise; user manual choice wins over resize (hook handles this).
- Table rendering: `<DataTable>` v2 (`@/components/ui/data-tables`) - sortable headers with arrows, optional select column wired to hook selection, action cell built from `DataTableAction[]`, integrated PaginationBar v2.
- Standalone lists (tree/split panes) use `PaginationBar` v2 directly: First/Prev/page-input/Next/Last, per-page 5/10/25/50/100.
- Multi-select -> BulkActionBar ("N selected", Delete Selected via DeleteConfirmModal, Clear).

## Layer 5 - Modals

| Modal | Component | Rule |
|---|---|---|
| Create | WizardModal allowed | validate per step |
| Edit | SAME wizard as create | identical steps, prefilled |
| Detail | DetailModal shell | tabs Information / Statistics / Activity / Related items / Attachments |
| Delete | DeleteConfirmModal | role != Developer -> soft-delete copy "...contact your Developer within 2 days to get it back"; Developer -> permanent confirm |
| Confirm | Modal sm | bulk/danger ops |
| Import | DataImportModal | columns match model schema; onImport calls API then reloads |
| Export | ExportModal | choose CSV or PDF + scope all/filtered/selected |

## Layer 6 - Toasts (`useNotify`)

```ts
const notify = useNotify();
notify.ok("Pack created", "Assign its modules next");      // 2xx success + next action
notify.warn(err, "Could not save record");                  // 4xx warning
notify.fail(err, "Server error while saving");              // 5xx error
```

Never call `toast.success` inside catch blocks. Map HTTP status: >=500 fail, 400-499 warn, 2xx ok.

## Cross-cutting rules

- Colors: use Tailwind tokens `bg-primary`, `text-primary`, `border-primary/20`, `hover:bg-primary-dark`. Raw hexes (#A70000/#8B0000/#FF4D4D) are forbidden in new code.
- Money: integer millimes; display `(v/1000).toFixed(3)` via `formatTND` from `@/lib/utils/format`.
- API mutations go through `@/lib/apis/*` services + `invalidateCache()`.
- Types from `@/types`; no new blanket `eslint-disable @typescript-eslint/no-explicit-any`.
- Page root class convention stays: `flex flex-col gap-6 w-full pb-16`.

## Acceptance checklist (verify before delivering a refactored view)

- [ ] Header matches Layer 1 order; every icon button has tooltip
- [ ] 4-6 live-computed stat cards
- [ ] FilterBar present with search + created_at range (+ applicable selects); Reset works
- [ ] Table sortable asc/desc; grid responsive; supported modes switch correctly; resize never overrides manual choice
- [ ] Selection + bulk soft-delete flow works; pagination controls complete; per-page {5,10,25,50,100}
- [ ] Create/Edit wizard parity; Detail modal has tabbed shell; Import persists; Export offers CSV/PDF + scope
- [ ] Toasts follow Layer 6 mapping
- [ ] Zero raw brand hexes; zero duplicated toolbar/KPI/table boilerplate; tsc --noEmit clean
