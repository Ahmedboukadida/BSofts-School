<!-- Updated: 2026-02-07 -->
# Generic Business SEO Strategy Template

## Overview

This template applies to businesses that don't fit neatly into SaaS, local service, e-commerce, publisher, or agency categories. Customize based on your specific business model.

## Recommended Site Architecture

```
/
├── Home
├── /products (or /services)
│   ├── /product-1
│   ├── /product-2
│   └── ...
├── /solutions (if applicable)
│   ├── /solution-1
│   └── ...
├── /about
│   ├── /team
│   ├── /history
│   └── /values
├── /resources
│   ├── /blog
│   ├── /guides
│   ├── /faq
│   └── /glossary
├── /contact
├── /support
└── /legal
    ├── /privacy
    └── /terms
```

## Universal SEO Principles

### Every Page Should Have
- Unique title tag (30-60 chars)
- Unique meta description (120-160 chars)
- Single H1 matching page intent
- Logical heading hierarchy (H1→H2→H3)
- Internal links to related content
- Clear call-to-action

### Schema for All Sites
| Page Type | Schema Types |
|-----------|-------------|
| Homepage | Organization, WebSite |
| About | Organization, AboutPage |
| Contact | ContactPage |
| Blog | Article, BlogPosting |
| FAQ | (FAQPage only for gov/health) |
| Product/Service | Product or Service |

## Content Quality Standards

### Minimum Word Counts
| Page Type | Min Words |
|-----------|-----------|
| Homepage | 500 |
| Product/Service | 800 |
| Blog Post | 1,500 |
| About Page | 400 |
| Landing Page | 600 |

### E-E-A-T Essentials
1. **Experience**: Share real examples and case studies
2. **Expertise**: Display credentials and qualifications
3. **Authoritativeness**: Earn mentions and citations
4. **Trustworthiness**: Full contact info, policies visible

## Technical Foundations

### Must-Haves
- [ ] HTTPS enabled
- [ ] Mobile-responsive design
- [ ] robots.txt configured
- [ ] XML sitemap submitted
- [ ] Google Search Console verified
- [ ] Core Web Vitals passing (LCP <2.5s, INP <200ms, CLS <0.1)

### Should-Haves
- [ ] Structured data on key pages
- [ ] Internal linking strategy
- [ ] 404 error page optimized
- [ ] Redirect chains eliminated
- [ ] Image optimization (WebP, lazy loading)

## Content Priorities

### Phase 1: Foundation (weeks 1-4)
1. Homepage optimization
2. Core product/service pages
3. About and contact pages
4. Basic schema implementation

### Phase 2: Expansion (weeks 5-12)
1. Blog launch (2-4 posts/month)
2. FAQ page
3. Additional product/service pages
4. Internal linking audit

### Phase 3: Growth (weeks 13-24)
1. Consistent content publishing
2. Link building outreach
3. GEO optimization
4. Performance optimization

### Phase 4: Authority (months 7-12)
1. Thought leadership content
2. Original research
3. PR and media mentions
4. Advanced schema

## Key Metrics to Track

- Organic traffic (overall and by section)
- Keyword rankings (branded and non-branded)
- Conversion rate from organic
- Pages indexed
- Core Web Vitals scores
- Backlinks acquired

## Customization Points

Adjust this template based on:

1. **Business Model**: B2B vs B2C vs D2C
2. **Geographic Scope**: Local, national, or international
3. **Content Type**: Product-focused vs content-heavy
4. **Competition Level**: Niche vs competitive market
5. **Resources**: Budget and team capacity

## Generative Engine Optimization (GEO) Checklist

- [ ] Include clear, quotable facts and statistics that AI systems can extract and cite
- [ ] Use structured data (Schema.org) to help AI systems understand content
- [ ] Build topical authority through comprehensive content clusters
- [ ] Provide original data, research, or unique perspectives AI cannot find elsewhere
- [ ] Maintain consistent entity information (brand, people, products) across the web
- [ ] Structure content with clear headings, definitions, and step-by-step formats
- [ ] Consider adding an `llms.txt` file at site root (emerging convention for AI crawlers: Google treats it as a regular text file)
- [ ] Monitor AI citation across Google AI Overviews, ChatGPT, Perplexity, and Bing Copilot


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
