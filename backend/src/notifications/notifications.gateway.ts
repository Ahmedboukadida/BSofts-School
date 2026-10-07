import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token — disconnecting`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.user = payload;

      // Join personal user room
      const userId: string = payload.sub || payload.id;
      client.join(`user:${userId}`);

      // Join tenant room if tenantId present
      const tenantId: string | undefined = payload.tenantId;
      if (tenantId) {
        client.join(`tenant:${tenantId}`);
      }

      this.logger.log(`Client ${client.id} connected — userId=${userId}, tenantId=${tenantId ?? 'none'}`);
    } catch (err) {
      this.logger.warn(`Client ${client.id} JWT verification failed — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /** Client can explicitly join a tenant room after connection */
  @SubscribeMessage('join:tenant')
  handleJoinTenant(
    @ConnectedSocket() client: Socket,
    @MessageBody() tenantId: string,
  ): void {
    const userTenantId = client.data.user?.tenantId;
    // Only allow join if tenant matches their profile (or root)
    if (userTenantId === tenantId || client.data.user?.isRoot) {
      client.join(`tenant:${tenantId}`);
    }
  }

  /**
   * Emit a real-time event to a specific user.
   * Called by NotificationsService after DB insert.
   */
  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /**
   * Broadcast a real-time event to all users in a tenant.
   */
  emitToTenant(tenantId: string, event: string, payload: unknown): void {
    this.server.to(`tenant:${tenantId}`).emit(event, payload);
  }
}
