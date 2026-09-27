
## ADR-052: Sprint 20 Third-Party Social Media, Services Media, eCommerce Order Items, Subscriptions Features & Companies Settings Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Bridged 5 unreferenced Prisma schema models into production full-stack engines and controllers: `third_parties_social_media`, `services_media`, `ecommerce_order_items`, `subscriptions_features`, and `companies_settings`.
- **Decisions & Standardizations**:
  1. **Partner Social Media Footprint (`third_parties_social_media`)**: Standardized 6 social media channels (`third_parties_social_media_type`: `FACEBOOK`, `INSTAGRAM`, `TIKTOK`, `TWITTER`, `LINKEDIN`, `WEBSITE`), soft-delete enabled (`super(prisma, 'third_parties_social_media', true)`), and company-scoped queries.
  2. **Billable Services Media Attachments (`services_media`)**: Added multimedia attachment management for catalog services (`services_media_type`: `IMAGE`, `VIDEO`, `AUDIO`) with soft-delete enabled (`super(prisma, 'services_media', true)`).
  3. **eCommerce Order Item Line Precision (`ecommerce_order_items`)**: Implemented Decimal calculations for quantities, prices, discounts, and tax values using `Prisma.Decimal`, soft-delete disabled (`super(prisma, 'ecommerce_order_items', false)`).
  4. **SaaS Subscription Plan Feature Limits & Gates (`subscriptions_features`)**: Managed feature flags, limits (`MAX_USERS`, `MAX_WAREHOUSES`), custom values, and atomic toggle switches (`PATCH /toggle/:id`), soft-delete enabled (`super(prisma, 'subscriptions_features', true)`). Registered in `SaasCoreBackendModule`.
  5. **Tenant-Level Dynamic Application Settings (`companies_settings`)**: Governed company-specific toggle flags with upsert logic over composite key `[company_id, app_setting_id]`, soft-delete disabled (`super(prisma, 'companies_settings', false)`), active user tenant fallback resolution. Registered in `AppModule`.
  6. **Route Declaration Precedence & Unit Testing**: Static routes strictly precede parameterized routes (`/:id`) adhering to `nest-route-organizer`. Unit tests standardized on `mockService` pattern avoiding DI instantiation overhead.
  7. **Strict Build Gate & Metrics Verification**: Verified dual `npx tsc --noEmit` exit code 0 on both `backend/` and `web/` with 0 explicit `any` types. Backend test suites expanded from 79 to **84 (381/381 tests passed, 100% green)**, backend controllers from 151 to **156 (+5)**, services from 165 to **170 (+5)**, modules from 163 to **168 (+5)**, HTTP endpoints from 259 to **274 (+15)**, web API clients from 163 to **165**.

## ADR-051: Sprint 19 Third-Party Addresses, Partner Contacts, POS Session Payments, Production Routing Steps & Billable Services Tags Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Bridged 5 unreferenced Prisma schema models into full-stack production components: `third_parties_addresses`, `third_parties_contact`, `pos_session_payments`, `prod_routing_steps`, and `services_tags` (with `services_tags_relations`).
- **Decisions & Standardizations**:
  1. **Partner Multi-Site Geographic Addresses (`third_parties_addresses`)**: Implemented multi-address management for clients and suppliers linked to the 3-level administrative hierarchy (`app_geo_countries`, `app_geo_states`, `app_geo_municipalities`) with zip code and soft-delete support (`super(prisma, 'third_parties_addresses', true)`).
  2. **Multi-Channel Partner Contacts (`third_parties_contact`)**: Standardized contact person channels using `third_parties_contact_type` enum (`PHONE`, `EMAIL`, `FIX`, `FAX`), partner lookup (`GET /by-third-party/:id`), and type filter (`GET /by-type/:id/:type`).
  3. **POS Session Drawer Reconciliations (`pos_session_payments`)**: Stored drawer payments in integer millimes without soft-delete flag (`super(prisma, 'pos_session_payments', false)`), providing aggregated summary by payment method for Z-report closing balance validation.
  4. **GPAO Production Routing Steps & Cycle Time Engine (`prod_routing_steps`)**: Sequenced routing operations with setup, unit processing, finishing, wait, and transfer durations. Built total cycle time computation engine (`calculateTotalRoutingTime`) taking batch quantity into account, workstation bindings, and quality control inspection gate flags (`est_point_controle`).
  5. **Billable Services Taxonomy & Classification Tags (`services_tags` & `services_tags_relations`)**: Governed taxonomy tags with company scoping and many-to-many relationship management (`attachTag`, `detachTag`) preventing duplicate tag assignments.
  6. **Route Declaration Precedence & Controller Unit Testing**: Static routes strictly precede parameterized routes (`/:id`) adhering to `nest-route-organizer`. Unit test specs standardized on `mockService` pattern avoiding DI instantiation overhead.
  7. **Strict Build Gate & Metrics Verification**: Verified dual `npx tsc --noEmit` exit code 0 on both `backend/` and `web/` with 0 explicit `any` types. Backend test suites expanded from 74 to **79 (361/361 tests passed, 100% green)**, backend controllers from 146 to **151**, services from 160 to **165**, modules from 158 to **163**, HTTP endpoints from 243 to **259 (+16)**, web API clients from 159 to **163**.

## ADR-048: Sprint 16 Catalog Services, Solar PV Master Registry & Production Output/Quotas Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Bridged 5 unreferenced Prisma database models into full-stack production components: `services`, `services_categories`, `pv_panneaux`, `prod_sorties_of`, and `prod_objectifs_equipe`.
- **Decisions & Standardizations**:
  1. **Decimal Types via Prisma**: Standardized all financial prices and production quantities on `Prisma.Decimal` imported from `@prisma/client` (eradicating unresolvable `@prisma/client/runtime/library` imports).
  2. **Hierarchical Service Category Self-Referencing**: Model `services_categories` models recursive parent-child tree navigation via `parent_id` foreign keys, with dedicated endpoints for root categories (`GET /roots`) and subcategories (`GET /subcategories/:parentId`).
  3. **Solar PV Central Registry & Binning**: Solar modules characterized via flash testing and EL inspection are registered into `pv_panneaux` with auto-computed 5W power binning ($P_{\max}/5 \times 5$), fill factor ($FF$), efficiency ($\eta$), and barcode uniqueness.
  4. **Strict Route Declaration Precedence**: Static route endpoints (`/active`, `/roots`, `/distribution`, `/declare`, `/summary/:articleCode`) strictly precede parameterized routes (`/:id`) adhering to `nest-route-organizer`.
  5. **Zero Type & Compilation Regressions**: Dual `npx tsc --noEmit` exit code 0 repository-wide with 0 explicit `any` types. Backend test suites expanded from 59 to 64 (317/317 tests passed, 100%), web tests maintained at 11 suites (58/58 tests passed).

## ADR-044: Repository-Wide ESLint & TypeScript Diagnostic Remediation Gate
- **Date**: 2026-09-06
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: 46 files across `web/` and `backend/package.json` had ESLint warnings, unused imports, unused variable declarations, catch parameter warnings, and minor modal signature discrepancies.
- **Decisions & Standardizations**:
  1. **Strict Catch Handlers**: Replaced all unread error catch arguments (`catch (e)`) with parameterless `catch` clauses across local storage deserializers and fallback initializers.
  2. **Eradication of Ghost Imports & Unused State**: Cleaned all unused Lucide icon imports, unread state setters, and dead function references across all 46 files.
  3. **Modal Component Contract Harmonization**: Unified `<DeleteConfirmModal>` invocations across all purchasing views to use the canonical `deleting={isDeleting}` prop instead of non-existent `loading`.
  4. **Strict Scope Destructuring for Export Handlers**: Destructured `{ scope }` on `<ExportModal onExport={({ scope }) => ...}>` when CSV format is predetermined, eliminating unused format warnings.
  5. **Zero Type & Compilation Regressions**: Enforced `npx tsc --noEmit` in both `web/` and `backend/` resulting in 0 errors and 0 explicit `any`. All 58 web tests and 248 backend tests remain 100% green.

## ADR-043: Master 47-Point Architecture & Remediation Standards
- **Date**: 2026-09-04
- **Status**: APPROVED & 100% IMPLEMENTED
- **Decisions & Standardizations**:
  1. **Foundations First**: Resolved all column ID collisions and hook instability (FOUND-1) eliminating re-render loops across all views.
  2. **Universal 3-Frame Wizard**: Quotes, Orders, Deliveries, Invoices, BCF, BR standardize on: Header/Meta -> Third-Party -> Article Lines.
  3. **Universal Audit Trail**: Embedded <AuditTrailTab> across all entity and document detail modals for field-level diffs and history.
  4. **Inventory & Emplacements**: Removed Arabic designation from articles, enabled EAN-13 auto-generation with override, added arbitrary-depth storage picker (Level 1 -> 1.1 -> 1.1.1 with "leave at this level"), converted lots-serials into an immutable consultation journal, added 3-step physical count wizard with auditor employee dropdown, and added interactive PUMP vs FIFO costing toggle.
  5. **Standalone Logistics Domain**: Extracted transport and fleet from stock into a dedicated top-level domain covering freight missions, weighbridge tickets, vehicle fleet maintenance schedules, HR-linked driver profiles, and trip expense tracking.
  6. **Zero TypeScript Errors Gate**: Verified repository-wide `npx tsc --noEmit` passing with 0 errors in both `web/` and `backend/`.

