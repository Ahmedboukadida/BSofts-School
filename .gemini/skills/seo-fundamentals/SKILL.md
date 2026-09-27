---
name: seo-fundamentals
description: Core principles of SEO including E-E-A-T, Core Web Vitals, technical foundations, content quality, and how modern search engines evaluate pages.
risk: safe
source: community
date_added: '2026-02-27'
---

# SEO Fundamentals

> **Foundational principles for sustainable search visibility.**
> This skill explains _how search engines evaluate quality_, not tactical shortcuts.

---

## 1. E-E-A-T (Quality Evaluation Framework)

E-E-A-T is **not a direct ranking factor**.
It is a framework used by search engines to **evaluate content quality**, especially for sensitive or high-impact topics.

| Dimension             | What It Represents                 | Common Signals                                      |
| --------------------- | ---------------------------------- | --------------------------------------------------- |
| **Experience**        | First-hand, real-world involvement | Original examples, lived experience, demonstrations |
| **Expertise**         | Subject-matter competence          | Credentials, depth, accuracy                        |
| **Authoritativeness** | Recognition by others              | Mentions, citations, links                          |
| **Trustworthiness**   | Reliability and safety             | HTTPS, transparency, accuracy                       |

> Pages competing in the same space are often differentiated by **trust and experience**, not keywords.

---

## 2. Core Web Vitals (Page Experience Signals)

Core Web Vitals measure **how users experience a page**, not whether it deserves to rank.

| Metric  | Target  | What It Reflects    |
| ------- | ------- | ------------------- |
| **LCP** | < 2.5s  | Loading performance |
| **INP** | < 200ms | Interactivity       |
| **CLS** | < 0.1   | Visual stability    |

**Important context:**

- CWV rarely override poor content
- They matter most when content quality is comparable
- Failing CWV can _hold back_ otherwise good pages

---

## 3. Technical SEO Principles

Technical SEO ensures pages are **accessible, understandable, and stable**.

### Crawl & Index Control

| Element           | Purpose                |
| ----------------- | ---------------------- |
| XML sitemaps      | Help discovery         |
| robots.txt        | Control crawl access   |
| Canonical tags    | Consolidate duplicates |
| HTTP status codes | Communicate page state |
| HTTPS             | Security and trust     |

### Performance & Accessibility

| Factor                 | Why It Matters                |
| ---------------------- | ----------------------------- |
| Page speed             | User satisfaction             |
| Mobile-friendly design | Mobile-first indexing         |
| Clean URLs             | Crawl clarity                 |
| Semantic HTML          | Accessibility & understanding |

---

## 4. Content SEO Principles

### Page-Level Elements

| Element          | Principle                    |
| ---------------- | ---------------------------- |
| Title tag        | Clear topic + intent         |
| Meta description | Click relevance, not ranking |
| H1               | Page’s primary subject       |
| Headings         | Logical structure            |
| Alt text         | Accessibility and context    |

### Content Quality Signals

| Dimension   | What Search Engines Look For |
| ----------- | ---------------------------- |
| Depth       | Fully answers the query      |
| Originality | Adds unique value            |
| Accuracy    | Factually correct            |
| Clarity     | Easy to understand           |
| Usefulness  | Satisfies intent             |

---

## 5. Structured Data (Schema)

Structured data helps search engines **understand meaning**, not boost rankings directly.

| Type           | Purpose                |
| -------------- | ---------------------- |
| Article        | Content classification |
| Organization   | Entity identity        |
| Person         | Author information     |
| FAQPage        | Q&A clarity            |
| Product        | Commerce details       |
| Review         | Ratings context        |
| BreadcrumbList | Site structure         |

> Schema enables eligibility for rich results but does not guarantee them.

---

## 6. AI-Assisted Content Principles

Search engines evaluate **output quality**, not authorship method.

### Effective Use

- AI as a drafting or research assistant
- Human review for accuracy and clarity
- Original insights and synthesis
- Clear accountability

### Risky Use

- Publishing unedited AI output
- Factual errors or hallucinations
- Thin or duplicated content
- Keyword-driven text with no value

---

## 7. Relative Importance of SEO Factors

There is **no fixed ranking factor order**.
However, when competing pages are similar, importance tends to follow this pattern:

| Relative Weight | Factor                      |
| --------------- | --------------------------- |
| Highest         | Content relevance & quality |
| High            | Authority & trust signals   |
| Medium          | Page experience (CWV, UX)   |
| Medium          | Mobile optimization         |
| Baseline        | Technical accessibility     |

> Technical SEO enables ranking; content quality earns it.

---

## 8. Measurement & Evaluation

SEO fundamentals should be validated using **multiple signals**, not single metrics.

| Area        | What to Observe            |
| ----------- | -------------------------- |
| Visibility  | Indexed pages, impressions |
| Engagement  | Click-through, dwell time  |
| Performance | CWV field data             |
| Coverage    | Indexing status            |
| Authority   | Mentions and links         |

---

> **Key Principle:**
> Sustainable SEO is built on _useful content_, _technical clarity_, and _trust over time_.
> There are no permanent shortcuts.

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.

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
