---
name: websocket-gateway
description: Implements Socket.IO WebSocket gateway for real-time notifications and messages across backend (NestJS) and frontend (Next.js).
---

# WebSocket Gateway Implementation Guide

This skill guides the `backend-websocket` and `web-realtime` agents in implementing a full Socket.IO-based real-time infrastructure.

## 1. Backend Setup

### Installation
Run the following command in the backend directory:
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

### Gateway Implementation
Create the `NotificationsGateway` class at `backend/src/core/notifications/notifications.gateway.ts`.

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3007',
      'http://127.0.0.1:3007',
      'http://localhost:8081',
      'http://localhost:1420',
      'tauri://localhost',
      'http://localhost:3000',
    ], // Must match HTTP CORS origins from main.ts
    credentials: true,
  },
  namespace: '/ws',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      // Auto-join personal room
      client.join(`user_${payload.id}`);
      
      if (payload.active_company_id) {
        client.join(`company_${payload.active_company_id}`);
      }
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Cleanup if necessary
  }

  @SubscribeMessage('join_company')
  handleJoinCompany(client: Socket, companyId: number) {
    // Ensure they only join if they belong to it, or rely on auth payload
    client.join(`company_${companyId}`);
  }

  emitToUser(userId: number, event: string, payload: any) {
    this.server.to(`user_${userId}`).emit(event, payload);
  }

  emitToCompany(companyId: number, event: string, payload: any) {
    this.server.to(`company_${companyId}`).emit(event, payload);
  }
}
```

### Module Registration
Register the gateway in `NotificationsModule` and import it in `AppModule`.

## 2. Backend Integration

Inject the `NotificationsGateway` into any service creating notifications or messages.

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly gateway: NotificationsGateway) {}

  async createNotification(userId: number, payload: any) {
    // Save to DB...
    // const notification = await prisma.notifications.create(...)
    
    this.gateway.emitToUser(userId, 'notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      created_at: notification.created_at,
    });
  }

  async createMessage(receiverId: number, payload: any) {
    // Save to DB...
    
    this.gateway.emitToUser(receiverId, 'message', {
      id: message.id,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      subject: message.subject,
      preview: message.preview,
      created_at: message.created_at,
    });
  }
}
```

## 3. Frontend Client

### Installation
Run the following in the `web` directory:
```bash
npm install socket.io-client
```

### WebSocket Hook
Create `web/src/hooks/useWebSocket.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

export function useWebSocket(activeCompanyId?: number) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = Cookies.get('bsoft_auth_token');
    if (!token) return;

    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
    
    const socket = io(url, {
      path: '/socket.io',
      namespace: '/ws',
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      if (activeCompanyId) {
        socket.emit('join_company', activeCompanyId);
      }
    });

    socket.on('notification', (payload) => {
      // update notification badge count in state
    });

    socket.on('message', (payload) => {
      // update messages badge count + show toast
    });

    return () => {
      socket.disconnect();
    };
  }, [activeCompanyId]);

  return socketRef.current;
}
```

Mount this in the `DashboardLayout` component.

## 4. Security Rules
- WebSocket connections MUST be authenticated by validating the JWT on handshake.
- Company data MUST only emit to company members (use `company_${id}` rooms securely).
- Never emit sensitive data (passwords, tokens) over WebSocket.

## 5. Connection Status Indicator
Show a subtle green dot in the navbar when connected, and gray when disconnected. Use `socket.on('connect')` and `socket.on('disconnect')` to manage this state.


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
