# BSofts-School — Domain Architecture Specifications

BSofts-School is architected around 5 core operational and strategic domains. Each domain specifies its business boundaries, data models, API endpoints, frontend views, and cross-cutting security contracts.

## Domain Map

```
+----------------------------------------------------------------------------------------------------+
|                                    1. SAAS PLATFORM DOMAIN                                         |
|  - Root Administration       - Multi-Tenant Provisioning   - Subscription Plans & Billing         |
|  - Level 1 Payment Gateway   - Global Audit & Logs         - Dynamic Platform Configuration       |
+----------------------------------------------------------------------------------------------------+
                                               │
                                               ▼
+----------------------------------------------------------------------------------------------------+
|                             2. ACADEMIC & INSTITUTION DOMAIN                                       |
|  - Establishments / Campuses - Academic Years              - Class Structures & Rooms             |
|  - Student & Teacher Enrolls - Dynamic Timetable Schedules - Academic Promotions                  |
+----------------------------------------------------------------------------------------------------+
                        │                                              │
                        ▼                                              ▼
+──────────────────────────────────────────────+      +──────────────────────────────────────────────+
│        3. PEDAGOGY & COMMUNITY DOMAIN        │      │          4. FINANCE & BILLING DOMAIN         │
│  - Homework & Assignment Submissions         │      │  - Tuition Fees & Invoicing Schedules        │
│  - Exams, Grades & Bulletins                 │      │  - School Caisse & Cash Transactions         │
│  - Student Daily Attendance                  │      │  - Level 2 Dual Payment Gateways:            │
│  - Real-Time LiveKit WebRTC Video Meetings   │      │    • Monétique Tunisie ClicToPay (TND)       │
│  - Agenda Voting & Deliberative Turns        │      │    • Stripe Multi-Currency Checkout          │
│  - Internal Messaging & Real-Time Toasts     │      │  - Transaction Reconciliation & Receipts     │
+──────────────────────────────────────────────+      +──────────────────────────────────────────────+
                                               │
                                               ▼
+----------------------------------------------------------------------------------------------------+
|                              5. SECURITY & OBSERVABILITY DOMAIN                                    |
|  - JWT Authentication & RBAC Permissions Matrix             - Tenant Middleware & Data Isolation   |
|  - DynamicEnums System Catalog                             - Dynamic SMTP Dispatch & Validation   |
|  - Health Probes (/health, /health/ready, /health/live)     - Structured JSON Logging (Zero-Raw)   |
|  - Zero Silent Catch Error Resilience Policy                - System Error Triage & Resolution     |
+----------------------------------------------------------------------------------------------------+
```

## Domain Documentation Directory

1. [`saas-platform-domain.md`](./saas-platform-domain.md): Tenant lifecycle, plan quotas, subscription checkout, platform logs.
2. [`academic-institution-domain.md`](./academic-institution-domain.md): Establishment hierarchy, academic calendar, rooms, schedules, promotions.
3. [`pedagogy-community-domain.md`](./pedagogy-community-domain.md): LMS homework, exams, LiveKit WebRTC conferencing, agenda voting, messaging.
4. [`finance-billing-domain.md`](./finance-billing-domain.md): Level 1 vs Level 2 dual payment gateways (ClicToPay + Stripe), caisse, student tuitions.
5. [`security-observability-domain.md`](./security-observability-domain.md): RBAC matrix, tenant isolation middleware, health probes, error resilience.
