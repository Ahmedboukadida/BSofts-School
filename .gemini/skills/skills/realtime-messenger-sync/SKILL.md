---
name: realtime-messenger-sync
description: Manages Facebook Messenger style floating bubbles, recursive parent_id thread grouping, dual Socket.IO event broadcasting, HTTP cache-buster timestamps, and clean PDF conversation exports.
---

# Real-Time Messenger & Conversation Sync Skill

This skill enforces standards for real-time messaging, floating avatar bubbles, thread normalization, dual WebSocket emission, and PDF conversation exports.

## Core Rules & Standards

### 1. Dual Real-Time WebSocket Emission (NestJS `messages.service.ts`)
- Every message creation event must emit a `message.created` Socket.IO event to **BOTH `sender_id` AND `receiver_id`**:
  ```ts
  if (created.receiver_id) {
    this.eventsGateway.emitToUser(created.receiver_id, 'message.created', eventPayload);
  }
  if (created.sender_id) {
    this.eventsGateway.emitToUser(created.sender_id, 'message.created', eventPayload);
  }
  ```

### 2. Recursive Parent Thread Grouping & ID Coercion
- Always trace `parent_id` recursively to identify the absolute root message (`rootId`).
- Coerce all User IDs and Message IDs using `Number(id)` before strict equality checking:
  ```ts
  const myId = user?.id ? Number(user.id) : null;
  const sId = Number(m.sender_id);
  const rId = m.receiver_id ? Number(m.receiver_id) : null;
  ```

### 3. Client HTTP Cache-Buster Timestamps
- Append `?_t=${Date.now()}` to GET requests for messages and notifications to bypass stale memory caching in Axios `client.ts`:
  ```ts
  apiClient.get<MessageItem[]>(`/messages?_t=${Date.now()}`)
  ```

### 4. PDF Conversation Transcript Exporter
- Replace window print screenshots with clean, formatted HTML document exports containing branded headers, sender names, timestamps, and message contents.


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
