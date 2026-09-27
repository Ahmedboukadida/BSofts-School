# Architecture Overview - Backend Services

Complete guide to the layered architecture pattern used in backend microservices.

## Table of Contents

- [Layered Architecture Pattern](#layered-architecture-pattern)
- [Request Lifecycle](#request-lifecycle)
- [Service Comparison](#service-comparison)
- [Directory Structure Rationale](#directory-structure-rationale)
- [Module Organization](#module-organization)
- [Separation of Concerns](#separation-of-concerns)

---

## Layered Architecture Pattern

### The Four Layers

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 1: ROUTES                    │
│  - Route definitions only           │
│  - Middleware registration          │
│  - Delegate to controllers          │
│  - NO business logic                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 2: CONTROLLERS               │
│  - Request/response handling        │
│  - Input validation                 │
│  - Call services                    │
│  - Format responses                 │
│  - Error handling                   │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 3: SERVICES                  │
│  - Business logic                   │
│  - Orchestration                    │
│  - Call repositories                │
│  - No HTTP knowledge                │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│  Layer 4: REPOSITORIES              │
│  - Data access abstraction          │
│  - Prisma operations                │
│  - Query optimization               │
│  - Caching                          │
└───────────────┬─────────────────────┘
                ↓
┌─────────────────────────────────────┐
│         Database (MySQL)            │
└─────────────────────────────────────┘
```

### Why This Architecture?

**Testability:**
- Each layer can be tested independently
- Easy to mock dependencies
- Clear test boundaries

**Maintainability:**
- Changes isolated to specific layers
- Business logic separate from HTTP concerns
- Easy to locate bugs

**Reusability:**
- Services can be used by routes, cron jobs, scripts
- Repositories hide database implementation
- Business logic not tied to HTTP

**Scalability:**
- Easy to add new endpoints
- Clear patterns to follow
- Consistent structure

---

## Request Lifecycle

### Complete Flow Example

```typescript
1. HTTP POST /api/users
   ↓
2. Express matches route in userRoutes.ts
   ↓
3. Middleware chain executes:
   - SSOMiddleware.verifyLoginStatus (authentication)
   - auditMiddleware (context tracking)
   ↓
4. Route handler delegates to controller:
   router.post('/users', (req, res) => userController.create(req, res))
   ↓
5. Controller validates and calls service:
   - Validate input with Zod
   - Call userService.create(data)
   - Handle success/error
   ↓
6. Service executes business logic:
   - Check business rules
   - Call userRepository.create(data)
   - Return result
   ↓
7. Repository performs database operation:
   - PrismaService.main.user.create({ data })
   - Handle database errors
   - Return created user
   ↓
8. Response flows back:
   Repository → Service → Controller → Express → Client
```

### Middleware Execution Order

**Critical:** Middleware executes in registration order

```typescript
app.use(Sentry.Handlers.requestHandler());  // 1. Sentry tracing (FIRST)
app.use(express.json());                     // 2. Body parsing
app.use(express.urlencoded({ extended: true })); // 3. URL encoding
app.use(cookieParser());                     // 4. Cookie parsing
app.use(SSOMiddleware.initialize());         // 5. Auth initialization
// ... routes registered here
app.use(auditMiddleware);                    // 6. Audit (if global)
app.use(errorBoundary);                      // 7. Error handler (LAST)
app.use(Sentry.Handlers.errorHandler());     // 8. Sentry errors (LAST)
```

**Rule:** Error handlers must be registered AFTER routes!

---

## Service Comparison

### Email Service (Mature Pattern ✅)

**Strengths:**
- Comprehensive BaseController with Sentry integration
- Clean route delegation (no business logic in routes)
- Consistent dependency injection pattern
- Good middleware organization
- Type-safe throughout
- Excellent error handling

**Example Structure:**
```
email/src/
├── controllers/
│   ├── BaseController.ts          ✅ Excellent template
│   ├── NotificationController.ts  ✅ Extends BaseController
│   └── EmailController.ts         ✅ Clean patterns
├── routes/
│   ├── notificationRoutes.ts      ✅ Clean delegation
│   └── emailRoutes.ts             ✅ No business logic
├── services/
│   ├── NotificationService.ts     ✅ Dependency injection
│   └── BatchingService.ts         ✅ Clear responsibility
└── middleware/
    ├── errorBoundary.ts           ✅ Comprehensive
    └── DevImpersonationSSOMiddleware.ts
```

**Use as template** for new services!

### Form Service (Transitioning ⚠️)

**Strengths:**
- Excellent workflow architecture (event sourcing)
- Good Sentry integration
- Innovative audit middleware (AsyncLocalStorage)
- Comprehensive permission system

**Weaknesses:**
- Some routes have 200+ lines of business logic
- Inconsistent controller naming
- Direct process.env usage (60+ occurrences)
- Minimal repository pattern usage

**Example:**
```
form/src/
├── routes/
│   ├── responseRoutes.ts          ❌ Business logic in routes
│   └── proxyRoutes.ts             ✅ Good validation pattern
├── controllers/
│   ├── formController.ts          ⚠️ Lowercase naming
│   └── UserProfileController.ts   ✅ PascalCase naming
├── workflow/                      ✅ Excellent architecture!
│   ├── core/
│   │   ├── WorkflowEngineV3.ts   ✅ Event sourcing
│   │   └── DryRunWrapper.ts      ✅ Innovative
│   └── services/
└── middleware/
    └── auditMiddleware.ts         ✅ AsyncLocalStorage pattern
```

**Learn from:** workflow/, middleware/auditMiddleware.ts
**Avoid:** responseRoutes.ts, direct process.env

---

## Directory Structure Rationale

### Controllers Directory

**Purpose:** Handle HTTP request/response concerns

**Contents:**
- `BaseController.ts` - Base class with common methods
- `{Feature}Controller.ts` - Feature-specific controllers

**Naming:** PascalCase + Controller

**Responsibilities:**
- Parse request parameters
- Validate input (Zod)
- Call appropriate service methods
- Format responses
- Handle errors (via BaseController)
- Set HTTP status codes

### Services Directory

**Purpose:** Business logic and orchestration

**Contents:**
- `{feature}Service.ts` - Feature business logic

**Naming:** camelCase + Service (or PascalCase + Service)

**Responsibilities:**
- Implement business rules
- Orchestrate multiple repositories
- Transaction management
- Business validations
- No HTTP knowledge (Request/Response types)

### Repositories Directory

**Purpose:** Data access abstraction

**Contents:**
- `{Entity}Repository.ts` - Database operations for entity

**Naming:** PascalCase + Repository

**Responsibilities:**
- Prisma query operations
- Query optimization
- Database error handling
- Caching layer
- Hide Prisma implementation details

**Current Gap:** Only 1 repository exists (WorkflowRepository)

### Routes Directory

**Purpose:** Route registration ONLY

**Contents:**
- `{feature}Routes.ts` - Express router for feature

**Naming:** camelCase + Routes

**Responsibilities:**
- Register routes with Express
- Apply middleware
- Delegate to controllers
- **NO business logic!**

### Middleware Directory

**Purpose:** Cross-cutting concerns

**Contents:**
- Authentication middleware
- Audit middleware
- Error boundaries
- Validation middleware
- Custom middleware

**Naming:** camelCase

**Types:**
- Request processing (before handler)
- Response processing (after handler)
- Error handling (error boundary)

### Config Directory

**Purpose:** Configuration management

**Contents:**
- `unifiedConfig.ts` - Type-safe configuration
- Environment-specific configs

**Pattern:** Single source of truth

### Types Directory

**Purpose:** TypeScript type definitions

**Contents:**
- `{feature}.types.ts` - Feature-specific types
- DTOs (Data Transfer Objects)
- Request/Response types
- Domain models

---

## Module Organization

### Feature-Based Organization

For large features, use subdirectories:

```
src/workflow/
├── core/              # Core engine
├── services/          # Workflow-specific services
├── actions/           # System actions
├── models/            # Domain models
├── validators/        # Workflow validation
└── utils/             # Workflow utilities
```

**When to use:**
- Feature has 5+ files
- Clear sub-domains exist
- Logical grouping improves clarity

### Flat Organization

For simple features:

```
src/
├── controllers/UserController.ts
├── services/userService.ts
├── routes/userRoutes.ts
└── repositories/UserRepository.ts
```

**When to use:**
- Simple features (< 5 files)
- No clear sub-domains
- Flat structure is clearer

---

## Separation of Concerns

### What Goes Where

**Routes Layer:**
- ✅ Route definitions
- ✅ Middleware registration
- ✅ Controller delegation
- ❌ Business logic
- ❌ Database operations
- ❌ Validation logic (should be in validator or controller)

**Controllers Layer:**
- ✅ Request parsing (params, body, query)
- ✅ Input validation (Zod)
- ✅ Service calls
- ✅ Response formatting
- ✅ Error handling
- ❌ Business logic
- ❌ Database operations

**Services Layer:**
- ✅ Business logic
- ✅ Business rules enforcement
- ✅ Orchestration (multiple repos)
- ✅ Transaction management
- ❌ HTTP concerns (Request/Response)
- ❌ Direct Prisma calls (use repositories)

**Repositories Layer:**
- ✅ Prisma operations
- ✅ Query construction
- ✅ Database error handling
- ✅ Caching
- ❌ Business logic
- ❌ HTTP concerns

### Example: User Creation

**Route:**
```typescript
router.post('/users',
    SSOMiddleware.verifyLoginStatus,
    auditMiddleware,
    (req, res) => userController.create(req, res)
);
```

**Controller:**
```typescript
async create(req: Request, res: Response): Promise<void> {
    try {
        const validated = createUserSchema.parse(req.body);
        const user = await this.userService.create(validated);
        this.handleSuccess(res, user, 'User created');
    } catch (error) {
        this.handleError(error, res, 'create');
    }
}
```

**Service:**
```typescript
async create(data: CreateUserDTO): Promise<User> {
    // Business rule: check if email already exists
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new ConflictError('Email already exists');

    // Create user
    return await this.userRepository.create(data);
}
```

**Repository:**
```typescript
async create(data: CreateUserDTO): Promise<User> {
    return PrismaService.main.user.create({ data });
}

async findByEmail(email: string): Promise<User | null> {
    return PrismaService.main.user.findUnique({ where: { email } });
}
```

**Notice:** Each layer has clear, distinct responsibilities!

---

**Related Files:**
- SKILL.md - Main guide
- [routing-and-controllers.md](routing-and-controllers.md) - Routes and controllers details
- [services-and-repositories.md](services-and-repositories.md) - Service and repository patterns


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
