---
name: vitest-skill
description: 'Generates Vitest tests in JavaScript/TypeScript with Vite-native speed. Jest-compatible API with ESM support and HMR. Use when user mentions "Vitest", "vi.mock", "vitest.config". Triggers on: "Vitest", "vi.mock", "vi.fn", "Vite test", "vitest config".'
risk: unknown
source: https://github.com/LambdaTest/agent-skills/tree/main/vitest-skill
source_repo: LambdaTest/agent-skills
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/LambdaTest/agent-skills/blob/main/LICENSE
---

# Vitest Testing Skill
## When to Use

Use this skill when you need generates Vitest tests in JavaScript/TypeScript with Vite-native speed. Jest-compatible API with ESM support and HMR. Use when user mentions "Vitest", "vi.mock", "vitest.config". Triggers on: "Vitest", "vi.mock", "vi.fn", "Vite test", "vitest config".


## Core Patterns

### Basic Test

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Calculator } from './calculator';

describe('Calculator', () => {
  let calc: Calculator;
  beforeEach(() => { calc = new Calculator(); });

  it('adds two numbers', () => {
    expect(calc.add(2, 3)).toBe(5);
  });

  it('throws on divide by zero', () => {
    expect(() => calc.divide(10, 0)).toThrow();
  });
});
```

### Mocking (vi instead of jest)

```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('./database', () => ({
  getUser: vi.fn().mockResolvedValue({ name: 'Alice' }),
  saveUser: vi.fn().mockResolvedValue(true),
}));

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ data: 'test' });

// Spy
const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
expect(spy).toHaveBeenCalledWith('message');
spy.mockRestore();

// Timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.runAllTimers();
vi.useRealTimers();
```

### In-Source Testing

```typescript
// src/math.ts — tests alongside code!
export function add(a: number, b: number) { return a + b; }
export function multiply(a: number, b: number) { return a * b; }

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;
  it('adds', () => { expect(add(2, 3)).toBe(5); });
  it('multiplies', () => { expect(multiply(3, 4)).toBe(12); });
}
```

### Snapshot Testing

```typescript
it('serializes user', () => {
  expect(serializeUser(user)).toMatchSnapshot();
});

it('inline snapshot', () => {
  expect(serializeUser(user)).toMatchInlineSnapshot(`
    { "name": "Alice", "email": "alice@test.com" }
  `);
});
```

### React Component Testing

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeDefined();
  });
});
```

### Anti-Patterns

| Bad | Good | Why |
|-----|------|-----|
| `jest.fn()` | `vi.fn()` | Vitest uses `vi` |
| `jest.mock()` | `vi.mock()` | Different namespace |
| No type safety | TypeScript + strict | Vitest is TS-first |

## Quick Reference

| Task | Command |
|------|---------|
| Run once | `npx vitest run` |
| Watch | `npx vitest` (default) |
| UI | `npx vitest --ui` |
| Coverage | `npx vitest --coverage` |
| Specific file | `npx vitest run src/math.test.ts` |
| Filter | `npx vitest run -t "adds"` |

## vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
    include: ['src/**/*.{test,spec}.{js,ts,tsx}'],
    includeSource: ['src/**/*.{js,ts}'],
  },
});
```

## Deep Patterns → `reference/playbook.md`

| § | Section | Lines |
|---|---------|-------|
| 1 | Production Configuration | Config, workspace, setup file |
| 2 | Mocking Patterns | vi.mock, spies, timers, fetch |
| 3 | React Testing Library | Components, hooks, providers |
| 4 | Snapshot & Inline Snapshots | File, inline, serializers |
| 5 | Table-Driven Tests | test.each, describe.each |
| 6 | In-Source Testing | Co-located tests in source |
| 7 | API / Integration Testing | Server tests with fetch |
| 8 | CI/CD Integration | GitHub Actions, scripts |
| 9 | Debugging Quick-Reference | 10 common problems |
| 10 | Best Practices Checklist | 13 items |

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
