import { useMemo } from 'react';
import { useEstablishmentStore } from '@/store/establishment-store';

export function useActiveContext() {
  const currentEstablishmentId = useEstablishmentStore((s) => s.currentEstablishmentId);
  const currentTenantId = useEstablishmentStore((s) => s.currentTenantId);
  const currentAcademicYearId = useEstablishmentStore((s) => s.currentAcademicYearId);
  const establishments = useEstablishmentStore((s) => s.establishments);
  const tenants = useEstablishmentStore((s) => s.tenants);
  const academicYears = useEstablishmentStore((s) => s.academicYears);

  const activeEstablishmentId =
    currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all'
      ? currentEstablishmentId
      : undefined;

  const activeTenantId =
    currentTenantId && currentTenantId !== 'ALL' && currentTenantId !== 'all'
      ? currentTenantId
      : undefined;

  const activeAcademicYearId =
    currentAcademicYearId && currentAcademicYearId !== 'ALL' && currentAcademicYearId !== 'all'
      ? currentAcademicYearId
      : undefined;

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
    contextParams,
    establishments,
    tenants,
    academicYears,
  };
}
