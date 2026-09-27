---
name: saas-mvp-launcher
description: "Use when planning or building a SaaS MVP from scratch. Provides a structured roadmap covering tech stack, architecture, auth, payments, and launch checklist."
risk: safe
source: community
date_added: "2026-03-04"
---

# SaaS MVP Launcher

## Overview

This skill guides you through building a production-ready SaaS MVP in the shortest time possible. It covers everything from idea validation and tech stack selection to authentication, payments, database design, deployment, and launch — using modern, battle-tested tools.

## When to Use This Skill

- Use when starting a new SaaS product from scratch
- Use when you need to choose a tech stack for a web application
- Use when setting up authentication, billing, or database for a SaaS
- Use when you want a structured launch checklist before going live
- Use when designing the architecture of a multi-tenant application
- Use when doing a technical review of an existing early-stage SaaS

## Step-by-Step Guide

### 1. Validate Before You Build

Before writing any code, validate the idea:

```
Validation checklist:
- [ ] Can you describe the problem in one sentence?
- [ ] Who is the exact customer? (not "everyone")
- [ ] What do they pay for today to solve this?
- [ ] Have you talked to 5+ potential customers?
- [ ] Will they pay $X/month for your solution?
```

**Rule:** If you can't get 3 people to pre-pay or sign a letter of intent, don't build yet.

### 2. Choose Your Tech Stack

Recommended modern SaaS stack (2026):

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | Next.js 15 + TypeScript | Full-stack, great DX, Vercel deploy |
| Styling | Tailwind CSS + shadcn/ui | Fast, accessible, customizable |
| Backend | Next.js API Routes or tRPC | Type-safe, co-located |
| Database | PostgreSQL via Supabase | Reliable, scalable, free tier |
| ORM | Prisma or Drizzle | Type-safe queries, migrations |
| Auth | Clerk or NextAuth.js | Social login, session management |
| Payments | Stripe | Industry standard, great docs |
| Email | Resend + React Email | Modern, developer-friendly |
| Deployment | Vercel (frontend) + Railway (backend) | Zero-config, fast CI/CD |
| Monitoring | Sentry + PostHog | Error tracking + analytics |

### 3. Project Structure

```
my-saas/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth routes (login, signup)
│   ├── (dashboard)/        # Protected app routes
│   ├── (marketing)/        # Public landing pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── [feature]/          # Feature-specific components
├── lib/
│   ├── db.ts               # Database client (Prisma/Drizzle)
│   ├── stripe.ts           # Stripe client
│   └── email.ts            # Email client (Resend)
├── prisma/
│   └── schema.prisma       # Database schema
├── .env.local              # Environment variables
└── middleware.ts           # Auth middleware
```

### 4. Core Database Schema (Multi-tenant SaaS)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  createdAt     DateTime  @default(now())
  subscription  Subscription?
  workspaces    WorkspaceMember[]
}

model Workspace {
  id        String    @id @default(cuid())
  name      String
  slug      String    @unique
  plan      Plan      @default(FREE)
  members   WorkspaceMember[]
  createdAt DateTime  @default(now())
}

model Subscription {
  id                 String   @id @default(cuid())
  userId             String   @unique
  user               User     @relation(fields: [userId], references: [id])
  stripeCustomerId   String   @unique
  stripePriceId      String
  stripeSubId        String   @unique
  status             String   # active, canceled, past_due
  currentPeriodEnd   DateTime
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}
```

### 5. Authentication Setup (Clerk)

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/blog(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### 6. Stripe Integration (Subscriptions)

```typescript
// lib/stripe.ts
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

