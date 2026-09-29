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
    const { method, url, user } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `${method} ${url} ${duration}ms - User: ${user?.id || 'anonymous'}`,
          );

          // Directive: LoginLog is reserved strictly for login attempts.
          // Skip recording /auth/login in AuditLog.
          if (url.includes('/auth/login')) {
            return;
          }

          // Log successfully executed mutations (2xx status)
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
              let actorSnapshot: string | null = null;
              if (user) {
                const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User';
                const handle = user.username ? `@${user.username}` : user.email ? `@${user.email}` : '';
                const role = user.isRoot ? 'ROOT' : user.roles?.[0]?.role?.code || 'USER';
                actorSnapshot = `${name} (${handle}) [${role}]`.replace(/\s+/g, ' ').trim();
              }

              // Determine resolved user ID
              const resolvedUserId =
                user?.id ||
                response?.user?.id ||
                response?.data?.user?.id ||
                response?.data?.id ||
                (typeof response?.id === 'string' ? response.id : null) ||
                null;

              const clientIp =
                (request.headers && typeof request.headers['x-forwarded-for'] === 'string'
                  ? request.headers['x-forwarded-for'].split(',')[0].trim()
                  : null) ||
                request.ip ||
                request.socket?.remoteAddress ||
                null;

              const userAgent = (request.headers && request.headers['user-agent']) || null;

              const action = this.resolveAction(method, url);
              const entity = this.extractEntity(url);
              const entityId = this.extractEntityId(url) || (response?.id ? String(response.id) : undefined);

              // Redact sensitive credentials in audit newValues
              const sanitizedValues = method !== 'DELETE' ? this.sanitizePayload(response) : undefined;

              await this.prisma.auditLog.create({
                data: {
                  userId: resolvedUserId,
                  actorSnapshot,
                  action,
                  entity,
                  entityId,
                  status: 'SUCCESS',
                  newValues: sanitizedValues,
                  ipAddress: clientIp,
                  userAgent,
                },
              });
            } catch (error: any) {
              this.logger.error(`Failed to create audit log for ${method} ${url}: ${error.message}`);
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

  private resolveAction(method: string, url: string): string {
    const cleanUrl = url.toLowerCase();
    if (cleanUrl.includes('/auth/register')) return 'AUTH_REGISTER';
    if (cleanUrl.includes('/auth/refresh')) return 'AUTH_TOKEN_REFRESH';
    if (cleanUrl.includes('/auth/change-password')) return 'AUTH_PASSWORD_CHANGE';
    if (cleanUrl.includes('/auth/forgot-password')) return 'AUTH_FORGOT_PASSWORD';
    if (cleanUrl.includes('/auth/reset-password')) return 'AUTH_PASSWORD_RESET';
    if (cleanUrl.includes('/auth/verify-email')) return 'AUTH_EMAIL_VERIFIED';
    if (cleanUrl.includes('/auth/totp/enable')) return 'AUTH_2FA_SETUP';
    if (cleanUrl.includes('/auth/totp/verify')) return 'AUTH_2FA_ACTIVATED';
    if (cleanUrl.includes('/auth/profile')) return 'AUTH_PROFILE_UPDATE';

    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };
    return actionMap[method] || 'EXECUTE';
  }

  private extractEntity(url: string): string {
    const parts = url.split('?')[0].split('/').filter(Boolean);
    if (parts[0] === 'api') {
      return parts[1] || 'general';
    }
    return parts[0] || 'general';
  }

  private extractEntityId(url: string): string | undefined {
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const part of parts) {
      if (uuidRegex.test(part)) {
        return part;
      }
    }
    return undefined;
  }

  private sanitizePayload(data: any): any {
    if (!data || typeof data !== 'object') return data;
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizePayload(item));
    }

    const SENSITIVE_KEYS = new Set([
      'password',
      'currentpassword',
      'newpassword',
      'token',
      'accesstoken',
      'refreshtoken',
      'twofactorsecret',
      'stripesecret',
      'resetpasswordtoken',
      'emailverificationtoken',
      'secret',
    ]);

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizePayload(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

