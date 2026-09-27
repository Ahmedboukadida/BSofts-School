---
name: api-security-testing
description: "API security testing workflow for REST and GraphQL APIs covering authentication, authorization, rate limiting, input validation, and security best practices."
category: granular-workflow-bundle
risk: safe
source: personal
date_added: "2026-02-27"
---

# API Security Testing Workflow

## Overview

Specialized workflow for testing REST and GraphQL API security including authentication, authorization, rate limiting, input validation, and API-specific vulnerabilities.

## When to Use This Workflow

Use this workflow when:
- Testing REST API security
- Assessing GraphQL endpoints
- Validating API authentication
- Testing API rate limiting
- Bug bounty API testing

## Workflow Phases

### Phase 1: API Discovery

#### Skills to Invoke
- `api-fuzzing-bug-bounty` - API fuzzing
- `scanning-tools` - API scanning

#### Actions
1. Enumerate endpoints
2. Document API methods
3. Identify parameters
4. Map data flows
5. Review documentation

#### Copy-Paste Prompts
```
Use @api-fuzzing-bug-bounty to discover API endpoints
```

### Phase 2: Authentication Testing

#### Skills to Invoke
- `broken-authentication` - Auth testing
- `api-security-best-practices` - API auth

#### Actions
1. Test API key validation
2. Test JWT tokens
3. Test OAuth2 flows
4. Test token expiration
5. Test refresh tokens

#### Copy-Paste Prompts
```
Use @broken-authentication to test API authentication
```

### Phase 3: Authorization Testing

#### Skills to Invoke
- `idor-testing` - IDOR testing

#### Actions
1. Test object-level authorization
2. Test function-level authorization
3. Test role-based access
4. Test privilege escalation
5. Test multi-tenant isolation

#### Copy-Paste Prompts
```
Use @idor-testing to test API authorization
```

### Phase 4: Input Validation

#### Skills to Invoke
- `api-fuzzing-bug-bounty` - API fuzzing
- `sql-injection-testing` - Injection testing

#### Actions
1. Test parameter validation
2. Test SQL injection
3. Test NoSQL injection
4. Test command injection
5. Test XXE injection

#### Copy-Paste Prompts
```
Use @api-fuzzing-bug-bounty to fuzz API parameters
```

### Phase 5: Rate Limiting

#### Skills to Invoke
- `api-security-best-practices` - Rate limiting

#### Actions
1. Test rate limit headers
2. Test brute force protection
3. Test resource exhaustion
4. Test bypass techniques
5. Document limitations

#### Copy-Paste Prompts
```
Use @api-security-best-practices to test rate limiting
```

### Phase 6: GraphQL Testing

#### Skills to Invoke
- `api-fuzzing-bug-bounty` - GraphQL fuzzing

#### Actions
1. Test introspection
2. Test query depth
3. Test query complexity
4. Test batch queries
5. Test field suggestions

#### Copy-Paste Prompts
```
Use @api-fuzzing-bug-bounty to test GraphQL security
```

### Phase 7: Error Handling

#### Skills to Invoke
- `api-security-best-practices` - Error handling

#### Actions
1. Test error messages
2. Check information disclosure
3. Test stack traces
4. Verify logging
5. Document findings

#### Copy-Paste Prompts
```
Use @api-security-best-practices to audit API error handling
```

## API Security Checklist

- [ ] Authentication working
- [ ] Authorization enforced
- [ ] Input validated
- [ ] Rate limiting active
- [ ] Errors sanitized
- [ ] Logging enabled
- [ ] CORS configured
- [ ] HTTPS enforced

## Quality Gates

- [ ] All endpoints tested
- [ ] Vulnerabilities documented
- [ ] Remediation provided
- [ ] Report generated

## Related Workflow Bundles

- `security-audit` - Security auditing
- `web-security-testing` - Web security
- `api-development` - API development

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
