# Styling Guide

Modern styling patterns for using MUI v7 sx prop, inline styles, and theme integration.

---

## Inline vs Separate Styles

### Decision Threshold

**<100 lines: Inline styles at top of component**

```typescript
import type { SxProps, Theme } from '@mui/material';

const componentStyles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        mb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
    },
    // ... more styles
};

export const MyComponent: React.FC = () => {
    return (
        <Box sx={componentStyles.container}>
            <Box sx={componentStyles.header}>
                <h2>Title</h2>
            </Box>
        </Box>
    );
};
```

**>100 lines: Separate `.styles.ts` file**

```typescript
// MyComponent.styles.ts
import type { SxProps, Theme } from '@mui/material';

export const componentStyles: Record<string, SxProps<Theme>> = {
    container: { ... },
    header: { ... },
    // ... 100+ lines of styles
};

// MyComponent.tsx
import { componentStyles } from './MyComponent.styles';

export const MyComponent: React.FC = () => {
    return <Box sx={componentStyles.container}>...</Box>;
};
```

### Real Example: UnifiedForm.tsx

**Lines 48-126**: 78 lines of inline styles (acceptable)

```typescript
const formStyles: Record<string, SxProps<Theme>> = {
    gridContainer: {
        height: '100%',
        maxHeight: 'calc(100vh - 220px)',
    },
    section: {
        height: '100%',
        maxHeight: 'calc(100vh - 220px)',
        overflow: 'auto',
        p: 4,
    },
    // ... 15 more style objects
};
```

**Guideline**: User is comfortable with ~80 lines inline. Use your judgment around 100 lines.

---

## sx Prop Patterns

### Basic Usage

```typescript
<Box sx={{ p: 2, mb: 3, display: 'flex' }}>
    Content
</Box>
```

### With Theme Access

```typescript
<Box
    sx={{
        p: 2,
        backgroundColor: (theme) => theme.palette.primary.main,
        color: (theme) => theme.palette.primary.contrastText,
        borderRadius: (theme) => theme.shape.borderRadius,
    }}
>
    Themed Box
</Box>
```

### Responsive Styles

```typescript
<Box
    sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: { xs: '100%', md: '50%' },
        flexDirection: { xs: 'column', md: 'row' },
    }}
>
    Responsive Layout
</Box>
```

### Pseudo-Selectors

```typescript
<Box
    sx={{
        p: 2,
        '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.05)',
        },
        '&:active': {
            backgroundColor: 'rgba(0,0,0,0.1)',
        },
        '& .child-class': {
            color: 'primary.main',
        },
    }}
>
    Interactive Box
</Box>
```

---

## MUI v7 Patterns

### Grid Component (v7 Syntax)

```typescript
import { Grid } from '@mui/material';

// ✅ CORRECT - v7 syntax with size prop
<Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>
        Left Column
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
        Right Column
    </Grid>
</Grid>

// ❌ WRONG - Old v6 syntax
<Grid container spacing={2}>
    <Grid xs={12} md={6}>  {/* OLD - Don't use */}
        Content
    </Grid>
</Grid>
```

**Key Change**: `size={{ xs: 12, md: 6 }}` instead of `xs={12} md={6}`

### Responsive Grid

```typescript
<Grid container spacing={3}>
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        Responsive Column
    </Grid>
</Grid>
```

### Nested Grids

```typescript
<Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 8 }}>
        <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
                Nested 1
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                Nested 2
            </Grid>
        </Grid>
    </Grid>

    <Grid size={{ xs: 12, md: 4 }}>
        Sidebar
    </Grid>
</Grid>
```

---

## Type-Safe Styles

### Style Object Type

```typescript
import type { SxProps, Theme } from '@mui/material';

// Type-safe styles
const styles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        // Autocomplete and type checking work here
    },
};

// Or individual style
const containerStyle: SxProps<Theme> = {
    p: 2,
    display: 'flex',
};
```

### Theme-Aware Styles

```typescript
const styles: Record<string, SxProps<Theme>> = {
    primary: {
        color: (theme) => theme.palette.primary.main,
        backgroundColor: (theme) => theme.palette.primary.light,
        '&:hover': {
            backgroundColor: (theme) => theme.palette.primary.dark,
        },
    },
    customSpacing: {
        padding: (theme) => theme.spacing(2),
        margin: (theme) => theme.spacing(1, 2), // top/bottom: 1, left/right: 2
    },
};
```

---

## What NOT to Use

### ❌ makeStyles (MUI v4 pattern)

```typescript
// ❌ AVOID - Old Material-UI v4 pattern
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));
```

**Why avoid**: Deprecated, v7 doesn't support it well

### ❌ styled() Components

```typescript
// ❌ AVOID - styled-components pattern
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
}));
```

**Why avoid**: sx prop is more flexible and doesn't create new components

### ✅ Use sx Prop Instead

```typescript
// ✅ PREFERRED
<Box
    sx={{
        p: 2,
        backgroundColor: 'primary.main',
    }}
>
    Content
</Box>
```

---

## Code Style Standards

### Indentation

**4 spaces** (not 2, not tabs)

```typescript
const styles: Record<string, SxProps<Theme>> = {
    container: {
        p: 2,
        display: 'flex',
        flexDirection: 'column',
    },
};
```

### Quotes

**Single quotes** for strings (project standard)

```typescript
// ✅ CORRECT
const color = 'primary.main';
import { Box } from '@mui/material';

// ❌ WRONG
const color = "primary.main";
import { Box } from "@mui/material";
```

### Trailing Commas

**Always use trailing commas** in objects and arrays

```typescript
// ✅ CORRECT
const styles = {
    container: { p: 2 },
    header: { mb: 1 },  // Trailing comma
};

const items = [
    'item1',
    'item2',  // Trailing comma
];

// ❌ WRONG - No trailing comma
const styles = {
    container: { p: 2 },
    header: { mb: 1 }  // Missing comma
};
```

---

## Common Style Patterns

### Flexbox Layout

```typescript
const styles = {
    flexRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
    },
    spaceBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
};
```

### Spacing

```typescript
// Padding
p: 2           // All sides
px: 2          // Horizontal (left + right)
py: 2          // Vertical (top + bottom)
pt: 2, pr: 1   // Specific sides

// Margin
m: 2, mx: 2, my: 2, mt: 2, mr: 1

// Units: 1 = 8px (theme.spacing(1))
p: 2  // = 16px
p: 0.5  // = 4px
```

### Positioning

```typescript
const styles = {
    relative: {
        position: 'relative',
    },
    absolute: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    sticky: {
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
};
```

---

## Summary

**Styling Checklist:**
- ✅ Use `sx` prop for MUI styling
- ✅ Type-safe with `SxProps<Theme>`
- ✅ <100 lines: inline; >100 lines: separate file
- ✅ MUI v7 Grid: `size={{ xs: 12 }}`
- ✅ 4 space indentation
- ✅ Single quotes
- ✅ Trailing commas
- ❌ No makeStyles or styled()

**See Also:**
- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full styling examples

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
