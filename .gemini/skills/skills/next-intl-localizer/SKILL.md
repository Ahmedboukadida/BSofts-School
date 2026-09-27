---
name: next-intl-localizer
description: Scans components to eliminate hardcoded text, wiring all UI elements through fr/en/ar dictionaries.
---

# Next-Intl Localizer Skill

This skill defines the rules for internationalization (i18n) within the BSOFTS Next.js web application.

## 1. Current State and Goals

- **Current State:** The Dashboard is currently 0% translated. ALL dashboard text is hardcoded.
- **Goal:** Eliminate all hardcoded text. Every piece of user-facing text must go through `next-intl`.

## 2. i18n Dictionary Files

The translation message files are located in: `web/src/messages/{en,fr,ar}.json`.

Currently, `en.json` contains a `LandingPage` namespace.
When localizing the dashboard, you must add a new `Dashboard` namespace to these files.

## 3. Component Usage

To translate text in a React component, use the `useTranslations` hook from `next-intl`.

```tsx
import { useTranslations } from "next-intl";

export default function UsersPage() {
  const t = useTranslations("Dashboard");

  return (
    <div>
      <h1>{t("users.title")}</h1>
      <button>{t("users.button.invite")}</button>
    </div>
  );
}
```

## 4. Key Naming Convention

Translation keys must follow this hierarchical structure:
`{section}.{component}.{label}`

Examples:

- `users.table.name`
- `users.button.invite`
- `settings.modal.confirm`

### Required Translations for Dashboard Pages

When building or refactoring a dashboard page, you MUST add translation keys for the following elements:

- Page title
- Page subtitle
- Button labels (create, edit, delete, save, cancel, refresh)
- Table column headers
- Filter labels
- Empty state text
- Modal titles
- Toast messages (for success/info, NOT backend errors)

## 5. Prohibited Patterns

### No Ternary Language Checks

**REPLACE ALL instances of this pattern:**

```tsx
// BAD: Excludes French users and breaks Next-Intl
const label = isRtl ? "Arabic text" : "English text";
```

_Currently, French users see English text everywhere because of this bug._

### No Manual Window Reloads

**DO NOT use `window.location.reload()` to switch languages.**

To switch languages properly:

1. Update the cookie: `Cookies.set('locale', newLang)`
2. Refresh the Next.js router: `router.refresh()`

### Transitional Hooks

The `useLang()` hook is a TRANSITIONAL tool used during migration.
Your final code should use `useLocale()` directly from `next-intl`.

### Backend Errors

**Do NOT translate error messages that come from the backend.**
These come as pre-formatted strings from `extractErrorMessage` and should be displayed directly.

## 6. RTL Layout Handling

Do NOT handle Right-to-Left (RTL) styling on a per-component basis.
RTL layout is handled globally at the layout level.

```tsx
// In the root layout or dashboard layout
<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>
```

## 7. Reading the Locale

To access the current locale in client components or utilities outside of React context, read the locale cookie:

```typescript
import Cookies from "js-cookie";

const currentLocale = Cookies.get("locale"); // Values: 'en', 'fr', 'ar'
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