### Decision 2026-09-03: Sidebar Domain Reorganization & Canonical 5-Layer Metier View Architecture
- **Context**: The user instructed to reorganize the left dashboard sidebar to follow a clean, professional grouping and align all specialized views (Real Estate, Academic, Syndic, Events, POS) with the canonical design standards (ViewHeader, KpiStrip, FilterBar, DataTable, Modals).
- **Decisions & Standardizations**:
  1. **16 Standardized Business Domain Navigation Groups**:
     - Consolidated all routes into 16 structured groups in `web/src/components/layout/dashboard/sidebar.tsx` with metier badges, lucide icons, `localStorage` expansion persistence, and current pathname auto-expanding.
  2. **Canonical 5-Layer View Architecture Enforced**:
     - All specialized views (`/dashboard/realestate/lots`, `/dashboard/school/timetables`, `/dashboard/syndic/gestion-immeuble`, `/dashboard/events/bookings`, `/dashboard/sales/pos/*`) strictly implement:
       - Layer 1: `<ViewHeader>` with breadcrumbs and contextual primary action triggers.
       - Layer 2: `<KpiStrip>` with dynamic analytics cards and color tones.
       - Layer 3: `<FilterBar>` with search, status/category dropdowns, and date ranges.
       - Layer 4: `<DataTable>` with sortable column definitions and always-visible action buttons.
       - Layer 5: `<Modal>` and `<DeleteConfirmModal>` with soft/hard deletion guards.
  3. **Zero TS Errors Gate Verified**: Both `web/` and `backend/` verified with `npx tsc --noEmit` returning 0 errors.

