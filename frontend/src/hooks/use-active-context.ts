import { useMemo } from 'react';
import { useEstablishmentStore } from '@/store/establishment-store';

export function useActiveContext() {
  const currentEstablishmentId = useEstablishmentStore((s) => s.currentEstablishmentId);
  const currentTenantId = useEstablishmentStore((s) => s.currentTenantId);
  const currentAcademicYearId = useEstablishmentStore((s) => s.currentAcademicYearId);
  const establishments = useEstablishmentStore((s) => s.establishments);
  const tenants = useEstablishmentStore((s) => s.tenants);
  const academicYears = useEstablishmentStore((s) => s.academicYears);

  const isValidId = (val: string | null | undefined) =>
    Boolean(val && val !== 'ALL' && val !== 'all' && val !== 'null' && val !== 'undefined' && !val.startsWith('year-'));

  const activeEstablishmentId = isValidId(currentEstablishmentId) ? currentEstablishmentId! : undefined;
  const activeTenantId = isValidId(currentTenantId) ? currentTenantId! : undefined;
  const activeAcademicYearId = isValidId(currentAcademicYearId) ? currentAcademicYearId! : undefined;

  const contextParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (activeEstablishmentId) params.establishmentId = activeEstablishmentId;
    if (activeTenantId) params.tenantId = activeTenantId;
    if (activeAcademicYearId) params.academicYearId = activeAcademicYearId;
    return params;
  }, [activeEstablishmentId, activeTenantId, activeAcademicYearId]);

  return {
    currentEstablishmentId,
    currentTenantId,
    currentAcademicYearId,
    activeEstablishmentId,
    activeTenantId,
    activeAcademicYearId,
    isAllEstablishments: !activeEstablishmentId,
    isAllTenants: !activeTenantId,
    isAllAcademicYears: !activeAcademicYearId,
    contextParams,
    establishments,
    tenants,
    academicYears,
  };
}
