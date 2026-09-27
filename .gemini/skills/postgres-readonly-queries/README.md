# postgres

Read-only PostgreSQL query skill. Query multiple databases safely with write protection.

## Setup

1. Copy the example config:
```bash
cp connections.example.json connections.json
```

2. Add your database credentials:
```json
{
  "databases": [
    {
      "name": "prod",
      "description": "Production - users, orders, transactions",
      "host": "db.example.com",
      "port": 5432,
      "database": "app_prod",
      "user": "readonly",
      "password": "secret",
      "sslmode": "require"
    }
  ]
}
```

3. Secure the config:
```bash
chmod 600 connections.json
```

## Usage

```bash
# List configured databases
python3 scripts/query.py --list

# List tables
python3 scripts/query.py --db prod --tables

# Show schema
python3 scripts/query.py --db prod --schema

# Run query
python3 scripts/query.py --db prod --query "SELECT * FROM users" --limit 100
```

## Config Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| name | Yes | - | Database identifier |
| description | Yes | - | What data it contains (for auto-selection) |
| host | Yes | - | Hostname |
| port | No | 5432 | Port |
| database | Yes | - | Database name |
| user | Yes | - | Username |
| password | Yes | - | Password |
| sslmode | No | prefer | disable, allow, prefer, require, verify-ca, verify-full |

## Safety Features

- **Read-only sessions**: PostgreSQL `readonly=True` mode blocks writes at database level
- **Query validation**: Only SELECT, SHOW, EXPLAIN, WITH allowed
- **Single statement**: No multi-statement queries (prevents `SELECT 1; DROP TABLE`)
- **Timeouts**: 30s query timeout, 10s connection timeout
- **Memory cap**: Max 10,000 rows per query
- **Credential protection**: Passwords sanitized from error messages

## Requirements

```bash
pip install psycopg2-binary
```


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
