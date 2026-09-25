import { User as PrismaUser } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends PrismaUser {
      isRoot?: boolean;
      roles?: Array<{ role?: { code?: string } }>;
      establishmentId?: string;
      tenantId?: string;
    }

    interface Request {
      user?: User;
      tenantId?: string;
      establishmentId?: string;
      isRoot?: boolean;
    }
  }
}

export {};
