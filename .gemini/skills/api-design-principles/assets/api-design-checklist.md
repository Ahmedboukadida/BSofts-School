# API Design Checklist

## Pre-Implementation Review

### Resource Design

- [ ] Resources are nouns, not verbs
- [ ] Plural names for collections
- [ ] Consistent naming across all endpoints
- [ ] Clear resource hierarchy (avoid deep nesting >2 levels)
- [ ] All CRUD operations properly mapped to HTTP methods

### HTTP Methods

- [ ] GET for retrieval (safe, idempotent)
- [ ] POST for creation
- [ ] PUT for full replacement (idempotent)
- [ ] PATCH for partial updates
- [ ] DELETE for removal (idempotent)

### Status Codes

- [ ] 200 OK for successful GET/PATCH/PUT
- [ ] 201 Created for POST
- [ ] 204 No Content for DELETE
- [ ] 400 Bad Request for malformed requests
- [ ] 401 Unauthorized for missing auth
- [ ] 403 Forbidden for insufficient permissions
- [ ] 404 Not Found for missing resources
- [ ] 422 Unprocessable Entity for validation errors
- [ ] 429 Too Many Requests for rate limiting
- [ ] 500 Internal Server Error for server issues

### Pagination

- [ ] All collection endpoints paginated
- [ ] Default page size defined (e.g., 20)
- [ ] Maximum page size enforced (e.g., 100)
- [ ] Pagination metadata included (total, pages, etc.)
- [ ] Cursor-based or offset-based pattern chosen

### Filtering & Sorting

- [ ] Query parameters for filtering
- [ ] Sort parameter supported
- [ ] Search parameter for full-text search
- [ ] Field selection supported (sparse fieldsets)

### Versioning

- [ ] Versioning strategy defined (URL/header/query)
- [ ] Version included in all endpoints
- [ ] Deprecation policy documented

### Error Handling

- [ ] Consistent error response format
- [ ] Detailed error messages
- [ ] Field-level validation errors
- [ ] Error codes for client handling
- [ ] Timestamps in error responses

### Authentication & Authorization

- [ ] Authentication method defined (Bearer token, API key)
- [ ] Authorization checks on all endpoints
- [ ] 401 vs 403 used correctly
- [ ] Token expiration handled

### Rate Limiting

- [ ] Rate limits defined per endpoint/user
- [ ] Rate limit headers included
- [ ] 429 status code for exceeded limits
- [ ] Retry-After header provided

### Documentation

- [ ] OpenAPI/Swagger spec generated
- [ ] All endpoints documented
- [ ] Request/response examples provided
- [ ] Error responses documented
- [ ] Authentication flow documented

### Testing

- [ ] Unit tests for business logic
- [ ] Integration tests for endpoints
- [ ] Error scenarios tested
- [ ] Edge cases covered
- [ ] Performance tests for heavy endpoints

### Security

- [ ] Input validation on all fields
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CORS configured correctly
- [ ] HTTPS enforced
- [ ] Sensitive data not in URLs
- [ ] No secrets in responses

### Performance

- [ ] Database queries optimized
- [ ] N+1 queries prevented
- [ ] Caching strategy defined
- [ ] Cache headers set appropriately
- [ ] Large responses paginated

### Monitoring

- [ ] Logging implemented
- [ ] Error tracking configured
- [ ] Performance metrics collected
- [ ] Health check endpoint available
- [ ] Alerts configured for errors

## GraphQL-Specific Checks

### Schema Design

- [ ] Schema-first approach used
- [ ] Types properly defined
- [ ] Non-null vs nullable decided
- [ ] Interfaces/unions used appropriately
- [ ] Custom scalars defined

### Queries

- [ ] Query depth limiting
- [ ] Query complexity analysis
- [ ] DataLoaders prevent N+1
- [ ] Pagination pattern chosen (Relay/offset)

### Mutations

- [ ] Input types defined
- [ ] Payload types with errors
- [ ] Optimistic response support
- [ ] Idempotency considered

### Performance

- [ ] DataLoader for all relationships
- [ ] Query batching enabled
- [ ] Persisted queries considered
- [ ] Response caching implemented

### Documentation

- [ ] All fields documented
- [ ] Deprecations marked
- [ ] Examples provided
- [ ] Schema introspection enabled


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
