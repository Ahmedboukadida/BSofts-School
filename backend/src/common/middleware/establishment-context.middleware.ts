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

    if (req.query) {
      if (isAll((req.query as any).establishmentId)) {
        delete (req.query as any).establishmentId;
      }
      if (isAll((req.query as any).tenantId)) {
        delete (req.query as any).tenantId;
      }
    }

    if (establishmentId) {
      (req as any).establishmentId = establishmentId;
      if (req.query && !(req.query as any).establishmentId) {
        (req.query as any).establishmentId = establishmentId;
      }
    }

    if (tenantId) {
      (req as any).tenantId = tenantId;
      if (req.query && !(req.query as any).tenantId) {
        (req.query as any).tenantId = tenantId;
      }
    }

    next();
  }
}
