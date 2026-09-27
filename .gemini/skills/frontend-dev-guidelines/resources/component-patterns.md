# Component Patterns

Modern React component architecture for the application emphasizing type safety, lazy loading, and Suspense boundaries.

---

## React.FC Pattern (PREFERRED)

### Why React.FC

All components use the `React.FC<Props>` pattern for:
- Explicit type safety for props
- Consistent component signatures
- Clear prop interface documentation
- Better IDE autocomplete

### Basic Pattern

```typescript
import React from 'react';

interface MyComponentProps {
    /** User ID to display */
    userId: number;
    /** Optional callback when action occurs */
    onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ userId, onAction }) => {
    return (
        <div>
            User: {userId}
        </div>
    );
};

export default MyComponent;
```

**Key Points:**
- Props interface defined separately with JSDoc comments
- `React.FC<Props>` provides type safety
- Destructure props in parameters
- Default export at bottom

---

## Lazy Loading Pattern

### When to Lazy Load

Lazy load components that are:
- Heavy (DataGrid, charts, rich text editors)
- Route-level components
- Modal/dialog content (not shown initially)
- Below-the-fold content

### How to Lazy Load

```typescript
import React from 'react';

// Lazy load heavy component
const PostDataGrid = React.lazy(() =>
    import('./grids/PostDataGrid')
);

// For named exports
const MyComponent = React.lazy(() =>
    import('./MyComponent').then(module => ({
        default: module.MyComponent
    }))
);
```

**Example from PostTable.tsx:**

```typescript
/**
 * Main post table container component
 */
import React, { useState, useCallback } from 'react';
import { Box, Paper } from '@mui/material';

// Lazy load PostDataGrid to optimize bundle size
const PostDataGrid = React.lazy(() => import('./grids/PostDataGrid'));

import { SuspenseLoader } from '~components/SuspenseLoader';

export const PostTable: React.FC<PostTableProps> = ({ formId }) => {
    return (
        <Box>
            <SuspenseLoader>
                <PostDataGrid formId={formId} />
            </SuspenseLoader>
        </Box>
    );
};

export default PostTable;
```

---

## Suspense Boundaries

### SuspenseLoader Component

**Import:**
```typescript
import { SuspenseLoader } from '~components/SuspenseLoader';
// Or
import { SuspenseLoader } from '@/components/SuspenseLoader';
```

**Usage:**
```typescript
<SuspenseLoader>
    <LazyLoadedComponent />
</SuspenseLoader>
```

**What it does:**
- Shows loading indicator while lazy component loads
- Smooth fade-in animation
- Consistent loading experience
- Prevents layout shift

### Where to Place Suspense Boundaries

**Route Level:**
```typescript
// routes/my-route/index.tsx
const MyPage = lazy(() => import('@/features/my-feature/components/MyPage'));

function Route() {
    return (
        <SuspenseLoader>
            <MyPage />
        </SuspenseLoader>
    );
}
```

**Component Level:**
```typescript
function ParentComponent() {
    return (
        <Box>
            <Header />
            <SuspenseLoader>
                <HeavyDataGrid />
            </SuspenseLoader>
        </Box>
    );
}
```

**Multiple Boundaries:**
```typescript
function Page() {
    return (
        <Box>
            <SuspenseLoader>
                <HeaderSection />
            </SuspenseLoader>

            <SuspenseLoader>
                <MainContent />
            </SuspenseLoader>

            <SuspenseLoader>
                <Sidebar />
            </SuspenseLoader>
        </Box>
    );
}
```

Each section loads independently, better UX.

---

## Component Structure Template

### Recommended Order

```typescript
/**
 * Component description
 * What it does, when to use it
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Paper, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';

// Feature imports
import { myFeatureApi } from '../api/myFeatureApi';
import type { MyData } from '~types/myData';

// Component imports
import { SuspenseLoader } from '~components/SuspenseLoader';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useMuiSnackbar } from '@/hooks/useMuiSnackbar';

// 1. PROPS INTERFACE (with JSDoc)
interface MyComponentProps {
    /** The ID of the entity to display */
    entityId: number;
    /** Optional callback when action completes */
    onComplete?: () => void;
    /** Display mode */
    mode?: 'view' | 'edit';
}

// 2. STYLES (if inline and <100 lines)
const componentStyles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
    },
};

// 3. COMPONENT DEFINITION
export const MyComponent: React.FC<MyComponentProps> = ({
    entityId,
    onComplete,
    mode = 'view',
}) => {
    // 4. HOOKS (in this order)
    // - Context hooks first
    const { user } = useAuth();
    const { showSuccess, showError } = useMuiSnackbar();

    // - Data fetching
    const { data } = useSuspenseQuery({
        queryKey: ['myEntity', entityId],
        queryFn: () => myFeatureApi.getEntity(entityId),
    });

    // - Local state
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(mode === 'edit');

    // - Memoized values
    const filteredData = useMemo(() => {
        return data.filter(item => item.active);
    }, [data]);

    // - Effects
    useEffect(() => {
        // Setup
        return () => {
            // Cleanup
        };
    }, []);

    // 5. EVENT HANDLERS (with useCallback)
    const handleItemSelect = useCallback((itemId: string) => {
        setSelectedItem(itemId);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            await myFeatureApi.updateEntity(entityId, { /* data */ });
            showSuccess('Entity updated successfully');
            onComplete?.();
        } catch (error) {
            showError('Failed to update entity');
        }
    }, [entityId, onComplete, showSuccess, showError]);

    // 6. RENDER
    return (
        <Box sx={componentStyles.container}>
            <Box sx={componentStyles.header}>
                <h2>My Component</h2>
                <Button onClick={handleSave}>Save</Button>
            </Box>

            <Paper sx={{ p: 2 }}>
                {filteredData.map(item => (
                    <div key={item.id}>{item.name}</div>
                ))}
            </Paper>
        </Box>
    );
};

// 7. EXPORT (default export at bottom)
export default MyComponent;
```

