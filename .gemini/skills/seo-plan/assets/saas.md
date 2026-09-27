<!-- Updated: 2026-02-07 -->
# SaaS SEO Strategy Template

## Industry Characteristics

- Long sales cycles with multiple touchpoints
- Feature-focused decision making
- Comparison shopping behavior
- Heavy research phase before purchase
- Integration and ecosystem considerations

## Recommended Site Architecture

```
/
├── Home
├── /product (or /platform)
│   ├── /features
│   │   ├── /feature-1
│   │   ├── /feature-2
│   │   └── ...
│   ├── /integrations
│   │   ├── /integration-1
│   │   └── ...
│   └── /security
├── /solutions
│   ├── /by-industry
│   │   ├── /industry-1
│   │   └── ...
│   └── /by-use-case
│       ├── /use-case-1
│       └── ...
├── /pricing
├── /customers
│   ├── /case-studies
│   │   ├── /case-study-1
│   │   └── ...
│   └── /testimonials
├── /resources
│   ├── /blog
│   ├── /guides
│   ├── /webinars
│   ├── /templates
│   └── /glossary
├── /docs (or /help)
│   └── /api
├── /company
│   ├── /about
│   ├── /careers
│   ├── /press
│   └── /contact
└── /compare
    ├── /vs-competitor-1
    └── /vs-competitor-2
```

## Content Priorities

### High Priority Pages
1. Homepage (value proposition, social proof)
2. Features overview
3. Pricing page
4. Key integrations
5. Top 3-5 use case pages

### Medium Priority Pages
1. Individual feature pages
2. Industry solution pages
3. Case studies (2-3 detailed ones)
4. Comparison pages (vs competitors)

### Content Marketing Focus
1. Bottom-of-funnel: Comparison guides, ROI calculators
2. Middle-of-funnel: How-to guides, best practices
3. Top-of-funnel: Industry trends, educational content

## Schema Recommendations

| Page Type | Schema Types |
|-----------|-------------|
| Homepage | Organization, WebSite, SoftwareApplication |
| Product/Features | SoftwareApplication, Offer |
| Pricing | SoftwareApplication, Offer (with pricing) |
| Blog | Article, BlogPosting |
| Case Studies | Article, Organization (customer) |
| Documentation | TechArticle |

## Key Metrics to Track

- Organic traffic to pricing page
- Demo/trial signups from organic
- Blog → pricing page conversion
- Comparison page rankings
- Integration page performance

## Comparison & Alternative Pages

Comparison pages are among the highest-converting content types for SaaS, with conversion rates of **4-7%** vs. 0.5-1.8% for standard blog content (35.8% of marketers report comparison content performs "better than ever" per Intergrowth November 2025 survey).

**Recommended page types:**
- `/{product}-vs-{competitor}`: Direct 1:1 comparison
- `/{competitor}-alternative`: Targeting competitor brand searches
- `/compare/{category}`: Category comparison hub
- `/best-{category}-tools`: Roundup-style pages

**Best practices:**
- Include structured comparison tables with pricing, features, pros/cons
- Be factually accurate about competitors: verify claims regularly
- Include customer testimonials from users who switched
- Add FAQ schema for common comparison questions (valuable for AI search)
- Update regularly: stale comparison data damages credibility
- Cross-reference the `seo-competitor-pages` skill for detailed frameworks

**Legal considerations:**
- Nominative fair use generally permits competitor brand mentions for comparison purposes
- Do NOT imply endorsement or affiliation
- Do NOT make false or unverifiable claims about competitor products
- Different jurisdictions have different trademark laws: consult legal counsel

## Competitive Considerations

- Monitor competitor feature releases
- Track competitor content strategies
- Identify keyword gaps in feature coverage
- Watch for new comparison opportunities

## Generative Engine Optimization (GEO) for SaaS

- [ ] Include clear, structured feature comparisons that AI systems can parse and cite
- [ ] Use SoftwareApplication schema with complete feature lists and pricing
- [ ] Publish original benchmark data, case studies, and ROI metrics
- [ ] Build content clusters around key product categories and use cases
- [ ] Ensure integration pages have clear, quotable descriptions
- [ ] Structure pricing information in tables AI can extract
- [ ] Monitor AI citation across Google AI Overviews, ChatGPT, and Perplexity


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
