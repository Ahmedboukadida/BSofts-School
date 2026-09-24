import {
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class EstablishmentContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const isAll = (val?: string) => !val || val === 'ALL' || val === 'all';

    const establishmentId = isAll(req.headers['x-establishment-id'] as string)
      ? null
      : (req.headers['x-establishment-id'] as string);

    const tenantId = isAll(req.headers['x-tenant-id'] as string)
      ? null
      : (req.headers['x-tenant-id'] as string);

    const query = req.query as Record<string, unknown>;

    if (query) {
      if (isAll(query.establishmentId as string | undefined)) {
        delete query.establishmentId;
      }
      if (isAll(query.tenantId as string | undefined)) {
        delete query.tenantId;
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

    next();
  }
}
