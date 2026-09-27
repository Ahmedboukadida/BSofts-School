# BSofts School Master Agent Roster, Skills & Work Breakdown

This registry defines the exact **43 specialist agents** across all 5 operational groups, their assigned codified **Skills**, and their precise **Part in the Work** for BSofts-School.

---

## 1. Domains Specialists (12 Agents)

| Domain | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **SaaS** | `saas-expert` | `saas-multi-tenant`, `saas-mvp-launcher`, `tenant-isolation-verifier`, `tenant-switcher-governance` | Multi-tenancy governance, tenant provisioning, plan features, module subscriptions, platform settings, multi-establishment scoping. |
| **Learning management system** | `academic-school-expert` | `clean-code`, `base-service-extender`, `class-validator-expert` | Academic hierarchy (`Cycle` -> `Level` -> `Class`), 3-Tier Timetable Collision Engine (Teacher, Class, Room), Tunisian Trimester GPA math, coefficients, bulletins, class ranking. |
| **Enterprise resource planning** | `domain-subagent-erp-core` | `backend-dev-guidelines`, `clean-architecture-guardrails`, `database-design` | Academic calendar, rooms & facilities management, school equipment tracking, resource scheduling, operational master data. |
| **Finance and accounting** | `domain-subagent-finance` | `database`, `base-service-extender`, `payment-integration` | School accounting, multi-caisse management, integer millimes (TND), atomic balance row locks, student installment payment plans, overdue penalties, financial ledger. |
| **Human resource management** | `hrms-payroll-tunisian-expert` | `backend-dev-guidelines`, `class-validator-expert` | Teacher & staff profiles, contracts, hourly rate tracking, attendance, leaves & vacations, payroll slip calculation (CNSS/IRPP deductions). |
| **Communication** | `realtime-messenger-agent` | `websocket-gateway`, `nodejs-backend-patterns` | Direct & group messaging channels between teachers, parents, students, and administration, real-time chat socket rooms. |
| **Notification** | `backend-email-agent` | `mailtrap-sending-emails`, `nodejs-backend-patterns` | Multichannel alerts (push, email, SMS) for student absences, exam announcements, report card publications, tuition payment reminders. |
| **Analytics and reporting** | `reporting-audit-expert` | `kpi-dashboard-design`, `analytics-tracking`, `sql-optimization-patterns` | Establishment KPI metrics, grade distribution curves, attendance trends, financial P&L reporting, audit log analytics. |
| **Document desgin** | `document-print-designer` | `ui-component`, `baseline-ui` | Pixel-perfect printable document templates: Official student bulletins, student ID cards, tuition payment receipts, school certificates. |
| **AI integration** | `ai-assistant-agent` | `python-pro`, `systematic-debugging` | Pedagogical AI tutor, automatic exam question generator, student homework summarizer, parent transcript analysis. |
| **Security** | `judger-security` | `jwt-auth-hardening`, `rbac-permissions-matrix`, `rate-limit-helmet`, `api-security-best-practices`, `web-security-testing` | 5-actor role matrix (Root, SuperAdmin, Admin, Teacher/Staff, Student/Parent), dual-delete governance, token revocation, brute-force rate-limiting. |
| **Payment gateway & Multi-Caisse** | `domain-subagent-payments` | `payment-integration`, `stripe-integration`, `pci-compliance` | Online tuition payment gateways (Konnect, Flouci, Stripe), multi-caisse drawer reconciliation, split payment methods, POS transaction logs. |

---

## 2. Development Core Specialists (6 Agents)

| Technology | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **Prisma** | `backend-prisma-head` | `prisma-expert`, `prisma-schema-engineer`, `prisma-index-auditor`, `prisma-multidb-manager` | 68 Prisma models, 31 enums, relation graphs, schema migrations without data loss, composite indexing for tenant/establishment queries. |
| **NestJS** | `backend-modules-manager` | `nestjs-expert`, `backend-architect`, `backend-dev-guidelines`, `nest-route-organizer` | 52 NestJS feature modules, dependency injection, provider hierarchy, microservice boundaries, lifecycle hooks. |
| **NextJS** | `web-views` | `nextjs-app-router-builder`, `nextjs-app-router-patterns`, `nextjs-best-practices`, `react-nextjs-development` | 38 Next.js 16 App Router pages, Server Actions, route groups, layout hierarchy, streaming SSR, Turbopack builds. |
| **TailwindCSS** | `web-styling` | `tailwind-design-system`, `tailwind-patterns`, `tailwind-v4-nesting` | Tailwind CSS v4 design tokens, 5-color solid palette, typography scale, responsive breakpoints, dark/light theme switching. |
| **ThreeJS** | `ui-3d-specialist` | `ui-component`, `baseline-ui` | Interactive WebGL/Three.js 3D campus models, 3D classroom seat planning, immersive data visualization. |
| **TypeScript** | `judger-typescript` | `typescript-expert`, `typescript-pro`, `typescript-advanced-types`, `typescript-type-syncer` | Strict type safety, zero `any` policy, generic type constraints, automated synchronization between backend DTOs and frontend interfaces. |

---

