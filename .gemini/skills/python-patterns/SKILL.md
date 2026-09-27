---
name: python-patterns
description: "Python development principles and decision-making. Framework selection, async patterns, type hints, project structure. Teaches thinking, not copying."
risk: unknown
source: community
date_added: "2026-02-27"
---

# Python Patterns

> Python development principles and decision-making for 2025.
> **Learn to THINK, not memorize patterns.**

## When to Use
Use this skill when making Python architecture decisions, choosing frameworks, designing async patterns, or structuring Python projects.

---

## ⚠️ How to Use This Skill

This skill teaches **decision-making principles**, not fixed code to copy.

- ASK user for framework preference when unclear
- Choose async vs sync based on CONTEXT
- Don't default to same framework every time

---

## 1. Framework Selection (2025)

### Decision Tree

```
What are you building?
│
├── API-first / Microservices
│   └── FastAPI (async, modern, fast)
│
├── Full-stack web / CMS / Admin
│   └── Django (batteries-included)
│
├── Simple / Script / Learning
│   └── Flask (minimal, flexible)
│
├── AI/ML API serving
│   └── FastAPI (Pydantic, async, uvicorn)
│
└── Background workers
    └── Celery + any framework
```

### Comparison Principles

| Factor | FastAPI | Django | Flask |
|--------|---------|--------|-------|
| **Best for** | APIs, microservices | Full-stack, CMS | Simple, learning |
| **Async** | Native | Django 5.0+ | Via extensions |
| **Admin** | Manual | Built-in | Via extensions |
| **ORM** | Choose your own | Django ORM | Choose your own |
| **Learning curve** | Low | Medium | Low |

### Selection Questions to Ask:
1. Is this API-only or full-stack?
2. Need admin interface?
3. Team familiar with async?
4. Existing infrastructure?

---

## 2. Async vs Sync Decision

### When to Use Async

```
async def is better when:
├── I/O-bound operations (database, HTTP, file)
├── Many concurrent connections
├── Real-time features
├── Microservices communication
└── FastAPI/Starlette/Django ASGI

def (sync) is better when:
├── CPU-bound operations
├── Simple scripts
├── Legacy codebase
├── Team unfamiliar with async
└── Blocking libraries (no async version)
```

### The Golden Rule

```
I/O-bound → async (waiting for external)
CPU-bound → sync + multiprocessing (computing)

Don't:
├── Mix sync and async carelessly
├── Use sync libraries in async code
└── Force async for CPU work
```

### Async Library Selection

| Need | Async Library |
|------|---------------|
| HTTP client | httpx |
| PostgreSQL | asyncpg |
| Redis | aioredis / redis-py async |
| File I/O | aiofiles |
| Database ORM | SQLAlchemy 2.0 async, Tortoise |

---

## 3. Type Hints Strategy

### When to Type

```
Always type:
├── Function parameters
├── Return types
├── Class attributes
├── Public APIs

Can skip:
├── Local variables (let inference work)
├── One-off scripts
├── Tests (usually)
```

### Common Type Patterns

```python
# These are patterns, understand them:

# Optional → might be None
from typing import Optional
def find_user(id: int) -> Optional[User]: ...

# Union → one of multiple types
def process(data: str | dict) -> None: ...

# Generic collections
def get_items() -> list[Item]: ...
def get_mapping() -> dict[str, int]: ...

# Callable
from typing import Callable
def apply(fn: Callable[[int], str]) -> str: ...
```

### Pydantic for Validation

```
When to use Pydantic:
├── API request/response models
├── Configuration/settings
├── Data validation
├── Serialization

Benefits:
├── Runtime validation
├── Auto-generated JSON schema
├── Works with FastAPI natively
└── Clear error messages
```

---

## 4. Project Structure Principles

### Structure Selection

```
Small project / Script:
├── main.py
├── utils.py
└── requirements.txt

Medium API:
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── schemas/
├── tests/
└── pyproject.toml

Large application:
├── src/
│   └── myapp/
│       ├── core/
│       ├── api/
│       ├── services/
│       ├── models/
│       └── ...
├── tests/
└── pyproject.toml
```

### FastAPI Structure Principles

```
Organize by feature or layer:

By layer:
├── routes/ (API endpoints)
├── services/ (business logic)
├── models/ (database models)
├── schemas/ (Pydantic models)
└── dependencies/ (shared deps)

By feature:
├── users/
│   ├── routes.py
│   ├── service.py
│   └── schemas.py
└── products/
    └── ...
```

