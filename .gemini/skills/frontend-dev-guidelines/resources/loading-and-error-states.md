# Loading & Error States

**CRITICAL**: Proper loading and error state handling prevents layout shift and provides better user experience.

---

## ⚠️ CRITICAL RULE: Never Use Early Returns

### The Problem

```typescript
// ❌ NEVER DO THIS - Early return with loading spinner
const Component = () => {
    const { data, isLoading } = useQuery();

    // WRONG: This causes layout shift and poor UX
    if (isLoading) {
        return <LoadingSpinner />;
    }

    return <Content data={data} />;
};
```

**Why this is bad:**
1. **Layout Shift**: Content position jumps when loading completes
2. **CLS (Cumulative Layout Shift)**: Poor Core Web Vital score
3. **Jarring UX**: Page structure changes suddenly
4. **Lost Scroll Position**: User loses place on page

### The Solutions

**Option 1: SuspenseLoader (PREFERRED for new components)**

```typescript
import { SuspenseLoader } from '~components/SuspenseLoader';

const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

export const MyComponent: React.FC = () => {
    return (
        <SuspenseLoader>
            <HeavyComponent />
        </SuspenseLoader>
    );
};
```

**Option 2: LoadingOverlay (for legacy useQuery patterns)**

```typescript
import { LoadingOverlay } from '~components/LoadingOverlay';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({ ... });

    return (
        <LoadingOverlay loading={isLoading}>
            <Content data={data} />
        </LoadingOverlay>
    );
};
```

---

## SuspenseLoader Component

### What It Does

- Shows loading indicator while lazy components load
- Smooth fade-in animation
- Prevents layout shift
- Consistent loading experience across app

### Import

```typescript
import { SuspenseLoader } from '~components/SuspenseLoader';
// Or
import { SuspenseLoader } from '@/components/SuspenseLoader';
```

### Basic Usage

```typescript
<SuspenseLoader>
    <LazyLoadedComponent />
</SuspenseLoader>
```

### With useSuspenseQuery

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { SuspenseLoader } from '~components/SuspenseLoader';

const Inner: React.FC = () => {
    // No isLoading needed!
    const { data } = useSuspenseQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),
    });

    return <Display data={data} />;
};

// Outer component wraps in Suspense
export const Outer: React.FC = () => {
    return (
        <SuspenseLoader>
            <Inner />
        </SuspenseLoader>
    );
};
```

### Multiple Suspense Boundaries

**Pattern**: Separate loading for independent sections

```typescript
export const Dashboard: React.FC = () => {
    return (
        <Box>
            <SuspenseLoader>
                <Header />
            </SuspenseLoader>

            <SuspenseLoader>
                <MainContent />
            </SuspenseLoader>

            <SuspenseLoader>
                <Sidebar />
            </SuspenseLoader>
        </Box>
    );
};
```

**Benefits:**
- Each section loads independently
- User sees partial content sooner
- Better perceived performance

### Nested Suspense

```typescript
export const ParentComponent: React.FC = () => {
    return (
        <SuspenseLoader>
            {/* Parent suspends while loading */}
            <ParentContent>
                <SuspenseLoader>
                    {/* Nested suspense for child */}
                    <ChildComponent />
                </SuspenseLoader>
            </ParentContent>
        </SuspenseLoader>
    );
};
```

---

## LoadingOverlay Component

### When to Use

- Legacy components with `useQuery` (not refactored to Suspense yet)
- Overlay loading state needed
- Can't use Suspense boundaries

### Usage

```typescript
import { LoadingOverlay } from '~components/LoadingOverlay';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),
    });

    return (
        <LoadingOverlay loading={isLoading}>
            <Box sx={{ p: 2 }}>
                {data && <Content data={data} />}
            </Box>
        </LoadingOverlay>
    );
};
```

**What it does:**
- Shows semi-transparent overlay with spinner
- Content area reserved (no layout shift)
- Prevents interaction while loading

---

## Error Handling

### useMuiSnackbar Hook (REQUIRED)

**NEVER use react-toastify** - Project standard is MUI Snackbar

```typescript
import { useMuiSnackbar } from '@/hooks/useMuiSnackbar';

export const MyComponent: React.FC = () => {
    const { showSuccess, showError, showInfo, showWarning } = useMuiSnackbar();

    const handleAction = async () => {
        try {
            await api.doSomething();
            showSuccess('Operation completed successfully');
        } catch (error) {
            showError('Operation failed');
        }
    };

    return <Button onClick={handleAction}>Do Action</Button>;
};
```

**Available Methods:**
- `showSuccess(message)` - Green success message
- `showError(message)` - Red error message
- `showWarning(message)` - Orange warning message
- `showInfo(message)` - Blue info message

### TanStack Query Error Callbacks

```typescript
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMuiSnackbar } from '@/hooks/useMuiSnackbar';

export const MyComponent: React.FC = () => {
    const { showError } = useMuiSnackbar();

    const { data } = useSuspenseQuery({
        queryKey: ['data'],
        queryFn: () => api.getData(),

        // Handle errors
        onError: (error) => {
            showError('Failed to load data');
            console.error('Query error:', error);
        },
    });

    return <Content data={data} />;
};
```

### Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant='h5' color='error'>
                Something went wrong
            </Typography>
            <Typography>{error.message}</Typography>
            <Button onClick={resetErrorBoundary}>Try Again</Button>
        </Box>
    );
}

export const MyPage: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error) => console.error('Boundary caught:', error)}
        >
            <SuspenseLoader>
                <ComponentThatMightError />
            </SuspenseLoader>
        </ErrorBoundary>
    );
};
```

