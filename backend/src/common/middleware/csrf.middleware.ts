import { Injectable, NestMiddleware, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
export const CSRF_HEADER_NAME = 'x-xsrf-token';
export const CSRF_HEADER_ALT_NAME = 'x-csrf-token';

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const items = cookieHeader.split(';');
  for (const item of items) {
    const idx = item.indexOf('=');
    if (idx !== -1) {
      const key = item.substring(0, idx).trim();
      const val = item.substring(idx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CsrfMiddleware.name);

  // Exempt webhooks authenticated via independent cryptographic signatures (Stripe, ClicToPay, LiveKit)
  private readonly exemptPaths = [
    '/billing/webhook',
    '/api/billing/webhook',
    '/livekit/webhook',
    '/api/livekit/webhook',
  ];

  use(req: Request, res: Response, next: NextFunction) {
    const cookies = parseCookies(req.headers.cookie);
    let csrfToken = cookies[CSRF_COOKIE_NAME];

    // 1. Issue CSRF token cookie if absent
    if (!csrfToken) {
      csrfToken = crypto.randomBytes(32).toString('hex');
      const isProd = process.env.NODE_ENV === 'production';

      // Set cookie using Express or raw header
      if (typeof res.cookie === 'function') {
        res.cookie(CSRF_COOKIE_NAME, csrfToken, {
          sameSite: 'lax',
          secure: isProd,
          httpOnly: false, // Must be readable by client JS to attach to custom header
          path: '/',
        });
      } else {
        const secureFlag = isProd ? '; Secure' : '';
        res.setHeader(
          'Set-Cookie',
          `${CSRF_COOKIE_NAME}=${csrfToken}; Path=/; SameSite=Lax${secureFlag}`,
        );
      }
    }

    // 2. Safe HTTP methods pass automatically
    const method = req.method?.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next();
    }

    // 3. Exempt webhook endpoints with independent HMAC signature validation
    const path = req.originalUrl || req.url || '';
    if (this.exemptPaths.some((exempt) => path.startsWith(exempt))) {
      return next();
    }

    // 4. Bearer Token Bypass:
    // Requests carrying a non-empty Bearer Authorization header are stateless API/mobile clients,
    // which browsers do not forge automatically on cross-site requests.
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.trim().startsWith('Bearer ')) {
      const token = authHeader.trim().substring(7).trim();
      if (token.length > 0) {
        return next();
      }
    }

    // 5. Double-Submit Cookie Guard for Cookie-based / browser sessions:
    const headerToken =
      (req.headers[CSRF_HEADER_NAME] as string) ||
      (req.headers[CSRF_HEADER_ALT_NAME] as string);

    if (!headerToken || !csrfToken || !safeCompare(csrfToken, headerToken)) {
      this.logger.warn(
        `CSRF validation failed for ${method} ${path} from ${req.ip || 'unknown'}: missing or mismatched token`,
      );
      return res.status(HttpStatus.FORBIDDEN).json({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: 'Invalid or missing CSRF token',
      });
    }

    next();
  }
}
