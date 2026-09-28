import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class EstablishmentContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isAll = (val?: string) =>
      !val ||
      val === 'ALL' ||
      val === 'all' ||
      val === 'null' ||
      val === 'undefined' ||
      val === 'none' ||
      val === 'placeholder' ||
      (typeof val === 'string' && val.startsWith('year-'));

    const establishmentHeader = req && (req.headers as any) ? (req.headers as any)['x-establishment-id'] : undefined;
    const tenantHeader = req && (req.headers as any) ? (req.headers as any)['x-tenant-id'] : undefined;
    const academicYearHeader = req && (req.headers as any) ? (req.headers as any)['x-academic-year-id'] : undefined;

    const establishmentId = establishmentHeader && !isAll(establishmentHeader as string)
      ? (establishmentHeader as string)
      : null;

    const tenantId = tenantHeader && !isAll(tenantHeader as string)
      ? (tenantHeader as string)
      : null;

    const academicYearId = academicYearHeader && !isAll(academicYearHeader as string)
      ? (academicYearHeader as string)
      : null;

    const query = req.query as Record<string, unknown>;

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

    if (establishmentId) {
      req.establishmentId = establishmentId;
      if (query && !query.establishmentId) {
        query.establishmentId = establishmentId;
      }
    }

    if (tenantId) {
      req.tenantId = tenantId;
      if (query && !query.tenantId) {
        query.tenantId = tenantId;
      }
    }

    if (academicYearId) {
      (req as any).academicYearId = academicYearId;
      if (query && !query.academicYearId) {
        query.academicYearId = academicYearId;
      }
    }

    next();
  }
}