---

## Complete Examples

### Example 1: Modern Component with Suspense

```typescript
import React from 'react';
import { Box, Paper } from '@mui/material';
import { useSuspenseQuery } from '@tanstack/react-query';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { myFeatureApi } from '../api/myFeatureApi';

// Inner component uses useSuspenseQuery
const InnerComponent: React.FC<{ id: number }> = ({ id }) => {
    const { data } = useSuspenseQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
    });

    // data is always defined - no isLoading needed!
    return (
        <Paper sx={{ p: 2 }}>
            <h2>{data.title}</h2>
            <p>{data.description}</p>
        </Paper>
    );
};

// Outer component provides Suspense boundary
export const OuterComponent: React.FC<{ id: number }> = ({ id }) => {
    return (
        <Box>
            <SuspenseLoader>
                <InnerComponent id={id} />
            </SuspenseLoader>
        </Box>
    );
};

export default OuterComponent;
```

### Example 2: Legacy Pattern with LoadingOverlay

```typescript
import React from 'react';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LoadingOverlay } from '~components/LoadingOverlay';
import { myFeatureApi } from '../api/myFeatureApi';

export const LegacyComponent: React.FC<{ id: number }> = ({ id }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
    });

    return (
        <LoadingOverlay loading={isLoading}>
            <Box sx={{ p: 2 }}>
                {error && <ErrorDisplay error={error} />}
                {data && <Content data={data} />}
            </Box>
        </LoadingOverlay>
    );
};
```

### Example 3: Error Handling with Snackbar

```typescript
import React from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@mui/material';
import { useMuiSnackbar } from '@/hooks/useMuiSnackbar';
import { myFeatureApi } from '../api/myFeatureApi';

export const EntityEditor: React.FC<{ id: number }> = ({ id }) => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useMuiSnackbar();

    const { data } = useSuspenseQuery({
        queryKey: ['entity', id],
        queryFn: () => myFeatureApi.getEntity(id),
        onError: () => {
            showError('Failed to load entity');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (updates) => myFeatureApi.update(id, updates),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entity', id] });
            showSuccess('Entity updated successfully');
        },

        onError: () => {
            showError('Failed to update entity');
        },
    });

    return (
        <Button onClick={() => updateMutation.mutate({ name: 'New' })}>
            Update
        </Button>
    );
};
```

---

## Loading State Anti-Patterns

### ❌ What NOT to Do

```typescript
// ❌ NEVER - Early return
if (isLoading) {
    return <CircularProgress />;
}

// ❌ NEVER - Conditional rendering
{isLoading ? <Spinner /> : <Content />}

// ❌ NEVER - Layout changes
if (isLoading) {
    return (
        <Box sx={{ height: 100 }}>
            <Spinner />
        </Box>
    );
}
return (
    <Box sx={{ height: 500 }}>  // Different height!
        <Content />
    </Box>
);
```

### ✅ What TO Do

```typescript
// ✅ BEST - useSuspenseQuery + SuspenseLoader
<SuspenseLoader>
    <ComponentWithSuspenseQuery />
</SuspenseLoader>

// ✅ ACCEPTABLE - LoadingOverlay
<LoadingOverlay loading={isLoading}>
    <Content />
</LoadingOverlay>

// ✅ OK - Inline skeleton with same layout
<Box sx={{ height: 500 }}>
    {isLoading ? <Skeleton variant='rectangular' height='100%' /> : <Content />}
</Box>
```

---

## Skeleton Loading (Alternative)

### MUI Skeleton Component

```typescript
import { Skeleton, Box } from '@mui/material';

export const MyComponent: React.FC = () => {
    const { data, isLoading } = useQuery({ ... });

    return (
        <Box sx={{ p: 2 }}>
            {isLoading ? (
                <>
                    <Skeleton variant='text' width={200} height={40} />
                    <Skeleton variant='rectangular' width='100%' height={200} />
                    <Skeleton variant='text' width='100%' />
                </>
            ) : (
                <>
                    <Typography variant='h5'>{data.title}</Typography>
                    <img src={data.image} />
                    <Typography>{data.description}</Typography>
                </>
            )}
        </Box>
    );
};
```

**Key**: Skeleton must have **same layout** as actual content (no shift)

---

## Summary

**Loading States:**
- ✅ **PREFERRED**: SuspenseLoader + useSuspenseQuery (modern pattern)
- ✅ **ACCEPTABLE**: LoadingOverlay (legacy pattern)
- ✅ **OK**: Skeleton with same layout
- ❌ **NEVER**: Early returns or conditional layout

**Error Handling:**
- ✅ **ALWAYS**: useMuiSnackbar for user feedback
- ❌ **NEVER**: react-toastify
- ✅ Use onError callbacks in queries/mutations
- ✅ Error boundaries for component-level errors

**See Also:**
- [component-patterns.md](component-patterns.md) - Suspense integration
- [data-fetching.md](data-fetching.md) - useSuspenseQuery details

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
