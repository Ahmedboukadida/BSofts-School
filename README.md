# BSofts School - Enterprise Multi-Tenant School Management Platform

A modern, production-grade multi-tenant SaaS educational management platform built with NestJS 12, Next.js 16 (App Router), Tailwind CSS v4, Prisma 7, PostgreSQL, Redis, and LiveKit Cloud WebRTC.

---

## 🚀 Key Architectural Features

### 🏢 Multi-Tenant Architecture & Data Isolation
- **Tenant & Establishment Hierarchy**: Multi-tier organization supporting multiple campuses/establishments per tenant.
- **Strict Data Scoping**: All domain tables and operations partitioned by `establishmentId` / `tenantId`.
- **Soft-Delete & Audit Lifecycle**: Standardized `isDeleted`, `deletedAt`, `deletedBy`, `createdBy`, `updatedBy` with full audit history tracking.

### 💳 Decoupled Dual-Gateway Payments
- **Level 1 — SaaS Platform Level (`PlatformPaymentConfig`)**: Decoupled ClicToPay (SMT / Monétique Tunisie) and Stripe (International) gateways for platform subscription plans and renewals.
- **Level 2 — Tenant School Level (`PaymentConfig`)**: Decoupled ClicToPay and Stripe gateways for tuition fees, inscription, cafeteria, and transport.
- **Adaptive Consumer Experience**: Direct checkout when 1 gateway is active; interactive modal selection when both gateways are active.

### 📹 LiveKit Cloud WebRTC Meetings Suite
- **Interactive Virtual Classrooms & Councils**: Powered by LiveKit Cloud WebRTC (`@livekit/components-react`).
- **Deliberative Agenda Voting**: Real-time voting points (`YES`, `NO`, `ABSTAIN`) with instantaneous tallying.
- **Hand-Raise & Turn Management**: Real-time speaking requests with golden visual indicators.
- **Dynamic Configuration**: Managed via `PlatformSetting` with dynamic JWT token signing.

### 🧩 Modular High-Density DataTables
- 100% backward compatible modularized DataTable system in `frontend/src/components/ui/data-table/`:
  - `data-table-toolbar.tsx`: Multi-criteria filters, search, and density switches.
  - `data-table-pagination.tsx`: Reusable bottom navigation and page sizing.
  - `data-table-row-actions.tsx`: View, edit, soft-delete, and restore actions.
  - `data-table-modals.tsx`: Audit timeline modal, delete modal, CSV wizard.

### 🔍 Observability, Structured Logging & Health Probes
- **Structured Logging**: Zero raw `console.*` policy across all backend services via NestJS `Logger`.
- **Probes**:
  - `GET /health`: System uptime, timestamp, memory usage.
  - `GET /health/db`: PostgreSQL live ping (`SELECT 1`).
  - `GET /health/redis`: Cache ping, latency, and in-memory fallback detection.
  - `GET /health/liveness`: Kubernetes/Render container liveness probe.
  - `GET /health/readiness`: Aggregate database + cache readiness check.
- **Incident Resolution**: `PATCH /system-logs/:id/resolve` for permanent tracking of resolved issues.

### 📊 Server-Side Aggregations
- **Dashboard Stats**: `GET /dashboard/stats` pre-computes active students, teachers, classes, revenue, and attendance via SQL aggregations with 60s Redis caching.
- **Reports Stats**: `GET /reports/stats` pre-computes status breakdowns for charts without client-side `limit=200` downloads.

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Backend** | NestJS | 12.x | Modular REST API & WebSockets |
| **ORM** | Prisma | 7.x | Type-safe Database Mapping & Migrations |
| **Database** | PostgreSQL | 16 / 17 | Primary Relational Storage |
| **Cache & Realtime** | Redis / Socket.IO | 7.x | Key-Value Cache & Live Notifications |
| **WebRTC Video** | LiveKit Cloud | 2.x | Real-time audio/video conferencing |
| **Testing** | Vitest | 4.x | Fast, modern TypeScript testing suite |
| **Frontend** | Next.js (Turbopack) | 16.x | Server Components & App Router |
| **UI & Styling** | React 19 / Tailwind CSS | 4.x | Component primitives & 5-color palette |
| **State Management** | Zustand | 5.x | Client auth and establishment store |

---

## 🎨 Design System & Color Palette

Strict adherence to a solid 5-color palette with **zero gradients**:
- **Deep Navy**: `#242F40`
- **Charcoal / Anthracite**: `#363636`
- **Warm Ochre / Gold**: `#CCA43B`
- **Soft Light Grey**: `#E5E5E5`
- **Pure White**: `#FFFFFF`

---

## 📦 Containerization & Deployment

### Run with Docker Compose
```bash
# Clone the repository
git clone https://github.com/Ahmedboukadida/BSofts-School.git
cd BSofts-School

# Start full production stack
docker compose up -d --build
```
This boots:
- `postgres` (PostgreSQL 16 Alpine on port 5432)
- `redis` (Redis 7 Alpine on port 6379)
- `backend` (NestJS on port 3025)
- `frontend` (Next.js on port 3000)

### CI/CD Pipeline (`.github/workflows/ci.yml`)
Automated GitHub Actions quality gates on every push/PR to `main`:
1. **Backend CI**: Prisma schema validation, Prisma Client generation, TypeScript compilation, Vitest unit test suite (97 tests).
2. **Frontend CI**: Dependency audit, Static typecheck (`npx tsc --noEmit`), Next.js 16 production build.
3. **Docker Images**: Concurrent build verification for backend and frontend Dockerfiles.

---

## 💻 Local Development Setup

### Backend
```bash
cd backend
npm install
npx prisma generate
npm run seed
npm run start:dev
```
Backend runs at `http://localhost:3025/api` (Swagger docs at `/api/docs`).

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## 🧪 Testing

```bash
cd backend
npm test
```
Runs 14 test suites with 97 unit tests via Vitest.

---

## 📄 License
UNLICENSED — Private Software © BSofts School
