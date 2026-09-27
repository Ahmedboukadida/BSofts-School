<!-- Updated: 2026-02-07 -->
# Agency/Consultancy SEO Strategy Template

## Industry Characteristics

- Service-based, high-value transactions
- Expertise and trust are paramount
- Long consideration cycles
- Portfolio/case study driven decisions
- Relationship-based sales
- Niche specialization benefits

## Recommended Site Architecture

```
/
├── Home
├── /services
│   ├── /service-1
│   │   ├── /sub-service-1
│   │   └── ...
│   └── /service-2
├── /industries
│   ├── /industry-1
│   ├── /industry-2
│   └── ...
├── /work (or /case-studies)
│   ├── /case-study-1
│   ├── /case-study-2
│   └── ...
├── /about
│   ├── /team
│   │   ├── /team-member-1
│   │   └── ...
│   ├── /culture
│   └── /careers
├── /insights (or /blog)
│   ├── /articles
│   ├── /guides
│   ├── /webinars
│   └── /podcasts
├── /contact
├── /process
└── /faq
```

## Schema Recommendations

| Page Type | Schema Types |
|-----------|-------------|
| Homepage | Organization, ProfessionalService |
| Service Page | Service, ProfessionalService |
| Case Study | Article, Organization (client) |
| Team Member | Person, ProfilePage |
| Blog | Article, BlogPosting |

### ProfessionalService Schema Example
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Agency Name",
  "description": "What the agency does",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Agency St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345"
  },
  "telephone": "+1-555-555-5555",
  "areaServed": "National",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Service 1"
        }
      }
    ]
  }
}
```

## E-E-A-T Requirements

### Team Pages Must Include
- Professional headshots
- Detailed bios with credentials
- Industry experience
- Speaking engagements
- Publications
- Social profiles

### Case Studies Must Include
- Client name (with permission) or industry
- Challenge/problem statement
- Approach/methodology
- Results with specific metrics
- Timeline
- Testimonial quote

## Content Priorities

### High Priority
1. Service pages (detailed, specific)
2. Industry pages (vertical expertise)
3. 3-5 detailed case studies
4. Team/leadership pages

### Medium Priority
1. Methodology/process page
2. Blog with thought leadership
3. Comparison content (vs alternatives)
4. FAQ page

### Thought Leadership Topics
- Industry trend analysis
- How-to guides (non-competitive)
- Original research/surveys
- Event recaps and insights
- Expert interviews
- Tool/technology reviews

## Content Strategy

### Service Pages (min 800 words)
- Clear value proposition
- Methodology overview
- Deliverables list
- Relevant case studies
- Team members who deliver this service
- CTA to schedule consultation

### Industry Pages (min 800 words)
- Industry-specific challenges
- How you solve them differently
- Relevant case studies
- Industry credentials/experience
- Client logos (with permission)

### Case Studies (min 1,000 words)
- Executive summary
- Client background
- Challenge details
- Solution approach
- Implementation process
- Measurable results
- Client testimonial
- Related services/CTA

## Key Metrics to Track

- Organic traffic to service pages
- Case study page views
- Contact form submissions from organic
- Time on page for key content
- Blog → service page conversion

## Generative Engine Optimization (GEO) for Agencies

- [ ] Publish original case studies with specific, citable metrics and results
- [ ] Use Person schema with sameAs links for all team members (builds entity authority)
- [ ] Use ProfilePage schema for team member pages
- [ ] Include clear, quotable expertise statements in service page descriptions
- [ ] Produce original industry research and surveys AI systems can cite
- [ ] Structure thought leadership content with clear headings and extractable insights
- [ ] Maintain consistent agency entity information across directories, social profiles, and industry sites
- [ ] Monitor AI citation in ChatGPT, Perplexity, and Google AI Overviews for brand and key service terms


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
