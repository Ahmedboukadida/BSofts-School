---
name: axia-add-settings-key
description: "Use when adding a new company-configurable setting to AxiaERP's shared-catalog settings mechanism — e.g. adding 'Devise' or 'Language' as a real settings key. Trigger on requests like 'add a new setting for companies', 'add X to the settings catalog', or when implementing Phase 1 of SETTINGS_ARCHITECTURE_PLAN.md. Do not use for genuinely per-company data that isn't a shared small-option-list preference (e.g. free-text values, references to arbitrary rows in another table) — the mechanism only supports a key with a small shared closed list of options."
---

# Adding a new companies_settings key end-to-end (AxiaERP)

The generic settings mechanism is a shared catalog: a key definition, a small shared list of options for that key, and a per-company row picking one option (or null = default). It does **not** support free text or a reference to an arbitrary row in another table — if the new setting needs either of those, stop and raise it as a bigger schema question (`postgres-schema-specialist` + `dotnet-backend-architect`) rather than forcing it into this shape.

## Step 1 — confirm the shape fits

Ask: does this setting have a small, fixed, shareable list of choices (like the existing "Document préfix" key's 9 fixed options)? If yes, continue. If it needs a boolean, that's still a fit (two options: true/false, or a single option representing "on"). If it needs a number range, free text, or a link to another table's row, it doesn't fit — don't force it.

## Step 2 — add the key and its values in both databases (idempotent SQL — see `axia-sql-migration`)

Structure DB (`companies_settings_keys` + `companies_settings_keys_values`):
```sql
INSERT INTO companies_settings_keys (key, value_type, slug)
SELECT 'Devise', 'string', 'devise'
WHERE NOT EXISTS (SELECT 1 FROM companies_settings_keys WHERE slug = 'devise');
```
then insert each option row into `companies_settings_keys_values` with `companies_settings_key_id` pointed at the key just inserted (look it up by slug, don't assume an id), guarded the same way.

Subscription DB (`settings_keys` + `settings` + `settings_keys_values`) — mirror the same key so future approvals seed it correctly. Remember the FK chain here is `settings.settings_key_id → settings_keys.id` and `settings_keys_values.setting_id → settings.id` (values hang off `settings`, not directly off `settings_keys` — this is a different shape from the Structure side, easy to get backwards).

## Step 3 — confirm the frontend needs no new code

The Companies wizard's settings step already renders arbitrary key/value rows generically — a new catalog key should appear automatically without a frontend code change. Verify this is still true (check `CompaniesFormModal.js`'s settings step and `CompaniesDetails.js`) before assuming it — and check `CompaniesDetails.js`'s `SETTING_KEY_LABELS` dictionary, which may already have a placeholder label waiting for this exact key (confirmed true for "Devise" and "Language" as of the last audit).

## Step 4 — decide what to do about the second write path

The Subscription approval wizard's Configuration step writes the same underlying data via a different payload shape (`{id, keyName, valueType, values, isSelected}` vs. the Companies wizard's `{companiesSettingsKeyId, selectedValueId}`). Adding a key doesn't require fixing this duplication, but if the task's scope includes reconciling it, that's a `dotnet-backend-architect` + `react-frontend-architect` joint change, not part of this skill's minimal path.

## Step 5 — verify

Run the two confirmation `SELECT` queries in `SETTINGS_ARCHITECTURE_PLAN.md` (or equivalent) against both databases via the user, since no agent has DB network access. Confirm the new key and its values appear correctly in both Structure and Subscription before considering this done.
