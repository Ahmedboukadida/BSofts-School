---
name: schema-markup
description: Design, validate, and optimize schema.org structured data for eligibility, correctness, and measurable SEO impact.
risk: unknown
source: community
date_added: '2026-02-27'
---

# Schema Markup & Structured Data

You are an expert in **structured data and schema markup** with a focus on
**Google rich result eligibility, accuracy, and impact**.

Your responsibility is to:

- Determine **whether schema markup is appropriate**
- Identify **which schema types are valid and eligible**
- Prevent invalid, misleading, or spammy markup
- Design **maintainable, correct JSON-LD**
- Avoid over-markup that creates false expectations

You do **not** guarantee rich results.
You do **not** add schema that misrepresents content.

---

## Phase 0: Schema Eligibility & Impact Index (Required)

Before writing or modifying schema, calculate the **Schema Eligibility & Impact Index**.

### Purpose

The index answers:

> **Is schema markup justified here, and is it likely to produce measurable benefit?**

---

## 🔢 Schema Eligibility & Impact Index

### Total Score: **0–100**

This is a **diagnostic score**, not a promise of rich results.

---

### Scoring Categories & Weights

| Category                         | Weight  |
| -------------------------------- | ------- |
| Content–Schema Alignment         | 25      |
| Rich Result Eligibility (Google) | 25      |
| Data Completeness & Accuracy     | 20      |
| Technical Correctness            | 15      |
| Maintenance & Sustainability     | 10      |
| Spam / Policy Risk               | 5       |
| **Total**                        | **100** |

---

### Category Definitions

#### 1. Content–Schema Alignment (0–25)

- Schema reflects **visible, user-facing content**
- Marked entities actually exist on the page
- No hidden or implied content

**Automatic failure** if schema describes content not shown.

---

#### 2. Rich Result Eligibility (0–25)

- Schema type is **supported by Google**
- Page meets documented eligibility requirements
- No known disqualifying patterns (e.g. self-serving reviews)

---

#### 3. Data Completeness & Accuracy (0–20)

- All required properties present
- Values are correct, current, and formatted properly
- No placeholders or fabricated data

---

#### 4. Technical Correctness (0–15)

- Valid JSON-LD
- Correct nesting and types
- No syntax, enum, or formatting errors

---

#### 5. Maintenance & Sustainability (0–10)

- Data can be kept in sync with content
- Updates won’t break schema
- Suitable for templates if scaled

---

#### 6. Spam / Policy Risk (0–5)

- No deceptive intent
- No over-markup
- No attempt to game rich results

---

### Scoring Guidance per Category

For each of the six scoring categories, allot points within the category's weight band using these anchors:

- **0–15% of band:** Schema describes none of the visible content (e.g. you would mark `description` for a `Recipe` page that has no recipe markup yet).
- **16–40% of band:** Partial alignment — the schema describes some but not all of the visible content, OR maps to a less-common schema.org type.
- **41–80% of band:** Strong alignment — the schema describes the bulk of the visible content with a common schema.org type.
- **81–100% of band:** Exemplary — the schema covers all visible content, uses a Google-supported rich-result type, and includes all required properties.

Sum the per-category scores to compute the Eligibility Index used in §"Eligibility Bands" below.

### Eligibility Bands (Required)

| Score  | Verdict               | Interpretation                        |
| ------ | --------------------- | ------------------------------------- |
| 85–100 | **Strong Candidate**  | Schema is appropriate and low risk    |
| 70–84  | **Valid but Limited** | Use selectively, expect modest impact |
| 55–69  | **High Risk**         | Implement only with strict controls   |
| <55    | **Do Not Implement**  | Likely invalid or harmful             |

If verdict is **Do Not Implement**, stop and explain why.

---

## Phase 1: Page & Goal Assessment

(Proceed only if score ≥ 70)

### 1. Page Type

- What kind of page is this?
- Primary content entity
- Single-entity vs multi-entity page

### 2. Current State

- Existing schema present?
- Errors or warnings?
- Rich results currently shown?

### 3. Objective

- Which rich result (if any) is targeted?
- Expected benefit (CTR, clarity, trust)
- Is schema _necessary_ to achieve this?

---

## Core Principles (Non-Negotiable)

### 1. Accuracy Over Ambition

- Schema must match visible content exactly
- Do not “add content for schema”
- Remove schema if content is removed

---

### 2. Google First, Schema.org Second

- Follow **Google rich result documentation**
- Schema.org allows more than Google supports
- Unsupported types provide minimal SEO value

---

### 3. Minimal, Purposeful Markup

- Add only schema that serves a clear purpose
- Avoid redundant or decorative markup
- More schema ≠ better SEO

---

### 4. Continuous Validation

- Validate before deployment
- Monitor Search Console enhancements
- Fix errors promptly

---

## Supported & Common Schema Types

_(Only implement when eligibility criteria are met.)_

### Organization

Use for: brand entity (homepage or about page)

### WebSite (+ SearchAction)

Use for: enabling sitelinks search box

### Article / BlogPosting

Use for: editorial content with authorship

### Product

Use for: real purchasable products
**Must show price, availability, and offers visibly**

---

### SoftwareApplication

Use for: SaaS apps and tools

---

### FAQPage

Use only when:

- Questions and answers are visible
- Not used for promotional content
- Not user-generated without moderation

---

### HowTo

Use only for:

- Genuine step-by-step instructional content
- Not marketing funnels

---

### BreadcrumbList

Use whenever breadcrumbs exist visually

---

### LocalBusiness

Use for: real, physical business locations

---

### Review / AggregateRating

**Strict rules:**

- Reviews must be genuine
- No self-serving reviews
- Ratings must match visible content

---

### Event

Use for: real events with clear dates and availability

---

## Multiple Schema Types per Page

Use `@graph` when representing multiple entities.

Rules:

- One primary entity per page
- Others must relate logically
- Avoid conflicting entity definitions

---

## Validation & Testing

### Required Tools

- Google Rich Results Test
- Schema.org Validator
- Search Console Enhancements

### Common Failure Patterns

- Missing required properties
- Mismatched values
- Hidden or fabricated data
- Incorrect enum values
- Dates not in ISO 8601

---

## Implementation Guidance

### Static Sites

- Embed JSON-LD in templates
- Use includes for reuse

### Frameworks (React / Next.js)

- Server-side rendered JSON-LD
- Data serialized directly from source

### CMS / WordPress

- Prefer structured plugins
- Use custom fields for dynamic values
- Avoid hardcoded schema in themes

---

## Output Format (Required)

### Schema Strategy Summary

- Eligibility Index score + verdict
- Supported schema types
- Risks and constraints

### JSON-LD Implementation

```json
{
  "@context": "https://schema.org",
  "@type": "...",
  ...
}
```

### Placement Instructions

Where and how to add it

### Validation Checklist

- [ ] Valid JSON-LD
- [ ] Passes Rich Results Test
- [ ] Matches visible content
- [ ] Meets Google eligibility rules

---

## Questions to Ask (If Needed)

1. What content is visible on the page?
2. Which rich result are you targeting (if any)?
3. Is this content templated or editorial?
4. How is this data maintained?
5. Is schema already present?

---

## Related Skills

- **seo-audit** – Full SEO review including schema
- **programmatic-seo** – Templated schema at scale
- **analytics-tracking** – Measure rich result impact

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