---

## Component Separation

### When to Split Components

**Split into multiple components when:**
- Component exceeds 300 lines
- Multiple distinct responsibilities
- Reusable sections
- Complex nested JSX

**Example:**

```typescript
// ❌ AVOID - Monolithic
function MassiveComponent() {
    // 500+ lines
    // Search logic
    // Filter logic
    // Grid logic
    // Action panel logic
}

// ✅ PREFERRED - Modular
function ParentContainer() {
    return (
        <Box>
            <SearchAndFilter onFilter={handleFilter} />
            <DataGrid data={filteredData} />
            <ActionPanel onAction={handleAction} />
        </Box>
    );
}
```

### When to Keep Together

**Keep in same file when:**
- Component < 200 lines
- Tightly coupled logic
- Not reusable elsewhere
- Simple presentation component

---

## Export Patterns

### Named Const + Default Export (PREFERRED)

```typescript
export const MyComponent: React.FC<Props> = ({ ... }) => {
    // Component logic
};

export default MyComponent;
```

**Why:**
- Named export for testing/refactoring
- Default export for lazy loading convenience
- Both options available to consumers

### Lazy Loading Named Exports

```typescript
const MyComponent = React.lazy(() =>
    import('./MyComponent').then(module => ({
        default: module.MyComponent
    }))
);
```

---

## Component Communication

### Props Down, Events Up

```typescript
// Parent
function Parent() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <Child
            data={data}                    // Props down
            onSelect={setSelectedId}       // Events up
        />
    );
}

// Child
interface ChildProps {
    data: Data[];
    onSelect: (id: string) => void;
}

export const Child: React.FC<ChildProps> = ({ data, onSelect }) => {
    return (
        <div onClick={() => onSelect(data[0].id)}>
            {/* Content */}
        </div>
    );
};
```

### Avoid Prop Drilling

**Use context for deep nesting:**
```typescript
// ❌ AVOID - Prop drilling 5+ levels
<A prop={x}>
  <B prop={x}>
    <C prop={x}>
      <D prop={x}>
        <E prop={x} />  // Finally uses it here
      </D>
    </C>
  </B>
</A>

// ✅ PREFERRED - Context or TanStack Query
const MyContext = createContext<MyData | null>(null);

function Provider({ children }) {
    const { data } = useSuspenseQuery({ ... });
    return <MyContext.Provider value={data}>{children}</MyContext.Provider>;
}

function DeepChild() {
    const data = useContext(MyContext);
    // Use data directly
}
```

---

## Advanced Patterns

### Compound Components

```typescript
// Card.tsx
export const Card: React.FC<CardProps> & {
    Header: typeof CardHeader;
    Body: typeof CardBody;
    Footer: typeof CardFooter;
} = ({ children }) => {
    return <Paper>{children}</Paper>;
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// Usage
<Card>
    <Card.Header>Title</Card.Header>
    <Card.Body>Content</Card.Body>
    <Card.Footer>Actions</Card.Footer>
</Card>
```

### Render Props (Rare, but useful)

```typescript
interface DataProviderProps {
    children: (data: Data) => React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const { data } = useSuspenseQuery({ ... });
    return <>{children(data)}</>;
};

// Usage
<DataProvider>
    {(data) => <Display data={data} />}
</DataProvider>
```

---

## Summary

**Modern Component Recipe:**
1. `React.FC<Props>` with TypeScript
2. Lazy load if heavy: `React.lazy(() => import())`
3. Wrap in `<SuspenseLoader>` for loading
4. Use `useSuspenseQuery` for data
5. Import aliases (@/, ~types, ~components)
6. Event handlers with `useCallback`
7. Default export at bottom
8. No early returns for loading states

**See Also:**
- [data-fetching.md](data-fetching.md) - useSuspenseQuery details
- [loading-and-error-states.md](loading-and-error-states.md) - Suspense best practices
- [complete-examples.md](complete-examples.md) - Full working examples

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
