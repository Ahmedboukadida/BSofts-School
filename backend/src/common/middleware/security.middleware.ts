import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // OWASP Recommended Security Headers (Helmet equivalent)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
    res.setHeader(
      'Permissions-Policy',
      'camera=(self), microphone=(self), geolocation=()',
    );
    res.removeHeader('X-Powered-By');

    next();
  }
}

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthRateLimitMiddleware.name);
  private readonly WINDOW_SECONDS = 15 * 60; // 15 minutes window
  private readonly MAX_REQUESTS = 60; // Max 60 auth requests per 15 min per IP

  constructor(private readonly cacheService: CacheService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Identify client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const rateLimitKey = `rate_limit:auth:${clientIp}`;

    try {
      const { count, ttl } = await this.cacheService.incrementRateLimit(
        rateLimitKey,
        this.WINDOW_SECONDS,
      );

      const remaining = Math.max(0, this.MAX_REQUESTS - count);

      res.setHeader('X-RateLimit-Limit', this.MAX_REQUESTS);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', ttl);

      if (count > this.MAX_REQUESTS) {
        res.setHeader('Retry-After', ttl);
        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Trop de requêtes d\'authentification. Veuillez patienter avant de réessayer.',
          retryAfterSeconds: ttl,
        });
      }

      next();
    } catch (err: any) {
      this.logger.error(`Rate limit evaluation error: ${err.message}`);
      // Fail-open for benign requests if unexpected error occurs
      next();
    }
  }
}
