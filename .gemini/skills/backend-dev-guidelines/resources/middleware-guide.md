# Middleware Guide - Express Middleware Patterns

Complete guide to creating and using middleware in backend microservices.

## Table of Contents

- [Authentication Middleware](#authentication-middleware)
- [Audit Middleware with AsyncLocalStorage](#audit-middleware-with-asynclocalstorage)
- [Error Boundary Middleware](#error-boundary-middleware)
- [Validation Middleware](#validation-middleware)
- [Composable Middleware](#composable-middleware)
- [Middleware Ordering](#middleware-ordering)

---

## Authentication Middleware

### SSOMiddleware Pattern

**File:** `/form/src/middleware/SSOMiddleware.ts`

```typescript
export class SSOMiddlewareClient {
    static verifyLoginStatus(req: Request, res: Response, next: NextFunction): void {
        const token = req.cookies.refresh_token;

        if (!token) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        try {
            const decoded = jwt.verify(token, config.tokens.jwt);
            res.locals.claims = decoded;
            res.locals.effectiveUserId = decoded.sub;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}
```

---

## Audit Middleware with AsyncLocalStorage

### Excellent Pattern from Blog API

**File:** `/form/src/middleware/auditMiddleware.ts`

```typescript
import { AsyncLocalStorage } from 'async_hooks';

export interface AuditContext {
    userId: string;
    userName?: string;
    impersonatedBy?: string;
    sessionId?: string;
    timestamp: Date;
    requestId: string;
}

export const auditContextStorage = new AsyncLocalStorage<AuditContext>();

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
    const context: AuditContext = {
        userId: res.locals.effectiveUserId || 'anonymous',
        userName: res.locals.claims?.preferred_username,
        impersonatedBy: res.locals.isImpersonating ? res.locals.originalUserId : undefined,
        timestamp: new Date(),
        requestId: req.id || uuidv4(),
    };

    auditContextStorage.run(context, () => {
        next();
    });
}

// Getter for current context
export function getAuditContext(): AuditContext | null {
    return auditContextStorage.getStore() || null;
}
```

**Benefits:**
- Context propagates through entire request
- No need to pass context through every function
- Automatically available in services, repositories
- Type-safe context access

**Usage in Services:**
```typescript
import { getAuditContext } from '../middleware/auditMiddleware';

async function someOperation() {
    const context = getAuditContext();
    console.log('Operation by:', context?.userId);
}
```

---

## Error Boundary Middleware

### Comprehensive Error Handler

**File:** `/form/src/middleware/errorBoundary.ts`

```typescript
export function errorBoundary(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    // Determine status code
    const statusCode = getStatusCodeForError(error);

    // Capture to Sentry
    Sentry.withScope((scope) => {
        scope.setLevel(statusCode >= 500 ? 'error' : 'warning');
        scope.setTag('error_type', error.name);
        scope.setContext('error_details', {
            message: error.message,
            stack: error.stack,
        });
        Sentry.captureException(error);
    });

    // User-friendly response
    res.status(statusCode).json({
        success: false,
        error: {
            message: getUserFriendlyMessage(error),
            code: error.name,
        },
        requestId: Sentry.getCurrentScope().getPropagationContext().traceId,
    });
}

// Async wrapper
export function asyncErrorWrapper(
    handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}
```

---

## Composable Middleware

### withAuthAndAudit Pattern

```typescript
export function withAuthAndAudit(...authMiddleware: any[]) {
    return [
        ...authMiddleware,
        auditMiddleware,
    ];
}

// Usage
router.post('/:formID/submit',
    ...withAuthAndAudit(SSOMiddlewareClient.verifyLoginStatus),
    async (req, res) => controller.submit(req, res)
);
```

---

## Middleware Ordering

### Critical Order (Must Follow)

```typescript
// 1. Sentry request handler (FIRST)
app.use(Sentry.Handlers.requestHandler());

// 2. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Cookie parsing
app.use(cookieParser());

// 4. Auth initialization
app.use(SSOMiddleware.initialize());

// 5. Routes registered here
app.use('/api/users', userRoutes);

// 6. Error handler (AFTER routes)
app.use(errorBoundary);

// 7. Sentry error handler (LAST)
app.use(Sentry.Handlers.errorHandler());
```

**Rule:** Error handlers MUST be registered AFTER all routes!

---

**Related Files:**
- SKILL.md
- [routing-and-controllers.md](routing-and-controllers.md)
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
