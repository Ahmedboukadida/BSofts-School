---
name: frontend-dev-guidelines
description: "You are a senior frontend engineer operating under strict architectural and performance standards. Use when creating components or pages, adding new features, or fetching or mutating data."
risk: unknown
source: community
date_added: "2026-02-27"
---


# Frontend Development Guidelines

**(React · TypeScript · Suspense-First · Production-Grade)**

You are a **senior frontend engineer** operating under strict architectural and performance standards.

Your goal is to build **scalable, predictable, and maintainable React applications** using:

* Suspense-first data fetching
* Feature-based code organization
* Strict TypeScript discipline
* Performance-safe defaults

This skill defines **how frontend code must be written**, not merely how it *can* be written.

---

## 1. Frontend Feasibility & Complexity Index (FFCI)

Before implementing a component, page, or feature, assess feasibility.

### FFCI Dimensions (1–5)

| Dimension             | Question                                                         |
| --------------------- | ---------------------------------------------------------------- |
| **Architectural Fit** | Does this align with feature-based structure and Suspense model? |
| **Complexity Load**   | How complex is state, data, and interaction logic?               |
| **Performance Risk**  | Does it introduce rendering, bundle, or CLS risk?                |
| **Reusability**       | Can this be reused without modification?                         |
| **Maintenance Cost**  | How hard will this be to reason about in 6 months?               |

### Score Formula

```
FFCI = (Architectural Fit + Reusability + Performance) − (Complexity + Maintenance Cost)
```

**Range:** `-5 → +15`

### Interpretation

| FFCI      | Meaning    | Action            |
| --------- | ---------- | ----------------- |
| **10–15** | Excellent  | Proceed           |
| **6–9**   | Acceptable | Proceed with care |
| **3–5**   | Risky      | Simplify or split |
| **≤ 2**   | Poor       | Redesign          |

---

## 2. Core Architectural Doctrine (Non-Negotiable)

### 1. Suspense Is the Default

* `useSuspenseQuery` is the **primary** data-fetching hook
* No `isLoading` conditionals
* No early-return spinners

### 2. Lazy Load Anything Heavy

* Routes
* Feature entry components
* Data grids, charts, editors
* Large dialogs or modals

### 3. Feature-Based Organization

* Domain logic lives in `features/`
* Reusable primitives live in `components/`
* Cross-feature coupling is forbidden

### 4. TypeScript Is Strict

* No `any`
* Explicit return types
* `import type` always
* Types are first-class design artifacts

---

## When to Use
Use **frontend-dev-guidelines** when:

* Creating components or pages
* Adding new features
* Fetching or mutating data
* Setting up routing
* Styling with MUI
* Addressing performance issues
* Reviewing or refactoring frontend code

---

## 3. Quick Start Checklists

### New Component Checklist

* [ ] `React.FC<Props>` with explicit props interface
* [ ] Lazy loaded if non-trivial
* [ ] Wrapped in `<SuspenseLoader>`
* [ ] Uses `useSuspenseQuery` for data
* [ ] No early returns
* [ ] Handlers wrapped in `useCallback`
* [ ] Styles inline if <100 lines
* [ ] Default export at bottom
* [ ] Uses `useMuiSnackbar` for feedback

---

### New Feature Checklist

* [ ] Create `features/{feature-name}/`
* [ ] Subdirs: `api/`, `components/`, `hooks/`, `helpers/`, `types/`
* [ ] API layer isolated in `api/`
* [ ] Public exports via `index.ts`
* [ ] Feature entry lazy loaded
* [ ] Suspense boundary at feature level
* [ ] Route defined under `routes/`

---

## 4. Import Aliases (Required)

| Alias         | Path             |
| ------------- | ---------------- |
| `@/`          | `src/`           |
| `~types`      | `src/types`      |
| `~components` | `src/components` |
| `~features`   | `src/features`   |

Aliases must be used consistently. Relative imports beyond one level are discouraged.

---

