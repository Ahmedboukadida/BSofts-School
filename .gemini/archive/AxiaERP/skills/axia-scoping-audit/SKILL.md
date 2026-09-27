---
name: axia-scoping-audit
description: "Use whenever adding a new per-company entity or endpoint in AxiaERP, or when asked to check whether company data is properly isolated (multi-tenancy). This codebase has confirmed cross-tenant scoping bugs (SouchesClient has no company column at all; Devise.DevIsBase isn't filtered by company in its consumers; salesDevisRefs.js calls unscoped endpoints where scoped ones exist) found by systematically applying this check — use it proactively, not just reactively."
---

# Auditing company scoping (multi-tenancy) in AxiaERP

Every per-company entity in Structure, Subscription, and Vente should carry `IdSociete` or `CompanyId` and every query against it should filter by it. This has been violated in confirmed, real ways — this is a security concern (cross-tenant data leakage), not just a correctness nice-to-have.

## The check, step by step

1. **Does the entity have a company column at all?** Read the entity class (or the table via a manual_sql script) and confirm an `IdSociete`/`CompanyId` column exists. Confirmed miss: `SouchesClient` has none, unlike every comparable entity (Souche, StatutDocument, etc. all have it).
2. **Does every repository/query method filter by it?** Grep the repository implementation for the entity — every `Get`/`List`/`Update`/`Delete` method should take a company id and use it in the `WHERE` clause (or EF `Where()`). A method that takes a company id parameter but doesn't use it in the actual query is worse than one that's honestly unscoped — it looks safe and isn't.
3. **Does the entity have both a scoped and unscoped endpoint variant?** Several resources (Devises, Taxes, ComptesGeneraux) intentionally expose both a `/by-societe` (scoped) and a plain (unscoped, admin/global-list-only) endpoint. If both exist, check every frontend caller and confirm each uses the *correct* one for its context. Confirmed miss: `salesDevisRefs.js` (used while drafting a sales document, where scoping matters) calls the unscoped versions instead of the scoped ones that dedicated admin pages correctly use.
4. **Does a "default" or "flag" field on a per-company row actually behave per-company?** Some fields look scoped (they sit on a row that has a company id) but their *consumers* don't filter by company when reading them. Confirmed miss: `Devise.DevIsBase` sits on a per-company currency row, but the FX-conversion logic and the rate-refresh job both pick "the" base currency system-wide, so setting it for one company silently unsets it for every other company. Check the read side, not just the write side.
5. **Does a partial/scoped uniqueness constraint exist where it should?** If a value should be unique per company (not globally), check whether the DB enforces this via a scoped partial unique index (see `axia-sql-migration`'s note on checking `pg_indexes`, not `information_schema.table_constraints`, for these) — an application-level-only check is a race condition waiting to happen.

## Reporting

State findings as: entity/field checked, what was found (has column / missing column; filters correctly / doesn't; scoped+unscoped both used correctly / misused), and severity (a missing filter that could leak another company's data is a security finding — escalate via `identity-security-specialist` and `product-stakeholder-coordinator`, don't just note it and move on).
