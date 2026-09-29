import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly prisma?: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (resp.message !== undefined && resp.message !== null) {
          message = resp.message as string | string[];
        }
        if (resp.error) {
          error = String(resp.error);
        }
      }
      stack = exception.stack;
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
      message = exception.message || 'An unexpected error occurred';
      error = exception.name || 'Internal Server Error';
      stack = exception.stack;
    }

    // Persist all client errors (4xx) and system errors (5xx) to SystemLog table (Task 1.7 / Issues A3/B10)
    if (status >= 400 && this.prisma) {
      try {
        const level = status >= 500 ? 'ERROR' : 'WARN';
        const clientIp =
          (request.headers && typeof request.headers['x-forwarded-for'] === 'string'
            ? request.headers['x-forwarded-for'].split(',')[0].trim()
            : null) ||
          request.ip ||
          request.socket?.remoteAddress ||
          null;

        const userId =
          (request.user as { id?: string } | undefined)?.id ||
          (request as any)?.user?.id ||
          null;

        await this.prisma.systemLog.create({
          data: {
            level,
            message: Array.isArray(message) ? message.join('; ') : String(message),
            stack: stack || null,
            context: 'HttpExceptionFilter',
            path: request.url,
            method: request.method,
            statusCode: status,
            userId,
            ipAddress: clientIp,
          },
        });
      } catch (logErr: any) {
        this.logger.error(`Failed to record SystemLog in database: ${logErr.message}`);
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code: error,
        message: Array.isArray(message) ? message : [message],
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