// Create checkout session
export async function createCheckoutSession(userId: string, priceId: string) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
    metadata: { userId },
  });
}
```

### 7. Pre-Launch Checklist

**Technical:**
- [ ] Authentication works (signup, login, logout, password reset)
- [ ] Payments work end-to-end (subscribe, cancel, upgrade)
- [ ] Error monitoring configured (Sentry)
- [ ] Environment variables documented
- [ ] Database backups configured
- [ ] Rate limiting on API routes
- [ ] Input validation with Zod on all forms
- [ ] HTTPS enforced, security headers set

**Product:**
- [ ] Landing page with clear value proposition
- [ ] Pricing page with 2-3 tiers
- [ ] Onboarding flow (first value in < 5 minutes)
- [ ] Email sequences (welcome, trial ending, payment failed)
- [ ] Terms of Service and Privacy Policy pages
- [ ] Support channel (email / chat)

**Marketing:**
- [ ] Domain purchased and configured
- [ ] SEO meta tags on all pages
- [ ] Google Analytics or PostHog installed
- [ ] Social media accounts created
- [ ] Product Hunt draft ready

## Best Practices

- ✅ **Do:** Ship a working MVP in 4-6 weeks maximum, then iterate based on feedback
- ✅ **Do:** Charge from day 1 — free users don't validate product-market fit
- ✅ **Do:** Build the "happy path" first, handle edge cases later
- ✅ **Do:** Use feature flags for gradual rollouts (e.g., Vercel Edge Config)
- ✅ **Do:** Monitor user behavior from launch day — not after problems arise
- ❌ **Don't:** Build every feature before talking to customers
- ❌ **Don't:** Optimize for scale before reaching $10k MRR
- ❌ **Don't:** Build a custom auth system — use Clerk, Auth.js, or Supabase Auth
- ❌ **Don't:** Skip the onboarding flow — it's where most SaaS lose users

## Troubleshooting

**Problem:** Users sign up but don't activate (don't use core feature)
**Solution:** Reduce steps to first value. Track with PostHog where users drop off in onboarding.

**Problem:** High churn after trial
**Solution:** Add an exit survey. Most churn is due to lack of perceived value, not price.

**Problem:** Stripe webhook events not received locally
**Solution:** Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**Problem:** Database migrations failing in production
**Solution:** Always run `prisma migrate deploy` (not `prisma migrate dev`) in production environments.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.


---

## 🛠️ Mandatory Workspace & Governance Directives (Upgraded Standards)

1. **Project Root & Paths**: Primary project workspace is E:\ToDo\BSofts.
2. **Auxiliary Workspace Directory Layout (.agents/bonus/)**:
   - **Scratch**: E:\ToDo\BSofts\.agents\bonus\Scratch — Scripting directory for creating temporary JS/TS scripts to inspect, verify, extract, or audit database & API components.
   - **Output**: E:\ToDo\BSofts\.agents\bonus\Scratch\Output — Deliverable directory for exported reports, data dumps, and persistent deliverables.
   - **Vault**: E:\ToDo\BSofts\.agents\bonus\Vault — Persistent memory vault directory holding state files (README.md, STATUS.md, PROGRESS.md, DECISIONS.md, DECLARATIONS.md, PROJECT.md).
3. **Autonomous Execution Loop (Rule #12)**:
   [1. Receive Goal] ➔ [2. Work & Implement] ➔ [3. Check & Verify (tsc --noEmit)] ➔ [4. Re-work if not complete] ➔ [5. Deliver Result] ➔ [6. Update Vault Memos].
4. **Autonomous Execution Permissions (Rule #13)**: Full permission to read, write, create, move files, and execute scripts/commands under E:\ToDo\BSofts without asking for permission.
5. **Mandatory Deletion Confirmation Guard (Rule #14)**: MUST ALWAYS ask user for explicit confirmation before deleting any file, folder, or database table.
6. **Zero Database Data Loss Guard (Rule #15)**: NEVER run commands that accept database data loss (such as prisma db push --accept-data-loss or forced table drops).


---

## 👥 BSOFT 5-Actor Role Architecture & Permanent Deletion Governance

1. **Developer (System Developer / Me)**:
   - Full platform god-mode access across all companies, tenants, endpoints, and system settings.
   - **Exclusive Permanent Deletion Authority**: Hard permanent deletes can ONLY be executed by Developer users. Non-developer delete requests default to soft-delete or throw ForbiddenException.
2. **Super Admin (Subscription Buyer & Owner)**:
   - Buyer of the SaaS subscription for his company/companies.
   - Full administrative control and feature configuration for his own company/companies only.
3. **Admin (Company Administrator)**:
   - Highest operational authority in a specific company right after Super Admin.
   - Manages day-to-day operations, employees, inventory, sales, and finance within his assigned company.
4. **Employees (Company Staff)**:
   - Operational staff members (Sales Agent, Accountant, Warehouse Manager) with role-restricted permissions.
5. **Third Parties (Clients & Providers / Suppliers)**:
   - External Customers (CLIENT) and Suppliers (FOURNISSEUR) operating in **Spectator Mode** — consult-only access restricted strictly to their own related records.

7. **Permanent Recursive File System Access Guarantee (Rule #16)**: Permanent, unrestricted, recursive read, write, create, and move permissions across all files, directories, subdirectories, and nested paths under E:\ToDo\BSofts at all times without asking for confirmation.
