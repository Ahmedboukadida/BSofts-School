# STEP 4 — SOFT-DELETE SPLIT AUDIT (164 models)
Policy (ratified §10): tenant-operated entities REQUIRE soft-delete mixin (is_deleted/deleted_at/deleted_by); developer-only catalogs & system counters use HARD delete guarded to developer role + audit-log row; status-lifecycle entities are compliant alternatives.

## Results
| Class | Count | Verdict |
|---|---|---|
| WITH is_deleted mixin | 121 | ✅ compliant |
| No soft-delete + has company_id | 20 | see breakdown |
| No soft-delete + no company_id (platform/catalog/system) | 23 | ✅ mostly correct |

## Breakdown of the 20 "suspects" → verdicts
**✅ Correct as-is (status-based lifecycle)**: messages, notifications — INBOX_LU/TRASH-style statuses ARE their soft-delete.
**✅ Correct as-is (append-only/system/counters/joins — hard-delete or never deleted)**: logs, caisses_mvt_history, prod_historiques_of, archives_exports, companies_settings, companies_settings_values, document_sequence_counters (guardrails), idempotency_keys (guardrails), users_companies_roles.
**⚠️ RECOMMENDED FIXES (tenant-operated, recoverable-deletion expected)**:
1. company_print_templates — owner-designed print layouts; accidental loss = rebuilding designs. PRIORITY.
2. interactions — CRM customer/provider touchpoints.
3. dynamic_enums — admin-managed value lists referenced by live records.
4. prod_defauts_decisions — quality decisions traceability.
5. fournisseurs_delais_articles — supplier lead-time config history matters for purchasing analytics.
**Optional/event-like (acceptable hard-delete)**: pv_panneaux, prod_affectations_operateurs, prod_equipements_gmao, company_hosting_settings.

## Platform-catalog spot-check (23 no-company_id)
Pure catalogs/system confirmed: app_settings(+values), devises, notification_templates, packs_lines, modules_lines, functions(+functions_permissions), roles_permissions_relations, users_permissions_relations, *tags/*categories relations, user_sessions, logs_system, subscriptions_requests (pre-tenant flow).
Parent-scoped lines (tenancy inherited via parent FK — acceptable without own company_id): pos_cart_items, ecommerce_order_items, journal_entry_lines, discount_rules, productions_machines_maintenance_logs.

## Action plan
- Batch A (recommended now, small): add mixin to the 5 ⚠️ models + switch their delete paths to PATCH is_deleted (FE already role-aware via DeleteConfirmModal). One migration.
- Developer-only catalogs: enforce hard-delete guard at service layer where not already (permissions/functions/modules/packs services) + audit-log row per deletion — verify during next functional touch (strangler-on-touch).