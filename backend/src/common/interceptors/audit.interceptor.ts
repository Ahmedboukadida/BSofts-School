import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} ${duration}ms - User: ${user?.id || 'anonymous'}`,
          );

          // Log mutation operations
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              let actorSnapshot: string | null = null;
              if (user) {
                const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
                const handle = user.username ? `@${user.username}` : user.email ? `@${user.email}` : '';
                const role = user.isRoot ? 'ROOT' : user.roles?.[0]?.role?.code || 'USER';
                actorSnapshot = `${name} (${handle}) [${role}]`.replace(/\s+/g, ' ').trim();
              }

              await this.prisma.auditLog.create({
                data: {
                  userId: user?.id,
                  actorSnapshot,
                  action: this.getMethodAction(method),
                  entity: this.extractEntity(url),
                  entityId: this.extractEntityId(url),
                  status: 'SUCCESS',
                  newValues: method !== 'DELETE' ? response : undefined,
                  ipAddress: request.ip,
                  userAgent: request.headers['user-agent'],
                },
              });
            } catch (error) {
              this.logger.error('Failed to create audit log', error);
            }
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }

  private getMethodAction(method: string): string {
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || 'READ';
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(Boolean);
    return parts[1] || 'unknown';
  }

  private extractEntityId(url: string): string | undefined {
    const parts = url.split('/').filter(Boolean);
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const part of parts) {
      if (uuidRegex.test(part)) {
        return part;
      }
    }
    return undefined;
  }
}
