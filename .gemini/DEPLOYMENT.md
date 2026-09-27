# BSofts-School — Production Deployment & Environment Guide

> Production-grade architecture documentation for Neon PostgreSQL, Render Backend, and Vercel Frontend.  
> **Last Verified**: 2026-09-22

---

## 1. Infrastructure Overview

```mermaid
flowchart LR
    subgraph Cloud Infrastructure
        Neon["Neon Cloud PostgreSQL<br>US-East-2 Pooler<br>68 Tables Synced"]
        Render["Render Web Service<br>Node.js 24 / NestJS<br>https://bsofts-school.onrender.com"]
        Vercel["Vercel Edge Network<br>Next.js 16.3.4 (Turbopack)<br>https://bsofts-school.vercel.app"]
    end
    
    subgraph Local Development
        DevBack["Local NestJS<br>http://localhost:3025"]
        DevFront["Local Next.js<br>http://localhost:3026"]
    end

    Neon <--> Render
    Neon <--> DevBack
    Render <--> Vercel
    DevBack <--> DevFront
```

---

## 2. Environment Variables & Connection Details

### Database (Neon PostgreSQL)
* **Connection String**:  
  `postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require`
* **Schema Sync Command**: `npm run db:push:neon` (executes `scripts/sync-neon.ts --push` without data loss).
* **Database State**: 68 tables, 45 domain entities with full audit (`createdBy`, `updatedBy`) and soft-delete (`isDeleted`, `deletedAt`, `deletedBy`) fields.

### Backend (Render Web Service)
* **Production URL**: `https://bsofts-school.onrender.com`
* **Port**: Listens on `0.0.0.0:${PORT || 3025}`
* **Environment Variables**:
  ```env
  NODE_ENV=production
  DATABASE_URL=postgresql://neondb_owner:npg_ItvFmO5Cw7ES@ep-broad-sunset-b4uaw37v-pooler.c-6.us-east-2.aws.neon.tech/bsofts_school?sslmode=require&channel_binding=require
  JWT_SECRET=bsofts-school-jwt-secret-2026-production-key
  JWT_EXPIRATION=7d
  FRONTEND_URL=https://bsofts-school.vercel.app
  CORS_ORIGIN=https://bsofts-school.vercel.app
  PORT=10000
  ```
* **Build Command**: `yarn` runs `postinstall: "prisma generate && nest build"`.
* **Start Command**: `node dist/main` (or `npm run start:prod`).
* **Swagger Documentation**: Available at `https://bsofts-school.onrender.com/swagger`.

### Frontend (Vercel)
* **Production URL**: `https://bsofts-school.vercel.app`
* **Framework**: Next.js 16.3.4 (App Router with Turbopack)
* **Environment Variables**:
  ```env
  NEXT_PUBLIC_API_URL=https://bsofts-school.onrender.com/api
  NEXT_PUBLIC_APP_NAME="BSofts School"
  NEXT_PUBLIC_APP_URL=https://bsofts-school.vercel.app
  ```
* **Auto-Discovery in `api.ts`**:
  If the browser hostname is not `localhost` or `127.0.0.1`, `getBaseUrl()` automatically routes requests to `https://bsofts-school.onrender.com/api`.

---

## 3. Local Development Setup

### Backend (Port 3025)
```powershell
cd e:\ReFactory\BSofts-School\backend
npm install
npm run start:dev
```
* Runs on `http://localhost:3025`.
* Swagger docs: `http://localhost:3025/swagger`.

### Frontend (Port 3026)
```powershell
cd e:\ReFactory\BSofts-School\frontend
npm install
npm run dev
```
* Runs on `http://localhost:3026`.

---

## 4. Deployment Protocol & Git Rules

> [!CAUTION]
> **Strict User Policy**: AI agents MUST NEVER run `git push`. All commits must remain local.
> The repository owner alone verifies changes and runs `git push origin main`.

### Release Workflow
1. Complete tasks and verify with `npm run build` (both backend and frontend).
2. Sync schema to Neon if required: `npm run db:push:neon`.
3. Commit locally: `git add . && git commit -m "feat(...): ..."`
4. User review & manual push:
   ```powershell
   git push origin main
   ```
5. Render and Vercel automatically trigger production builds from GitHub webhooks.
