---
name: python-fastapi-development
description: "Python FastAPI backend development with async patterns, SQLAlchemy, Pydantic, authentication, and production API patterns."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---

# Python/FastAPI Development Workflow

## Overview

Specialized workflow for building production-ready Python backends with FastAPI, featuring async patterns, SQLAlchemy ORM, Pydantic validation, and comprehensive API patterns.

## When to Use This Workflow

Use this workflow when:
- Building new REST APIs with FastAPI
- Creating async Python backends
- Implementing database integration with SQLAlchemy
- Setting up API authentication
- Developing microservices

## Workflow Phases

### Phase 1: Project Setup

#### Skills to Invoke
- `app-builder` - Application scaffolding
- `python-development-python-scaffold` - Python scaffolding
- `fastapi-templates` - FastAPI templates
- `uv-package-manager` - Package management

#### Actions
1. Set up Python environment (uv/poetry)
2. Create project structure
3. Configure FastAPI app
4. Set up logging
5. Configure environment variables

#### Copy-Paste Prompts
```
Use @fastapi-templates to scaffold a new FastAPI project
```

```
Use @python-development-python-scaffold to set up Python project structure
```

### Phase 2: Database Setup

#### Skills to Invoke
- `prisma-expert` - Prisma ORM (alternative)
- `database-design` - Schema design
- `postgresql` - PostgreSQL setup
- `pydantic-models-py` - Pydantic models

#### Actions
1. Design database schema
2. Set up SQLAlchemy models
3. Create database connection
4. Configure migrations (Alembic)
5. Set up session management

#### Copy-Paste Prompts
```
Use @database-design to design PostgreSQL schema
```

```
Use @pydantic-models-py to create Pydantic models for API
```

### Phase 3: API Routes

#### Skills to Invoke
- `fastapi-router-py` - FastAPI routers
- `api-design-principles` - API design
- `api-patterns` - API patterns

#### Actions
1. Design API endpoints
2. Create API routers
3. Implement CRUD operations
4. Add request validation
5. Configure response models

#### Copy-Paste Prompts
```
Use @fastapi-router-py to create API endpoints with CRUD operations
```

```
Use @api-design-principles to design RESTful API
```

### Phase 4: Authentication

#### Skills to Invoke
- `auth-implementation-patterns` - Authentication
- `api-security-best-practices` - API security

#### Actions
1. Choose auth strategy (JWT, OAuth2)
2. Implement user registration
3. Set up login endpoints
4. Create auth middleware
5. Add password hashing

#### Copy-Paste Prompts
```
Use @auth-implementation-patterns to implement JWT authentication
```

### Phase 5: Error Handling

#### Skills to Invoke
- `fastapi-pro` - FastAPI patterns
- `error-handling-patterns` - Error handling

#### Actions
1. Create custom exceptions
2. Set up exception handlers
3. Implement error responses
4. Add request logging
5. Configure error tracking

#### Copy-Paste Prompts
```
Use @fastapi-pro to implement comprehensive error handling
```

### Phase 6: Testing

#### Skills to Invoke
- `python-testing-patterns` - pytest testing
- `api-testing-observability-api-mock` - API testing

#### Actions
1. Set up pytest
2. Create test fixtures
3. Write unit tests
4. Implement integration tests
5. Configure test database

#### Copy-Paste Prompts
```
Use @python-testing-patterns to write pytest tests for FastAPI
```

### Phase 7: Documentation

#### Skills to Invoke
- `api-documenter` - API documentation
- `openapi-spec-generation` - OpenAPI specs

#### Actions
1. Configure OpenAPI schema
2. Add endpoint documentation
3. Create usage examples
4. Set up API versioning
5. Generate API docs

#### Copy-Paste Prompts
```
Use @api-documenter to generate comprehensive API documentation
```

### Phase 8: Deployment

#### Skills to Invoke
- `deployment-engineer` - Deployment
- `docker-expert` - Containerization

#### Actions
1. Create Dockerfile
2. Set up docker-compose
3. Configure production settings
4. Set up reverse proxy
5. Deploy to cloud

#### Copy-Paste Prompts
```
Use @docker-expert to containerize FastAPI application
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | FastAPI |
| Language | Python 3.11+ |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Database | PostgreSQL |
| Migrations | Alembic |
| Auth | JWT, OAuth2 |
| Testing | pytest |

## Quality Gates

- [ ] All tests passing (>80% coverage)
- [ ] Type checking passes (mypy)
- [ ] Linting clean (ruff, black)
- [ ] API documentation complete
- [ ] Security scan passed
- [ ] Performance benchmarks met

## Related Workflow Bundles

- `development` - General development
- `database` - Database operations
- `security-audit` - Security testing
- `api-development` - API patterns

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