## ADR-042: Universal Canonical View Standard (Platform App Settings Reference Model)
- **Date**: 2026-09-03
- **Status**: APPROVED & ENFORCED ACROSS ALL 106 WEB PAGES
- **Context**: The user mandated strict harmonization of layout, design, colors, sizes, modal styles, button styles, widths, filters, and toolbar controls across all dashboard views, standardizing on the Platform App Settings reference model.
- **Decision**:
  1. Header Division: Breadcrumbs, domain icon, bold title, subtitle, and #A70000 primary create button.
  2. KPI Strip: 4-card grid with tonal icons in top-right and bold metric values.
  3. Filter Toolbar: Left full-width search input, explicit "All [Domain]" dropdowns ("All Categories", "All Status", "All Data Types"), Start/End date pickers, and right-aligned toolbar controls (Reload, ViewMode toggles, Export, Import, Expand/Collapse, Reset).
  4. Data Division: First column with checkbox + sortable ID column (# / ID), click-to-sort on all columns, uppercase headers, and always-visible action buttons.
  5. Standard Modals: 3xl forms, tabbed DetailModal, DeleteConfirmModal, ExportModal, DataImportModal.
- **Consequences**: Zero cognitive load for users navigating between any ERP domain, 100% consistent UX, zero TypeScript/ESLint warnings, and strict responsive adaptability (<1024px vs >=1024px).


## ADR-040: Universal Multi-Select, BulkActionBar & ViewMode Standards
- **Date**: 2026-09-03
- **Context**: Ensure consistent UX, responsive layout, multi-selection, and view mode switching across all 106 frontend web pages.
- **Decision**: 
  1. Every data table must include row selection and `<BulkActionBar>`.
  2. Every hierarchical/tree view must include `<ExpandCollapseToggle>` in `FilterBar.toolbarActions`.
  3. Every view with multiple layouts must include `<ViewModeSelector>` in `FilterBar.toolbarActions`.
  4. All view filters must use the canonical `<FilterBar>` component.
  5. Zero TypeScript errors (`tsc --noEmit`) and zero `any` types enforced across the repository.

## Decision 2026-09-05: Sprint 3 CRM Suite & Universal Modals Harmonization
- **RNE & Registre de Commerce**: In Tunisian enterprise compliance, the modern RNE (Registre National des Entreprises) maps to the database column `rc` on `third_parties`. The CRM views now map `rne_number` to `rc` and display both Matricule Fiscal and RNE on client and supplier cards.
- **VAT Exemption & Risk Indicators**: Added explicit `is_vat_exempt` handling (setting `tax_rate_snapshot: 0`) with amber badge in the data tables, plus credit limit breach alerts when client encours exceeds the authorized credit ceiling.
- **One-Click Lead-to-Client Modal**: Rather than an in-memory status update, "Convertir en Client" now launches a dedicated modal creating certified `third_parties` accounts via `thirdPartyApi.create` and updating lead status to `CONVERTI` via `leadsApi.update`.
- **Pipeline Kanban Persistence**: Drag-and-drop stage updates in the CRM pipeline are now immediately persisted to the backend API via `opportunitiesApi.update`.
- **Portfolio Inbound Lead Inbox**: Integrated a dedicated tab in `portfolio/page.tsx` displaying incoming web leads with qualification and conversion actions.

## Decision 2026-09-05: Sprint 4 Commercial Sales, POS Verticals, Purchasing & Inventory Harmonization
- **Document Lineage & Actions**:
  - `sales/quotes/page.tsx`: Devis to Commande conversion (`handleConvertToOrder`) creates CMD in `bsoft_orders` and updates quote status to `ACCEPTE`.
  - `sales/orders/page.tsx`: Commande to Facture generation (`handleGenerateInvoice`) creates customer invoice in `bsoft_invoices` and updates order status to `FACTURE`.
  - `sales/deliveries/page.tsx`: BL status progression mapped to standard `EN_PREPARATION`, `EN_COURS_LIVRAISON`, `LIVRE_CONFORME`, and `CLOTURE`.
  - `sales/invoices/page.tsx`: Multi-modal payment modal with Tunisian regulatory cash ceiling (5,000 TND max) notice and bank/caisse account selectors.
- **Vertical POS Enhancements**:
  - `sales/pos/retail/page.tsx`: Standardized unique column IDs (`ticket_col`, `store_col`, `motif_col`, `total_col`, `payment_col`, `date_col`, `actions`).
  - `sales/pos/restaurant/page.tsx`: Standardized unique column IDs (`table_col`, `covers_col`, `server_col`, `total_col`, `status_col`, `actions`).
  - `sales/pos/karting/page.tsx`: Standardized unique column IDs (`kart_col`, `rider_col`, `laps_col`, `timer_col`, `price_col`, `status_col`, `actions`).
- **Purchasing Workflow Transformations**:
  - `purchasing/orders/page.tsx`: Bon de Réception generation (`handleGenerateGoodsReceipt`) creates BR in `bsoft_purchase_receipts` and updates PO status.
  - `purchasing/receipts/page.tsx`: Facture d'Achat generation (`handleGeneratePurchaseInvoice`) creates invoice in `bsoft_purchase_invoices`.
  - `purchasing/invoices/page.tsx`: RS Withholding Tax (1%, 1.5%, 15%) calculation and ledger payment recording.
- **Inventory & Logistics Remediation**:
  - `inventory/warehouses/page.tsx`: Integrated canonical `<AddressGeoPicker>` with Tunisian cascade (Country -> State -> Municipality), GPS coordinates, and unique column IDs.
  - `inventory/articles/page.tsx`: Stripped `name_ar` from table cells, CSV export, and search filter to maintain French-only dashboard compliance. Added unique column IDs.
  - `inventory/lots-serials/page.tsx`: Standardized unique column IDs for FEFO lot tracking.
  - `inventory/adjustments/page.tsx`: Replaced raw text input with `AUDITOR_EMPLOYEES` dropdown in creation modal and standardized unique column IDs.

## Decision 2026-09-05: Sprint 5 Test Suite Stabilization & Controller Signature Harmonization
- **PermissionsGuard Teardown**: Made `PermissionCatalogCache` `@Optional()` in constructor injection so isolated unit tests instantiating controllers with mocks do not fail dependency injection.
- **BaseController Method Signatures**: Harmonized all 11 controller test specs with `BaseController` and Geo service invocation signatures, passing `IActiveUser` context (`id: 1`, `active_company_id: 1`, `is_developer: true`) and asserting on actual service calls:
  - `findAll(companyId, options, companyIds, isDeveloper)`
  - `findOne(id, user.active_company_id || 1, isDeveloper)`
  - `create(dto, user.id, user.active_company_id || 1)`
  - `update(id, dto, user.id, user.active_company_id || 1)`
  - `remove(id, user.id, user.active_company_id || 1, isDeveloper)`
- **Vitest Runner on Windows**: Configured `pool: 'threads'` in `web/vitest.config.ts` to replace `pool: 'forks'`, resolving worker initialization timeouts on Windows environments.
- **Full Test Suite Passing**: Verified 44/44 backend test suites (248/248 tests) and 1/1 web test suite (2/2 tests) passing with 0 failures.

## Decision 2026-09-05: Sprint 6 Partner Statements, Barcode/QR Engine & Public Storefront
- **Interactive Statement of Account (`StatementOfAccountModal`)**: Widened partner identifier interface (`number | string`) to cleanly support both `ClientItem` and `SupplierItem`. Integrated 360 partner running balance ($B_t = B_{t-1} + \text{Debit}_t - \text{Credit}_t$), period filters, lettrage status tags, CSV export, and print spooling across both list tables and responsive grid cards in `crm/clients` and `crm/suppliers`.
- **Barcode & QR Label Generator (`BarcodeLabelPrinterModal`)**: Standardized label generation for multiple physical form factors (50x30 mm direct thermal, 70x35 mm shelf label, 100x50 mm shipping pallet, and 24-up A4 sheet). Fully wired into `inventory/articles`, `inventory/lots-serials`, and `inventory/warehouses`.
- **Public Client Mini-Storefront (`/storefront/[slug]`)**: Scaffolded modern public store portal at `web/src/app/storefront/[slug]/page.tsx` with dynamic category filtering, cart drawer integration (`StorefrontMiniCartDrawer`), and 4-gateway checkout modal supporting Konnect, Flouci, Stripe, and Cash on Delivery (COD).
- **Zero-Type-Debt Enforced**: Maintained 0 explicit `any` types repository-wide, verified with `verify-metrics.ps1` (0 backend / 0 web / 0 total).

## Decision 2026-09-06: Sprint 7 Geotechnical LIMS Engine, 1D/2D Cut Optimizer & Automated General Ledger Posting
- **Geotechnical LIMS Math Engine (`lims-geotech-engine.tsx`)**:
  - Implemented dynamic semi-log interpolation for $D_{10}, D_{30}, D_{60}$ based on actual sieve data points, replacing static estimates.
  - Implemented least-squares quadratic polynomial curve fitting for Proctor Normal compaction test (NF P94-093), accurately locating the vertex optimum point ($w_{\text{opt}}$, $\gamma_{d,\max}$).
  - Added Sand Equivalent cleanliness ratio calculation ($ES = \frac{h_2}{h_1} \times 100$) with piston/visual calibration.
  - Designed pure offline-compatible deterministic SHA-256 cryptographic seal generator for ISO/IEC 17025 certificate freezing with tamper-proof payload.
- **Responsive SVG LIMS Visual Charts (`lims/geotechnique/page.tsx`)**:
  - Built a native responsive SVG semi-logarithmic granulometry curve chart ($0.063\text{ mm} \rightarrow 25\text{ mm}$) with standard BTP envelope guides and guide markers for effective diameters.
  - Built a native responsive SVG Proctor compaction bell curve with real-time vertex crosshair.
  - Added cryptographic certificate freezing flow and modal with copyable SHA-256 hash and official verification token.
- **2D Sheet / Plate Guillotine Cut Stock Optimizer (`cutting-stock-2d.ts`)**:
  - Implemented Guillotine Shelf-Packing algorithm for rectangular parts on sheet materials (glass, metal plates, wood panels) with 90-degree part rotation, blade kerf accounting, and offcut minimization.
  - Created dual-tab interface in `cut-optimizer/page.tsx` (1D linear bars vs 2D nested sheet panels) with an interactive SVG 2D layout canvas rendering nested colored parts and offcuts.
  - Added sheet presets (MDF, steel plate, glass pane, marble slab), CSV export, 'OF' document vector printing, and stock raw material reservation.
- **Tunisian General Ledger Automated Posting Engine (`journal-automation-engine.ts`)**:
  - Encoded Tunisian Plan Comptable Général (PCG) automated posting rules for sales invoices (VT: 411 / 701 / 4367 / 4365), purchase receipts (AC: 607 / 4366 / 401 / 432), and POS cashier closings (CS: 532 / 512 / 707 / 4367).
  - Enforced strict integer millimes balance guard ($\sum \text{Debit} = \sum \text{Credit}$).
  - Wired interactive "Génération Automatique des Écritures" modal in `journal-entries/page.tsx`.
- **Quality Gates Maintained**:
  - 44/44 backend test suites passing (248/248 tests).
  - Web unit tests expanded to 4 test suites (12/12 tests passing).
  - 0 TypeScript errors in `web/` and `backend/` (`npx tsc --noEmit`).
  - 0 explicit `any` types repository-wide.

## Decision 2026-09-06: Sprint 8 Tunisian Tax Declarations, Construction BTP Progress Invoicing & Board Governance AI Minute Word PV Generator
- **Tunisian Liasse Fiscale Engine (`liasse-fiscale-engine.ts`)**:
  - Strict mapping of the Tunisian Système Comptable des Entreprises (SCE) into standard Bilan Actif / Passif balance sheets ($\sum \text{Actif} = \sum \text{Passif}$) with negative amortization deductions and balanced equity/liabilities.
  - État de Résultat with operating profit calculation, ordinary profit, 15% corporate tax (`IS`) calculation with 0.2% minimum turnover tax ceiling, and net earnings.
  - Indirect cash flow statement (`État des Flux de Trésorerie`) with operational cash flow (A), investing cash flow (B), and financing cash flow (C) reconciliation.
  - Déclaration Employeur Annexes 1 through 7 with detailed beneficiary tables, tax/social withholding columns, and column sums.
  - Official DGI Tele-declaration magnetic file format generator producing standardized ASCII text with fixed header `000`, company identity `001`, employee compensation `002`, honoraria `004`, and footer `999` records.
- **Construction BTP Progress Invoicing (`chantier-site-engine.tsx`)**:
  - Implemented progressive situation billing (`N-ème Situation de Travaux`) with cumulative works calculation ($P_N = \text{Cumul}_N - \text{Cumul}_{N-1}$).
  - Incorporated mandatory Tunisian public/private works 5% legal guarantee retention (`retenue_garantie`) deducted before VAT.
  - Incorporated mobilization advance recovery (`remboursement_avance_demarrage`) amortized progressively against gross work value.
  - Real-time printable BTP Décompte Provisoire layout adhering to Tunisian civil engineering standards.
- **Board Governance AI Minute Word PV Generator (`board-meetings-engine.tsx`)**:
  - Legal resolution synthesis conforming to Code des Sociétés Commerciales (CSC) Articles 200+ with French ordinal headings (`1ère RÉSOLUTION`, `2ème RÉSOLUTION`).
  - Microsoft Word `.doc`/`.docx` generator creating valid XML/HTML Word format with embedded corporate header, quorum certified declaration, presence sheet table, resolution voting breakdown, and execution authority clause.
- **Quality Gates Maintained**:
  - Web unit test suites expanded from 4 to 7 test suites (22/22 tests passing, 100%).
  - Backend test suites maintained at 44/44 test suites (248/248 tests passing, 100%).
  - 0 TypeScript errors in `web/` and `backend/` (`npx tsc --noEmit`).
  - 0 explicit `any` types repository-wide.

## Decision 2026-09-06: Sprint 9 School ERP Academic Engine, Syndic Co-Ownership Fund Calls & POS Thermal ESC/POS Receipt Bridge
- **School ERP Academic Engine (`school-grade-engine.ts`)**:
  - Weighted term GPA calculation on 20 ($\bar{X} = \frac{\sum c_i M_i}{\sum c_i}$) with Tunisian exam weighting rules (Devoir de Contrôle DC + 2 * Devoir de Synthèse DS / 3; or DC + TP + 2 * DS / 4).
  - Class ranking algorithm with stable tie-breaking and quantile sorting.
  - Standard academic honors mapping: Félicitations ($\ge 16$), Encouragements ($\ge 14$), Tableau d'Honneur ($\ge 12$), Admis ($\ge 10$), Avertissement Travail ($< 10$).
  - Official vector printable A4 Bulletin de Notes HTML layout with Ministry and Academy headers, subject matrix, class statistics, and principal/parent signature blocks.
- **Student Registration & Tuition Engine (`school/students/page.tsx`)**:
  - Comprehensive 360 student profile tracking cycle, class, blood group, guardian contacts, enrollment validation, and tuition installment recovery.
- **Syndic Property Co-Ownership & Appels de Fonds (`syndic-tantiemes-engine.tsx`, `syndic/appels-de-fonds`)**:
  - General operating expenses and lift maintenance apportioned proportionally to owner tantièmes millièmes ($/ 1000$).
  - Utility sub-meter delta tracking ($D_t = I_t - I_{t-1}$) with SONEDE/STEG unit pricing validation against inverted/tampered meter readings.
  - Formal printable A4 Avis d'Appel de Fonds generator with bank RIB and payment instructions.
- **Universal POS Thermal ESC/POS Bridge (`escpos-formatter.tsx`, `<ThermalReceiptModal>`)**:
  - Raw binary ESC/POS command array compiler (`Uint8Array`) generating standard control codes (`0x1B 0x40` init, `0x1B 0x61` alignment, `0x1B 0x45` bold, `0x1D 0x56` paper cut) compatible with USB and Tauri desktop bridges.
  - SVG/HTML visual thermal paper slip simulator with realistic tear-off borders and Code 128 barcode.
  - Cashier closing Z-Report engine reconciling cash drawer discrepancies ($\Delta = \text{Counted} - \text{Expected}$) and calculating VAT breakdown (7%, 13%, 19%).
- **Quality Gates Maintained**:
  - Web unit test suites expanded from 7 to 10 test suites (37/37 tests passing, 100%).
  - Total web pages increased from 109 to 112.
  - 0 explicit `any` types repository-wide (0 backend / 0 web / 0 total).
  - Strict TypeScript compilation gate passing.

## Decision 2026-09-06: Sprint 10 Universal Database Seeding & Enterprise Realistic Modeling Suite (169 Models & 66 Enums)
- **Context**: BSOFTS had 169 Prisma models and 66 enums with 79 tables populated and 92 empty. The user requested inspecting the relational architecture, contrasting Case X (Nominal Happy Path) vs Case Y (Risk, Deficits, Scrap & Litigation), and populating all business tables with authentic Tunisian localized data (millimes TND, valid MF/RNE, 19%/7%/13% VAT, Timbre Fiscal 1.000 DT, ZKTeco biometric punches, balanced GL journal entries, and Sun Simulator PV flash test IV curves) preserving zero data loss.
- **Decisions & Standardizations**:
  1. **10-Wave Modular Idempotent Seed Suite (`backend/prisma/seed/`)**:
     - `01_core_saas.seed.ts`: 5 Companies, 7 Core Users with bcrypt passwords, Devises (`TND`, `EUR`, `USD`), Taxes, Compteurs, Bank Accounts, Measuring Units & Gammes, Dynamic Enums, Hosting Settings.
     - `02_crm_third_parties.seed.ts`: 7 Third Parties (Case X healthy clients/suppliers + Case Y `SUSPENDED` liquidation client), addresses, contacts, social media, CRM pipelines & 6 stages, opportunities, scheduled activities.
     - `03_catalog_inventory.seed.ts`: 5 Warehouses, 5 Articles (Case X nominal + Case Y severe stockout alert), 2 Articles Lots (Case X conforme + Case Y expired rebut), 5 Finished Products, Variants, Lots, Serial Numbers, Movements, Adjustments, Supplier Lead Times.
     - `04_sales_purchasing_docs.seed.ts`: Fiscal periods, Shipping methods, Discount rules, Full Sales & Purchasing document lineage (`DEV` -> `BC` -> `BL` -> `FAC` Case X + Overdue `FAC` Case Y + `AV` Avoir Case Y + Cancelled `DEV`), line items, approval steps, status history, and tax snapshots.
     - `05_pos_retail.seed.ts`: 5 Payment methods, 3 Caisses, 2 Stores, 2 POS Terminals, Case X balanced session + Case Y cash deficit session (-18.500 DT), carts, items, payments, Z-Reports, cash movement history.
     - `06_finance_accounting.seed.ts`: 25 Tunisian Chart of Accounts, balanced double-entry General Ledger journal entries (Vente, Banque BIAT, Achat, Doubtful Debt litigation), payments, payment schedules (Case X Paid vs Case Y Overdue), payment transactions.
     - `07_hrms_payroll.seed.ts`: Departments, Job titles, Employes, Contracts, Shifts, Biometric ZKTeco punch logs (Case X on-time vs Case Y 1h45 late), attendances, leave requests (Case X approved annual vs Case Y rejected urgent), payroll slips (Case X CFO net salary vs Case Y operator penalty deduction).
     - `08_gpao_mes_gmao.seed.ts`: Production site, Postes de charge, Equipes, Operateurs, Tools, Routings, Routing steps, OFs (Case X nominal 50/50 vs Case Y 12% scrap), raw materials consumption, outputs, defect decisions, GMAO machine maintenance requests & logs.
     - `09_btp_ecommerce_support.seed.ts`: Civil engineering chantiers & lots de travaux (Case X on-track vs Case Y suspended weather block), e-commerce orders & items, shopping carts & lines, internal messaging (CFO litigation alerts), system notifications, and 7 workflow state transitions.
     - `10_auxiliary_services_qc.seed.ts`: Services categories, Services, Services tags & relations, Services media, Products tags & relations, Employes frais, Employes files, HR holiday settings, Simulations couts & lines (BOM cost rollup), Productions nomenclature products, Productions consommations, Prod affectations operateurs, Prod creneaux livraison, PV solar characterization flash test IV curves (`pv_panneaux`), Subscriptions features & settings, Interactions, Notification templates, Companies settings, Documents devises prices & line devises prices, Users permissions direct grants.
  2. **Automated Sequence Synchronization**:
     - Embedded dynamic PostgreSQL PL/pgSQL function querying all base tables with serial primary keys and resetting `setval(seq, coalesce(max(id), 1))` preventing PK collision errors on runtime inserts.
  3. **Database Population Coverage**:
     - Tables with data jumped from 79 to **167 / 171 tables** (97.7% of all tables in the entire database, 100% of all real business tables). The only 4 empty tables are 2 internal Prisma shadow compound key tables (`_fk_*`) and 2 transient runtime cache tables (`archives_exports`, `idempotency_keys`).
  4. **Quality Gates Maintained**:
     - Backend test suite: 44/44 test suites passed (248/248 tests passing, 100%).
     - Dual TypeScript strict compilation: `npx tsc --noEmit` returns 0 errors across both `backend/` and `web/`.
     - Explicit `any` types: 0 repository-wide.

## ADR-044: Sprint 11 Enterprise Metier Supremacy (Check Printing, Fleet Logistics & Touch MES)
- **Date**: 2026-09-06
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: BSOFTS required high-value metier components synthesized from legacy systems #02 AxiaBusiness, #11 AxiaCompta, #19 AxiaTransport, #06 AxiaBat, and #01 IFRISOL:
  1. Tunisian Bank Check & Traite Printing Engine with millimeter calibration across 11 major Tunisian banks and French number-to-words currency generator with millimes grammar.
  2. Fleet Vehicles, Fuel Logs & Anomaly Detection Engine with ATTT/assurance/vignette regulatory tracking and real consumption anomaly detection (>15% over nominal).
  3. Industrial Touchscreen MES Shopfloor Terminal with $\ge 48$px touch targets, real-time OEE / TRS performance math ($\text{OEE} = A \times P \times Q$), live increment counters, and machine downtime logger.
- **Decisions & Technical Architecture**:
  1. **Bank Check Designer (`check-print-engine.ts`, `finance/check-designer/page.tsx`)**:
     - `numberToWordsFrench(millimes)`: Recursive French grammar rules handling 0 to 999,999,999,999 millimes, irregular tens (soixante-dix, quatre-vingts, quatre-vingt-dix), singular/plural accord for "cent", "cents", "vingt", "vingts", "mille" (invariable), and "millions". Generates exact wording: "Douze mille quatre cent cinquante Dinars et Zéro millime".
     - Pre-calibrated bank templates: Dimensions (80x175mm standard vs 100x210mm traite) and precision millimeter positions for date, payee, amount, letter amount, city, and endorsement bars.
     - Realistic SVG WYSIWYG preview: Responsive CSS/SVG vector canvas rendering bank logos, magnetic MICR simulation band, and non-endossable crossed bars (`//`).
     - Batch printing modal with session calibration adjustments.
  2. **Fleet Logistics & Anomaly Engine (`fleet-logistics-engine.ts`, `logistics/fleet/page.tsx`)**:
     - Vehicle technical passport: Plate number, brand/model, type, nominal consumption, current odometer km, driver link, and ATTT / assurance / vignette expiration dates.
     - Regulatory compliance urgency logic: Flagged as `EXPIRED` if past due, `URGENT` if $\le 15$ days, `WARNING` if $\le 30$ days, `OK` otherwise.
     - Fuel voucher calculations: Real consumption $C = \frac{\Delta L}{\Delta \text{Km}} \times 100$.
     - Anomaly detection: Flagged with warning badge when $C > 1.15 \times C_{\text{nominal}}$ or $C < 0.5 \times C_{\text{nominal}}$.
  3. **Touchscreen MES Terminal (`touch-terminal-engine.ts`, `production/touch-terminal/page.tsx`)**:
     - Ergonomic touch layout: Minimum touch targets $\ge 48$px, high contrast color coding, full-screen ready for rugged tablets and industrial touch HMIs.
     - Real-time OEE (Taux de Rendement Synthétique - TRS):
       $$\text{Availability} = \frac{\text{Operating Time}}{\text{Planned Production Time}}$$
       $$\text{Performance} = \frac{\text{Ideal Cycle Time} \times \text{Total Count}}{\text{Operating Time}}$$
       $$\text{Quality} = \frac{\text{Good Count}}{\text{Total Count}}$$
       $$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$
     - Machine state machine: `RUNNING`, `PAUSED`, `SETUP`, `BREAKDOWN`, `MAINTENANCE`, `STOPPED` with color indicators.
     - Incident logger: Stoppage cause classification (mechanical failure, material stockout, tooling calibration, QC inspection wait, team break).
  4. **Quality Gates & Metrics Synchronization**:
     - Web pages expanded to **115**.
     - Metier unit tests expanded to **11 test suites (58/58 tests passed, 100% green)**.
     - Dual TypeScript compilation gate passing with 0 errors (`npx tsc --noEmit`).
     - 0 explicit `any` types repository-wide.

## ADR-045: Sprint 13 Core Backend Endpoints & Metier Engines Architecture
- **Date**: 2026-09-06
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five core operational metier domains required full-stack backend endpoint and engine implementation to bridge existing frontend views with backend execution:
  1. Biometric Timeclock Punch Pairing & Shift Fallback Heuristics (`biometric-timeclock`)
  2. GMAO Preventive Maintenance Scheduling & Automated Work Order Triggering (`maintenance-schedules`)
  3. SaaS Core Workflow State Transition Engine & RBAC Validation (`workflow-state-transitions`)
  4. Multi-Currency Exchange Rate Engine & Direct/Reciprocal Conversions (`devises-cours`)
  5. POS Fiscal Z-Reports, Drawer Reconciliation & Grand Total Accumulator (`pos-z-reports`)
- **Decisions & Technical Architecture**:
  1. **HRMS Biometric Punch Engine (`biometric-timeclock`)**: Chronological punch sorting, IN/OUT alternating pairing, shift fallback heuristics with 15-minute grace period before late status (`RETARD`), automated integration with `employes_attendances`.
  2. **GMAO Maintenance Trigger Engine (`maintenance-schedules`)**: Work order generation in `prod_ordres_fabrication` triggered by maintenance schedule threshold, schedule interval calculations across DAYS, OPERATING_HOURS, and PRODUCTION_CYCLES, due maintenance alerts endpoint.
  3. **Workflow State Engine (`workflow-state-transitions`)**: Centralized state transition validator for document lifecycles (Devis, Commandes, Factures, OFs), validating against `workflow_state_transitions` rules with role authorization verification.
  4. **FX Currency Exchange Engine (`devises-cours`)**: Direct multiplication and reciprocal division for inverted currency pairs, precision rounding to integer millimes (TND), latest active exchange rates lookup endpoint.
  5. **POS Fiscal Z-Report Engine (`pos-z-reports`)**: Drawer closing protocol, grand total non-resettable fiscal accumulator, 3-tier Tunisian VAT breakdown (7%, 13%, 19%), payment method breakdown, and physical cash variance calculation.
  6. **Prisma Type Safety & Route Hygiene**: Handled `Prisma.Decimal` imports from `@prisma/client`, enforced strict 0 `any` typing, and adhered to `nest-route-organizer` ensuring all static routes (`/convert`, `/latest`, `/close-session`, `/validate`, `/due/alerts`) precede parameterized routes (`/:id`).
  7. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 116 to **121**, services from 130 to **135**, modules from 128 to **133**, HTTP endpoints from 169 to **179**, backend test suites from 44 to **49 (263/263 tests passed, 100% green)**, web API clients from 135 to **139**, 0 explicit `any` types, dual TypeScript strict mode 0 errors.

## ADR-046: Sprint 14 Industrial MES, Quality Control & Commercial Metier Backend Engines Architecture
- **Date**: 2026-09-06
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five advanced industrial, quality control, and commercial metier domains required full-stack backend endpoint and engine implementation to bridge existing frontend views with backend database models:
  1. Production MRP Simulations & Gross-to-Net Demand Explosion (`prod_simulations_mrp`)
  2. Solar Photovoltaic Sun Simulator Flash Tests & Electrical IV Characterization (`prod_flash_tests`)
  3. Industrial Shopfloor Scrap & Waste Declaration Engine (`prod_rebuts_dechets`)
  4. Commercial Pricing & Discount Rules Engine (`discount_rules`)
  5. Multi-Unit of Measure Stock Conversions Engine (`units_conversions`)
- **Decisions & Technical Architecture**:
  1. **Production MRP Simulations Engine (`prod-simulations-mrp`)**: Gross-to-net demand explosion algorithm ($N_i = \max(0, B_i + SS_i - S_i - P_i)$), lead-time planning offset, stock deficit detection, and planned order generation with transaction-safe persistence.
  2. **PV Flash Tests Engine (`prod-flash-tests`)**: Photovoltaic solar IV curve characterization ($P_{\max}, V_{oc}, I_{sc}, V_{mp}, I_{mp}$), Fill Factor evaluation ($FF = \frac{P_{\max}}{V_{oc} \times I_{sc}}$), 5W power binning (e.g. 400W-405W), module conversion efficiency %, and STC tolerance compliance verification.
  3. **Production Scrap Declaration Engine (`prod-rebuts-dechets`)**: Shopfloor scrap logging with monetary cost calculation in integer millimes ($\text{ScrapCost} = Q_{\text{scrap}} \times \text{Cost}_{\text{unit}}$), manufacturing order (OF) linkage, and root cause classification.
  4. **Commercial Pricing Discount Rules Engine (`discount-rules`)**: Tiered discount evaluation supporting PERCENTAGE vs fixed AMOUNT deductions, minimum order threshold validation, active status checks, validity date range enforcement, and net amount calculation.
  5. **Multi-Unit Stock Conversions Engine (`units-conversions`)**: Dynamic unit of measure conversions across all 7 article units (`ROULEAU`, `KG`, `L`, `M`, `PIECE`, `PACQUET`, `PALETTE`) with direct factor and reciprocal inverse ratio support, precision rounding (6 decimal places), and conversion matrix queries.
  6. **Prisma Type Safety & Route Hygiene**: Enforced strict 0 `any` typing, handled Prisma Decimal conversions, verified company isolation scoping, and adhered to `nest-route-organizer` ensuring all static routes (`/run`, `/latest`, `/record`, `/declare`, `/evaluate`, `/active`, `/convert`, `/matrix`) precede parameterized routes (`/:id`).
  7. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 121 to **126**, services from 135 to **140**, modules from 133 to **138**, HTTP endpoints from 179 to **189**, backend test suites from 49 to **54 (278/278 tests passed, 100% green)**, web API clients from 139 to **143**, 0 explicit `any` types, dual TypeScript strict mode 0 errors.

## ADR-047: Sprint 15 Quality Control EL Inspections, Pallet Binnage, Supplier Lead Times, Defect Decisions & Company Print Templates Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five mission-critical quality control, purchasing terms, manufacturing defect disposition, and print layout domains required full-stack backend endpoint and engine implementation to bridge existing frontend views with backend database models:
  1. Solar PV Electroluminescence Defect Inspection Engine (`prod_el_inspections`)
  2. Solar PV Module Palletizing & Power Binning Engine (`prod_palettes_binnage`)
  3. Supplier Lead Times & Negotiated Article Terms (`fournisseurs_delais_articles`)
  4. Shopfloor Quality Defect Decisions & Rework Engine (`prod_defauts_decisions`)
  5. Enterprise Document Print Layout Templates Engine (`company_print_templates`)
- **Decisions & Technical Architecture**:
  1. **Solar PV EL Defect Inspection Engine (`prod-el-inspections`)**: Dark-room EL camera defect categorization (microcracks, dead cells, finger interruptions, PID), automated quality grading (`GRADE_A`, `GRADE_B`, `REBUT_DEFECTUEUX`), warranty eligibility determination, panel serial code lookup, and defective modules queue.
  2. **Solar PV Palletizing & Power Binning Engine (`prod-palettes-binnage`)**: Automated pallet allocation matching 5W power bin classes, maximum capacity (30 modules) auto-sealing, weight accumulation, warehouse transfer assignment, active pallets query, and manual seal endpoint.
  3. **Supplier Lead Times & Purchasing Terms (`fournisseurs-delais-articles`)**: Multi-supplier article negotiation terms, supplier delivery lead times in days, minimum order quantities (MOQ), negotiated unit prices in millimes, best supplier evaluation engine prioritizing price and lead time, and per-article supplier list.
  4. **Production Defect Decisions & Rework Engine (`prod-defauts-decisions`)**: Manufacturing quality defect disposition tracking (`REBUT`, `RETOUCHE`, `RECLASSEMENT`, `ACCEPTATION_DEROGATION`), financial loss and rework cost impact calculation in millimes, rework manufacturing order (`of_reprise_id`) linkage, and history by OF.
  5. **Enterprise Document Print Layout Templates (`company-print-templates`)**: Multi-template per-document layout customization (FACTURE, DEVIS, BL, BC, BON_RECEPTION), paper size formats (A4, A5, POS 80mm), orientation, top/bottom/left/right margins in mm, header/footer configuration, branding colors, bank RIB, watermark toggle, active default template lookup, and template default switcher.
  6. **Route Organization & Architecture Standards**: All static routes (`/record`, `/panel/:code`, `/defective`, `/add-module`, `/active`, `/best-supplier/:articleId`, `/article/:articleId`, `/terms`, `/decision`, `/by-of/:ofId`, `/default/:documentType`, `/type/:documentType`) strictly precede parameterized routes (`/:id`, `/:id/seal`, `/:id/set-default`), complying with `nest-route-organizer`. BaseService constructors pass `false` for tenant isolation scoping.
  7. **Frontend Wiring & Type Safety**: Created 5 dedicated Axios API client wrappers (`apiClient`), fully wired into `solar-pv/page.tsx`, `orders/page.tsx`, `touch-terminal/page.tsx`, and `branding/page.tsx`.
  8. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 126 to **131 (+5)**, services from 140 to **145 (+5)**, modules from 138 to **143 (+5)**, HTTP endpoints from 189 to **203 (+14)**, backend test suites from 54 to **59 (297/297 tests passed, 100% green)**, web API clients from 143 to **148 (+5)**, web test suites maintained at **11 (58/58 tests passed, 100% green)**, 0 explicit `any` types repository-wide, dual TypeScript strict mode 0 errors (`npx tsc --noEmit` exit code 0 on both `backend/` and `web/`).

## ADR-049: Sprint 17 GMAO Equipment Telemetry, Operator Shift Allocations, Manufacturing Order Audit History, Delivery Windows & Daily Factory Overheads Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five industrial production, maintenance telemetry, shopfloor allocation, logistics dispatch, and daily cost tracking domains required full-stack backend engines, controllers, DTOs, entities, modules, unit tests, and frontend web API wirings:
  1. GMAO Equipment Telemetry & Machine OEE/TRS Registry (`prod_equipements_gmao`)
  2. Shopfloor Operator Workstation Shift Allocations (`prod_affectations_operateurs`)
  3. Manufacturing Order Audit History & Status Lifecycle Transitions (`prod_historiques_of`)
  4. Logistics Delivery Dispatch Windows & Arrival Confirmation (`prod_creneaux_livraison`)
  5. Daily Factory Overheads & Direct Operating Expense Tracking (`prod_frais_journaliers`)
- **Decisions & Technical Architecture**:
  1. **GMAO Equipment Telemetry Engine (`prod-equipements-gmao`)**: Industrial equipment telemetry registry, breakdown logging with moving-average MTTR updates and `statut_operationnel: 'EN_PANNE'`, TPM OEE/TRS formula calculation ($TRS = \text{Disponibilité} \times \text{Performance} \times \text{Qualité}$), available operational machines query.
  2. **Operator Workstation Shift Allocations Engine (`prod-affectations-operateurs`)**: Shopfloor shift assignments per manufacturing order (OF), workstation operation binding, operator presence status management, substitute replacement workflow (`REMPLACE`).
  3. **OF Status Transition Audit History Engine (`prod-historiques-of`)**: Full audit history for manufacturing orders tracking `mode_avant` to `mode_apres` using `prod_of_mode` enum, supervisor override bypass tracking (`est_forcage`), and automated mode synchronization on `prod_ordres_fabrication`.
  4. **Logistics Delivery Windows Engine (`prod-creneaux-livraison`)**: Logistics delivery slot scheduling for finished OFs, fleet vehicle and driver operator allocation, chantier destination linking, arrival confirmation with return quantity logging (`statut: 'LIVRE'`), soft-delete support (`super(prisma, 'prod_creneaux_livraison', true)`).
  5. **Daily Factory Overheads Engine (`prod-frais-journaliers`)**: Daily direct labor, energy, machine depreciation, and overhead absorption tracking stored in integer millimes, automatic total sum computation, date-range filtering, and per-site aggregated financial cost summary. Soft-delete support (`super(prisma, 'prod_frais_journaliers', true)`).
  6. **Route Organization & Architecture Standards**: All static routes (`/available`, `/record-breakdown`, `/oee`, `/by-of/:ofId`, `/allocate`, `/substitute`, `/log`, `/schedule`, `/confirm`, `/record`, `/by-date-range`, `/summary/site/:siteId`) strictly precede parameterized routes (`/:id`), adhering to `nest-route-organizer`.
  7. **Frontend Wiring & Type Safety**: Created 5 dedicated Axios API client wrappers (`apiClient`), fully wired into `production/maintenance-schedules/page.tsx`, `production/teams/page.tsx`, `production/orders/page.tsx`, and `production/daily-costs/page.tsx`.
  8. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 136 to **141 (+5)**, services from 150 to **155 (+5)**, modules from 148 to **153 (+5)**, HTTP endpoints from 217 to **231 (+14)**, backend test suites from 64 to **69 (331/331 tests passed, 100% green)**, web API clients from 151 to **156 (+5)**, web test suites maintained at **11 (58/58 tests passed, 100% green)**, 0 explicit `any` types repository-wide, dual TypeScript strict mode 0 errors (`npx tsc --noEmit` exit code 0 on both `backend/` and `web/`).

## ADR-050: Sprint 18 Company Measuring Units, Product Gammes, Tenant Hosting Settings, System Archive Exports & CRM Multi-Entity Interactions Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five core tenant-level inventory, catalog gammes, hosting infrastructure topology, system archives, and CRM social interaction domains required full-stack backend engines, controllers, DTOs, entities, modules, unit tests, and frontend web API wirings:
  1. Tenant Measuring Units Registry & Dimension Classification (`company_measuring_units`)
  2. Commercial Product Collections & Brand Ranges/Gammes (`company_gammes`)
  3. SaaS Multi-Tenant Hosting Topology & Cryptographic Enterprise Licensing (`company_hosting_settings`)
  4. System Data Export Archives & User Audit Traceability (`archives_exports`)
  5. Multi-Entity Social Interactions & Favoriting Timeline Engine (`interactions`)
- **Decisions & Technical Architecture**:
  1. **Company Measuring Units Engine (`company-measuring-units`)**: Tenant-specific units of measure, category classification (LENGTH, WEIGHT, VOLUME, AREA, TIME, GENERAL), symbol and conversion factor management, soft-delete enabled (`super(prisma, 'company_measuring_units', true)`), active and category filter endpoints.
  2. **Product Gammes & Brand Ranges Engine (`company-gammes`)**: Commercial product collections and brand tiers, parent-child gamme hierarchy, soft-delete enabled (`super(prisma, 'company_gammes', true)`), active collections query.
  3. **Tenant Hosting Settings Engine (`company-hosting-settings`)**: SaaS hosting topology management (`EnumHostingType`: BSOFT_CLOUD, SELF_HOSTED_LOCAL, CUSTOM_CLOUD, HYBRID_EDGE), operational sync status (`EnumHostingStatus`), sync heartbeat updater, and cryptographic enterprise license key verification engine. No soft-delete (`super(prisma, 'company_hosting_settings', false)`).
  4. **System Data Export Archives Engine (`archives-exports`)**: Export archives registry linking generated files (`.zip`, `.csv`) with author user audit trails and active company scoping. No soft-delete (`super(prisma, 'archives_exports', false)`).
  5. **CRM Multi-Entity Interactions Engine (`interactions`)**: Universal polymorphic social interactions registry across articles, third parties, leads, and opportunities supporting `interactions_type` (LIKE, DISLIKE, COMMENT, FAVORIS, FOLLOW, WISHLISTS), actor timeline logging, and atomic one-click favorite toggling (`toggleFavorite`). No soft-delete (`super(prisma, 'interactions', false)`).
  6. **Route Organization & Architecture Standards**: All static and parameterized routes (`/active`, `/by-category/:category`, `/current`, `/sync-heartbeat`, `/verify-license`, `/company`, `/record`, `/recent`, `/by-entity/:entityName/:rowId`, `/log`, `/toggle-favorite`) strictly adhere to `nest-route-organizer`.
  7. **Frontend Wiring & Type Safety**: Created 5 dedicated Axios API client wrappers (`apiClient`), fully wired into `inventory/articles/page.tsx`, `saas-core/logs/page.tsx`, `crm/clients/page.tsx`, `crm/leads/page.tsx`, and `settings/security/page.tsx`.
  8. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 141 to **146 (+5)**, services from 155 to **160 (+5)**, modules from 153 to **158 (+5)**, HTTP endpoints from 231 to **243 (+12)**, backend test suites from 69 to **74 (343/343 tests passed, 100% green)**, web API clients from 156 to **159**, web test suites maintained at **11 (58/58 tests passed, 100% green)**, 0 explicit `any` types repository-wide, dual TypeScript strict mode 0 errors (`npx tsc --noEmit` exit code 0 on both `backend/` and `web/`).

## ADR-051: Sprint 19 Third-Party Addresses, Partner Contacts, POS Session Payments, Production Routing Steps & Services Tags Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Partner multi-site delivery addresses, multi-channel contacts, POS drawer payment reconciliation, GPAO production routing steps, and catalog services tags taxonomy.
- **Decisions & Technical Architecture**:
  1. `third_parties_addresses`: Soft-delete enabled (`super(prisma, 'third_parties_addresses', true)`). 2/2 tests passed.
  2. `third_parties_contact`: Soft-delete enabled (`super(prisma, 'third_parties_contact', true)`). 3/3 tests passed.
  3. `pos_session_payments`: Drawer payment tracking in millimes. No soft-delete. 3/3 tests passed.
  4. `prod_routing_steps`: Routing steps sequencing and duration engine. Soft-delete enabled. 3/3 tests passed.
  5. `services_tags`: Billable services taxonomy tags with relation manager. Soft-delete enabled. 5/5 tests passed.

## ADR-052: Sprint 20 Third-Party Social Media, Services Media, eCommerce Order Items, Subscriptions Features & Companies Settings Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Partner digital footprint, service media attachments, ecommerce line item decimals, subscription feature toggles, and company setting overrides.
- **Decisions & Technical Architecture**:
  1. `third_parties_social_media`: Soft-delete enabled (`super(prisma, 'third_parties_social_media', true)`). 2/2 tests passed.
  2. `services_media`: Soft-delete enabled (`super(prisma, 'services_media', true)`). 3/3 tests passed.
  3. `ecommerce_order_items`: Decimal calculations, product relation queries. No soft-delete. 2/2 tests passed.
  4. `subscriptions_features`: Soft-delete enabled, atomic boolean toggle. 3/3 tests passed.
  5. `companies_settings`: Upsert on `[company_id, app_setting_id]`. No soft-delete. 4/4 tests passed.

## ADR-053: Sprint 21 Subscriptions Settings, Companies Settings Values, Document Sequence Counters, Documents Lines Taxes & Articles Categories Relations Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: Five database models covering subscription parameters, tenant setting values, atomic document sequence counters, multi-tax invoice lines, and article category relations required full-stack engines, controllers, DTOs, entities, modules, unit tests, and frontend web API wirings:
  1. SaaS Subscription Settings Configuration Registry (`subscriptions_settings`)
  2. Per-Tenant Custom App Setting Values Override (`companies_settings_values`)
  3. Atomic Document Numbering Sequence Counters (`document_sequence_counters`)
  4. Document Line Item Tax Details & Precision Breakdown (`documents_lines_taxes`)
  5. Articles to Categories Many-to-Many Catalog Junction (`articles_categories_relations`)
- **Decisions & Technical Architecture**:
  1. **SaaS Subscription Settings Engine (`subscriptions-settings`)**: Registry of plan configuration key-values supporting flexible data types (`STRING`, `BOOLEAN`, `NUMBER`, `JSON`). Soft-delete enabled (`super(prisma, 'subscriptions_settings', true)`). Endpoints: `GET /by-subscription/:subscriptionId`, `GET /setting/:subscriptionId/:settingKey`, `POST /record`. 3/3 Jest tests passed. Registered in `SaasCoreBackendModule`. Wired into `saas-core/subscriptions/page.tsx`.
  2. **Tenant App Setting Values Override Engine (`companies-settings-values`)**: Custom per-company setting values linked to `app_settings` definitions with active tenant resolution fallback. No soft-delete (`super(prisma, 'companies_settings_values', false)`). Endpoints: `GET /my-values`, `GET /by-company/:companyId`, `POST /set-value`, `POST /record`. 4/4 Jest tests passed. Registered in `AppModule`. Wired into `use-app-settings.tsx`.
  3. **Atomic Document Sequence Counters Engine (`document-sequence-counters`)**: High-throughput atomic sequence numbering registry per company, document type (`EnumDocumentType`), and period key (`YYYY` or `YYYYMM`) using Prisma upsert increment. No soft-delete (`super(prisma, 'document_sequence_counters', false)`). Endpoints: `GET /by-company`, `GET /counter/:docType/:periodKey`, `POST /increment`, `POST /reset`, `POST /record`. 5/5 Jest tests passed. Registered in `DocumentsGroupModule`. Wired into `settings/sequences/page.tsx`.
  4. **Document Lines Multi-Tax Breakdown Engine (`documents-lines-taxes`)**: Detailed tax row breakdown per document line item (`documents_lines`) with rate snapshot and computed Decimal millimes (`tva_value`). Soft-delete enabled (`super(prisma, 'documents_lines_taxes', true)`). Endpoints: `GET /by-line/:lineId`, `GET /by-document/:documentId`, `POST /record`. 3/3 Jest tests passed. Registered in `DocumentsGroupModule`. Wired into `sales/invoices/page.tsx`.
  5. **Articles Categories Relations Engine (`articles-categories-relations`)**: Relational junction connecting articles to categories with primary category distinction (`is_primary`). No soft-delete (`super(prisma, 'articles_categories_relations', false)`). Endpoints: `GET /by-article/:articleId`, `GET /by-category/:categoryId`, `POST /attach`, `POST /record`, `DELETE /detach/:articleId/:categoryId`. 6/6 Jest tests passed. Registered in `InventoryGroupModule`. Wired into `inventory/articles/page.tsx`.
  6. **Route Organization & Architecture Standards**: All static routes strictly precede parameterized routes (`/:id`), adhering to `nest-route-organizer`.
  7. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 156 to **161 (+5)**, services from 170 to **175 (+5)**, modules from 168 to **173 (+5)**, HTTP endpoints from 274 to **292 (+18)**, backend test suites from 84 to **89 (402/402 tests passed, 100% green)**, web API clients from 165 to **168**, web test suites maintained at **11 (58/58 tests passed, 100% green)**, 0 explicit `any` types repository-wide, dual TypeScript strict mode 0 errors (`npx tsc --noEmit` exit code 0 on both `backend/` and `web/`).

## ADR-054: Sprint 22 Documents Devises Prices, Documents Lines Devises Prices, Packs Lines, Products Categories Relations & Products Tags Relations Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: The final 5 unreferenced business Prisma schema models required full-stack engines, controllers, DTOs, entities, modules, unit tests, and frontend web API wirings:
  1. Commercial Document Foreign Currency Price Conversions (`documents_devises_prices`)
  2. Document Line Item Foreign Currency Price Conversions (`documents_lines_devises_prices`)
  3. SaaS Subscription Pack Included Modules Junction (`packs_lines`)
  4. Product Catalog Category Many-to-Many Junction (`products_categories_relations`)
  5. Product Catalog Taxonomy Tagging Junction (`products_tags_relations`)
- **Decisions & Technical Architecture**:
  1. **Foreign Currency Document Pricing Engine (`documents-devises-prices`)**: Document-level foreign currency valuation snapshot storing exchange rate (`taux_change`), converted subtotal HT (`subtotal_ht`), tax amount (`tax_amount`), and total TTC (`total_ttc`). Soft-delete enabled (`super(prisma, 'documents_devises_prices', true)`). Endpoints: `GET /by-document/:documentId`, `POST /record`. 2/2 Jest tests passed. Registered in `DocumentsGroupModule`. Wired into `sales/invoices/page.tsx`.
  2. **Foreign Currency Line Item Pricing Engine (`documents-lines-devises-prices`)**: Line-level foreign currency conversions storing exchange rate (`taux_change`), unit price HT (`unit_price_ht`), discount (`discount_amount`), tax (`tax_amount`), total HT (`total_ht`), and total TTC (`total_ttc`). Soft-delete enabled (`super(prisma, 'documents_lines_devises_prices', true)`). Endpoints: `GET /by-line/:lineId`, `POST /record`. 2/2 Jest tests passed. Registered in `DocumentsGroupModule`. Wired into `sales/invoices/page.tsx`.
  3. **SaaS Subscription Pack Lines Engine (`packs-lines`)**: Subscription plan feature bundle junction connecting `packs` to `modules` with display order (`display_order`) and status (`is_active`). No soft-delete (`super(prisma, 'packs_lines', false)`). Endpoints: `GET /by-pack/:packId`, `GET /by-module/:moduleId`, `POST /add-module`, `POST /record`, `DELETE /remove-module/:packId/:moduleId`. 4/4 Jest tests passed. Registered in `SaasCoreBackendModule`. Wired into `saas-core/subscriptions/page.tsx`.
  4. **Products Categories Relations Engine (`products-categories-relations`)**: Relational junction connecting products to categories with primary category distinction (`is_primary`). No soft-delete (`super(prisma, 'products_categories_relations', false)`). Endpoints: `GET /by-product/:productId`, `GET /by-category/:categoryId`, `POST /attach`, `POST /record`, `DELETE /detach/:productId/:categoryId`. 4/4 Jest tests passed. Registered in `InventoryGroupModule`. Dedicated client `products-categories-relations.api.tsx` created and wired into `inventory/articles/page.tsx`.
  5. **Products Tags Relations Engine (`products-tags-relations`)**: Taxonomy junction connecting products to tags. No soft-delete (`super(prisma, 'products_tags_relations', false)`). Endpoints: `GET /by-product/:productId`, `GET /by-tag/:tagId`, `POST /attach`, `POST /record`, `DELETE /detach/:productId/:tagId`. 4/4 Jest tests passed. Registered in `InventoryGroupModule`. Dedicated client `products-tags-relations.api.tsx` created and wired into `inventory/articles/page.tsx`.
  6. **Route Organization & Architecture Standards**: All static routes strictly precede parameterized routes (`/:id`), adhering to `nest-route-organizer`.
  7. **100% Business Database Coverage Milestone**: With Sprint 22 completed, **all 168 business Prisma models** across all 9 domains now have dedicated NestJS controllers, services, DTOs with validation, Swagger entities, modules, unit tests, and frontend web API wirings (the sole remaining model being internal infrastructure `idempotency_keys` in `IdempotencyRepository`).
  8. **Quality Gates & Metrics Synchronization**: Backend controllers expanded from 161 to **166 (+5)**, services from 175 to **180 (+5)**, modules from 173 to **178 (+5)**, HTTP endpoints from 292 to **308 (+16)**, backend test suites from 89 to **94 (423/423 tests passed, 100% green)**, web API clients from 168 to **170 (+2)**, web test suites maintained at **11 (58/58 tests passed, 100% green)**, 0 explicit `any` types repository-wide, dual TypeScript strict mode 0 errors (`npx tsc --noEmit` exit code 0 on both `backend/` and `web/`).

## ADR-055: Sprint 23 Cross-Platform Native Desktop Tauri Bridge & Mobile Flutter Client Deepening Architecture
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: BSOFTS operates across 3 deployment targets (Cloud Web SaaS, Native Rust Tauri Desktop, and Cross-Platform Flutter Mobile). The native desktop needed a typed bridge connecting the Next.js frontend with the underlying Rust hardware printers and offline SQLite queue, while the mobile client required dedicated operational screens with zero `dynamic` typing.
- **Decisions & Technical Architecture**:
  1. **Tauri Native Desktop Bridge (`tauri-bridge.ts`)**: Built typed bridge utility implementing detection (`isTauri`), hardware diagnostics (`getDesktopSystemInfo`), direct USB ESC/POS binary printing (`printReceiptDirect`, `printThermalRaw`), printer enumeration (`listThermalPrinters`), and local SQLite write queuing (`initOfflineDb`, `queueOfflineOperation`, `getPendingOfflineOperations`, `markOfflineOperationSynced`). Features transparent browser fallback via `localStorage` for cloud development.
  2. **Tauri Bridge Unit Test Suite (`tauri-bridge.spec.ts`)**: Added 11 unit test assertions covering both browser simulation mode (local storage fallback) and Tauri invoke mocking. Web test suite expanded to 12 suites (69 tests passed, 100% green).
  3. **POS Thermal Receipt Modal Hardware Integration (`ThermalReceiptModal.tsx`)**: Wired `tauri-bridge` directly into the receipt preview modal, enabling high-speed direct ESC/POS hardware printing to USB/Serial receipt printers without browser print dialogs.
  4. **Mobile Warehouse Barcode & Inventory Scanner (`inventory_scanner_screen.dart`)**: Created Flutter screen with barcode/SKU lookup, real-time article stock inspection, PUMP valuation, and quick stock adjustment stepper (+1, +10, -1, -10). Strict Dart typing, zero `dynamic`.
  5. **Mobile Field Service & Technician Interventions (`field_interventions_screen.dart`)**: Created Flutter field technician screen (AxiaTeams legacy integration) with intervention roadmap, 4-stage lifecycle (`PLANIFIEE` -> `EN_ROUTE` -> `EN_COURS` -> `TERMINEE`), client address geolocation, and report sign-off. Strict Dart typing, zero `dynamic`.
  6. **Mobile Commercial Sales Orders & Field Order Taking (`sales_orders_screen.dart`)**: Created Flutter field sales representative screen for in-person customer visits with order creation modal, total calculation in integer millimes, and status tracking. Strict Dart typing, zero `dynamic`.
  7. **Mobile Navigation Hub Integration (`dashboard_screen.dart`)**: Enhanced Flutter executive dashboard with interactive action tiles routing directly into the 3 new metier applications.
  8. **Zero-Type-Debt & Verification**: `dart analyze mobile/lib` verified with 0 issues found (0 `dynamic` typing), dual TypeScript strict mode 0 errors (`npx tsc --noEmit` on both `backend/` and `web/`), production builds (`nest build` and `next build`) exiting code 0.

## ADR-056: Sprint 24 Metier Domain Test Matrix Expansion (Transport, Recruitment ATS, Real Estate Urbanism, Cashless RFID Wallet, School Timetabling & Event Booking)
- **Date**: 2026-09-07
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: BSOFTS synthesized mathematical engines and business state machines from 6 specialized legacy ERP systems:
  1. #19 AxiaTransport (Freight transport, axle weighbridge gross/tare/net formulas, fuel consumption and toll trip cost per km)
  2. #20 AxiaSolution (HR recruitment ATS pipeline stage progression, candidate rating and score ranking)
  3. #22 SPIZ (Real estate promotion, COS/CES urban surface coefficient constraints, 15-day deposit hold expiry)
  4. #15 HeglaPark (Cashless RFID wallet top-up and spend debit state machine, turnstile access checks)
  5. #12 EasySchool (Academic timetabling collision detection algorithms for teachers, rooms, and student classes)
  6. #10 OSSEvents (Event hall booking slot collision math, multi-tier pricing schedules, and installment validation)
- **Decisions & Technical Architecture**:
  1. **Transport Logistics Spec (`transport-logistics.spec.ts`)**: 9 test assertions covering net weight evaluation ($M_{\text{net}} = M_{\text{gross}} - M_{\text{tare}}$), error guards on invalid weight inputs, trip cost per km in millimes, zero-distance edge cases, printable weighbridge ticket formatting, and multi-trip fleet metrics aggregation.
  2. **Recruitment ATS Spec (`recruitment-pipeline.spec.ts`)**: 9 test assertions covering candidate stage progression (`RECU` -> `PRESELECTIONNE` -> `ENTRETIEN_RH` -> `ENTRETIEN_TECHNIQUE` -> `OFFRE_ENVOYEE` -> `EMBAUCHE`), terminal states, rejection transitions, invalid transition error guards, candidate score ranking, and pipeline KPI metrics.
  3. **Real Estate Urbanism Spec (`realestate-urbanism.spec.ts`)**: 3 test assertions covering floor area ratio (COS) and ground coverage ratio (CES) regulatory constraints ($S_{\text{plancher}} \le \text{COS} \times S_{\text{terrain}}$, $S_{\text{emprise}} \le \text{CES} \times S_{\text{terrain}}$), net sales price and 19% VAT calculations in integer millimes, and 15-day reservation deposit hold expiration state machine.
  4. **Cashless RFID Wallet Spec (`cashless-wallet.spec.ts`)**: 11 test assertions covering RFID wristband/card balance initialization and top-ups ($B_t = B_{t-1} + \text{topup}$), cashless spend debit with balance checks ($B_t = B_{t-1} - \text{spend}$), insufficient balance rejection, turnstile access validation with zone ticket rules, and daily audit reconciliation.
  5. **School Timetabling Spec (`school-timetabling.spec.ts`)**: 6 test assertions covering timetable slot collision detection (teacher schedule collision, classroom occupancy collision, class student group collision), consecutive session duration constraints, and weekly workload cap compliance.
## ADR-057: Sprint 25 Frontend View Expansion — Waves 1, 2 & 3 (16 New Views, 131 Web Pages)
- **Date**: 2026-09-08
- **Status**: APPROVED & 100% IMPLEMENTED
- **Context**: The user identified a discrepancy between backend breadth (169 Prisma models, 166 controllers, 308 HTTP endpoints) and frontend views, directing the swarm to implement 3 waves of views:
  1. Wave 1: 360° Record Master & Detail Views (`[id]/page.tsx` — 6 views)
  2. Wave 2: Missing Core ERP Sub-Views (6 views)
  3. Wave 3: Specialized Legacy Metier Views (4 views)
- **Decisions & Technical Architecture**:
  1. **Wave 1 (360° Master Record Detail Views)**:
     - `sales/invoices/[id]/page.tsx`: 4-tab 360° invoice master view (Aperçu, Lignes Facture, Règlements & Échéancier, Impact Comptable GL VT), status progression, vector PDF printing via `renderAndPrintDocument('FACTURE', ...)`.
     - `sales/orders/[id]/page.tsx`: Commercial sales order dossier with ordered vs delivered quantities, linked delivery slips (BL) history, invoicing conversion action, and vector printing via `renderAndPrintDocument('COMMANDE_CLIENT', ...)`.
     - `purchasing/orders/[id]/page.tsx`: Supplier PO dossier with raw material billable lines, goods receipts (BR) history, incoming QC inspection tags, and vector printing via `renderAndPrintDocument('BC_FOURNISSEUR', ...)`.
     - `crm/clients/[id]/page.tsx`: Client 360° master dossier with running account balance statement ($B_t = B_{t-1} + D - C$), credit limit risk warning badges, VAT exemption certificates, and chronological commercial history.
     - `inventory/articles/[id]/page.tsx`: Article master data, multi-warehouse stock breakdown, Kardex running movement ledger, and FEFO lot tracking.
     - `production/orders/[id]/page.tsx`: Manufacturing order (OF) shopfloor view with routing steps, raw material BOM consumption with scrap variance, and operator shift allocations.
  2. **Wave 2 (Missing Core ERP Sub-Views)**:
     - `inventory/transfers/page.tsx`: Inter-depot stock transfer management with source/destination warehouse selection, transit tracking, and one-click reception confirmation modal.
     - `production/tooling/page.tsx`: Molds and tooling fleet management (`prod_outillages`) with strike counters, maximum cycle limits, wear percentage bars, and maintenance alerts.
     - `hr/departments/page.tsx`: Organizational hierarchy, department cards with managers, employee headcount, cost centers, and budget progress bars.
     - `hr/expenses/page.tsx`: Employee expense claims (`Notes de Frais`) with receipt attachments, reimbursement status, and multi-tier approval workflow (`SOUMIS` -> `VALIDE_MANAGER` -> `APPROUVE_RH` -> `REMBOURSE`).
     - `settings/approvals/page.tsx`: Multi-level document signature approval workflow queue (`documents_approvals`) with digital PIN signing confirmation and financial threshold matrix.
     - `crm/agenda/page.tsx`: Commercial scheduled activities calendar (`crm_activities_scheduled`) with dual list / day timeline view, sales rep tracking, and meeting reports.
  3. **Wave 3 (Specialized Legacy Metier Views)**:
     - `lims/concrete-testing/page.tsx`: Geotechnical concrete compressive strength crushing logs ($f_{c28}$ at 7, 14, 28 days, AxiaLabo legacy) with breaking load in kN, MPa strength calculation ($f_c = F/S$), and NF EN 12390 compliance certificate printing via `renderAndPrintDocument('LIMS_CERTIFICATE', ...)`.
     - `logistics/fuel-vouchers/page.tsx`: Fleet fuel cards and vouchers registry (AxiaTransport legacy) with station networks, index km delta, and automated overconsumption anomaly detection ($C = \frac{\Delta L}{\Delta \text{Km}} \times 100 > 1.25 \times \text{baseline}$).
     - `projects/site-logbook/page.tsx`: Civil engineering site daily logbook (AxiaBat legacy) with weather conditions, stoppage hours, workforce headcounts, and machinery logs.
     - `projects/dispatch-gantt/page.tsx`: Field technician intervention dispatch Gantt schedule (AxiaTeams legacy) with hourly visual matrix, specialty filtering, and conflict prevention.
  4. **Navigation Integration (`sidebar.tsx`)**: Wired all 10 non-parameterized routes into `web/src/components/layout/dashboard/sidebar.tsx` with active sub-items and badges.
  5. **Strict Quality Gates & Metrics Verification**: Verified `npx tsc --noEmit` exit code 0 on both `backend/` and `web/` with 0 explicit `any` types. Web pages expanded from 115 to **131 (+16 pages)**, 18/18 web test suites passed (112/112 tests, 100% green), 94/94 backend test suites passed (423/423 tests, 100% green).


