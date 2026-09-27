# BSofts-School — Subagents Architecture & Operational Registry

> Catalog of specialized domain agents, technical execution squad, and codified skills within `.gemini/`.  
> **Last Updated**: 2026-09-22

---

## 1. Master Plan v3.0 Active Execution Squad

These 5 specialized subagents are registered and directly invokable to execute Master Plan v3.0:

| Agent Identifier | Codified Skills Assigned | Operational Mandate |
| :--- | :--- | :--- |
| `dto-validation-shield` | `class-validator-expert`, `backend-dev-guidelines`, `backend-security-coder`, `clean-code` | Eliminate 400 Bad Request ("property X should not exist") errors. Reconfigure `AppValidationPipe` with `forbidNonWhitelisted: false`. Synchronize DTOs and services for Employees, Classes, Rooms, Academic Modules, Homework, Students. |
| `auth-core-specialist` | `jwt-auth-hardening`, `saas-multi-tenant`, `clean-architecture-guardrails` | Implement missing user profile (`PUT /auth/profile`) and password change (`PUT /auth/change-password`) in Auth controller. Build `MeetingsModule` and `SaasFunctionsModule`. |
| `analytics-stats-architect` | `kpi-dashboard-design`, `sql-optimization-patterns`, `postgres-best-practices` | Replace fragile client-side `limit=200` data crunching with real aggregated backend endpoints (`GET /dashboard/stats`, `GET /reports/stats`). Secure subscription approval and system log resolution. |
| `frontend-dataflow-refactorer` | `frontend-dev-guidelines`, `react-ui-patterns`, `tanstack-table-builder` | Fix `/community/messages` -> `/messages` and `/community/notifications` -> `/notifications` URLs. Align form payloads with DTOs. Wire `/dynamic-enums` dropdowns. Replace silent catch blocks with error toasts. |
| `master-judger` | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Multi-dimension gatekeeper verifying 100% build health, zero runtime errors, contract parity, and strict 5-color palette compliance. |

---

## 2. Domain Specialists Registry

| Domain | Primary Agent | Primary Skills in `.gemini/skills/` | Deliverables & Responsibilities |
| :--- | :--- | :--- | :--- |
| **SaaS Platform** | `saas-expert` | `saas-multi-tenant`, `saas-mvp-launcher`, `clean-architecture-guardrails` | Multi-tenant isolation, tenant settings, subscription plans, packs, modules, and platform limits. |
| **Learning Management (LMS)** | `academic-school-expert` | `nestjs-expert`, `nextjs-app-router-builder`, `tanstack-table-builder` | Courses, academic years, periods, subjects (matières), lessons, homework, and session timetables. |
| **Enterprise Resource Planning (ERP)** | `domain-subagent-erp-core` | `database-design`, `base-service-extender`, `prisma-schema-engineer` | Salles/rooms, facilities, equipment, inventory, and cross-department resource management. |
| **Finance & Accounting** | `domain-subagent-finance` | `stripe-integration`, `payment-integration`, `billing-automation` | Student fees, payment plans, invoices, receipts, and income/loss balance audits. |
| **Payment Gateway & Multi-Caisse** | `domain-subagent-payments` | `payment-integration`, `billing-automation`, `sql-pro` | Physical cash registers (caisses), atomic balance locks, transaction receipts, and payment processor webhooks. |
| **Human Resource Management (HRM)** | `hrms-payroll-tunisian-expert` | `odoo-hr-payroll-setup`, `nestjs-expert` | Employees, teachers, hourly/monthly teacher contracts, attendance tracking, and leaves. |
| **Communication** | `realtime-messenger-agent` | `websocket-gateway`, `modern-javascript-patterns` | Direct messages, conversation threads, group messaging between staff, teachers, students, and parents. |
| **Notification Engine** | `backend-email-agent` | `mailtrap-sending-emails`, `websocket-gateway` | Real-time alerts, absence notifications sent to parents, push notifications, and email triggers. |
| **Analytics & Reporting** | `reporting-audit-expert` | `kpi-dashboard-design`, `sql-optimization-patterns` | KPI summary cards, enrollment charts, attendance trends, financial reports, and CSV/Excel/PDF exports. |
| **Document Design** | `document-print-designer` | `clean-code`, `baseline-ui` | Automated school report cards (bulletins), official receipts, certificates, and printable timetables. |
| **Security & RBAC** | `judger-security` | `jwt-auth-hardening`, `rbac-permissions-matrix`, `api-security-best-practices` | Four-tier guard chain, token rotation, bcrypt password hashing, and granular permissions checks. |

---

## 3. Operational Hardening Squad (8 Specialized Agents)

| Operational Role | Agent Identifier | Assigned Skills | Deliverables & Responsibilities |
| :--- | :--- | :--- | :--- |
| **DevOps Platform** | `devops-platform-engineer` | `docker-expert`, `devops-deploy`, `ci-cd-and-automation`, `github`, `prometheus-configuration` | Docker, compose, CI/CD GitHub Actions, `/health` and `/metrics` probes, structured logging. |
| **Frontend Testing** | `frontend-test-engineer` | `jest-skill`, `vitest-skill`, `playwright-skill`, `e2e-testing-patterns` | Vitest + React Testing Library component tests, Playwright 5 critical user journey suites. |
| **Accessibility (a11y)** | `accessibility-a11y-engineer` | `frontend-ui-engineering`, `react-best-practices`, `baseline-ui` | WCAG 2.1 AA audit, axe-core automated CI gates, keyboard trap and ARIA attributes. |
| **Performance Guardian** | `perf-budget-guardian` | `pagespeed-enhancer`, `web-performance-optimization`, `react-component-performance` | Core Web Vitals, code-splitting, Next.js bundle budget, lazy loading Three.js assets. |
| **Production SRE** | `production-hardening-sre` | `jwt-auth-hardening`, `rate-limit-helmet`, `secrets-management`, `api-security-best-practices` | OWASP hardening, Throttler rate-limiting, secret rotation, S3 file storage, magic-byte sniffing. |
| **Tenant Pentester** | `tenant-isolation-pentester` | `tenant-isolation-verifier`, `tenant-switcher-governance`, `saas-multi-tenant` | Cross-tenant isolation verification, JWT establishmentId scope assertion, leak prevention. |
| **Seed Steward** | `seed-data-steward` | `prisma-expert`, `prisma-schema-engineer`, `clean-code` | Deterministic and idempotent database seeding, env-driven credentials, transactional safety. |
| **AI Features** | `ai-feature-builder` | `python-pro`, `systematic-debugging` | Feature-flagged AI tutor integration, exam quiz generator, transcript insights, PII scrub. |

---

## 4. Technology Stack & Codified Standards

- **Database**: PostgreSQL 17 on Neon Cloud via Prisma ORM (`.gemini/skills/prisma-schema-engineer`, `postgres-best-practices`).
- **Backend**: NestJS 12 (`.gemini/skills/nestjs-expert`, `class-validator-expert`, `api-design-principles`).
- **Frontend**: Next.js 16 App Router & React 19 (`.gemini/skills/nextjs-app-router-builder`, `react-patterns`).
- **Styling**: Tailwind CSS v4 (`.gemini/skills/tailwind-design-system`) strictly enforcing the 5-color solid palette:
  - `#363636` (Graphite)
  - `#242F40` (Jet Black / Slate Navy)
  - `#CCA43B` (Golden Bronze)
  - `#E5E5E5` (Light Platinum)
  - `#FFFFFF` (Pure White)
- **Type Safety**: TypeScript 6.x (`.gemini/skills/typescript-expert`, `typescript-advanced-types`).
