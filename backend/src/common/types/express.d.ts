import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        isRoot?: boolean;
        roles?: Array<{ role?: { code?: string } }>;
        establishmentId?: string;
        tenantId?: string;
      };
      tenantId?: string;
      establishmentId?: string;
      isRoot?: boolean;
    }
  }
}

export {};
