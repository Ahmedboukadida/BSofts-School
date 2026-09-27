---
name: frontend-permission-guard
description: Implements button-level permission guards, subscription module gates, and company-context guards for the BSOFTS frontend.
---

# Frontend Permission & Auth Validation

This skill defines the hooks and components required to protect UI elements and pages on the frontend. Note that backend guards remain the real source of security; these are for UX purposes.

## 1. The `usePermission()` Hook

Lives at `web/src/hooks/usePermission.ts`. It reads the user's role and permissions from `AuthContext` to determine if a specific action is allowed.

```typescript
import { useAuthContext } from "@/context/AuthContext";

export function usePermission() {
  const { user } = useAuthContext();

  const can = (permissionName: string): boolean => {
    if (!user) return false;

    // Developer bypass
    if (user.isDeveloper) return true;

    // Check user.permissions (assuming an array of strings or objects)
    return user.permissions?.includes(permissionName) ?? false;
  };

  return { can };
}
```

Usage in a component:

```tsx
const { can } = usePermission();

return <div>{can("inventory.write") && <button>Create Item</button>}</div>;
```

## 2. The `useRequireCompany()` Hook

Lives at `web/src/hooks/useRequireCompany.ts`. Ensures the user has an active company selected before rendering module pages.

```typescript
import React from 'react';
import { useCompanyContext } from '@/context/CompanyContext'; // Assuming this exists

export function useRequireCompany(isAllMode: boolean = false) {
  const { activeCompany } = useCompanyContext();

  const hasCompany = !!activeCompany;

  const CompanyPrompt: React.FC = () => {
    if (isAllMode) return null;
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Company Required</h3>
          <p className="text-slate-500 dark:text-slate-400">Please select an active company to continue.</p>
        </div>
      </div>
    );
  };

  return { hasCompany, CompanyPrompt };
}
```

Usage in a page:

```tsx
const { hasCompany, CompanyPrompt } = useRequireCompany();
if (!hasCompany) return <CompanyPrompt />;
```

## 3. The `<SubscriptionGate>` Component

Lives at `web/src/components/ui/subscription-gate.tsx`. It guards access to entire modules based on the active company's subscription plan.

```tsx
import React from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useCompanyContext } from "@/context/CompanyContext";
import { Lock } from "lucide-react";

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
}

export function SubscriptionGate({ feature, children }: SubscriptionGateProps) {
  const { user } = useAuthContext();
  const { activeCompany } = useCompanyContext();

  const isDeveloper = user?.isDeveloper;
  const features = activeCompany?.subscription?.packs?.features || [];
  const hasFeature = features.includes(feature);

  if (hasFeature || isDeveloper) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <Lock className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Upgrade Required
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
        This feature ({feature}) is not included in your current plan. Contact
        Support to Upgrade.
      </p>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
        Contact Support
      </button>
    </div>
  );
}
```

Usage in module pages:

```tsx
<SubscriptionGate feature="inventory">
  <InventoryPage />
</SubscriptionGate>
```

## 4. Token Expiry Handling

In the Axios client (`web/src/lib/apis/client.ts`), intercept 401 Unauthorized responses to seamlessly log the user out if their JWT has expired.

```typescript
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "react-hot-toast"; // Or your toast library

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { clearAuth } = useAuthStore.getState();
      clearAuth();
      toast.error("Session expired. Please log in again.");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);
```

## 5. Page-Level Auth Protection

The dashboard layout (`layout.tsx`) handles unauthenticated users by redirecting them to `/`.

However, ERP pages must also ensure they operate within the context of a company. Every ERP page should start with:

```tsx
const { hasCompany, CompanyPrompt } = useRequireCompany();
if (!hasCompany) return <CompanyPrompt />;
```

---

## 👑 Upgraded Skill Governance Directives (2026 Standard)

1. **Zero-Regression Enforcement**: All service, controller, and DTO changes must be verified against `npx tsc --noEmit` with 0 errors.
2. **Dual-Route Path Alias Rule**: All NestJS controllers handling hyphenated/underscored route paths MUST register dual route array paths via `@Controller(['canonical-path', 'alias-path'])`.
3. **Multi-Tenant Context & God-Mode Auth**: Always validate `x-company-id` headers while honoring `isDeveloper` / `is_developer` god-mode bypass logic across all guards.
4. **Strict DTO Validation**: All Create & Update DTOs must enforce 100% `class-validator` decorator coverage. Optional fields require `@IsOptional()`. Money fields must be integer millimes (`@IsInt()`).


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
