# TypeScript Standards

TypeScript best practices for type safety and maintainability in React frontend code.

---

## Strict Mode

### Configuration

TypeScript strict mode is **enabled** in the project:

```json
// tsconfig.json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
    }
}
```

**This means:**
- No implicit `any` types
- Null/undefined must be handled explicitly
- Type safety enforced

---

## No `any` Type

### The Rule

```typescript
// ❌ NEVER use any
function handleData(data: any) {
    return data.something;
}

// ✅ Use specific types
interface MyData {
    something: string;
}

function handleData(data: MyData) {
    return data.something;
}

// ✅ Or use unknown for truly unknown data
function handleUnknown(data: unknown) {
    if (typeof data === 'object' && data !== null && 'something' in data) {
        return (data as MyData).something;
    }
}
```

**If you truly don't know the type:**
- Use `unknown` (forces type checking)
- Use type guards to narrow
- Document why type is unknown

---

## Explicit Return Types

### Function Return Types

```typescript
// ✅ CORRECT - Explicit return type
function getUser(id: number): Promise<User> {
    return apiClient.get(`/users/${id}`);
}

function calculateTotal(items: Item[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ AVOID - Implicit return type (less clear)
function getUser(id: number) {
    return apiClient.get(`/users/${id}`);
}
```

### Component Return Types

```typescript
// React.FC already provides return type (ReactElement)
export const MyComponent: React.FC<Props> = ({ prop }) => {
    return <div>{prop}</div>;
};

// For custom hooks
function useMyData(id: number): { data: Data; isLoading: boolean } {
    const [data, setData] = useState<Data | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    return { data: data!, isLoading };
}
```

---

## Type Imports

### Use 'type' Keyword

```typescript
// ✅ CORRECT - Explicitly mark as type import
import type { User } from '~types/user';
import type { Post } from '~types/post';
import type { SxProps, Theme } from '@mui/material';

// ❌ AVOID - Mixed value and type imports
import { User } from '~types/user';  // Unclear if type or value
```

**Benefits:**
- Clearly separates types from values
- Better tree-shaking
- Prevents circular dependencies
- TypeScript compiler optimization

---

## Component Prop Interfaces

### Interface Pattern

```typescript
/**
 * Props for MyComponent
 */
interface MyComponentProps {
    /** The user ID to display */
    userId: number;

    /** Optional callback when action completes */
    onComplete?: () => void;

    /** Display mode for the component */
    mode?: 'view' | 'edit';

    /** Additional CSS classes */
    className?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
    userId,
    onComplete,
    mode = 'view',  // Default value
    className,
}) => {
    return <div>...</div>;
};
```

**Key Points:**
- Separate interface for props
- JSDoc comments for each prop
- Optional props use `?`
- Provide defaults in destructuring

### Props with Children

```typescript
interface ContainerProps {
    children: React.ReactNode;
    title: string;
}

// React.FC automatically includes children type, but be explicit
export const Container: React.FC<ContainerProps> = ({ children, title }) => {
    return (
        <div>
            <h2>{title}</h2>
            {children}
        </div>
    );
};
```

---

## Utility Types

### Partial<T>

```typescript
// Make all properties optional
type UserUpdate = Partial<User>;

function updateUser(id: number, updates: Partial<User>) {
    // updates can have any subset of User properties
}
```

### Pick<T, K>

```typescript
// Select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;

const preview: UserPreview = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    // Other User properties not allowed
};
```

### Omit<T, K>

```typescript
// Exclude specific properties
type UserWithoutPassword = Omit<User, 'password' | 'passwordHash'>;

const publicUser: UserWithoutPassword = {
    id: 1,
    name: 'John',
    email: 'john@example.com',
    // password and passwordHash not allowed
};
```

### Required<T>

```typescript
// Make all properties required
type RequiredConfig = Required<Config>;  // All optional props become required
```

### Record<K, V>

```typescript
// Type-safe object/map
const userMap: Record<string, User> = {
    'user1': { id: 1, name: 'John' },
    'user2': { id: 2, name: 'Jane' },
};

// For styles
import type { SxProps, Theme } from '@mui/material';

const styles: Record<string, SxProps<Theme>> = {
    container: { p: 2 },
    header: { mb: 1 },
};
```

---

## Type Guards

### Basic Type Guards

```typescript
function isUser(data: unknown): data is User {
    return (
        typeof data === 'object' &&
        data !== null &&
        'id' in data &&
        'name' in data
    );
}

// Usage
if (isUser(response)) {
    console.log(response.name);  // TypeScript knows it's User
}
```

### Discriminated Unions

```typescript
type LoadingState =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: Data }
    | { status: 'error'; error: Error };

function Component({ state }: { state: LoadingState }) {
    // TypeScript narrows type based on status
    if (state.status === 'success') {
        return <Display data={state.data} />;  // data available here
    }

    if (state.status === 'error') {
        return <Error error={state.error} />;  // error available here
    }

    return <Loading />;
}
```

---

## Generic Types

### Generic Functions

```typescript
function getById<T>(items: T[], id: number): T | undefined {
    return items.find(item => (item as any).id === id);
}

// Usage with type inference
const users: User[] = [...];
const user = getById(users, 123);  // Type: User | undefined
```

### Generic Components

```typescript
interface ListProps<T> {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
}

export function List<T>({ items, renderItem }: ListProps<T>): React.ReactElement {
    return (
        <div>
            {items.map((item, index) => (
                <div key={index}>{renderItem(item)}</div>
            ))}
        </div>
    );
}

// Usage
<List<User>
    items={users}
    renderItem={(user) => <UserCard user={user} />}
/>
```

---

## Type Assertions (Use Sparingly)

### When to Use

```typescript
// ✅ OK - When you know more than TypeScript
const element = document.getElementById('my-element') as HTMLInputElement;
const value = element.value;

// ✅ OK - API response that you've validated
const response = await api.getData();
const user = response.data as User;  // You know the shape
```

### When NOT to Use

```typescript
// ❌ AVOID - Circumventing type safety
const data = getData() as any;  // WRONG - defeats TypeScript

// ❌ AVOID - Unsafe assertion
const value = unknownValue as string;  // Might not actually be string
```

---

## Null/Undefined Handling

### Optional Chaining

```typescript
// ✅ CORRECT
const name = user?.profile?.name;

// Equivalent to:
const name = user && user.profile && user.profile.name;
```

### Nullish Coalescing

```typescript
// ✅ CORRECT
const displayName = user?.name ?? 'Anonymous';

// Only uses default if null or undefined
// (Different from || which triggers on '', 0, false)
```

### Non-Null Assertion (Use Carefully)

```typescript
// ✅ OK - When you're certain value exists
const data = queryClient.getQueryData<Data>(['data'])!;

// ⚠️ CAREFUL - Only use when you KNOW it's not null
// Better to check explicitly:
const data = queryClient.getQueryData<Data>(['data']);
if (data) {
    // Use data
}
```

---

## Summary

**TypeScript Checklist:**
- ✅ Strict mode enabled
- ✅ No `any` type (use `unknown` if needed)
- ✅ Explicit return types on functions
- ✅ Use `import type` for type imports
- ✅ JSDoc comments on prop interfaces
- ✅ Utility types (Partial, Pick, Omit, Required, Record)
- ✅ Type guards for narrowing
- ✅ Optional chaining and nullish coalescing
- ❌ Avoid type assertions unless necessary

**See Also:**
- [component-patterns.md](component-patterns.md) - Component typing
- [data-fetching.md](data-fetching.md) - API typing

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
