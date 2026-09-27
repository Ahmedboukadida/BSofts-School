# Company Settings: What We Have, and a Plan to Expand It

Prepared 2026-07-27. Based on a full read of the Structure and Subscription solutions' entities, handlers, controllers, and the erp-front pages that touch them, plus every manual SQL script that seeded real data. I could not reach either database directly (no network path to 172.0.1.131 from this environment), so the "what data exists today" parts are inferred from the manual_sql scripts and code, not a live query — flagged below wherever that matters.

## 1. What the generic settings mechanism actually is today

Structure DB: `companies_settings_keys` (shared catalog of key definitions) + `companies_settings_keys_values` (shared option list per key) + `companies_settings` (per-company junction: which key, which selected value). Subscription DB has a mirror-image master template: `settings_keys` / `settings` / `settings_keys_values`, meant to be copied into the Structure tables whenever a subscription gets approved for a new company.

As seeded on 2026-07-23 (the only data I can confirm existed, via the backfill script), it holds exactly 4 keys, all UI/display preferences:

- Table pagination — 5 / 10 (default) / 15 / 20 / 25 / 50 / 100
- Document préfix — BCA / DVA / BE / FA / BCV (default) / BT / BS / BL / FV
- Theme top navbar color — 4 hex swatches
- Theme left sidebar color — 4 hex swatches

Confirmed by direct code trace: this mechanism is **purely display/CRUD today**. Nothing outside the Companies wizard's own settings screen reads it. The one exception is the Subscription approval flow, which *writes* into it once at company-creation time — it doesn't read it either.

The mechanism itself only supports one shape: a key with a small, shared, closed list of options (even the "string"-typed Document préfix key only offers 9 fixed choices, not free text). There's no free-text value, no per-company-only option list, and no way to reference an arbitrary row in another table.

Two independent code paths both write to this same data today, which is worth reconciling at some point: the Companies wizard's settings step (`{companiesSettingsKeyId, selectedValueId}` via `Companies/CreateComplex` / `CompaniesSettings/Create`) and the Subscription approval wizard's Configuration step (`{id, keyName, valueType, values, isSelected}` via `SubscriptionRequests/Approve`) — structurally the same concept, two different payload shapes and endpoints.

## 2. Real per-company configuration that exists *outside* this mechanism

