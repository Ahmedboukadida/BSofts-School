# Routing Guide

TanStack Router implementation with folder-based routing and lazy loading patterns.

---

## TanStack Router Overview

**TanStack Router** with file-based routing:
- Folder structure defines routes
- Lazy loading for code splitting
- Type-safe routing
- Breadcrumb loaders

---

## Folder-Based Routing

### Directory Structure

```
routes/
  __root.tsx                    # Root layout
  index.tsx                     # Home route (/)
  posts/
    index.tsx                   # /posts
    create/
      index.tsx                 # /posts/create
    $postId.tsx                 # /posts/:postId (dynamic)
  comments/
    index.tsx                   # /comments
```

**Pattern**:
- `index.tsx` = Route at that path
- `$param.tsx` = Dynamic parameter
- Nested folders = Nested routes

---

## Basic Route Pattern

### Example from posts/index.tsx

```typescript
/**
 * Posts route component
 * Displays the main blog posts list
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

// Lazy load the page component
const PostsList = lazy(() =>
    import('@/features/posts/components/PostsList').then(
        (module) => ({ default: module.PostsList }),
    ),
);

export const Route = createFileRoute('/posts/')({
    component: PostsPage,
    // Define breadcrumb data
    loader: () => ({
        crumb: 'Posts',
    }),
});

function PostsPage() {
    return (
        <PostsList
            title='All Posts'
            showFilters={true}
        />
    );
}

export default PostsPage;
```

**Key Points:**
- Lazy load heavy components
- `createFileRoute` with route path
- `loader` for breadcrumb data
- Page component renders content
- Export both Route and component

---

## Lazy Loading Routes

### Named Export Pattern

```typescript
import { lazy } from 'react';

// For named exports, use .then() to map to default
const MyPage = lazy(() =>
    import('@/features/my-feature/components/MyPage').then(
        (module) => ({ default: module.MyPage })
    )
);
```

### Default Export Pattern

```typescript
import { lazy } from 'react';

// For default exports, simpler syntax
const MyPage = lazy(() => import('@/features/my-feature/components/MyPage'));
```

### Why Lazy Load Routes?

- Code splitting - smaller initial bundle
- Faster initial page load
- Load route code only when navigated to
- Better performance

---

## createFileRoute

### Basic Configuration

```typescript
export const Route = createFileRoute('/my-route/')({
    component: MyRoutePage,
});

function MyRoutePage() {
    return <div>My Route Content</div>;
}
```

### With Breadcrumb Loader

```typescript
export const Route = createFileRoute('/my-route/')({
    component: MyRoutePage,
    loader: () => ({
        crumb: 'My Route Title',
    }),
});
```

Breadcrumb appears in navigation/app bar automatically.

### With Data Loader

```typescript
export const Route = createFileRoute('/my-route/')({
    component: MyRoutePage,
    loader: async () => {
        // Can prefetch data here
        const data = await api.getData();
        return { crumb: 'My Route', data };
    },
});
```

### With Search Params

```typescript
export const Route = createFileRoute('/search/')({
    component: SearchPage,
    validateSearch: (search: Record<string, unknown>) => {
        return {
            query: (search.query as string) || '',
            page: Number(search.page) || 1,
        };
    },
});

function SearchPage() {
    const { query, page } = Route.useSearch();
    // Use query and page
}
```

---

## Dynamic Routes

### Parameter Routes

```typescript
// routes/users/$userId.tsx

export const Route = createFileRoute('/users/$userId')({
    component: UserPage,
});

function UserPage() {
    const { userId } = Route.useParams();

    return <UserProfile userId={userId} />;
}
```

### Multiple Parameters

```typescript
// routes/posts/$postId/comments/$commentId.tsx

export const Route = createFileRoute('/posts/$postId/comments/$commentId')({
    component: CommentPage,
});

function CommentPage() {
    const { postId, commentId } = Route.useParams();

    return <CommentEditor postId={postId} commentId={commentId} />;
}
```

---

## Navigation

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router';

export const MyComponent: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate({ to: '/posts' });
    };

    return <Button onClick={handleClick}>View Posts</Button>;
};
```

### With Parameters

```typescript
const handleNavigate = () => {
    navigate({
        to: '/users/$userId',
        params: { userId: '123' },
    });
};
```

### With Search Params

```typescript
const handleSearch = () => {
    navigate({
        to: '/search',
        search: { query: 'test', page: 1 },
    });
};
```

---

## Route Layout Pattern

### Root Layout (__root.tsx)

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Box } from '@mui/material';
import { CustomAppBar } from '~components/CustomAppBar';

export const Route = createRootRoute({
    component: RootLayout,
});

function RootLayout() {
    return (
        <Box>
            <CustomAppBar />
            <Box sx={{ p: 2 }}>
                <Outlet />  {/* Child routes render here */}
            </Box>
        </Box>
    );
}
```

### Nested Layouts

```typescript
// routes/dashboard/index.tsx
export const Route = createFileRoute('/dashboard/')({
    component: DashboardLayout,
});

function DashboardLayout() {
    return (
        <Box>
            <DashboardSidebar />
            <Box sx={{ flex: 1 }}>
                <Outlet />  {/* Nested routes */}
            </Box>
        </Box>
    );
}
```

---

## Complete Route Example

```typescript
/**
 * User profile route
 * Path: /users/:userId
 */

import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';
import { SuspenseLoader } from '~components/SuspenseLoader';

// Lazy load heavy component
const UserProfile = lazy(() =>
    import('@/features/users/components/UserProfile').then(
        (module) => ({ default: module.UserProfile })
    )
);

export const Route = createFileRoute('/users/$userId')({
    component: UserPage,
    loader: () => ({
        crumb: 'User Profile',
    }),
});

function UserPage() {
    const { userId } = Route.useParams();

    return (
        <SuspenseLoader>
            <UserProfile userId={userId} />
        </SuspenseLoader>
    );
}

export default UserPage;
```

---

## Summary

**Routing Checklist:**
- ✅ Folder-based: `routes/my-route/index.tsx`
- ✅ Lazy load components: `React.lazy(() => import())`
- ✅ Use `createFileRoute` with route path
- ✅ Add breadcrumb in `loader` function
- ✅ Wrap in `SuspenseLoader` for loading states
- ✅ Use `Route.useParams()` for dynamic params
- ✅ Use `useNavigate()` for programmatic navigation

**See Also:**
- [component-patterns.md](component-patterns.md) - Lazy loading patterns
- [loading-and-error-states.md](loading-and-error-states.md) - SuspenseLoader usage
- [complete-examples.md](complete-examples.md) - Full route examples

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
