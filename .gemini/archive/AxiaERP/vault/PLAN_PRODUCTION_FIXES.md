# Production Module — Fix Plan (Full Scope)

> Based on the user's comprehensive review of ~100 issues across all Production screens.
> Investigation complete. User choices incorporated. Ready for review before execution.

---

## User Decisions (from Q&A)

| Question | Answer |
|----------|--------|
| Detail view on row click | **Side panel (split view)** — master-detail layout |
| Site fields (dépôt, code analytique) | **Keep as dropdown lists** linked to source data |
| Nomenclatures | **Create new Production page** (not cross-link to Structure) |
| OF flow | **Redesign now** — commande-first cascade |

---

## Suggestions / Better Ideas

1. **Replace ALL native `<select>` with `react-select`** — Instead of fixing CSS on native selects, add a new `"richSelect"` field type to `GenericResourceFormModal`. Uses `menuPortalTarget={document.body}` with z-index 9999 (same pattern as existing pickers like ArticlePicker, FamillePicker). Searchable, clearable, works perfectly inside modals. One change, all screens benefit.

2. **Code auto-generation via client-side slugify** — Rather than wiring the server-side Souches system (overkill), generate codes client-side from libellé: `"Atelier Principal"` → `"ATELIER-PRINCIPAL"`. Add a debounced uniqueness check (`GET /exists?code=X`). User can still override manually.

3. **Operateurs ↔ Structure Employees** — Don't duplicate RH data. Add an "Importer depuis RH" button that fetches from Structure's `Employe` table via gateway, pre-fills the form, and copies `Coutstd` → `coutHoraire`. One-time import, not a live sync (operators can be edited independently after import).

4. **Depot field on Sites** — The `DepotPicker` component already exists in the codebase. Use it directly instead of a raw number input.

5. **OF commande-first cascade** — When a commande is selected: auto-fill client, products, quantité. When product is selected: auto-fill nomenclature principale + gamme publiée + site from gamme. Each step narrows the next dropdown. User can override any auto-fill.

> **Terminology convention (enforced throughout):**
> - **Product** (produit) = what comes OUT of production (produit fini)
> - **Article** (matière première) = raw material/component used to MAKE the product
> - In code: `articleCode` on OF = the product code being manufactured. Nomenclature lines' `componentArticle` = the articles (matières premières) consumed.

---

## Phase A — Cross-Cutting Infrastructure

> Blocks most downstream work. Must complete first.

### A1. Add `richSelect` field type to GenericResourceFormModal

**Why:** The native `<select>` inside ErpModal has click issues + no search. A new `richSelect` type renders `react-select` with portal, fixing all dropdown screens at once.

**Files:**
- `erp-front/src/ERPPages/Production/shared/GenericResourceFormModal.js` — add `case "richSelect"` to `rendreChamp`, import `Select` from `react-select`, use `RICH_SELECT_STYLES` from shared
- `erp-front/src/ERPPages/shared/richSelectOption.js` — import `RICH_SELECT_STYLES`

**Tasks:**
| # | Task | Agent |
|---|------|-------|
| A1.1 | Add `richSelect` case to `rendreChamp` switch — renders `<Select>` with `menuPortalTarget={document.body}`, `menuPosition="fixed"`, options from `c.options`, value from `valeurs[c.name]`, onChange calls `modifier()` | Agent (frontend) |
| A1.2 | Handle `richSelect` in `construireCharge` — extract `.value` from selected option, apply `valeurNumerique` casting | Same agent |
| A1.3 | Handle `richSelect` in `useEffect` (edit mode init) — map raw value to option object for react-select | Same agent |
| A1.4 | Test with at least one screen (Postes siteId) to verify portal rendering works inside modal | Verify step |

---

### A2. Add detail side panel to StructuresModuleTablePage

**Why:** "Voir détails" and row click currently set `?sel=ID` but nothing renders the detail. All 12 Production screens need a split-view panel.

