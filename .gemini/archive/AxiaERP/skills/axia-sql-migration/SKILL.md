---
name: axia-sql-migration
description: "Use whenever a change to the Structure or Subscription databases is needed — these have no EF Core Migrations, so every schema/data change is a hand-written, idempotent SQL script placed in */Persistence/manual_sql/. Trigger on any request to add a column, table, index, or backfill data in Structure or Subscription (Identitydb is the one exception — it has real EF migrations, don't use this skill for it)."
---

# Writing a manual SQL migration for AxiaERP (Structure / Subscription)

Structure and Subscription have no EF Core Migrations. Every schema or data change is a plain `.sql` file, applied by hand by a human against the live database, once. Nothing enforces order or reruns — the script itself must guarantee safety.

## File placement and naming

`<Solution>Infrastructure/Persistence/manual_sql/YYYY-MM-DD_description.sql` — e.g. `StructureInfrastructure/Persistence/manual_sql/2026-07-23_companies_settings_hardening.sql`. Use today's date, a short snake_case description.

## Mandatory idempotency

The script may be run more than once (by accident, or against an environment that already has a later state). Every statement must be safe to rerun:

**Adding a column:**
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'companies_settings' AND column_name = 'new_column'
    ) THEN
        ALTER TABLE companies_settings ADD COLUMN new_column integer;
    END IF;
END $$;
```

**Adding a row (catalog/seed data):**
```sql
INSERT INTO companies_settings_keys (key, value_type, slug)
SELECT 'Language', 'string', 'language'
WHERE NOT EXISTS (
    SELECT 1 FROM companies_settings_keys WHERE slug = 'language'
);
```

**Adding an index — GOTCHA**: to check whether a (possibly partial) unique index already exists, query `pg_indexes`, **not** `information_schema.table_constraints` (the latter misses partial indexes and produces a false negative, so the script tries to `CREATE INDEX` again and fails on the second run):
```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE indexname = 'ux_companies_settings_company_key'
    ) THEN
        CREATE UNIQUE INDEX ux_companies_settings_company_key
            ON companies_settings (company_id, companies_settings_key_id);
    END IF;
END $$;
```

## Before finishing

1. Re-read the script and confirm every statement is guarded (`IF NOT EXISTS` / `WHERE NOT EXISTS`) — no bare `ALTER TABLE ADD COLUMN`, no bare `INSERT` without a guard, no bare `CREATE INDEX`.
2. If the change is schema (not just data), check whether the corresponding EF entity/DbContext config also needs updating — hand off to `dotnet-backend-architect`.
3. You have no database network access. Do not claim the script "works" — hand it to the user to run, and ask for the output (or provide a companion `SELECT` to confirm the result) so you can verify after the fact.
4. If the change affects the companies_settings/settings_keys catalog specifically, use the `axia-add-settings-key` skill instead — it covers both databases together.
