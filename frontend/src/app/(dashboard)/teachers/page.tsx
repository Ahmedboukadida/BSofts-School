'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import type { TeacherItem } from '@/types';

export default function TeachersPage() {
  const { user } = useAuthStore();
  const { currentEstablishmentId, establishments, fetchEstablishments } = useEstablishmentStore();

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [specFilter, setSpecFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TeacherItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    establishmentId: '',
    matricule: '',
    firstName: '',
    lastName: '',
    specialization: 'Mathématiques',
    diploma: 'Master / Agrégation d’Enseignement',
    assignedClasses: ['3-MATH-A', '4-SC-EXP'],
    weeklyHours: 18,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  useEffect(() => {
    if (user?.isRoot && establishments.length === 0) {
      fetchEstablishments();
    }
  }, [user?.isRoot, establishments.length, fetchEstablishments]);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeEstId =
        currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all'
          ? currentEstablishmentId
          : undefined;

      const res = await api.get('/teachers', {
        params: {
          includeDeleted: isTrashMode,
          ...(activeEstId ? { establishmentId: activeEstId } : {}),
        },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: TeacherItem[] = list.map((t: any) => {
        const matName = t.matieres?.[0]?.matiere?.name || t.matieres?.[0]?.name;
        const classes = Array.isArray(t.assignedClasses)
          ? t.assignedClasses
          : Array.isArray(t.classes)
          ? t.classes.map((c: any) => c.class?.name || c.name || c)
          : [];
        return {
          id: t.id || '',
          matricule: t.matricule || '',
          firstName: t.firstName || t.user?.firstName || '',
          lastName: t.lastName || t.user?.lastName || '',
          specialization: t.specialization || t.speciality || matName || 'Général',
          diploma: t.diploma || 'Enseignement',
          assignedClasses: classes,
          weeklyHours: Number(t.weeklyHours ?? t.contracts?.[0]?.weeklyHours ?? 18),
          email: t.email || t.user?.email || '',
          phone: t.phone || '',
          hireDate: t.hireDate || t.createdAt || new Date().toISOString(),
          isActive: t.isActive !== false,
          establishmentId: t.establishmentId || t.establishment?.id || '',
          establishmentName: t.establishment?.name || t.establishmentName || 'Établissement Principal',
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
          isDeleted: Boolean(t.isDeleted),
        };
      });
      setTeachers(mapped);
    } catch {
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, currentEstablishmentId]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      establishmentId: (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
        ? currentEstablishmentId
        : (establishments[0]?.id || ''),
      matricule: `ENS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      specialization: 'Mathématiques',
      diploma: 'Master / Agrégation d’Enseignement',
      assignedClasses: ['3-MATH-A'],
      weeklyHours: 18,
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      establishmentId: item.establishmentId || item.establishment?.id || '',
      matricule: item.matricule,
      firstName: item.firstName,
      lastName: item.lastName,
      specialization: item.specialization,
      diploma: item.diploma,
      assignedClasses: item.assignedClasses,
      weeklyHours: item.weeklyHours,
      email: item.email,
      phone: item.phone,
      hireDate: item.hireDate?.split('T')[0] || '',
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        weeklyHours: Number(formData.weeklyHours),
      };
      if (editingItem) {
        await api.put(`/teachers/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/teachers', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchTeachers();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: TeacherItem) => {
    await api.delete(`/teachers/${item.id}`).catch(() => {});
    setTeachers((prev) => prev.filter((t) => t.id !== item.id));
  };

  const handlePermanentDelete = async (item: TeacherItem) => {
    await api.delete(`/teachers/${item.id}?permanent=true`).catch(() => {});
    setTeachers((prev) => prev.filter((t) => t.id !== item.id));
  };

  const handleToggleStatus = async (item: TeacherItem) => {
    const updated = !item.isActive;
    await api.put(`/teachers/${item.id}`, { isActive: updated }).catch(() => {});
    setTeachers((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, isActive: updated } : t))
    );
  };

  const filteredTeachers = teachers.filter((t) => {
    if (specFilter && t.specialization !== specFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !t.isActive : t.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<TeacherItem>[] = [
    {
      key: 'name',
      header: 'Enseignant & Matricule',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-[11px] font-mono text-brand font-semibold">
              {row.matricule}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'specialization',
      header: 'Discipline & Diplôme',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-text-primary block">{row.specialization}</span>
          <span className="text-[11px] text-text-secondary">{row.diploma}</span>
        </div>
      ),
    },
    {
      key: 'assignedClasses',
      header: 'Divisions Enseignées',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[240px]">
          {(row.assignedClasses || []).map((cls) => (
            <span
              key={cls}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-surface border border-border text-text-secondary"
            >
              {cls}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'weeklyHours',
      header: 'Charge Horaire',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
          <Clock className="w-3.5 h-3.5 text-brand" />
          <span>{row.weeklyHours}h / semaine</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Coordonnées',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-text-secondary">
          <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-text-tertiary" /> {row.email}</p>
          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-text-tertiary" /> {row.phone}</p>
        </div>
      ),
    },
    ...(user?.isRoot
      ? [
          {
            key: 'establishmentName' as keyof TeacherItem,
            header: 'Établissement',
            render: (row: TeacherItem) => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                {row.establishmentName || 'Principal'}
              </span>
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
              : 'bg-rose-500/10 text-rose-600 border border-rose-200'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'En Service' : 'En Congé'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: TeacherItem): DetailSection[] => [
    {
      title: 'Fiche Pédagogique du Professeur',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Identité & Titre</span>
            <p className="text-base font-bold text-text-primary">
              M./Mme {item.firstName} {item.lastName}
            </p>
            <p className="text-text-secondary">Matricule : <span className="font-mono font-bold text-brand">{item.matricule}</span></p>
            <p className="text-text-secondary">Discipline d’enseignement : <span className="font-semibold text-text-primary">{item.specialization}</span></p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Affectations & Horaires</span>
            <p className="text-sm font-semibold text-text-primary">
              Charge hebdomadaire : {item.weeklyHours} heures
            </p>
            <p className="text-text-secondary">Diplôme le plus élevé : <span className="font-semibold text-text-primary">{item.diploma}</span></p>
            <p className="text-text-secondary">Établissement : <span className="font-semibold text-text-primary">{item.establishmentName || 'Siège'}</span></p>
          </div>
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: TeacherItem,
    onViewDetails: (item: TeacherItem) => void,
    actions: TableRowActions<TeacherItem>
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
              {item.matricule}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.firstName} {item.lastName}
        </h3>

        <p className="text-xs text-brand mb-3 font-semibold">
          {item.specialization}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4 space-y-1.5 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Charge cours :</span>
            <span className="font-bold text-text-primary">{item.weeklyHours}h / semaine</span>
          </div>
          <div className="flex justify-between">
            <span>Classes :</span>
            <span className="font-semibold text-text-primary">{(item.assignedClasses || []).join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.isActive ? 'En Service' : 'En Congé'}
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
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Corps Professoral & Enseignants</h1>
              <p className="text-sm text-text-secondary">
                Gestion des professeurs, spécialités, attributions de classes, volumes horaires et fiches pédagogiques.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Ajouter un Enseignant
          </Button>
        </div>
      </div>

      <DataTable<TeacherItem>
        title="Annuaire du Corps Professoral"
        data={filteredTeachers}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par nom, matière, matricule ou classe..."
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
        importExportEntityName="Enseignants"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              aria-label="Filtrer par discipline"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les Disciplines</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Sciences Physiques & Chimie">Sciences Physiques & Chimie</option>
              <option value="Informatique & Algorithmique">Informatique & Algorithmique</option>
              <option value="Langue & Littérature Françaises">Français</option>
              <option value="Langue Arabe">Arabe</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">En service uniquement</option>
              <option value="inactive">En congé / Inactifs</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier l’enseignant : ${editingItem.firstName} ${editingItem.lastName}` : 'Ajouter un Enseignant'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <GraduationCap className="w-4 h-4 text-brand" />
                Identité & Spécialité
              </h3>

              {user?.isRoot && (
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Établissement Scolaire *
                  </label>
                  <select
                    value={formData.establishmentId}
                    onChange={(e) => setFormData({ ...formData, establishmentId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand font-medium"
                  >
                    <option value="">Sélectionner un établissement</option>
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name} ({est.city || est.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Moncef"
                  required
                />
                <Input
                  label="Nom de famille *"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Trabelsi"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Matricule Interne *"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  placeholder="ENS-2026-001"
                  required
                />
                <Input
                  label="Date de recrutement"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Discipline Enseignée *
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    aria-label="Discipline Enseignée"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Sciences Physiques & Chimie">Sciences Physiques & Chimie</option>
                    <option value="Sciences de la Vie et de la Terre">Sciences de la Vie et de la Terre</option>
                    <option value="Informatique & Algorithmique">Informatique & Algorithmique</option>
                    <option value="Langue & Littérature Françaises">Français</option>
                    <option value="Langue & Littérature Arabes">Arabe</option>
                    <option value="Langue Anglaise">Anglais</option>
                    <option value="Histoire & Géographie">Histoire & Géographie</option>
                    <option value="Philosophie">Philosophie</option>
                  </select>
                </div>

                <Input
                  label="Diplôme Principal"
                  value={formData.diploma}
                  onChange={(e) => setFormData({ ...formData, diploma: e.target.value })}
                  placeholder="Ex: Agrégation / Master"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Clock className="w-4 h-4 text-brand" />
                Charge Horaire & Contact
              </h3>

              <Input
                label="Volume Horaire Hebdomadaire (heures) *"
                type="number"
                min={1}
                max={40}
                value={formData.weeklyHours}
                onChange={(e) => setFormData({ ...formData, weeklyHours: Number(e.target.value) })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email Professionnel *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="prof@ecole.tn"
                  required
                />
                <Input
                  label="Téléphone Portable *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+216 98 000 000"
                  required
                />
              </div>
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer l’Enseignant'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
