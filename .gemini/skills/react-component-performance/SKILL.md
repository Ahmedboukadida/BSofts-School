---
name: react-component-performance
description: Diagnose slow React components and suggest targeted performance fixes.
risk: safe
source: "Dimillian/Skills (MIT)"
date_added: "2026-03-25"
---

# React Component Performance

## Overview

Identify render hotspots, isolate expensive updates, and apply targeted optimizations without changing UI behavior.

## When to Use
- When the user asks to profile or improve a slow React component.
- When you need to reduce re-renders, list lag, or expensive render work in React UI.

## Workflow

1. Reproduce or describe the slowdown.
2. Identify what triggers re-renders (state updates, props churn, effects).
3. Isolate fast-changing state from heavy subtrees.
4. Stabilize props and handlers; memoize where it pays off.
5. Reduce expensive work (computation, DOM size, list length).
6. **Validate**: open React DevTools Profiler → record the interaction → inspect the Flamegraph for components rendering longer than ~16 ms → compare against a pre-optimization baseline recording.

## Checklist

- Measure: use React DevTools Profiler or log renders; capture baseline.
- Find churn: identify state updated on a timer, scroll, input, or animation.
- Split: move ticking state into a child; keep heavy lists static.
- Memoize: wrap leaf rows with `memo` only when props are stable.
- Stabilize props: use `useCallback`/`useMemo` for handlers and derived values.
- Avoid derived work in render: precompute, or compute inside memoized helpers.
- Control list size: window/virtualize long lists; avoid rendering hidden items.
- Keys: ensure stable keys; avoid index when order can change.
- Effects: verify dependency arrays; avoid effects that re-run on every render.
- Style/layout: watch for expensive layout thrash or large Markdown/diff renders.

## Optimization Patterns

### Isolate ticking state

Move a timer or animation counter into a child so the parent list never re-renders on each tick.

```tsx
// ❌ Before – entire parent (and list) re-renders every second
function Dashboard({ items }: { items: Item[] }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <Clock tick={tick} />
      <ExpensiveList items={items} /> {/* re-renders every second */}
    </>
  );
}

// ✅ After – only <Clock> re-renders; list is untouched
function Clock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{tick}s</span>;
}

function Dashboard({ items }: { items: Item[] }) {
  return (
    <>
      <Clock />
      <ExpensiveList items={items} />
    </>
  );
}
```

### Stabilize callbacks with `useCallback` + `memo`

```tsx
// ❌ Before – new handler reference on every render busts Row memo
function List({ items }: { items: Item[] }) {
  const handleClick = (id: string) => console.log(id); // new ref each render
  return items.map(item => <Row key={item.id} item={item} onClick={handleClick} />);
}

// ✅ After – stable handler; Row only re-renders when its own item changes
const Row = memo(({ item, onClick }: RowProps) => (
  <li onClick={() => onClick(item.id)}>{item.name}</li>
));

function List({ items }: { items: Item[] }) {
  const handleClick = useCallback((id: string) => console.log(id), []);
  return items.map(item => <Row key={item.id} item={item} onClick={handleClick} />);
}
```

### Prefer derived data outside render

```tsx
// ❌ Before – recomputes on every render
function Summary({ orders }: { orders: Order[] }) {
  const total = orders.reduce((sum, o) => sum + o.amount, 0); // runs every render
  return <p>Total: {total}</p>;
}

// ✅ After – recomputes only when orders changes
function Summary({ orders }: { orders: Order[] }) {
  const total = useMemo(() => orders.reduce((sum, o) => sum + o.amount, 0), [orders]);
  return <p>Total: {total}</p>;
}
```

### Additional patterns

- **Split rows**: extract list rows into memoized components with narrow props.
- **Defer heavy rendering**: lazy-render or collapse expensive content until expanded.

## Profiling Validation Steps

1. Open **React DevTools → Profiler** tab.
2. Click **Record**, perform the slow interaction, then **Stop**.
3. Switch to **Flamegraph** view; any bar labeled with a component and time > ~16 ms is a candidate.
4. Use **Ranked chart** to sort by self render time and target the top offenders.
5. Apply one optimization at a time, re-record, and compare render counts and durations against the baseline.

## Example Reference

Load `references/examples.md` when the user wants a concrete refactor example.

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
