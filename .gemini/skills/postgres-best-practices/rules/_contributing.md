# Writing Guidelines for Postgres Rules

This document provides guidelines for creating effective Postgres best
practice rules that work well with AI agents and LLMs.

## Key Principles

### 1. Concrete Transformation Patterns

Show exact SQL rewrites. Avoid philosophical advice.

**Good:** "Use `WHERE id = ANY(ARRAY[...])` instead of
`WHERE id IN (SELECT ...)`" **Bad:** "Design good schemas"

### 2. Error-First Structure

Always show the problematic pattern first, then the solution. This trains agents
to recognize anti-patterns.

```markdown
**Incorrect (sequential queries):** [bad example]

**Correct (batched query):** [good example]
```

### 3. Quantified Impact

Include specific metrics. Helps agents prioritize fixes.

**Good:** "10x faster queries", "50% smaller index", "Eliminates N+1" 
**Bad:** "Faster", "Better", "More efficient"

### 4. Self-Contained Examples

Examples should be complete and runnable (or close to it). Include `CREATE TABLE`
if context is needed.

```sql
-- Include table definition when needed for clarity
CREATE TABLE users (
  id bigint PRIMARY KEY,
  email text NOT NULL,
  deleted_at timestamptz
);

-- Now show the index
CREATE INDEX users_active_email_idx ON users(email) WHERE deleted_at IS NULL;
```

### 5. Semantic Naming

Use meaningful table/column names. Names carry intent for LLMs.

**Good:** `users`, `email`, `created_at`, `is_active`
**Bad:** `table1`, `col1`, `field`, `flag`

---

## Code Example Standards

### SQL Formatting

```sql
-- Use lowercase keywords, clear formatting
CREATE INDEX CONCURRENTLY users_email_idx
  ON users(email)
  WHERE deleted_at IS NULL;

-- Not cramped or ALL CAPS
CREATE INDEX CONCURRENTLY USERS_EMAIL_IDX ON USERS(EMAIL) WHERE DELETED_AT IS NULL;
```

### Comments

- Explain _why_, not _what_
- Highlight performance implications
- Point out common pitfalls

### Language Tags

- `sql` - Standard SQL queries
- `plpgsql` - Stored procedures/functions
- `typescript` - Application code (when needed)
- `python` - Application code (when needed)

---

## When to Include Application Code

**Default: SQL Only**

Most rules should focus on pure SQL patterns. This keeps examples portable.

**Include Application Code When:**

- Connection pooling configuration
- Transaction management in application context
- ORM anti-patterns (N+1 in Prisma/TypeORM)
- Prepared statement usage

**Format for Mixed Examples:**

````markdown
**Incorrect (N+1 in application):**

```typescript
for (const user of users) {
  const posts = await db.query("SELECT * FROM posts WHERE user_id = $1", [
    user.id,
  ]);
}
```
````

**Correct (batch query):**

```typescript
const posts = await db.query("SELECT * FROM posts WHERE user_id = ANY($1)", [
  userIds,
]);
```

---

## Impact Level Guidelines

| Level | Improvement | Use When |
|-------|-------------|----------|
| **CRITICAL** | 10-100x | Missing indexes, connection exhaustion, sequential scans on large tables |
| **HIGH** | 5-20x | Wrong index types, poor partitioning, missing covering indexes |
| **MEDIUM-HIGH** | 2-5x | N+1 queries, inefficient pagination, RLS optimization |
| **MEDIUM** | 1.5-3x | Redundant indexes, query plan instability |
| **LOW-MEDIUM** | 1.2-2x | VACUUM tuning, configuration tweaks |
| **LOW** | Incremental | Advanced patterns, edge cases |

---

## Reference Standards

**Primary Sources:**

- Official Postgres documentation
- Supabase documentation
- Postgres wiki
- Established blogs (2ndQuadrant, Crunchy Data)

**Format:**

```markdown
Reference:
[Postgres Indexes](https://www.postgresql.org/docs/current/indexes.html)
```

---

## Review Checklist

Before submitting a rule:

- [ ] Title is clear and action-oriented
- [ ] Impact level matches the performance gain
- [ ] impactDescription includes quantification
- [ ] Explanation is concise (1-2 sentences)
- [ ] Has at least 1 **Incorrect** SQL example
- [ ] Has at least 1 **Correct** SQL example
- [ ] SQL uses semantic naming
- [ ] Comments explain _why_, not _what_
- [ ] Trade-offs mentioned if applicable
- [ ] Reference links included
- [ ] `npm run validate` passes
- [ ] `npm run build` generates correct output


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