---

## 5. Django Principles (2025)

### Django Async (Django 5.0+)

```
Django supports async:
├── Async views
├── Async middleware
├── Async ORM (limited)
└── ASGI deployment

When to use async in Django:
├── External API calls
├── WebSocket (Channels)
├── High-concurrency views
└── Background task triggering
```

### Django Best Practices

```
Model design:
├── Fat models, thin views
├── Use managers for common queries
├── Abstract base classes for shared fields

Views:
├── Class-based for complex CRUD
├── Function-based for simple endpoints
├── Use viewsets with DRF

Queries:
├── select_related() for FKs
├── prefetch_related() for M2M
├── Avoid N+1 queries
└── Use .only() for specific fields
```

---

## 6. FastAPI Principles

### async def vs def in FastAPI

```
Use async def when:
├── Using async database drivers
├── Making async HTTP calls
├── I/O-bound operations
└── Want to handle concurrency

Use def when:
├── Blocking operations
├── Sync database drivers
├── CPU-bound work
└── FastAPI runs in threadpool automatically
```

### Dependency Injection

```
Use dependencies for:
├── Database sessions
├── Current user / Auth
├── Configuration
├── Shared resources

Benefits:
├── Testability (mock dependencies)
├── Clean separation
├── Automatic cleanup (yield)
```

### Pydantic v2 Integration

```python
# FastAPI + Pydantic are tightly integrated:

# Request validation
@app.post("/users")
async def create(user: UserCreate) -> UserResponse:
    # user is already validated
    ...

# Response serialization
# Return type becomes response schema
```

---

## 7. Background Tasks

### Selection Guide

| Solution | Best For |
|----------|----------|
| **BackgroundTasks** | Simple, in-process tasks |
| **Celery** | Distributed, complex workflows |
| **ARQ** | Async, Redis-based |
| **RQ** | Simple Redis queue |
| **Dramatiq** | Actor-based, simpler than Celery |

### When to Use Each

```
FastAPI BackgroundTasks:
├── Quick operations
├── No persistence needed
├── Fire-and-forget
└── Same process

Celery/ARQ:
├── Long-running tasks
├── Need retry logic
├── Distributed workers
├── Persistent queue
└── Complex workflows
```

---

## 8. Error Handling Principles

### Exception Strategy

```
In FastAPI:
├── Create custom exception classes
├── Register exception handlers
├── Return consistent error format
└── Log without exposing internals

Pattern:
├── Raise domain exceptions in services
├── Catch and transform in handlers
└── Client gets clean error response
```

### Error Response Philosophy

```
Include:
├── Error code (programmatic)
├── Message (human readable)
├── Details (field-level when applicable)
└── NOT stack traces (security)
```

---

## 9. Testing Principles

### Testing Strategy

| Type | Purpose | Tools |
|------|---------|-------|
| **Unit** | Business logic | pytest |
| **Integration** | API endpoints | pytest + httpx/TestClient |
| **E2E** | Full workflows | pytest + DB |

### Async Testing

```python
# Use pytest-asyncio for async tests

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/users")
        assert response.status_code == 200
```

### Fixtures Strategy

```
Common fixtures:
├── db_session → Database connection
├── client → Test client
├── authenticated_user → User with token
└── sample_data → Test data setup
```

---

## 10. Decision Checklist

Before implementing:

- [ ] **Asked user about framework preference?**
- [ ] **Chosen framework for THIS context?** (not just default)
- [ ] **Decided async vs sync?**
- [ ] **Planned type hint strategy?**
- [ ] **Defined project structure?**
- [ ] **Planned error handling?**
- [ ] **Considered background tasks?**

---

## 11. Anti-Patterns to Avoid

### ❌ DON'T:
- Default to Django for simple APIs (FastAPI may be better)
- Use sync libraries in async code
- Skip type hints for public APIs
- Put business logic in routes/views
- Ignore N+1 queries
- Mix async and sync carelessly

### ✅ DO:
- Choose framework based on context
- Ask about async requirements
- Use Pydantic for validation
- Separate concerns (routes → services → repos)
- Test critical paths

---

> **Remember**: Python patterns are about decision-making for YOUR specific context. Don't copy code—think about what serves your application best.

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
