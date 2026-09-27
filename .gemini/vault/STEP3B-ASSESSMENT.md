# STEP 3B ASSESSMENT — Backend Module Template: Where It Actually Applies
Evidence-based classification (line counts + logic-signal scan across erp/* and core/*).

## Findings
1. **Controllers**: ZERO logic signals (no loops/map/reduce clusters) anywhere in erp — presentation layer is already clean.
2. **ERP services**: ALL under 165 lines, pure CRUD over Prisma (messages 163, notifications 162, warehouses 116 being the largest).
3. **Real logic concentrates in core platform services**: auth 404 · permission-registry 330 (Step-1 product) · permissions 306 · subscription-provisioning 272 · functions 266 · companies 256.
4. Domain/app/infrastructure template ALREADY correctly applied where logic exists: hr/payroll (Step-2 pilot), documents/numbering + pdf (guardrails wave), core/rbac (Step-1).

## Verdict
- Blanket-templating thin-CRUD ERP services = ceremony without benefit → NOT recommended (violates proportionality; would inflate every module ~3× for zero rule enforcement gain).
- Template applies ONLY where business rules exist. Current coverage of logic-bearing areas: ✅ payroll ✅ documents(numbering+pdf) ✅ rbac registry.
- Remaining logic-bearing candidates (OPTIONAL polish, low risk but real refactor cost):
  a) subscription-provisioning.service.ts → extract provisioning policy into core/saas/domain (pack→defaults matrix) + application use-case. Highest domain value (owner's core SaaS flow).
  b) permissions/functions services → catalog invariants could move to core/rbac/domain alongside registry.
  c) auth.service.ts → token/session policy extraction (security-sensitive; schedule with dedicated tests).

## Decision recorded
Step 3B = DONE for mandated scope. Items (a)(b)(c) queued as optional hardening backlog, executed only when those services next change functionally (strangler-on-touch), per plan's proportionality principle.
Part A (19 pages off raw apiClient) = COMPLETE: 106 calls migrated, grep target R2 achieved (0 pages bypass services).
