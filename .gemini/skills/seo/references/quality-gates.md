# Content Quality Gates

## Minimum Word Counts by Page Type

| Page Type | Min Words | Unique Content % | Notes |
|-----------|-----------|-----------------|-------|
| Homepage | 500 | 100% | Must clearly communicate value proposition |
| Service / Feature Page | 800 | 100% | Detailed explanation of offering |
| Location (Primary) | 600 | 60%+ | City headquarters or main service area |
| Location (Secondary) | 500 | 40%+ | Satellite locations |
| Blog Post | 1,500 | 100% | In-depth, valuable content |
| Product Page | 400 | 80%+ | Unique descriptions, specs |
| Category Page | 400 | 100% | Unique intro, not just product listings |
| About Page | 400 | 100% | Company story, team, values |
| Landing Page | 600 | 100% | Focused conversion content |
| FAQ Page | 800 | 100% | Comprehensive Q&A |

---

## Location Page Thresholds

### Warning Level (30+ pages)
- ⚠️ **WARNING** at 30+ location pages
- Enforce 60%+ unique content per page
- Content must include:
  - Unique local information (landmarks, neighborhoods)
  - Location-specific services or offerings
  - Local team or staff information
  - Genuine customer testimonials from that area

### Hard Stop (50+ pages)
- 🛑 **HARD STOP** at 50+ location pages
- Require explicit user justification
- Must demonstrate:
  - Legitimate business presence in each location
  - Unique content strategy for each page
  - Local signals (Google Business Profile, local reviews)

### Why This Matters
Google's doorway page algorithm penalizes programmatic location pages with thin/duplicate content. Signs of doorway pages:
- Only city/state name changed between pages
- No unique local information
- No local business signals
- Keyword-stuffed URLs

---

## Safe vs. Risky Programmatic Pages

### Safe at Scale ✅
| Page Type | Why It's Safe |
|-----------|---------------|
| Integration pages | Real setup documentation, unique technical content |
| Template/tool pages | Downloadable assets, unique functionality |
| Glossary pages | 200+ word unique definitions |
| Product pages | Unique specs, images, reviews |
| User profile pages | User-generated unique content |

### Penalty Risk ❌
| Page Type | Why It's Risky |
|-----------|----------------|
| Location pages with only city swapped | Duplicate content, doorway pages |
| "Best [tool] for [industry]" | Often thin, no industry-specific value |
| "[Competitor] alternative" | Requires genuine comparison data |
| AI-generated mass content | No unique value, E-E-A-T failure |

---

## Title Tag Requirements

| Aspect | Requirement |
|--------|-------------|
| Minimum length | 30 characters |
| Maximum length | 60 characters (Google truncates ~60) |
| Primary keyword | Near the beginning |
| Brand name | At end (if included) |
| Uniqueness | Each page must have unique title |

### Good Examples
- "Emergency Plumbing Services in Austin | ABC Plumbing"
- "How to Fix a Leaky Faucet: Step-by-Step Guide"
- "Enterprise SEO Software | Comprehensive Platform"

### Bad Examples
- "Home" (too short, not descriptive)
- "Best Plumbing Services for All Your Plumbing Needs in Austin Texas and Surrounding Areas" (too long)
- "ABC Plumbing - Plumbing - Plumber - Plumbing Services" (keyword stuffing)

---

## Meta Description Requirements

| Aspect | Requirement |
|--------|-------------|
| Minimum length | 120 characters |
| Maximum length | 160 characters (Google truncates ~155-160) |
| Call-to-action | Include compelling CTA |
| Primary keyword | Include naturally |
| Uniqueness | Each page must have unique description |

---

## Image Alt Text Requirements

| Aspect | Requirement |
|--------|-------------|
| Required on | All non-decorative images |
| Length | 10-125 characters |
| Content | Describe the image content, not "image" or filename |
| Keywords | Include naturally where relevant |
| Decorative images | Use `alt=""` or `role="presentation"` |

### Good Examples
- "Professional plumber repairing kitchen sink faucet"
- "Red 2024 Toyota Camry sedan front view"
- "Team meeting in modern office conference room"

### Bad Examples
- "image.jpg" (filename, not description)
- "plumber plumbing plumber services" (keyword stuffing)
- "Click here" (not descriptive)

---

## Internal Linking Guidelines

| Page Type | Internal Links Target |
|-----------|----------------------|
| Blog post (1,500+ words) | 5-10 internal links |
| Service page | 3-5 internal links |
| Category page | Links to all child pages |
| Product page | 2-4 internal links |

### Anchor Text Rules
- Use descriptive anchor text (not "click here")
- Vary anchor text (don't always use exact match keywords)
- Link to relevant, related content
- Ensure no orphan pages (every page linked from at least one other page)

---

## Content Freshness Signals

| Content Type | Update Frequency |
|--------------|------------------|
| News/current events | Within hours/days |
| Blog posts (evergreen) | Review annually |
| Product pages | When specs change |
| Service pages | Review quarterly |
| Company info | When changes occur |

### Required Elements
- Publication date visible (for articles/blogs)
- Last updated date (if significantly revised)
- Changelog for major updates (optional but good)


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
