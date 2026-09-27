---
name: production-devops-containerization
description: 'Production containerization, Docker Compose orchestration, Vercel standalone vs serverless deployment conditioning, and GitHub Actions CI/CD pipeline standards.'
---

# Production DevOps & Containerization Standards

## 1. Docker Multi-Stage Builds

### Backend (`backend/Dockerfile`):
- **Base Image**: `node:22-alpine` with `libc6-compat` and `openssl`.
- **Stage 1 (`deps`)**: Installs dependencies with `npm ci`.
- **Stage 2 (`builder`)**: Runs `npx prisma generate && npm run build`.
- **Stage 3 (`runner`)**: Runs as non-root `nestjs` user (`uid: 1001`). Copies only production `node_modules` and compiled `dist/`.
- **Healthcheck**: In-container curl probe hitting `/health` on 30s interval with 3 retries.

### Frontend (`frontend/Dockerfile`):
- **Base Image**: `node:22-alpine` with `libc6-compat`.
- **Stage 1 (`deps`)**: Installs dependencies with `npm ci`.
- **Stage 2 (`builder`)**: Sets `ENV BUILD_STANDALONE=true` and runs `npm run build`.
- **Stage 3 (`runner`)**: Copies standalone build artifacts:
  - `.next/standalone`
  - `.next/static` into `.next/standalone/.next/static`
  - `public` into `.next/standalone/public`
- **Runner Execution**: `node server.js` as non-root `nextjs` user (`uid: 1001`).

## 2. Vercel vs Docker Standalone Rule

> [!CAUTION]
> **Vercel CLI Build Failure Prevention**:
> Next.js 16 + Turbopack on Vercel CLI crashes with:
> `Error: ENOENT: no such file or directory, open '/vercel/path0/frontend/.next/next-server.js.nft.json'`
> when `output: 'standalone'` is unconditionally set in `next.config.ts`.
>
> **The Solution**:
> Always condition standalone mode based on build target:
> ```typescript
> const isStandalone = process.env.BUILD_STANDALONE === 'true' && !process.env.VERCEL;
>
> const nextConfig: NextConfig = {
>   ...(isStandalone ? { output: 'standalone' } : {}),
> };
> ```
> This ensures Vercel receives standard serverless bundles while Docker builds receive standalone bundles.

## 3. Local Multi-Container Stack (`docker-compose.yml`)

Services:
1. `postgres`: PostgreSQL 16 Alpine with persistent volume `postgres_data` and healthcheck `pg_isready`.
2. `redis`: Redis 7 Alpine with persistent volume `redis_data` and healthcheck `redis-cli ping`.
3. `backend`: NestJS production image waiting for healthy PostgreSQL and Redis. Port 3025.
4. `frontend`: Next.js production image waiting for healthy backend. Port 3000.
All services share isolated bridge network `bsofts-network`.

## 4. GitHub Actions CI/CD Gates (`.github/workflows/ci.yml`)

1. **Job 1 (Backend CI)**: Prisma validation, Prisma generate, TypeScript compile (`npm run build`), Vitest unit tests (97 tests).
2. **Job 2 (Frontend CI)**: Static typecheck (`npx tsc --noEmit`), Next.js 16 build (`npm run build`).
3. **Job 3 (Docker Verify)**: Concurrently builds backend and frontend Dockerfiles via `docker/build-push-action@v6`.
