import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const authRateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of authRateLimitMap.entries()) {
    if (now > record.resetAt) {
      authRateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

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
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
  private readonly MAX_REQUESTS = 60; // Max 60 auth requests per 15 min per IP

  use(req: Request, res: Response, next: NextFunction) {
    // Identify client IP
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    let record = authRateLimitMap.get(clientIp);

    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + this.WINDOW_MS };
      authRateLimitMap.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, this.MAX_REQUESTS - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', this.MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > this.MAX_REQUESTS) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Trop de requêtes d\'authentification. Veuillez patienter avant de réessayer.',
        retryAfterSeconds: resetSeconds,
      });
    }

    next();
  }
}
