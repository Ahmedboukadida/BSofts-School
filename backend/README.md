# BSofts School - Backend API

Production-grade SaaS school management system API built with NestJS, Prisma ORM, PostgreSQL, Redis, and WebRTC LiveKit.

## Core Capabilities

- **Multi-Tenant Architecture**: Complete data isolation with `x-tenant-id` and `x-establishment-id` resolution via `TenantMiddleware` and `GlobalSecurityGuard`.
- **Dual Payment Gateways**:
  - **Stripe**: International multi-currency credit/debit card processing and subscription lifecycle webhook handling.
  - **ClicToPay**: Tunisian national e-Dinar and banking card payment processing with dedicated verification callbacks.
- **Real-Time Video & Collaboration**: LiveKit WebRTC video conferencing for academic meetings, turn requests, interactive voting, and screen sharing.
- **Enterprise Observability**:
  - Structured JSON logging (`{"level","message","context","timestamp"}`) with zero raw console emissions.
  - Health check probes: `/health` (liveness), `/health/ready` (readiness with DB & Redis ping), `/health/live`.
  - In-database audit trails (`audit_logs`) and system error triage (`system_logs`) with resolution workflows.
- **Server-Side Aggregations**: Authoritative SQL aggregations for `/dashboard/stats` and `/reports/stats` backed by Redis caching.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions matrix across root, tenant admins, directors, teachers, parents, and students.

## Technology Stack

- **Framework**: NestJS 10 (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache & Real-Time**: Redis (ioredis)
- **WebRTC**: LiveKit Server SDK
- **Security**: JWT authentication, Helmet security headers, Express rate limiting, bcrypt hashing
- **Testing**: Jest with 14 test suites and 97 unit tests

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation & Environment

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Apply Database Migrations (preserve existing data)
npx prisma migrate deploy
```

### Running the Server

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov
```

## Health Endpoints

- `GET /health`: Liveness probe for Kubernetes / Docker container health checks.
- `GET /health/ready`: Readiness probe verifying PostgreSQL database connection and Redis connectivity.
- `GET /health/live`: Lightweight process liveness verification.

## Architecture Guidelines

- **Zero Raw Console**: Always inject `AppLogger` service instead of calling `console.log` or `console.error`.
- **Tenant Scoping**: All operational tables (`students`, `teachers`, `classes`, etc.) require explicit `tenantId` and `establishmentId`.
- **Dual Payment Separation**: Never mix Stripe subscription logic with ClicToPay school fee collections. Keep schemas, webhooks, and controllers strictly decoupled.