Every `IdSociete`/`CompanyId`-scoped entity in the Structure solution was checked (37 total). Most are ordinary per-company business data (each company's own customers, banks, currencies, tax rates, etc.) — not settings, and not candidates for this list. The genuine configuration/preference concepts found:

**Default GL account for new clients/suppliers** — `Company.CgNumCltDefault`/`CgNumCltValue`/`CgNumFrsDefault`/`CgNumFrsValue`. A checkbox + account picker in the Companies page's "Comptes Généraux" tab (`CompanyComptesGenerauxModal.js`), its own dedicated endpoints, nothing to do with the generic catalog. **Confirmed dead**: grepped the entire backend, including the actual client/supplier-creation handlers — nothing reads these four fields except their own CRUD screen. Client/supplier creation always takes the GL account number straight from the form.

**Article numbering (prefix / digit width / auto-increment)** — `TableNumerotation`, one row per company per numbering "Type". Has its own working frontend already: the Codification page (`/admin/codification`, nav "Parametre de document"), which covers 15 structure types including Article. Real, gated generation logic exists server-side (`GetNextArticleReferenceQueryHandler`) — but **confirmed unwired**: article creation never calls it, and no frontend caller was found for the next-reference endpoint. There's also a second, redundant increment mechanism on the same table (`TableNumerotationRepository.IncrementAsync`, mutating a counter embedded in a string field) that nothing calls either.

**Base/reference currency** — `Devise.DevIsBase`, a boolean on one row of each company's currency list. Real consumers exist (FX conversion, the nightly rate-refresh job) — but **bug found**: none of them filter by company. Setting a base currency for one company unsets it for every company; the refresh job picks one currency for the whole system. The frontend has no "default currency" picker anywhere — this is set via the Devise list's own edit form.

**Souche / StatutDocument / DoccurentPiece** (document numbering series, status workflow, document-type catalog) — genuine per-company configuration, already has dedicated, working CRUD screens (Codification's domaine panel, Gestion des statuts). Confirmed: real multi-row relational data with dependents (referenced by every Vente document), not a fit for a key/value catalog, and doesn't need to be.

**Client/supplier/employee code numbering (`SouchesClient`)** — its own frontend page exists (Souches client), and a real code-preview generator exists server-side — but it's preview-only (confirmed: not called by client/supplier creation), and the entity has **no company column at all**, unlike everything else in this list. The frontend's save call doesn't send a company id either.

**Fiscal defaults hardcoded in the approval wizard** — `tvaPercent` defaults to 19, `foducPercent` to 1, `timbreAmount` to 1, and the currency unit "TND" is a literal string, all baked into `ApproveSubscriptionModal.js`'s component state rather than sourced from anywhere. These are Tunisia-wide statutory figures, not really a per-company choice, so the fix here is probably "move to one shared config source," not "make it a per-company setting" — flagging for your call.

**A concrete signal for what's already intended**: `CompaniesDetails.js` has a label dictionary with entries for "Devise" and "Language" settings keys that **don't exist yet** in the 4-key catalog, and the navigation menu has a disabled stub literally labeled "Paramètres" sitting where a settings hub would go. Someone already planned for this expansion; it was never finished.

## 3. Other bugs found along the way (independent of the settings question, but real)

- `salesDevisRefs.js` (used when drafting a quote/invoice) calls the **unscoped** Devises/Taxes/ComptesGeneraux endpoints, while the dedicated admin list pages for those same resources correctly use the `/by-societe` scoped versions. A document being drafted can currently see another company's currencies, tax rates, and chart of accounts.
- `SouchesClient` has no company scoping at all (see above) — probably shows/edits every company's numbering series together today.
- `Devise.DevIsBase` company-scoping bug (see above).

None of these are things I'd fix as a side effect of the settings work — they're separate, pre-existing bugs worth their own ticket.

## 4. Recommended plan

**Phase 1 — expand the catalog with things that actually fit it**, no backend logic changes required, since the Companies wizard's settings step already renders arbitrary key/value rows generically:
- Add "Devise" (default company currency) and "Language" as real keys — the frontend already has label placeholders waiting for exactly these.
- Add the two GL-account booleans ("Compte général client par défaut" / "...fournisseur par défaut") as boolean keys, matching what the Comptes Généraux modal already exposes as checkboxes. The *value* half (which specific account) doesn't fit the shared-option-list pattern — recommend leaving the account picker as its own field for now rather than forcing it into `companies_settings_keys_values`, unless you want to extend the mechanism to support a "reference" value type (a bigger schema change).

**Phase 2 — fix the wiring gaps that are independent of adding new keys:**
- Wire `GetNextArticleReferenceQueryHandler`/increment into actual article creation, and remove the redundant `TableNumerotationRepository.IncrementAsync` path.
- Decide whether `SouchesClient` needs company scoping added (it currently has none) and whether its preview generator should become enforced at creation time.
- Fix the two Devise/multi-tenancy bugs above.
- Reconcile the two settings-mutation code paths (Companies wizard vs. approval wizard) so there's one way to write this data, not two.

**Phase 3 — decide on the fiscal-defaults question** (TVA/FODEC/Timbre/currency-unit): move to shared config, or make genuinely per-company/per-request overridable settings — this needs your call on whether any customer actually negotiates different rates, since today it's Tunisia-wide statutory figures hardcoded in one component.

## 5. What I need from you before touching any code

1. Confirmation on the Phase 1 key list (Devise, Language, the two GL booleans) — or tell me if you had different keys in mind that don't show up anywhere in the current code (those wouldn't be findable by reading the codebase at all).
2. A decision on Phase 2's scope — fix the wiring gaps as part of this work, file them separately, or skip for now.
3. Direction on Phase 3 (fiscal defaults).
4. If you want live confirmation of exactly what's in `companies_settings_keys`/`settings_keys` right now rather than relying on the 2026-07-23 backfill script as the source of truth, run this from your machine and send me the output:

```sql
-- Structure DB
SELECT k.id, k.key, k.value_type, k.slug, v.value, v.is_default
FROM companies_settings_keys k
LEFT JOIN companies_settings_keys_values v ON v.companies_settings_key_id = k.id
WHERE k.is_deleted IS NOT TRUE
ORDER BY k.id, v.id;
```

```sql
-- Subscription DB
SELECT sk.id, sk.key, sk.value_type, sk.slug, skv.value, skv.is_default
FROM settings_keys sk
LEFT JOIN settings s ON s.settings_key_id = sk.id
LEFT JOIN settings_keys_values skv ON skv.setting_id = s.id
WHERE sk.is_deleted IS NOT TRUE
ORDER BY sk.id, skv.id;
```
