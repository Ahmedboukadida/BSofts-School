import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CsrfMiddleware, CSRF_COOKIE_NAME, CSRF_HEADER_NAME, CSRF_HEADER_ALT_NAME } from './csrf.middleware';
import { HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: any;
  let jsonMock: any;
  let cookieMock: any;
  let setHeaderMock: any;

  beforeEach(() => {
    middleware = new CsrfMiddleware();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    cookieMock = vi.fn();
    setHeaderMock = vi.fn();
    mockNext = vi.fn();

    mockRequest = {
      method: 'GET',
      originalUrl: '/api/users',
      url: '/api/users',
      headers: {},
      ip: '127.0.0.1',
    };

    mockResponse = {
      status: statusMock,
      cookie: cookieMock,
      setHeader: setHeaderMock,
    };
  });

  it('should issue a new XSRF-TOKEN cookie on GET request when absent', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(cookieMock).toHaveBeenCalledWith(
      CSRF_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        sameSite: 'lax',
        httpOnly: false,
        path: '/',
      }),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should reuse existing XSRF-TOKEN cookie if present', () => {
    mockRequest.headers = {
      cookie: `${CSRF_COOKIE_NAME}=existing-csrf-token-12345; other=value`,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(cookieMock).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should allow safe methods (GET, HEAD, OPTIONS) without header validation', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      mockRequest.method = method;
      mockRequest.headers = {
        cookie: `${CSRF_COOKIE_NAME}=token123`,
      };
      mockNext = vi.fn();

      middleware.use(mockRequest as Request, mockResponse as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    }
  });

  it('should bypass CSRF validation for mutating methods when a non-empty Bearer token is present', () => {
    mockRequest.method = 'POST';
    mockRequest.headers = {
      authorization: 'Bearer valid.jwt.token.here',
      cookie: `${CSRF_COOKIE_NAME}=sometoken`,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should bypass CSRF validation for exempt webhook endpoints', () => {
    mockRequest.method = 'POST';
    mockRequest.originalUrl = '/api/billing/webhook/stripe';
    mockRequest.headers = {};

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should reject mutating request with 403 Forbidden when cookie exists but CSRF header is missing', () => {
    mockRequest.method = 'POST';
    mockRequest.headers = {
      cookie: `${CSRF_COOKIE_NAME}=valid-secret-token`,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Invalid or missing CSRF token',
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should reject mutating request with 403 Forbidden when CSRF header does not match cookie', () => {
    mockRequest.method = 'POST';
    mockRequest.headers = {
      cookie: `${CSRF_COOKIE_NAME}=valid-secret-token`,
      [CSRF_HEADER_NAME]: 'attacker-tampered-token',
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Invalid or missing CSRF token',
      }),
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should accept mutating request when CSRF header matches cookie token (Double-Submit)', () => {
    const validToken = 'f0e4c2b1a9876543210fedcba9876543210fedcba9876543210fedcba9876543';
    mockRequest.method = 'POST';
    mockRequest.headers = {
      cookie: `${CSRF_COOKIE_NAME}=${validToken}`,
      [CSRF_HEADER_NAME]: validToken,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should accept mutating request using alternate header name (x-csrf-token)', () => {
    const validToken = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    mockRequest.method = 'PUT';
    mockRequest.headers = {
      cookie: `${CSRF_COOKIE_NAME}=${validToken}`,
      [CSRF_HEADER_ALT_NAME]: validToken,
    };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });
});
