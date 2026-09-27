# Database Patterns - Prisma Best Practices

Complete guide to database access patterns using Prisma in backend microservices.

## Table of Contents

- [PrismaService Usage](#prismaservice-usage)
- [Repository Pattern](#repository-pattern)
- [Transaction Patterns](#transaction-patterns)
- [Query Optimization](#query-optimization)
- [N+1 Query Prevention](#n1-query-prevention)
- [Error Handling](#error-handling)

---

## PrismaService Usage

### Basic Pattern

```typescript
import { PrismaService } from '@project-lifecycle-portal/database';

// Always use PrismaService.main
const users = await PrismaService.main.user.findMany();
```

### Check Availability

```typescript
if (!PrismaService.isAvailable) {
    throw new Error('Prisma client not initialized');
}

const user = await PrismaService.main.user.findUnique({ where: { id } });
```

---

## Repository Pattern

### Why Use Repositories

✅ **Use repositories when:**
- Complex queries with joins/includes
- Query used in multiple places
- Need caching layer
- Want to mock for testing

❌ **Skip repositories for:**
- Simple one-off queries
- Prototyping (can refactor later)

### Repository Template

```typescript
export class UserRepository {
    async findById(id: string): Promise<User | null> {
        return PrismaService.main.user.findUnique({
            where: { id },
            include: { profile: true },
        });
    }

    async findActive(): Promise<User[]> {
        return PrismaService.main.user.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return PrismaService.main.user.create({ data });
    }
}
```

---

## Transaction Patterns

### Simple Transaction

```typescript
const result = await PrismaService.main.$transaction(async (tx) => {
    const user = await tx.user.create({ data: userData });
    const profile = await tx.userProfile.create({ data: { userId: user.id } });
    return { user, profile };
});
```

### Interactive Transaction

```typescript
const result = await PrismaService.main.$transaction(
    async (tx) => {
        const user = await tx.user.findUnique({ where: { id } });
        if (!user) throw new Error('User not found');

        return await tx.user.update({
            where: { id },
            data: { lastLogin: new Date() },
        });
    },
    {
        maxWait: 5000,
        timeout: 10000,
    }
);
```

---

## Query Optimization

### Use select to Limit Fields

```typescript
// ❌ Fetches all fields
const users = await PrismaService.main.user.findMany();

// ✅ Only fetch needed fields
const users = await PrismaService.main.user.findMany({
    select: {
        id: true,
        email: true,
        profile: { select: { firstName: true, lastName: true } },
    },
});
```

### Use include Carefully

```typescript
// ❌ Excessive includes
const user = await PrismaService.main.user.findUnique({
    where: { id },
    include: {
        profile: true,
        posts: { include: { comments: true } },
        workflows: { include: { steps: { include: { actions: true } } } },
    },
});

// ✅ Only include what you need
const user = await PrismaService.main.user.findUnique({
    where: { id },
    include: { profile: true },
});
```

---

## N+1 Query Prevention

### Problem: N+1 Queries

```typescript
// ❌ N+1 Query Problem
const users = await PrismaService.main.user.findMany(); // 1 query

for (const user of users) {
    // N queries (one per user)
    const profile = await PrismaService.main.userProfile.findUnique({
        where: { userId: user.id },
    });
}
```

### Solution: Use include or Batching

```typescript
// ✅ Single query with include
const users = await PrismaService.main.user.findMany({
    include: { profile: true },
});

// ✅ Or batch query
const userIds = users.map(u => u.id);
const profiles = await PrismaService.main.userProfile.findMany({
    where: { userId: { in: userIds } },
});
```

---

## Error Handling

### Prisma Error Types

```typescript
import { Prisma } from '@prisma/client';

try {
    await PrismaService.main.user.create({ data });
} catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (error.code === 'P2002') {
            throw new ConflictError('Email already exists');
        }

        // Foreign key constraint
        if (error.code === 'P2003') {
            throw new ValidationError('Invalid reference');
        }

        // Record not found
        if (error.code === 'P2025') {
            throw new NotFoundError('Record not found');
        }
    }

    // Unknown error
    Sentry.captureException(error);
    throw error;
}
```

---

**Related Files:**
- SKILL.md
- [services-and-repositories.md](services-and-repositories.md)
- [async-and-errors.md](async-and-errors.md)


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