## 3. Database Layer Specialist (1 Agent)

| Technology | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `backend-db-engineer` | `postgresql`, `postgres-best-practices`, `postgresql-optimization`, `sql-pro` | PostgreSQL 17 database administration, indexing strategies, transaction isolation levels, connection pooling, concurrency balance locking. |

---

## 4. Backend Layer Specialists (9 Agents)

| Backend Layer | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **Entities** | `backend-entities-manager` | `backend-dev-guidelines`, `clean-code` | Domain model entities, entity-to-Prisma mappers, domain event emission, immutability rules. |
| **DTOs** | `backend-dtos-manager` | `class-validator-expert`, `api-design-principles` | 100% `class-validator` coverage, nested object validation, pagination DTOs, type coercion decorators (`@Type`). |
| **Services** | `backend-services-manager` | `base-service-extender`, `clean-architecture-guardrails` | 52 Business logic services, multi-model transaction orchestration, soft-delete query scoping (`isDeleted: false`). |
| **Controllers** | `backend-controllers-manager` | `nest-route-organizer`, `api-design-principles` | 51 Controllers, REST endpoints, static-before-parameterized route ordering, HTTP status mapping, request routing. |
| **API** | `judger-api-contracts` | `openapi-swagger-decorator`, `api-patterns` | OpenAPI / Swagger specifications, response envelope formatting, HTTP status codes, API versioning. |
| **JWT** | `backend-access-control` | `jwt-auth-hardening`, `api-security-best-practices` | JWT token creation, refresh token rotation, payload claims (`tenantId`, `establishmentId`, `roles`), token blacklisting. |
| **Guard** | `backend-security` | `rbac-permissions-matrix`, `tenant-isolation-verifier` | `JwtAuthGuard`, `RolesGuard`, `EstablishmentGuard`, `@RequirePermissions()` decorator enforcement, Root-only permanent delete guards. |
| **Modules** | `backend-modules-orchestrator` | `nestjs-expert`, `backend-architect` | Module dependency graph, dynamic imports, global modules (Prisma, Config, Mail), circular dependency prevention. |
| **Spec** | `e2e-api-verifier` | `unit-testing-test-generate`, `tdd-workflow`, `vitest-skill` | Controller and service unit tests, E2E test suites, Prisma mocking, authentication flow testing. |

---

## 5. Frontend Layer Specialists (15 Agents)

| Frontend Layer | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **Middleware** | `web-middleware` | `nextjs-best-practices`, `tenant-isolation-verifier` | Next.js middleware, route protection, token validation, `x-tenant-id` and `x-establishment-id` request header injection. |
| **Types** | `web-types` | `typescript-type-syncer`, `typescript-expert` | TypeScript interfaces, enum definitions, API response shapes, strict props typing with zero `any`. |
| **API** | `web-apis` | `tanstack-query-expert`, `api-patterns` | Axios/fetch client configurations, SWR/TanStack Query custom hooks, request interceptors, optimistic updates. |
| **Context** | `web-contexts` | `react-context-manager`, `react-state-management` | `AuthContext`, `EstablishmentContext`, `ThemeContext`, `SocketContext`, company/establishment active state. |
| **Components** | `ui-component-architect` | `shadcn`, `ui-component`, `baseline-ui` | High-density `<DataTable>`, FilterBar, PaginationBar, Modals (`5xl`/`6xl`), Status badges, Dialogs, Dropdowns. |
| **Hooks** | `web-hooks` | `react-patterns`, `react-ui-patterns` | Reusable custom hooks: `useListPage`, `useDebounce`, `useEstablishment`, `useAuth`, `usePermissions`, `useMediaQuery`. |
| **Layouts** | `web-layouts` | `nextjs-app-router-builder`, `baseline-ui` | App shell layout, sidebar navigation, horizontal navigation bar overflow protection, dynamic breadcrumbs. |
| **Views - Layouts** | `web-views-layouts` | `nextjs-app-router-builder`, `tanstack-table-builder` | Standard view templates: Table mode, Card Grid mode, Split mode, Matrix mode, Detail Drawer mode. |
| **Views - Animations** | `web-views-animations` | `react-ui-patterns`, `baseline-ui` | Framer Motion route transitions, modal entry/exit animations, hover feedback, micro-interactions. |
| **Views - 3Ds** | `web-views-3d` | `ui-component`, `baseline-ui` | Integration of 3D canvas components into views, interactive campus models, WebGL fallbacks. |
| **Views - Skeleton** | `web-views-skeleton` | `react-ui-patterns`, `baseline-ui` | Content-matching shimmer skeletons for tables, KPI cards, form fields, and detail modals to eliminate layout shifts. |
| **Views - Loading** | `web-views-loading` | `react-ui-patterns`, `nextjs-best-practices` | Route-level `loading.tsx` skeletons, asynchronous button spinners, non-blocking background fetching indicators. |
| **i18n** | `i18n-multilingual-agent` | `next-intl-localizer`, `modern-javascript-patterns` | Trilingual dictionaries (`fr`, `en`, `ar`), Arabic RTL layout flip, currency, date & number formatting. |
| **Mobile Friendly** | `judger-ui-ux` | `flutter-build-responsive-layout`, `baseline-ui` | Mobile responsive navigation, touch target optimization, responsive tables with horizontal swipe, bottom action sheets. |
| **SEO Optimized** | `judger-performance` | `seo`, `seo-technical`, `pagespeed-enhancer`, `schema-markup` | Dynamic meta tags, OpenGraph previews, Core Web Vitals audit, SSR optimization, JSON-LD structured data. |

