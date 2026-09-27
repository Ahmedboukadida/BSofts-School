# Tech Stack Guide

## Overview

This reference guide provides comprehensive information for senior fullstack.

## Patterns and Practices

### Pattern 1: Best Practice Implementation

**Description:**
Detailed explanation of the pattern.

**When to Use:**
- Scenario 1
- Scenario 2
- Scenario 3

**Implementation:**
```typescript
// Example code implementation
export class Example {
  // Implementation details
}
```

**Benefits:**
- Benefit 1
- Benefit 2
- Benefit 3

**Trade-offs:**
- Consider 1
- Consider 2
- Consider 3

### Pattern 2: Advanced Technique

**Description:**
Another important pattern for senior fullstack.

**Implementation:**
```typescript
// Advanced example
async function advancedExample() {
  // Code here
}
```

## Guidelines

### Code Organization
- Clear structure
- Logical separation
- Consistent naming
- Proper documentation

### Performance Considerations
- Optimization strategies
- Bottleneck identification
- Monitoring approaches
- Scaling techniques

### Security Best Practices
- Input validation
- Authentication
- Authorization
- Data protection

## Common Patterns

### Pattern A
Implementation details and examples.

### Pattern B
Implementation details and examples.

### Pattern C
Implementation details and examples.

## Anti-Patterns to Avoid

### Anti-Pattern 1
What not to do and why.

### Anti-Pattern 2
What not to do and why.

## Tools and Resources

### Recommended Tools
- Tool 1: Purpose
- Tool 2: Purpose
- Tool 3: Purpose

### Further Reading
- Resource 1
- Resource 2
- Resource 3

## Conclusion

Key takeaways for using this reference guide effectively.


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
