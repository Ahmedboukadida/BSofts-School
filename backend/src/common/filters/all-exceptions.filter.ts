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
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let stack: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
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

    // Persist critical system errors (5xx) to SystemLog table
    if (status >= 500 && this.prisma) {
      try {
        await this.prisma.systemLog.create({
          data: {
            level: 'ERROR',
            message: Array.isArray(message) ? message.join('; ') : String(message),
            stack: stack || null,
            context: 'HttpExceptionFilter',
            path: request.url,
            method: request.method,
            statusCode: status,
            userId: (request as any).user?.id || null,
            ipAddress: request.ip || null,
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