**Files:**
- `erp-front/src/ERPPages/shared/StructuresModuleTablePage.js` — add `DetailPanel` component that renders when `selectedId` is set
- `erp-front/src/ERPPages/shared/StructuresModuleTablePage.css` or inline styles — master-detail layout (table left, detail right)

**Tasks:**
| # | Task | Agent |
|---|------|-------|
| A2.1 | Add `selectedItem` state derived from `?sel=ID` + items array | Agent (frontend) |
| A2.2 | Create `DetailPanel` component: shows all field values of the selected item, edit/delete buttons, close button | Same agent |
| A2.3 | Split layout: when panel open, table gets `col-7` and panel gets `col-5`. When closed, table gets `col-12`. Smooth transition. | Same agent |
| A2.4 | Wire existing `onRowClick` to toggle the panel (click same row = close) | Same agent |
| A2.5 | Make each screen pass a `detailFields` config to StructuresModuleTablePage (field names, labels, formatters) | Phase B work |

---

### A3. Code auto-generation helper

**Why:** 7+ screens need auto-generated codes from libellé. One reusable hook.

**Files:**
- `erp-front/src/ERPPages/Production/shared/useAutoCode.js` — new hook
- Backend: `GET {resource}/exists?code=X` endpoint on each controller (or a generic one)

**Tasks:**
| # | Task | Agent |
|---|------|-------|
| A3.1 | Create `slugify(text)` utility: uppercase, replace spaces/accents with hyphens, strip special chars, truncate to 20 chars | Agent (frontend) |
| A3.2 | Create `useAutoCode(service)` hook: watches libellé, generates code via slugify, debounced 500ms uniqueness check via `service.exists(code)`, returns `{ suggestedCode, isChecking, isAvailable }` | Same agent |
| A3.3 | Backend: add `[HttpGet("exists")]` endpoint to Production controllers (Sites, Operations, Postes, Equipements, Motifs) — returns `{ exists: bool }` | Agent (backend) |
| A3.4 | Wire into GenericResourceFormModal: when field has `autoFrom: "libelle"`, auto-fill code from libellé on create (not edit). Show availability indicator. | Agent (frontend) |

---

### A4. Frontend constants for Production type enums

**Why:** TypeSite, TypePoste, TypeEquipement, TypeUnité are free-text in the DB but have documented allowed values. Frontend needs option arrays.

**Files:**
- `erp-front/src/ERPPages/Production/shared/productionConstants.js` — add TYPE constants

**Tasks:**
| # | Task | Agent |
|---|------|-------|
| A4.1 | Add `TYPE_SITE_OPTIONS`: `usine`, `centrale`, `atelier`, `chantier`, `ligne` | Agent (frontend) |
| A4.2 | Add `TYPE_POSTE_OPTIONS`: `ligne`, `cellule`, `station`, `poste` | Same agent |
| A4.3 | Add `TYPE_EQUIPEMENT_OPTIONS`: `machine`, `vehicule`, `pompe`, `malaxeur`, `outil_lourd` | Same agent |
| A4.4 | Add `TYPE_UNITE_STOCKAGE_OPTIONS`: `silo`, `tremie`, `cuve`, `fosse`, `bac`, `rack`, `zone` | Same agent |

---

### A5. Guide page fixes

**Files:**
- `erp-front/src/ERPPages/Production/Aide/AidePage.js`

**Tasks:**
| # | Task | Agent |
|---|------|-------|
| A5.1 | Add `target="_blank" rel="noopener noreferrer"` to all `<a href>` links | Agent (frontend) |
| A5.2 | Add `w-100` or remove max-width constraint so guide uses full page width | Same agent |

---

## Phase B — Reference Data Screens

> B1–B6 are independent of each other → can be parallelized.
> All depend on Phase A (richSelect, constants, auto-code).

### B1. Sites

**Current:** Custom `SiteFormModal.js`. TypeSite = text input. DepotId = number input. No code auto-gen.