---

## 6. Master Plan v3.0 Active Execution Squad

For the immediate execution of Master Plan v3.0 (Zero-Error Hardening & Functional Harmony), the following 4 core execution agents and Judger Panel are activated:

| Agent Role | Codified Skills | Operational Mandate |
| :--- | :--- | :--- |
| **Agent A: DTO & Validation Shield** | `class-validator-expert`, `backend-dev-guidelines`, `backend-security-coder`, `clean-code` | Soften ValidationPipe (`forbidNonWhitelisted: false`) to stop 400 Bad Request crashes; align DTOs for Employees, Classes, Rooms, Academic Modules, Homework; auto-create employee contracts and child entities in services. |
| **Agent B: Auth & Core Services Specialist** | `jwt-auth-hardening`, `saas-multi-tenant`, `clean-architecture-guardrails` | Implement missing user profile (`PUT /auth/profile`) and password change (`PUT /auth/change-password`) in Auth controller; build `MeetingsModule` and `SaasFunctionsModule`. |
| **Agent C: Analytics & Stats Engine Architect** | `kpi-dashboard-design`, `sql-optimization-patterns`, `postgres-best-practices` | Replace client-side `limit=200` data crunching with real aggregated backend endpoints (`GET /dashboard/stats`, `GET /reports/stats`); secure subscription approval and system log resolution. |
| **Agent D: Frontend Data-Flow Refactorer** | `frontend-dev-guidelines`, `react-ui-patterns`, `tanstack-table-builder` | Fix `/community/messages` -> `/messages` and `/community/notifications` -> `/notifications` URLs; align form payloads with DTOs; wire `/dynamic-enums` dropdowns; replace silent catch blocks with error toasts. |
| **Judger Panel** | `judger-api-contracts`, `judger-security`, `judger-typescript`, `judger-ui-ux` | Multi-dimension gatekeeper verifying 100% build health, zero runtime errors, contract parity, and strict 5-color palette compliance. |

---

## 7. Operational Hardening & Production Squad (8 Agents)

| Operational Role | Agent Identifier | Assigned Skills | Exact Part in the Work |
| :--- | :--- | :--- | :--- |
| **DevOps & Observability** | `devops-platform-engineer` | `docker-expert`, `devops-deploy`, `ci-cd-and-automation`, `github`, `vercel-deployment`, `prometheus-configuration`, `grafana-dashboards`, `secrets-management`, `distributed-tracing` | Dockerfile, docker-compose, GitHub Actions CI, `/health` endpoints, Pino logging, Sentry error telemetry. |
| **Frontend Test Engineer** | `frontend-test-engineer` | `jest-skill`, `vitest-skill`, `playwright-skill`, `e2e-testing-patterns`, `tdd-workflow`, `react-best-practices` | Vitest + RTL component testing, Playwright E2E suites (5 critical journeys), hook testing, coverage reports. |
| **Accessibility Engineer** | `accessibility-a11y-engineer` | `frontend-ui-engineering`, `react-best-practices`, `baseline-ui`, `senior-frontend` | WCAG 2.1 AA compliance, keyboard navigation, axe-core automated audits, focus trap in modals, ARIA labeling. |
| **Performance Guardian** | `perf-budget-guardian` | `pagespeed-enhancer`, `web-performance-optimization`, `performance-engineer`, `react-component-performance`, `nextjs-best-practices` | Core Web Vitals optimization, bundle size budget (≤250KB gzip), dynamic imports, Three.js lazy-loading. |
| **Production Hardening SRE** | `production-hardening-sre` | `jwt-auth-hardening`, `rate-limit-helmet`, `api-security-best-practices`, `secrets-management`, `top-web-vulnerabilities` | OWASP hardening, rate limiting with Throttler/Helmet, secret encryption at rest, S3 upload migration, magic-byte sniffing. |
| **Tenant Isolation Pentester** | `tenant-isolation-pentester` | `tenant-isolation-verifier`, `tenant-switcher-governance`, `saas-multi-tenant`, `web-security-testing`, `idor-testing` | Pentest scripts against cross-tenant data leaks, JWT establishmentId validation, centralized `where.establishmentId` scoping. |
| **Seed Data Steward** | `seed-data-steward` | `prisma-expert`, `prisma-schema-engineer`, `database-migrations-sql-migrations`, `clean-code`, `data-quality-frameworks` | Idempotent multi-tenant seeding, parameterized seed credentials via env vars, transactional seeding safety. |
| **AI Feature Builder** | `ai-feature-builder` | `python-pro`, `systematic-debugging`, `modern-javascript-patterns` | Pedagogical AI tutor chat, automatic question generator, parent transcript analyzer, PII scrubbing, token usage caps. |


