import {
  Injectable,
  NestMiddleware,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EstablishmentContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger(EstablishmentContextMiddleware.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isAll = (val?: string | null) =>
      !val ||
      val === 'ALL' ||
      val === 'all' ||
      val === 'null' ||
      val === 'undefined' ||
      val === 'none' ||
      val === 'placeholder' ||
      val === 'year-placeholder' ||
      val === 'year-all';

    const query = req.query as Record<string, unknown>;

    const establishmentHeader = req?.headers ? (req.headers['x-establishment-id'] as string | undefined) : undefined;
    const tenantHeader = req?.headers ? (req.headers['x-tenant-id'] as string | undefined) : undefined;
    const academicYearHeader = req?.headers ? (req.headers['x-academic-year-id'] as string | undefined) : undefined;

    const isExplicitAllEstablishment =
      establishmentHeader === 'ALL' ||
      establishmentHeader === 'all' ||
      query?.establishmentId === 'ALL' ||
      query?.establishmentId === 'all';

    const isExplicitAllTenant =
      tenantHeader === 'ALL' ||
      tenantHeader === 'all' ||
      query?.tenantId === 'ALL' ||
      query?.tenantId === 'all';

    const isExplicitAllYear =
      academicYearHeader === 'ALL' ||
      academicYearHeader === 'all' ||
      query?.academicYearId === 'ALL' ||
      query?.academicYearId === 'all';

    if (query) {
      if (isAll(query.establishmentId as string | undefined)) {
        delete query.establishmentId;
      }
      if (isAll(query.tenantId as string | undefined)) {
        delete query.tenantId;
      }
      if (isAll(query.academicYearId as string | undefined)) {
        delete query.academicYearId;
      }
    }

    const rawEstablishmentId = establishmentHeader && !isAll(establishmentHeader) ? establishmentHeader : null;
    const rawTenantId = tenantHeader && !isAll(tenantHeader) ? tenantHeader : null;
    const rawAcademicYearId = academicYearHeader && !isAll(academicYearHeader) ? academicYearHeader : null;

    // Check Authorization header for Bearer token
    const authHeader = req?.headers?.authorization;
    let tokenPayload: any = null;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        tokenPayload = this.jwtService.verify(token);
        userId = tokenPayload?.sub || null;
      } catch (err) {
        // Token invalid/expired - let downstream JwtAuthGuard handle it
        return next();
      }
    }

    // Unauthenticated request (public endpoints, login, etc.)
    if (!userId && !req.isRoot && !req.tenantId && !req.user) {
      // Do not trust client headers for security scoping on public endpoints
      return next();
    }

    // Determine user status (ROOT vs Non-ROOT)
    let isRoot = req.isRoot ?? false;
    let authenticatedTenantId = req.tenantId || null;
    let authenticatedEstablishmentId = tokenPayload?.establishmentId || null;

    // If req.isRoot or req.tenantId was not yet populated by upstream middleware, resolve from DB / token
    if (userId && (!req.isRoot && !req.tenantId)) {
      try {
        const dbUser = await this.prisma.user.findUnique({
          where: { id: userId },
          select: {
            isRoot: true,
            tenant: { select: { id: true } },
            userRoles: {
              select: {
                establishmentId: true,
                establishment: { select: { id: true, tenantId: true } },
              },
            },
            teacher: { select: { establishmentId: true } },
            student: { select: { establishmentId: true } },
            employee: { select: { establishmentId: true } },
            parent: { select: { establishmentId: true } },
          },
        });

        if (dbUser?.isRoot) {
          isRoot = true;
          req.isRoot = true;
        } else if (dbUser) {
          authenticatedTenantId =
            dbUser.tenant?.id ||
            dbUser.userRoles?.find((r: any) => r.establishment?.tenantId)?.establishment?.tenantId ||
            tokenPayload?.tenantId ||
            null;

          authenticatedEstablishmentId =
            dbUser.userRoles?.[0]?.establishmentId ||
            dbUser.teacher?.establishmentId ||
            dbUser.student?.establishmentId ||
            dbUser.employee?.establishmentId ||
            dbUser.parent?.establishmentId ||
            tokenPayload?.establishmentId ||
            null;

          if (authenticatedTenantId) {
            req.tenantId = authenticatedTenantId;
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not resolve user context for ${userId}: ${err.message}`);
      }
    }

    // 1. ROOT User: Full platform super-admin access
    if (isRoot) {
      if (rawTenantId) {
        req.tenantId = rawTenantId;
        if (query && !query.tenantId) {
          query.tenantId = rawTenantId;
        }
      } else if (isExplicitAllTenant) {
        delete (req as any).tenantId;
        if (query) delete query.tenantId;
      }

      if (rawEstablishmentId) {
        req.establishmentId = rawEstablishmentId;
        if (query && !query.establishmentId) {
          query.establishmentId = rawEstablishmentId;
        }
      } else if (isExplicitAllEstablishment) {
        delete (req as any).establishmentId;
        if (query) delete query.establishmentId;
      }

      if (rawAcademicYearId) {
        (req as any).academicYearId = rawAcademicYearId;
        if (query && !query.academicYearId) {
          query.academicYearId = rawAcademicYearId;
        }
      } else if (isExplicitAllYear) {
        delete (req as any).academicYearId;
        if (query) delete query.academicYearId;
      }

      return next();
    }

    // 2. Non-ROOT User: Strict tenant boundary enforcement
    if (authenticatedTenantId) {
      const requestedTenantId =
        rawTenantId || (query?.tenantId && !isAll(query.tenantId as string) ? (query.tenantId as string) : null);

      // Block cross-tenant access attempts immediately
      if (requestedTenantId && requestedTenantId !== authenticatedTenantId) {
        this.logger.warn(
          `Cross-tenant access attempt blocked: user belongs to ${authenticatedTenantId} but requested ${requestedTenantId}`,
        );
        return res.status(403).json({
          statusCode: 403,
          message: 'Cross-tenant access prohibited: unauthorized tenant context',
          error: 'Forbidden',
        });
      }

      // Enforce authentic tenant ID
      req.tenantId = authenticatedTenantId;
      if (query) {
        query.tenantId = authenticatedTenantId;
      }

      // Validate establishment context
      const requestedEstablishmentId =
        rawEstablishmentId ||
        (query?.establishmentId && !isAll(query.establishmentId as string)
          ? (query.establishmentId as string)
          : null);

      if (requestedEstablishmentId) {
        try {
          const establishment = await this.prisma.establishment.findFirst({
            where: {
              id: requestedEstablishmentId,
              tenantId: authenticatedTenantId,
              isDeleted: false,
            },
            select: { id: true, tenantId: true },
          });

          if (!establishment) {
            this.logger.warn(
              `Establishment spoofing attempt blocked: establishment ${requestedEstablishmentId} does not belong to tenant ${authenticatedTenantId}`,
            );
            return res.status(403).json({
              statusCode: 403,
              message: 'Unauthorized establishment access: establishment does not belong to your tenant',
              error: 'Forbidden',
            });
          }

          req.establishmentId = establishment.id;
          if (query) {
            query.establishmentId = establishment.id;
          }
        } catch (err: any) {
          this.logger.error(`Error validating establishment context: ${err.message}`);
          return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error while resolving establishment context',
            error: 'InternalServerError',
          });
        }
      } else if (!isExplicitAllEstablishment && authenticatedEstablishmentId) {
        // User is scoped to a single establishment and did not select 'ALL'
        req.establishmentId = authenticatedEstablishmentId;
        if (query && !query.establishmentId) {
          query.establishmentId = authenticatedEstablishmentId;
        }
      } else {
        // User selected 'ALL' or has no single bound establishment
        delete (req as any).establishmentId;
        if (query) delete query.establishmentId;
      }

      // Academic Year Context
      if (rawAcademicYearId) {
        (req as any).academicYearId = rawAcademicYearId;
        if (query) {
          query.academicYearId = rawAcademicYearId;
        }
      } else {
        delete (req as any).academicYearId;
        if (query) delete query.academicYearId;
      }
    }

    next();
  }
}

