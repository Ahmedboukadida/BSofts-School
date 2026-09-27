---
name: clean-architecture-guardrails
description: Machine-checkable separation rules for BSOFTS (dependency rule + per-layer forbidden lists + CI gates). Mandatory read before writing backend or frontend code.
---

# Clean Architecture Guardrails

Dependency rule: `Presentation → Application → DOMAIN ← Infrastructure(implements ports)`. Inner layers never import outer ones.

## R1 — Domain purity
Files under backend `*/domain/*` and web `src/domain/**` import NOTHING from: react, next, @nestjs/*, @prisma/client, axios, socket.io, js-cookie, DOM globals.
Check: `npx dependency-cruiser` element rules (when installed) / grep imports.

## R2 — Single API gateway (frontend)
Only `web/src/lib/apis/**` may import/execute the axios client. Pages/components call services.
Check: `Select-String -Path "web/src/app/**/page.tsx" -Pattern "apiClient\."` → must be 0.

## R3 — No rate literals in UI/services
Business constants (tax %, thresholds like 0.0918, 0.1657) live ONLY in domain config files (`payroll-config.types.ts` etc.) or per-company DB settings. Display text may interpolate config values.
Check: grep `\* 0\.\d\d` in src/app + non-domain services → 0.

## R4 — Controllers never touch Prisma
Controllers validate + delegate. Check: grep `prisma\.` in *.controller.ts → 0.

## R5 — Application services contain no formulas
Use-cases orchestrate; math imported from domain. Constants check same as R3 inside application/*.

## R6 — Schema discipline
- Tenant-operated entities carry soft-delete mixin; developer-only catalogs hard-delete behind developer guard + audit row.
- Every migration: one concern + one-line ADR note in PR.

## R7 — Presentation stays thin
Dashboard pages are composition (primitives + hooks + services), target ≤ ~250 lines; new dashboard pages MUST use bsoft-view-standard primitives.

## Gates
- CI: tsc (both stacks), eslint web/src, jest/vitest suites.
- master-judger arch gate: baseline file `.agents/bonus/Vault/VIOLATIONS-BASELINE.md` must not grow; each sweep batch ticks items off.
- Quick local audit commands:
  - `rg "apiClient\." web/src/app -l` → empty
  - `rg "prisma\." backend/src --glob "*.controller.ts"` → empty
  - `rg "\* 0\.\d\d" web/src/app backend/src/*/application` → empty