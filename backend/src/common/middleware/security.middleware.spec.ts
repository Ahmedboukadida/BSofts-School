import { describe, beforeEach, it, expect, vi } from 'vitest';
import { SecurityHeadersMiddleware, AuthRateLimitMiddleware } from './security.middleware';
import { HttpStatus } from '@nestjs/common';

describe('Security Middlewares', () => {
  describe('SecurityHeadersMiddleware', () => {
    let middleware: SecurityHeadersMiddleware;
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;
    let setHeaders: Record<string, string>;
    let removedHeaders: string[];

    beforeEach(() => {
      middleware = new SecurityHeadersMiddleware();
      setHeaders = {};
      removedHeaders = [];

      mockReq = {};
      mockRes = {
        setHeader: vi.fn((key: string, value: string) => {
          setHeaders[key.toLowerCase()] = value;
        }),
        removeHeader: vi.fn((key: string) => {
          removedHeaders.push(key.toLowerCase());
        }),
      };
      mockNext = vi.fn();
    });

    it('should attach standard security headers and remove X-Powered-By', () => {
      middleware.use(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
      expect(mockRes.removeHeader).toHaveBeenCalledWith('X-Powered-By');
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('AuthRateLimitMiddleware', () => {
    let middleware: AuthRateLimitMiddleware;
    let mockCacheService: any;
    let mockReq: any;
    let mockRes: any;
    let mockNext: any;
    let setHeaders: Record<string, any>;

    beforeEach(() => {
      mockCacheService = {
        incrementRateLimit: vi.fn(),
      };
      middleware = new AuthRateLimitMiddleware(mockCacheService);
      setHeaders = {};

      mockRes = {
        setHeader: vi.fn((key: string, value: any) => {
          setHeaders[key.toLowerCase()] = value;
        }),
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    it('should extract IP from x-forwarded-for first hop and call incrementRateLimit', async () => {
      mockReq = {
        headers: {
          'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
        },
        socket: {},
      };

      mockCacheService.incrementRateLimit.mockResolvedValue({ count: 1, ttl: 900 });

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockCacheService.incrementRateLimit).toHaveBeenCalledWith(
        'rate_limit:auth:203.0.113.195',
        900,
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 59);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 900);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should fall back to req.ip or socket.remoteAddress if x-forwarded-for is missing', async () => {
      mockReq = {
        headers: {},
        ip: '192.168.1.50',
        socket: {},
      };

      mockCacheService.incrementRateLimit.mockResolvedValue({ count: 10, ttl: 450 });

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockCacheService.incrementRateLimit).toHaveBeenCalledWith(
        'rate_limit:auth:192.168.1.50',
        900,
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 50);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 450);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should reject request with 429 when rate limit count exceeds 60', async () => {
      mockReq = {
        headers: {},
        ip: '10.0.0.99',
        socket: {},
      };

      mockCacheService.incrementRateLimit.mockResolvedValue({ count: 61, ttl: 300 });

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 60);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', 300);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', 300);

      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.TOO_MANY_REQUESTS);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfterSeconds: 300,
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should fail-open and call next() if incrementRateLimit throws', async () => {
      mockReq = {
        headers: {},
        ip: '127.0.0.1',
        socket: {},
      };

      mockCacheService.incrementRateLimit.mockRejectedValue(new Error('Redis connection drop'));

      await middleware.use(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