**Files:**
- `erp-front/src/ERPPages/Production/Sites/components/SiteFormModal.js`

**Tasks:**
| # | Task |
|---|------|
| B1.1 | `typeSite` → `richSelect` dropdown using `TYPE_SITE_OPTIONS` from A4 |
| B1.2 | `depotId` + `depotLibelle` → replace with `DepotPicker` component (import from `ERPPages/Depot/components/DepotPicker`). On selection, set both `depotId` and `depotLibelle`. |
| B1.3 | `codeAnalytique` → keep as text (no source table exists for analytical codes) |
| B1.4 | Wire code auto-generation from `useAutoCode` (A3) on create |
| B1.5 | Add `detailFields` config for side panel (A2) |

---

### B2. Opérations

**Current:** Uses factory + GenericResourceFormModal. `typeOperation` already has select with options. Mostly fine.

**Files:**
- `erp-front/src/ERPPages/Production/Operations/OperationsTablePage.js`

**Tasks:**
| # | Task |
|---|------|
| B2.1 | Change `typeOperation` from `type: "select"` to `type: "richSelect"` (searchable dropdown) |
| B2.2 | Wire code auto-generation from libellé (A3) |
| B2.3 | Add `detailFields` config for side panel |

---

### B3. Postes de charge

**Current:** `siteId` is native `<select>` (the one user reports can't select). `typePoste` is free text.

**Files:**
- `erp-front/src/ERPPages/Production/PostesCharge/PostesChargeTablePage.js`

**Tasks:**
| # | Task |
|---|------|
| B3.1 | Change `siteId` from `type: "select"` to `type: "richSelect"` — this fixes the click issue |
| B3.2 | Change `typePoste` from text to `type: "richSelect"` with `TYPE_POSTE_OPTIONS` from A4 |
| B3.3 | Change `contrainte` from `type: "select"` to `type: "richSelect"` |
| B3.4 | Wire code auto-generation from libellé (A3) |
| B3.5 | Add `detailFields` config for side panel |

---

### B4. Équipements

**Current:** `typeEquipement` is free text. `etat`, `posteChargeId`, `siteId` are native selects.

**Files:**
- `erp-front/src/ERPPages/Production/Equipements/EquipementsTablePage.js`

**Tasks:**
| # | Task |
|---|------|
| B4.1 | Change `typeEquipement` from text to `type: "richSelect"` with `TYPE_EQUIPEMENT_OPTIONS` |
| B4.2 | Change `etat`, `posteChargeId`, `siteId` from `type: "select"` to `type: "richSelect"` |
| B4.3 | Wire code auto-generation from libellé (A3) |
| B4.4 | Add `detailFields` config for side panel |

---

### B5. Opérateurs

**Current:** Manual data entry. No link to Structure employees.

**Files:**
- `erp-front/src/ERPPages/Production/Operateurs/OperateursTablePage.js`
- Backend: new `IEmployeGateway` + `EmployeGatewayHttp` in ProductionInfrastructure

**Tasks:**
| # | Task |
|---|------|
| B5.1 | **Backend**: Create `IEmployeGateway` interface with `GetEmployesAsync()` method |
| B5.2 | **Backend**: Implement `EmployeGatewayHttp` — calls `GET api/Structure/Employe` (or whatever the endpoint is), maps to DTOs |
| B5.3 | **Backend**: Create `[HttpGet("import-employes")]` endpoint on Production's OperateursController — returns list from gateway |
| B5.4 | **Frontend**: Add "Importer depuis RH" button on OperateursTablePage toolbar |
| B5.5 | **Frontend**: Create `ImportEmployesModal` — fetches available employees, shows a multi-select list, imports selected ones as new operators (pre-fills nomComplet, matricule, fonction, coutHoraire from Coutstd) |
| B5.6 | Change `siteId`, `equipeDefautId` from `type: "select"` to `type: "richSelect"` |
| B5.7 | Add `detailFields` config for side panel |

---

### B6. Motifs d'arrêt

**Current:** Uses factory + GenericResourceFormModal. `categorie` already has select with options. Mostly fine.

**Files:**
- `erp-front/src/ERPPages/Production/MotifsArret/MotifsArretTablePage.js`

**Tasks:**
| # | Task |
|---|------|
| B6.1 | Change `categorie` from `type: "select"` to `type: "richSelect"` |
| B6.2 | Wire code auto-generation from libellé (A3) |
| B6.3 | Add `detailFields` config for side panel |

---

## Phase C — Gammes Overhaul

> Depends on Phase A (richSelect).

### C1. Replace window.prompt with NouvelleVersionModal

**Current:** `window.prompt` for version number — ugly, no validation, no extra fields.

**Files:**
- `erp-front/src/ERPPages/Production/Gammes/GammesTablePage.js`
- `erp-front/src/ERPPages/Production/Gammes/components/NouvelleVersionModal.js` (new)

**Tasks:**
| # | Task |
|---|------|
| C1.1 | Create `NouvelleVersionModal` — ErpModal with fields: version (number, default: current+1), valideDu (date), commentaire (textarea) |
| C1.2 | Wire into GammesTablePage: replace `window.prompt` call with modal open |
| C1.3 | Update `nouvelleVersionRouting` call to pass `{ version, valideDu, commentaire }` (backend already accepts these from Phase 0.1 fix) |

---

### C2. Gamme form dropdowns

**Current:** `articleCode` = plain text input. `uniteLibelle` = plain text input.

**Files:**
- `erp-front/src/ERPPages/Production/Gammes/GammesTablePage.js`

**Tasks:**
| # | Task |
|---|------|
| C2.1 | Change `articleCode` from text to `richSelect` — load articles via `chargerAnnexes`, use ArticlePicker-style options (code + désignation) |
| C2.2 | Change `uniteLibelle` from text to `richSelect` — load unités via `chargerAnnexes`, use UnitePicker-style options |
| C2.3 | Add `detailFields` config for side panel |

---

## Phase D — Production Nomenclatures Page

> User chose: "create the same under production but fix it with the requested"

### D1. Create NomenclaturesProductionPage

**Why:** Currently a cross-link to Structure. User wants a Production-specific page with better UX.

**Approach:** This page will call Structure's API via the existing Production gateway (IStructureGateway already has nomenclature methods). For CRUD, we need new gateway methods.

**Files:**
- `erp-front/src/ERPPages/Production/Nomenclatures/NomenclaturesProductionPage.js` (new)
- `erp-front/src/ERPPages/Production/Nomenclatures/components/NomenclatureFormModal.js` (new)
- `erp-front/src/ERPPages/Production/Nomenclatures/components/LignesNomenclaturePanel.js` (new)
- Backend: extend `IStructureGateway` for nomenclature listing/CRUD
- Backend: new endpoints on Production controller for nomenclature proxy

**Tasks:**
| # | Task |
|---|------|
| D1.1 | **Backend**: Add `GetNomenclaturesAsync()` to IStructureGateway — lists all nomenclatures from Structure |
| D1.2 | **Backend**: Add `CreateNomenclatureAsync()`, `UpdateNomenclatureAsync()`, `DeleteNomenclatureAsync()` to IStructureGateway |
| D1.3 | **Backend**: Implement in StructureGatewayHttp — proxy calls to Structure API |
| D1.4 | **Backend**: Create `NomenclaturesProxyController` in ProductionAPI — exposes gateway methods as REST endpoints |
| D1.5 | **Frontend**: Create `NomenclaturesProductionPage` — table of nomenclatures with article, composants count, statut |
| D1.6 | **Frontend**: Create `NomenclatureFormModal` — size "xl". Fields: article (ArticlePicker), libellé, isPrincipale checkbox. NO version/dates fields (user requested removal). |
| D1.7 | **Frontend**: Create `LignesNomenclaturePanel` — inline table of composants. Add/edit/delete lines. Article component picker, quantité, unité, taux déchet. |
| D1.8 | **Frontend**: Add route in `allRoutes.js` for `/production/nomenclatures` |

---

### D2. Update Production menu

**Files:**
- `erp-front/src/navigation/navigationRegistry.js`
- `erp-front/src/navigation/erpRoutePaths.js`

**Tasks:**
| # | Task |
|---|------|
| D2.1 | Change `prod-nomenclatures` pathKey from `"nomenclatures"` (→ Structure) to `"productionNomenclatures"` (→ new Production page) |
| D2.2 | Add `productionNomenclatures: "/production/nomenclatures"` to erpRoutePaths.js |
| D2.3 | Remove `prod-gammes` entry ("Gammes (déclinaisons)") from navigation — line 412 |

---

## Phase E — OF Redesign (Commande-First)

> Depends on Phase A (richSelect) and Phase B1 (sites dropdown).

### E1. Backend: Vente Gateway

**Why:** OF needs to load commandes from the Ventes service. No gateway exists.

**Files:**
- `erp-back/ProductionApplication/Interfaces/IPasserelles.cs` — add `IVenteGateway`
- `erp-back/ProductionInfrastructure/Passerelles/VenteGatewayHttp.cs` (new)
- `erp-back/ProductionAPI/Program.cs` — register gateway DI
- `erp-back/ProductionAPI/Controllers/OrdresFabrication/OrdresController.cs` — add endpoint

**Tasks:**
| # | Task |
|---|------|
| E1.1 | Create `IVenteGateway` interface: `GetCommandesOuvertesAsync()` → returns list of `{ Id, NumeroCommande, ClientLibelle, DateCommande, Lignes[] }` where each Ligne has `{ ArticleCode, ArticleLibelle, Quantite, UniteLibelle }` |
| E1.2 | Create `VenteGatewayHttp` — calls `GET api/Vente/BonCommande` + `GET api/Vente/BonCommandeLignes/by-bon-commande/{id}` |
| E1.3 | Register in DI (Program.cs) with named HttpClient pointing to Vente service URL |
| E1.4 | Add `[HttpGet("commandes-ouvertes")]` on OrdresController — returns gateway data |

---

### E2. Frontend: Redesign OF form

**Current:** Gamme dropdown → fills article. User wants: Commande → auto-fills article/client → auto-fills gamme/nomenclature/site.

**Files:**
- `erp-front/src/ERPPages/Production/OrdresFabrication/components/OrdreFormModal.js` — rewrite

**Tasks:**
| # | Task |
|---|------|
| E2.1 | Load commandes, gammes, sites, articles via charger function |
| E2.2 | Redesign form layout with cascade flow: |
|     | **Section 1 — Origine**: Référence commande (richSelect from commandes, clears downstream). On select → auto-fill client, show lignes. |
|     | **Section 2 — Produit**: Ligne de commande or Article (richSelect). On select → auto-fill quantité, unité, libellé. Fetch nomenclature principale + gamme publiée from backend. |
|     | **Section 3 — Méthode**: Gamme (richSelect, auto-selected from article), Site (richSelect, auto-selected from gamme), Nature (richSelect from TYPE_OF). |
|     | **Section 4 — Planification**: Début prévu (datetime-local, **default: today**), Échéance client (date, auto-filled from commande), Priorité (number). |
|     | **Section 5**: Commentaire (textarea). |
| E2.3 | Cascade logic: commande.onChange → fill client + articles list → article.onChange → fetch gamme/nomenclature → gamme.onChange → fill site |
| E2.4 | "Début prévu" defaults to current date+time (`new Date().toISOString().slice(0, 16)`) |
| E2.5 | Allow manual OF (no commande) — skip section 1, type article manually |

---

## Phase F — Planning, Besoins, Traçabilité, Coût

> Depends on Phases A–E being stable.

### F1. Besoins — fix server error

**Current:** "Lancer un calcul" likely hits a backend error (to investigate at execution time).

**Tasks:**
| # | Task |
|---|------|
| F1.1 | Reproduce the error by tracing the API call from BesoinsPage → backend handler |
| F1.2 | Fix the root cause (missing data, null reference, or unimplemented handler) |
| F1.3 | Verify the calculation runs and returns results |

---

### F2. Planning — UX improvements

**Tasks:**
| # | Task |
|---|------|
| F2.1 | Investigate current PlanningPage.js state — what works, what doesn't |
| F2.2 | Add tooltips/legends explaining the resource-by-day grid |
| F2.3 | Improve mobile responsiveness |

---

### F3. Traçabilité & Coût de revient

**Tasks:**
| # | Task |
|---|------|
| F3.1 | Investigate current state of both screens |
| F3.2 | Fix reported issues based on investigation |

---

## Execution Order & Dependencies

```
Phase A (cross-cutting) ─────────────────────────────┐
  A1 (richSelect)  ←── blocks B1–B6, C2, E2         │
  A2 (side panel)  ←── blocks B*detailFields          │
  A3 (auto-code)   ←── blocks B*code-gen              │
  A4 (constants)   ←── blocks B1, B3, B4              │
  A5 (guide)       ←── independent                    │
                                                       │
Phase B (ref data) ── all parallel after A ────────────┤
  B1 (Sites)                                           │
  B2 (Opérations)                                      │
  B3 (Postes)                                          │
  B4 (Équipements)                                     │
  B5 (Opérateurs) ── needs backend gateway             │
  B6 (Motifs)                                          │
                                                       │
Phase C (Gammes) ── after A1 ──────────────────────────┤
  C1 (NouvelleVersionModal)                            │
  C2 (Gamme form dropdowns)                            │
                                                       │
Phase D (Nomenclatures) ── after A1, independent ──────┤
  D1 (new page + backend gateway)                      │
  D2 (menu update)                                     │
                                                       │
Phase E (OF redesign) ── after A1, B1, D1 ─────────────┤
  E1 (Vente gateway) ── backend                        │
  E2 (OF form) ── after E1                             │
                                                       │
Phase F ── after E ────────────────────────────────────┘
  F1 (Besoins fix)
  F2 (Planning UX)
  F3 (Traçabilité + Coût)
```

---

## Agent Assignment Strategy

| Phase | Agent count | Agent type | Rationale |
|-------|------------|------------|-----------|
| A1–A4 | 1 agent | Frontend | All touch shared components, sequential |
| A5 | 1 agent | Frontend | Independent, trivial |
| B1–B6 | 2–3 parallel agents | Frontend + Backend (B5) | Screens are independent |
| C1–C2 | 1 agent | Frontend | Same file |
| D1 | 2 parallel agents | Backend + Frontend | Gateway and UI are independent |
| D2 | 1 agent | Frontend | Tiny, do after D1 |
| E1 | 1 agent | Backend | Gateway work |
| E2 | 1 agent | Frontend | OF form rewrite, after E1 |
| F1–F3 | 1 agent per task | Investigate first | Need to see current state |

**Total estimated task count: ~65 individual changes**

---

## SQL Scripts Needed (user runs manually)

| Script | Purpose |
|--------|---------|
| `exists` endpoints | No schema change — just new query endpoints |
| Employee gateway | No schema change — reads existing Structure.Employe table |
| Vente gateway | No schema change — reads existing Vente.BonCommande table |

**No database migrations needed for this plan.** All changes are frontend + API code.

---

## Pending Prerequisites (from prior work)

- [ ] User should run `2026-08-12_reaffecter_societe.sql` on all 3 databases
- [ ] User should run a build to verify Phase 0.1 changes
- [ ] User should run `2026-08-17_01_reprise_postes_operation.sql` as diagnostic
