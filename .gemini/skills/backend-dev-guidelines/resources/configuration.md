# Configuration Management - UnifiedConfig Pattern

Complete guide to managing configuration in backend microservices.

## Table of Contents

- [UnifiedConfig Overview](#unifiedconfig-overview)
- [NEVER Use process.env Directly](#never-use-processenv-directly)
- [Configuration Structure](#configuration-structure)
- [Environment-Specific Configs](#environment-specific-configs)
- [Secrets Management](#secrets-management)
- [Migration Guide](#migration-guide)

---

## UnifiedConfig Overview

### Why UnifiedConfig?

**Problems with process.env:**
- ❌ No type safety
- ❌ No validation
- ❌ Hard to test
- ❌ Scattered throughout code
- ❌ No default values
- ❌ Runtime errors for typos

**Benefits of unifiedConfig:**
- ✅ Type-safe configuration
- ✅ Single source of truth
- ✅ Validated at startup
- ✅ Easy to test with mocks
- ✅ Clear structure
- ✅ Fallback to environment variables

---

## NEVER Use process.env Directly

### The Rule

```typescript
// ❌ NEVER DO THIS
const timeout = parseInt(process.env.TIMEOUT_MS || '5000');
const dbHost = process.env.DB_HOST || 'localhost';

// ✅ ALWAYS DO THIS
import { config } from './config/unifiedConfig';
const timeout = config.timeouts.default;
const dbHost = config.database.host;
```

### Why This Matters

**Example of problems:**
```typescript
// Typo in environment variable name
const host = process.env.DB_HSOT; // undefined! No error!

// Type safety
const port = process.env.PORT; // string! Need parseInt
const timeout = parseInt(process.env.TIMEOUT); // NaN if not set!
```

**With unifiedConfig:**
```typescript
const port = config.server.port; // number, guaranteed
const timeout = config.timeouts.default; // number, with fallback
```

---

## Configuration Structure

### UnifiedConfig Interface

```typescript
export interface UnifiedConfig {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    server: {
        port: number;
        sessionSecret: string;
    };
    tokens: {
        jwt: string;
        inactivity: string;
        internal: string;
    };
    keycloak: {
        realm: string;
        client: string;
        baseUrl: string;
        secret: string;
    };
    aws: {
        region: string;
        emailQueueUrl: string;
        accessKeyId: string;
        secretAccessKey: string;
    };
    sentry: {
        dsn: string;
        environment: string;
        tracesSampleRate: number;
    };
    // ... more sections
}
```

### Implementation Pattern

**File:** `/blog-api/src/config/unifiedConfig.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';

const configPath = path.join(__dirname, '../../config.ini');
const iniConfig = ini.parse(fs.readFileSync(configPath, 'utf-8'));

export const config: UnifiedConfig = {
    database: {
        host: iniConfig.database?.host || process.env.DB_HOST || 'localhost',
        port: parseInt(iniConfig.database?.port || process.env.DB_PORT || '3306'),
        username: iniConfig.database?.username || process.env.DB_USER || 'root',
        password: iniConfig.database?.password || process.env.DB_PASSWORD || '',
        database: iniConfig.database?.database || process.env.DB_NAME || 'blog_dev',
    },
    server: {
        port: parseInt(iniConfig.server?.port || process.env.PORT || '3002'),
        sessionSecret: iniConfig.server?.sessionSecret || process.env.SESSION_SECRET || 'dev-secret',
    },
    // ... more configuration
};

// Validate critical config
if (!config.tokens.jwt) {
    throw new Error('JWT secret not configured!');
}
```

**Key Points:**
- Read from config.ini first
- Fallback to process.env
- Default values for development
- Validation at startup
- Type-safe access

---

## Environment-Specific Configs

### config.ini Structure

```ini
[database]
host = localhost
port = 3306
username = root
password = password1
database = blog_dev

[server]
port = 3002
sessionSecret = your-secret-here

[tokens]
jwt = your-jwt-secret
inactivity = 30m
internal = internal-api-token

[keycloak]
realm = myapp
client = myapp-client
baseUrl = http://localhost:8080
secret = keycloak-client-secret

[sentry]
dsn = https://your-sentry-dsn
environment = development
tracesSampleRate = 0.1
```

### Environment Overrides

```bash
# .env file (optional overrides)
DB_HOST=production-db.example.com
DB_PASSWORD=secure-password
PORT=80
```

**Precedence:**
1. config.ini (highest priority)
2. process.env variables
3. Hard-coded defaults (lowest priority)

---

## Secrets Management

### DO NOT Commit Secrets

```gitignore
# .gitignore
config.ini
.env
sentry.ini
*.pem
*.key
```

### Use Environment Variables in Production

```typescript
// Development: config.ini
// Production: Environment variables

export const config: UnifiedConfig = {
    database: {
        password: process.env.DB_PASSWORD || iniConfig.database?.password || '',
    },
    tokens: {
        jwt: process.env.JWT_SECRET || iniConfig.tokens?.jwt || '',
    },
};
```

---

## Migration Guide

### Find All process.env Usage

```bash
grep -r "process.env" blog-api/src/ --include="*.ts" | wc -l
```

### Migration Example

**Before:**
```typescript
// Scattered throughout code
const timeout = parseInt(process.env.OPENID_HTTP_TIMEOUT_MS || '15000');
const keycloakUrl = process.env.KEYCLOAK_BASE_URL;
const jwtSecret = process.env.JWT_SECRET;
```

**After:**
```typescript
import { config } from './config/unifiedConfig';

const timeout = config.keycloak.timeout;
const keycloakUrl = config.keycloak.baseUrl;
const jwtSecret = config.tokens.jwt;
```

**Benefits:**
- Type-safe
- Centralized
- Easy to test
- Validated at startup

---

**Related Files:**
- SKILL.md
- [testing-guide.md](testing-guide.md)


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
