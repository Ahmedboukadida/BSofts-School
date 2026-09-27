---
name: cypress-skill
description: Generates production-grade Cypress E2E and component tests in JavaScript or TypeScript. Supports local execution and TestMu AI cloud. Use when the user asks to write Cypress tests, set up Cypress, test with cy commands, or mentions "Cypress", "cy.visit", "cy.get", "cy.intercept"....
risk: unknown
source: https://github.com/LambdaTest/agent-skills/tree/main/cypress-skill
source_repo: LambdaTest/agent-skills
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/LambdaTest/agent-skills/blob/main/LICENSE
---

# Cypress Automation Skill
## When to Use

Use this skill when you need generates production-grade Cypress E2E and component tests in JavaScript or TypeScript. Supports local execution and TestMu AI cloud. Use when the user asks to write Cypress tests, set up Cypress, test with cy commands, or mentions "Cypress", "cy.visit", "cy.get", "cy.intercept"....


You are a senior QA automation architect specializing in Cypress.

## Step 1 — Execution Target

```
User says "test" / "automate"
│
├─ Mentions "cloud", "TestMu", "LambdaTest", "cross-browser"?
│  └─ TestMu AI cloud via cypress-cli plugin
│
├─ Mentions "locally", "open", "headed"?
│  └─ Local: npx cypress open
│
└─ Ambiguous? → Default local, mention cloud option
```

## Step 2 — Test Type

| Signal | Type | Config |
|--------|------|--------|
| "E2E", "end-to-end", page URL | E2E test | `cypress/e2e/` |
| "component", "React", "Vue" | Component test | `cypress/component/` |
| "API test", "cy.request" | API test via Cypress | `cypress/e2e/api/` |

## Core Patterns

### Command Chaining — CRITICAL

```javascript
// ✅ Cypress chains — no await, no async
cy.visit('/login');
cy.get('#username').type('user@test.com');
cy.get('#password').type('password123');
cy.get('button[type="submit"]').click();
cy.url().should('include', '/dashboard');

// ❌ NEVER use async/await with cy commands
// ❌ NEVER assign cy.get() to a variable for later use
```

### Selector Priority

```
1. cy.get('[data-cy="submit"]')     ← Best practice
2. cy.get('[data-testid="submit"]') ← Also good
3. cy.contains('Submit')            ← Text-based
4. cy.get('#submit-btn')            ← ID
5. cy.get('.btn-primary')           ← Class (fragile)
```

### Anti-Patterns

| Bad | Good | Why |
|-----|------|-----|
| `cy.wait(5000)` | `cy.intercept()` + `cy.wait('@alias')` | Arbitrary waits |
| `const el = cy.get()` | Chain directly | Cypress is async |
| `async/await` with cy | Chain `.then()` if needed | Different async model |
| Testing 3rd party sites | Stub/mock instead | Flaky, slow |
| Single `beforeEach` with everything | Multiple focused specs | Better isolation |

### Basic Test Structure

```javascript
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login with valid credentials', () => {
    cy.get('[data-cy="username"]').type('user@test.com');
    cy.get('[data-cy="password"]').type('password123');
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-cy="welcome"]').should('contain', 'Welcome');
  });

  it('should show error for invalid credentials', () => {
    cy.get('[data-cy="username"]').type('wrong@test.com');
    cy.get('[data-cy="password"]').type('wrong');
    cy.get('[data-cy="submit"]').click();
    cy.get('[data-cy="error"]').should('be.visible');
  });
});
```

### Network Interception

```javascript
// Stub API response
cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { token: 'fake-jwt', user: { name: 'Test User' } },
}).as('loginRequest');

cy.get('[data-cy="submit"]').click();
cy.wait('@loginRequest').its('request.body').should('deep.include', {
  email: 'user@test.com',
});

// Wait for real API
cy.intercept('GET', '/api/dashboard').as('dashboardLoad');
cy.visit('/dashboard');
cy.wait('@dashboardLoad');
```

### Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-cy="username"]').type(email);
    cy.get('[data-cy="password"]').type(password);
    cy.get('[data-cy="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// Usage in tests
cy.login('user@test.com', 'password123');
```

### TestMu AI Cloud

```javascript
// cypress.config.js
module.exports = {
  e2e: {
    setupNodeEvents(on, config) {
      // LambdaTest plugin
    },
  },
};

// lambdatest-config.json
{
  "lambdatest_auth": {
    "username": "${LT_USERNAME}",
    "access_key": "${LT_ACCESS_KEY}"
  },
  "browsers": [
    { "browser": "Chrome", "platform": "Windows 11", "versions": ["latest"] },
    { "browser": "Firefox", "platform": "macOS Sequoia", "versions": ["latest"] }
  ],
  "run_settings": {
    "build_name": "Cypress Build",
    "parallels": 5,
    "specs": "cypress/e2e/**/*.cy.js"
  }
}
```

**Run on cloud:**
```bash
npx lambdatest-cypress run
```

## Validation Workflow

1. **No arbitrary waits**: Zero `cy.wait(number)` — use intercepts
2. **Selectors**: Prefer `data-cy` attributes
3. **No async/await**: Pure Cypress chaining
4. **Assertions**: Use `.should()` chains, not manual checks
5. **Isolation**: Each test independent, use `cy.session()` for auth

## Quick Reference

| Task | Command |
|------|---------|
| Open interactive | `npx cypress open` |
| Run headless | `npx cypress run` |
| Run specific spec | `npx cypress run --spec "cypress/e2e/login.cy.js"` |
| Run in browser | `npx cypress run --browser chrome` |
| Component tests | `npx cypress run --component` |
| Environment vars | `CYPRESS_BASE_URL=http://localhost:3000 npx cypress run` |
| Fixtures | `cy.fixture('users.json').then(data => ...)` |
| File upload | `cy.get('input[type="file"]').selectFile('file.pdf')` |
| Viewport | `cy.viewport('iphone-x')` or `cy.viewport(1280, 720)` |
| Screenshot | `cy.screenshot('login-page')` |

## Reference Files

| File | When to Read |
|------|-------------|
| `reference/cloud-integration.md` | LambdaTest Cypress CLI, parallel, config |
| `reference/component-testing.md` | React/Vue/Angular component tests |
| `reference/custom-commands.md` | Advanced commands, overwrite, TypeScript |
| `reference/debugging-flaky.md` | Retry-ability, detached DOM, race conditions |

## Advanced Playbook

For production-grade patterns, see `reference/playbook.md`:

| Section | What's Inside |
|---------|--------------|
| §1 Production Config | Multi-env configs, setupNodeEvents |
| §2 Auth with cy.session() | UI login, API login, validation |
| §3 Page Object Pattern | Fluent page classes, barrel exports |
| §4 Network Interception | Mock, modify, delay, wait for API |
| §5 Component Testing | React/Vue mount, stubs, variants |
| §6 Custom Commands | TypeScript declarations, drag-drop |
| §7 DB Reset & Seeding | API reset, Cypress tasks, Prisma |
| §8 Time Control | cy.clock(), cy.tick() |
| §9 File Operations | Upload, drag-drop, download verify |
| §10 iframe & Shadow DOM | Content access patterns |
| §11 Accessibility | cypress-axe, WCAG audits |
| §12 Visual Regression | Percy, cypress-image-snapshot |
| §13 CI/CD | GitHub Actions matrix + Cypress Cloud parallel |
| §14 Debugging Table | 11 common problems with fixes |
| §15 Best Practices | 15-item production checklist |

## Limitations

- Use this skill only when the task clearly matches its upstream source and local project context.
- Verify commands, generated code, dependencies, credentials, and external service behavior before applying changes.
- Do not treat examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.


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
