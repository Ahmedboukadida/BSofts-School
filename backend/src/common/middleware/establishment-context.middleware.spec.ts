import { describe, beforeEach, it, expect, vi } from 'vitest';
import { EstablishmentContextMiddleware } from './establishment-context.middleware';

describe('EstablishmentContextMiddleware', () => {
  let middleware: EstablishmentContextMiddleware;
  let mockPrisma: any;
  let mockJwtService: any;
  let mockNext: any;
  let mockRes: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: vi.fn(),
      },
      establishment: {
        findFirst: vi.fn(),
      },
    };

    mockJwtService = {
      verify: vi.fn(),
    };

    mockNext = vi.fn();

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    middleware = new EstablishmentContextMiddleware(mockPrisma, mockJwtService);
  });

  describe('Unauthenticated requests', () => {
    it('should pass through unauthenticated requests and clean up isAll query params', async () => {
      const req: any = {
        headers: {},
        query: {
          establishmentId: 'ALL',
          tenantId: 'all',
          academicYearId: 'null',
        },
      };

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.query.establishmentId).toBeUndefined();
      expect(req.query.tenantId).toBeUndefined();
      expect(req.query.academicYearId).toBeUndefined();
      expect(req.tenantId).toBeUndefined();
      expect(req.establishmentId).toBeUndefined();
    });

    it('should ignore spoofed headers on unauthenticated requests', async () => {
      const req: any = {
        headers: {
          'x-tenant-id': 'spoofed-tenant-123',
          'x-establishment-id': 'spoofed-est-456',
        },
        query: {},
      };

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.tenantId).toBeUndefined();
      expect(req.establishmentId).toBeUndefined();
    });
  });

  describe('ROOT user requests', () => {
    it('should allow ROOT user to set arbitrary tenant and establishment context', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer root-token',
          'x-tenant-id': 'target-tenant-1',
          'x-establishment-id': 'target-est-1',
          'x-academic-year-id': 'year-2026',
        },
        query: {},
        isRoot: true,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'root-id', isRoot: true });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.tenantId).toBe('target-tenant-1');
      expect(req.establishmentId).toBe('target-est-1');
      expect(req.academicYearId).toBe('year-2026');
      expect(req.query.tenantId).toBe('target-tenant-1');
      expect(req.query.establishmentId).toBe('target-est-1');
      expect(req.query.academicYearId).toBe('year-2026');
    });

    it('should allow ROOT user to select ALL across tenant and establishment', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer root-token',
          'x-tenant-id': 'ALL',
          'x-establishment-id': 'ALL',
          'x-academic-year-id': 'ALL',
        },
        query: {
          tenantId: 'ALL',
          establishmentId: 'ALL',
        },
        isRoot: true,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'root-id', isRoot: true });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.tenantId).toBeUndefined();
      expect(req.establishmentId).toBeUndefined();
      expect(req.query.tenantId).toBeUndefined();
      expect(req.query.establishmentId).toBeUndefined();
    });
  });

  describe('Non-ROOT user requests & Tenant isolation', () => {
    it('should block non-ROOT user from spoofing a different tenant via header', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer user-token',
          'x-tenant-id': 'victim-tenant-2',
        },
        query: {},
        tenantId: 'my-tenant-1',
        isRoot: false,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'user-1', tenantId: 'my-tenant-1' });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          error: 'Forbidden',
          message: expect.stringContaining('Cross-tenant access prohibited'),
        }),
      );
    });

    it('should block non-ROOT user from spoofing a different tenant via query parameter', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer user-token',
        },
        query: {
          tenantId: 'victim-tenant-2',
        },
        tenantId: 'my-tenant-1',
        isRoot: false,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'user-1', tenantId: 'my-tenant-1' });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          error: 'Forbidden',
          message: expect.stringContaining('Cross-tenant access prohibited'),
        }),
      );
    });

    it('should block non-ROOT user from requesting an establishment outside their tenant', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer user-token',
          'x-establishment-id': 'foreign-est-99',
        },
        query: {},
        tenantId: 'my-tenant-1',
        isRoot: false,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'user-1', tenantId: 'my-tenant-1' });
      // Establishment not found in my-tenant-1
      mockPrisma.establishment.findFirst.mockResolvedValue(null);

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          error: 'Forbidden',
          message: expect.stringContaining('Unauthorized establishment access'),
        }),
      );
      expect(mockPrisma.establishment.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'foreign-est-99',
          tenantId: 'my-tenant-1',
          isDeleted: false,
        },
        select: { id: true, tenantId: true },
      });
    });

    it('should allow non-ROOT user when establishment belongs to their tenant', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer user-token',
          'x-establishment-id': 'legit-est-1',
        },
        query: {},
        tenantId: 'my-tenant-1',
        isRoot: false,
      };

      mockJwtService.verify.mockReturnValue({ sub: 'user-1', tenantId: 'my-tenant-1' });
      mockPrisma.establishment.findFirst.mockResolvedValue({
        id: 'legit-est-1',
        tenantId: 'my-tenant-1',
      });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.tenantId).toBe('my-tenant-1');
      expect(req.establishmentId).toBe('legit-est-1');
      expect(req.query.tenantId).toBe('my-tenant-1');
      expect(req.query.establishmentId).toBe('legit-est-1');
    });

    it('should respect explicit ALL establishment selection for multi-establishment tenant admin', async () => {
      const req: any = {
        headers: {
          authorization: 'Bearer user-token',
          'x-establishment-id': 'ALL',
        },
        query: {},
        tenantId: 'my-tenant-1',
        isRoot: false,
      };

      mockJwtService.verify.mockReturnValue({
        sub: 'admin-1',
        tenantId: 'my-tenant-1',
        establishmentId: 'est-default-1',
      });

      await middleware.use(req, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(req.tenantId).toBe('my-tenant-1');
      expect(req.establishmentId).toBeUndefined();
      expect(req.query.tenantId).toBe('my-tenant-1');
      expect(req.query.establishmentId).toBeUndefined();
    });
  });
});
