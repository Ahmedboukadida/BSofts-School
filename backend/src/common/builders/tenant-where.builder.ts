export interface TenantFilterOptions {
  establishmentId?: string | null;
  includeDeleted?: boolean;
  tenantId?: string | null;
  search?: string | null;
  searchFields?: string[];
  additionalWhere?: Record<string, any>;
}

/**
 * Standard multi-tenant and soft-delete query filter builder.
 * Guarantees that cross-tenant queries are scoped by establishmentId
 * and soft-deleted rows are hidden unless explicitly requested.
 */
export function buildTenantWhere<T extends Record<string, any> = Record<string, any>>(
  options: TenantFilterOptions,
): T {
  const where: Record<string, any> = { ...(options.additionalWhere || {}) };

  // Establishment isolation
  if (
    options.establishmentId &&
    options.establishmentId !== 'ALL' &&
    options.establishmentId !== 'all'
  ) {
    where.establishmentId = options.establishmentId;
  }

  // Soft-delete guard
  if (!options.includeDeleted) {
    where.isDeleted = false;
  }

  // Generic multi-field text search helper
  if (options.search && options.searchFields && options.searchFields.length > 0) {
    where.OR = options.searchFields.map((field) => ({
      [field]: { contains: options.search, mode: 'insensitive' },
    }));
  }

  return where as T;
}