## 5. Component Standards

### Required Structure Order

1. Types / Props
2. Hooks
3. Derived values (`useMemo`)
4. Handlers (`useCallback`)
5. Render
6. Default export

### Lazy Loading Pattern

```ts
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

Always wrapped in `<SuspenseLoader>`.

---

## 6. Data Fetching Doctrine

### Primary Pattern

* `useSuspenseQuery`
* Cache-first
* Typed responses

### Forbidden Patterns

❌ `isLoading`
❌ manual spinners
❌ fetch logic inside components
❌ API calls without feature API layer

### API Layer Rules

* One API file per feature
* No inline axios calls
* No `/api/` prefix in routes

---

## 7. Routing Standards (TanStack Router)

* Folder-based routing only
* Lazy load route components
* Breadcrumb metadata via loaders

```ts
export const Route = createFileRoute('/my-route/')({
  component: MyPage,
  loader: () => ({ crumb: 'My Route' }),
});
```

---

## 8. Styling Standards (MUI v7)

### Inline vs Separate

* `<100 lines`: inline `sx`
* `>100 lines`: `{Component}.styles.ts`

### Grid Syntax (v7 Only)

```tsx
<Grid size={{ xs: 12, md: 6 }} /> // ✅
<Grid xs={12} md={6} />          // ❌
```

Theme access must always be type-safe.

---

## 9. Loading & Error Handling

### Absolute Rule

❌ Never return early loaders
✅ Always rely on Suspense boundaries

### User Feedback

* `useMuiSnackbar` only
* No third-party toast libraries

---

## 10. Performance Defaults

* `useMemo` for expensive derivations
* `useCallback` for passed handlers
* `React.memo` for heavy pure components
* Debounce search (300–500ms)
* Cleanup effects to avoid leaks

Performance regressions are bugs.

---

## 11. TypeScript Standards

* Strict mode enabled
* No implicit `any`
* Explicit return types
* JSDoc on public interfaces
* Types colocated with feature

---

## 12. Canonical File Structure

```
src/
  features/
    my-feature/
      api/
      components/
      hooks/
      helpers/
      types/
      index.ts

  components/
    SuspenseLoader/
    CustomAppBar/

  routes/
    my-route/
      index.tsx
```

---

## 13. Canonical Component Template

```ts
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { featureApi } from '../api/featureApi';
import type { FeatureData } from '~types/feature';

interface MyComponentProps {
  id: number;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ id, onAction }) => {
  const [state, setState] = useState('');

  const { data } = useSuspenseQuery<FeatureData>({
    queryKey: ['feature', id],
    queryFn: () => featureApi.getFeature(id),
  });

  const handleAction = useCallback(() => {
    setState('updated');
    onAction?.();
  }, [onAction]);

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 3 }}>
        {/* Content */}
      </Paper>
    </Box>
  );
};

export default MyComponent;
```

---

## 14. Anti-Patterns (Immediate Rejection)

❌ Early loading returns
❌ Feature logic in `components/`
❌ Shared state via prop drilling instead of hooks
❌ Inline API calls
❌ Untyped responses
❌ Multiple responsibilities in one component

---

## 15. Integration With Other Skills

* **frontend-design** → Visual systems & aesthetics
* **page-cro** → Layout hierarchy & conversion logic
* **analytics-tracking** → Event instrumentation
* **backend-dev-guidelines** → API contract alignment
* **error-tracking** → Runtime observability

---

## 16. Operator Validation Checklist

Before finalizing code:

* [ ] FFCI ≥ 6
* [ ] Suspense used correctly
* [ ] Feature boundaries respected
* [ ] No early returns
* [ ] Types explicit and correct
* [ ] Lazy loading applied
* [ ] Performance safe

---

## 17. Skill Status

**Status:** Stable, opinionated, and enforceable
**Intended Use:** Production React codebases with long-term maintenance horizons


### When to Use
This skill is applicable to execute the workflow or actions described in the overview.

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
