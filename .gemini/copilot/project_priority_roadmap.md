# BSofts School — Updated Priority Roadmap

## Goal

Bring the project from a promising multi-module SaaS foundation to a trusted production-grade school management platform.

This is not a feature roadmap only. It is a risk-remediation roadmap.

---

## Priority 1 — Stabilize the application core

### Target: 0–2 weeks

This is the first gate. If this fails, everything else is noise.

### Must-fix items
1. Fix the failing backend tests completely
2. Remove fragile request-object assumptions in controller flows
3. Harden mail and auth request logic
4. Align Prisma service contracts with actual model behaviors
5. Fix upload validation order and file handling semantics
6. Replace unsafe development-only fallback secrets with strict prod checks

### Why it matters
This is the difference between a demo and a product. A school management system is operationally critical; it cannot fail in core request processing.

### Exit criteria
- backend test suite green
- no null request crashes in protected endpoints
- all auth and mail paths behave predictably with valid and invalid request context
- upload rules reliably fail malicious payloads and accept valid files

---

## Priority 2 — Harden tenant and establishment boundaries

### Target: 2–4 weeks

### Must-fix items
1. Prove that tenant isolation is enforced in all listing and detail endpoints
2. Validate that establishment-scoped queries never leak data across schools
3. Review all admin operations for privilege boundary enforcement
4. Create a tenant-scoping test matrix for each major module

### Why it matters
This is the most serious business and security risk in a SaaS school platform.

### Exit criteria
- each endpoint is proven to honor tenant and establishment scope
- a school admin cannot access another school's dataset
- tests cover cross-tenant access attempts

---

## Priority 3 — Finish the business-critical school workflows

### Target: 4–8 weeks

### Must-ship flows
1. student onboarding and enrollment
2. teacher assignment and subject mapping
3. class scheduling and academic assignment integrity
4. attendance flow and reporting
5. exam and grading workflow
6. bulletins and academic results publication
7. parent access and messaging visibility
8. financial and payment reconciliation flows

### Why it matters
A school platform becomes valuable only when operational workflows are correct, not just modular.

### Exit criteria
- end-to-end school operations work for a realistic scenario
- admin, teacher, student, and parent experiences are all coherent
- no critical business logic silently fails

---

## Priority 4 — Security and governance hardening

### Target: 6–10 weeks

### Required work
1. Safe production secret validation
2. better audit coverage for privileged operations
3. stronger role matrix verification
4. endpoint-level abuse protection beyond auth rate limiting
5. file storage governance for sensitive uploads
6. security review across admin and financial modules

### Why it matters
The platform handles student and school data; trust is non-negotiable.

### Exit criteria
- no critical secrets in code paths
- audit logs exist for key operations
- access control is measurable and testable
- file handling is hardened against abuse

---

## Priority 5 — Performance and production readiness

### Target: 8–12 weeks

### Required work
1. optimize report/dashboard queries
2. reduce expensive client-side aggregations
3. index the most important Prisma query paths
4. ensure large list screens paginate, filter, and sort efficiently
5. improve production observability and health checks
6. create release and rollback documentation

### Why it matters
Large school data sets create serious bottlenecks if not designed for scale.

### Exit criteria
- dashboards and reports remain responsive
- slow endpoint patterns are identified and fixed
- production operations are monitorable

---

## Priority 6 — UX trust and client confidence

### Target: 10–14 weeks

### Required work
1. final admin experience polish
2. consistent error handling and user feedback
3. role-specific dashboard clarity
4. clean migration from MVP states to real ERP-like workflows
5. final QA and acceptance testing for real stakeholders

### Why it matters
The product may have the technical base, but client adoption depends on trust, clarity, and smooth operator experience.

---

## Decision gate before sale

Do not present this as commercial-ready until all of the following are true:

- backend tests pass consistently
- tenant and establishment scoping is proven
- auth, mail, and upload paths are hardened
- critical school workflows are validated in realistic scenarios
- deployment and security configuration are documented and repeatable
- the platform can be used in a live school environment without major trust issues

---

## Final attitude

This is no longer a "feature completion" task.

It is a "trust and reliability" task.

If the team can complete the first three priorities rigorously, the product can become a serious school-management platform. Without that, it remains a high-potential but untrusted MVP.
