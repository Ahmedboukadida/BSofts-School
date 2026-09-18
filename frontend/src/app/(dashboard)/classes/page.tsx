'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Users,
  ArrowUpRight,
  School,
  DoorOpen,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import api from '@/lib/api';
import type { ClassItem } from '@/types';

export default function ClassesPage() {
  const { user } = useAuthStore();
  const { currentEstablishmentId, establishments } = useEstablishmentStore();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: '3ème Année Secondaire',
    academicYear: '2025-2026',
    roomName: 'Salle A-101',
    mainTeacherName: 'M. Moncef Trabelsi',
    capacity: 32,
    isActive: true,
    establishmentId: '',
  });

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeEst = (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
        ? currentEstablishmentId
        : undefined;

      const res = await api.get('/classes', {
        params: {
          includeDeleted: isTrashMode,
          establishmentId: activeEst,
        },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: ClassItem[] = list.map((c: any) => {
        const levelName = typeof c.level === 'string'
          ? c.level
          : (c.classLevel?.name || c.level?.name || 'Niveau standard');
        const yearName = typeof c.academicYear === 'string'
          ? c.academicYear
          : (c.academicYear?.name || '2025-2026');
        const count = Number(c.studentsCount ?? c._count?.studentClassAssignments ?? 0);
        const cap = Number(c.capacity ?? c.maxStudents ?? 30);
        return {
          id: c.id || '',
          name: c.name || 'Classe sans nom',
          code: c.code || '',
          level: levelName,
          academicYear: yearName,
          roomName: c.roomName || c.room?.name || '',
          mainTeacherName: c.mainTeacherName || (c.mainTeacher ? `${c.mainTeacher.firstName} ${c.mainTeacher.lastName}` : ''),
          studentsCount: count,
          capacity: cap,
          isActive: c.isActive !== false,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
          isDeleted: Boolean(c.isDeleted),
          establishmentName: c.establishment?.name || c.establishmentName || '',
          establishmentId: c.establishmentId || '',
        } as ClassItem;
      });
      setClasses(mapped);
    } catch {
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, currentEstablishmentId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    const defaultEst = (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
      ? currentEstablishmentId
      : (establishments[0]?.id || user?.establishmentId || '');
    setFormData({
      name: '',
      code: '',
      level: '3ème Année Secondaire',
      academicYear: '2025-2026',
      roomName: 'Salle A-101',
      mainTeacherName: 'M. Moncef Trabelsi',
      capacity: 32,
      isActive: true,
      establishmentId: defaultEst,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: ClassItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      level: item.level,
      academicYear: item.academicYear,
      roomName: item.roomName || '',
      mainTeacherName: item.mainTeacherName || '',
      capacity: item.capacity,
      isActive: item.isActive,
      establishmentId: (item as any).establishmentId || currentEstablishmentId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        establishmentId: formData.establishmentId || (currentEstablishmentId && currentEstablishmentId !== 'ALL' ? currentEstablishmentId : (establishments[0]?.id || user?.establishmentId)),
      };
      if (editingItem) {
        await api.put(`/classes/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/classes', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchClasses();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ClassItem) => {
    await api.delete(`/classes/${item.id}`).catch(() => {});
    setClasses((prev) => prev.filter((c) => c.id !== item.id));
  };

  const handlePermanentDelete = async (item: ClassItem) => {
    await api.delete(`/classes/${item.id}?permanent=true`).catch(() => {});
    setClasses((prev) => prev.filter((c) => c.id !== item.id));
  };

  const handleToggleStatus = async (item: ClassItem) => {
    const updated = !item.isActive;
    await api.put(`/classes/${item.id}`, { isActive: updated }).catch(() => {});
    setClasses((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, isActive: updated } : c))
    );
  };

  const filteredClasses = classes.filter((c) => {
    if (levelFilter && c.level !== levelFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !c.isActive : c.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<ClassItem>[] = [
    {
      key: 'name',
      header: 'Classe / Division & Code',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-brand font-semibold">
                {row.code}
              </span>
              <span className="text-xs text-text-tertiary">
                {typeof row.level === 'object' ? (row.level as any)?.name : (row.level || '')}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'studentsCount',
      header: 'Effectif / Capacité',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <Users className="w-3.5 h-3.5 text-brand" />
            <span>{Number(row.studentsCount || 0)} / {Number(row.capacity || 30)} élèves</span>
          </div>
          <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                Number(row.studentsCount || 0) >= Number(row.capacity || 30) ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (Number(row.studentsCount || 0) / Math.max(1, Number(row.capacity || 30))) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'mainTeacherName',
      header: 'Professeur Principal & Salle',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-text-primary">{row.mainTeacherName || 'Non assigné'}</p>
          <p className="text-[11px] text-text-secondary flex items-center gap-1">
            <DoorOpen className="w-3 h-3 text-text-tertiary" /> {row.roomName || 'Salle variable'}
          </p>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Année Scolaire',
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface border border-border text-text-secondary">
          {typeof row.academicYear === 'object' ? (row.academicYear as any)?.name : (row.academicYear || '')}
        </span>
      ),
    },
    ...(user?.isRoot
      ? [
          {
            key: 'establishment',
            header: 'Établissement',
            render: (row: ClassItem) => (
              <div className="flex items-center gap-1.5 text-xs">
                <School className="w-3.5 h-3.5 text-[#CCA43B] shrink-0" />
                <span className="font-semibold text-text-primary">
                  {(row as any).establishmentName || 'Campus Principal'}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'isActive',
      header: 'Statut',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Active' : 'Archivée'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: ClassItem): DetailSection[] => [
    {
      title: 'Fiche d’Identification Pédagogique',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Désignation de la Division</span>
            <p className="text-base font-bold text-text-primary">{item.name}</p>
            <p className="text-text-secondary">Code : <span className="font-mono font-bold text-brand">{item.code}</span></p>
            <p className="text-text-secondary">Niveau scolaire : <span className="font-semibold text-text-primary">{typeof item.level === 'object' ? (item.level as any)?.name : (item.level || '')}</span></p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Encadrement & Localisation</span>
            <p className="text-sm font-semibold text-text-primary">
              Professeur Principal : {item.mainTeacherName || 'Non assigné'}
            </p>
            <p className="text-text-secondary">Salle de cours dédiée : <span className="font-semibold text-text-primary">{item.roomName || 'Non fixée'}</span></p>
            <p className="text-text-secondary">Effectif inscrit : <span className="font-bold text-brand">{Number(item.studentsCount || 0)} / {Number(item.capacity || 30)} élèves</span></p>
          </div>
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: ClassItem,
    onViewDetails: (item: ClassItem) => void,
    actions: TableRowActions<ClassItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.code}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-secondary mb-3 font-semibold">
          {typeof item.level === 'object' ? (item.level as any)?.name : (item.level || '')}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4 space-y-1.5 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Effectif :</span>
            <span className="font-bold text-text-primary">{Number(item.studentsCount || 0)} / {Number(item.capacity || 30)} élèves</span>
          </div>
          <div className="flex justify-between">
            <span>Prof. Principal :</span>
            <span className="font-medium text-text-primary truncate max-w-[140px]">{item.mainTeacherName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Salle :</span>
            <span className="font-medium text-text-primary">{item.roomName || '—'}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface text-text-secondary'
          }`}
        >
          {item.isActive ? 'Active' : 'Archivée'}
        </span>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(item)}>
            Détails
          </Button>
          {actions.onEdit && (
            <Button variant="secondary" size="sm" onClick={() => actions.onEdit!(item)}>
              Modifier
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-brand/10 text-brand">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Classes & Divisions Scolaires</h1>
              <p className="text-sm text-text-secondary">
                Organisation pédagogique des sections, affectation des salles, effectifs et professeurs principaux.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/classes/promotion">
            <Button variant="secondary" className="shadow-xs">
              <ArrowUpRight className="w-4 h-4 mr-1.5" />
              Conseil & Passage de Classe
            </Button>
          </Link>
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle Classe
          </Button>
        </div>
      </div>

      <DataTable<ClassItem>
        title="Répertoire des Classes de l’Établissement"
        data={filteredClasses}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une classe, un niveau, un code ou prof principal..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'grid', 'split']}
        detailModalSize="6xl"
        renderGridCard={renderGridCard}
        renderDetailSections={renderDetailSections}
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
          onPermanentDelete: handlePermanentDelete,
          onToggleStatus: handleToggleStatus,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Classes_Divisions"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filtrer par niveau"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les Niveaux Scolaires</option>
              <option value="1ère Année Secondaire">1ère Année Secondaire</option>
              <option value="2ème Année Secondaire">2ème Année Secondaire</option>
              <option value="3ème Année Secondaire">3ème Année Secondaire</option>
              <option value="4ème Année (Baccalauréat)">4ème Année (Baccalauréat)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Classes actives</option>
              <option value="inactive">Archivées</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier la classe : ${editingItem.name}` : 'Créer une Nouvelle Classe'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <GraduationCap className="w-4 h-4 text-brand" />
                Désignation & Niveau
              </h3>

              {user?.isRoot && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-[#CCA43B]" />
                    Établissement Scolaire *
                  </label>
                  <select
                    value={formData.establishmentId}
                    onChange={(e) => setFormData({ ...formData, establishmentId: e.target.value })}
                    aria-label="Établissement Scolaire"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand font-medium"
                    required
                  >
                    <option value="">-- Sélectionner un établissement --</option>
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        🏫 {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <Input
                label="Nom de la classe *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: 3ème Année Mathématiques B"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Système Unique *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="3-MATH-B"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Niveau Scolaire *
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    aria-label="Niveau Scolaire"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="1ère Année Secondaire">1ère Année Secondaire</option>
                    <option value="2ème Année Secondaire">2ème Année Secondaire</option>
                    <option value="3ème Année Secondaire">3ème Année Secondaire</option>
                    <option value="4ème Année (Baccalauréat)">4ème Année (Baccalauréat)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Année Scolaire"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                />
                <Input
                  label="Capacité Maximale (Élèves) *"
                  type="number"
                  min={1}
                  max={50}
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <School className="w-4 h-4 text-brand" />
                Affectation des Ressources
              </h3>

              <Input
                label="Salle de cours principale"
                value={formData.roomName}
                onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                placeholder="Ex: Salle A-101 (Sciences)"
              />

              <Input
                label="Professeur Principal Référent"
                value={formData.mainTeacherName}
                onChange={(e) => setFormData({ ...formData, mainTeacherName: e.target.value })}
                placeholder="Ex: M. Moncef Trabelsi"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingItem ? 'Enregistrer les Modifications' : 'Créer la Classe'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
