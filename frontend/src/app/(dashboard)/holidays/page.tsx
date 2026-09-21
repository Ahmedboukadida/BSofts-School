'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  School,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import { useToast, showToast, showApiErrorToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { HolidayItem } from '@/types';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HolidayItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'ACADEMIC_VACATION' as 'ACADEMIC_VACATION' | 'NATIONAL' | 'RELIGIOUS',
    startDate: '2025-10-27',
    endDate: '2025-11-02',
    durationDays: 7,
    academicYear: '2025/2026',
    isClosedForStudents: true,
    isClosedForStaff: true,
    description: 'Vacances officielles fixées par le Ministère de l’Éducation.',
  });

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/holidays', { params: { limit: 100 } });
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: HolidayItem[] = list.map((h: any) => ({
        id: h.id || '',
        name: h.name || 'Jour férié',
        type: (h.type as any) || 'NATIONAL',
        startDate: h.startDate ? h.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: h.endDate ? h.endDate.split('T')[0] : new Date().toISOString().split('T')[0],
        durationDays: Number(h.durationDays || 1),
        academicYear: h.academicYear || '2025/2026',
        isClosedForStudents: h.isClosedForStudents !== false,
        isClosedForStaff: Boolean(h.isClosedForStaff),
        description: h.description || '',
        createdAt: h.createdAt || new Date().toISOString(),
        updatedAt: h.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(h.isDeleted),
      }));
      setHolidays(mapped);
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement des congés');
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: 'ACADEMIC_VACATION',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      durationDays: 1,
      academicYear: '2025/2026',
      isClosedForStudents: true,
      isClosedForStaff: true,
      description: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: HolidayItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      startDate: item.startDate,
      endDate: item.endDate,
      durationDays: item.durationDays,
      academicYear: item.academicYear,
      isClosedForStudents: item.isClosedForStudents,
      isClosedForStaff: item.isClosedForStaff,
      description: item.description || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isRecurring: false,
      };
      if (editingItem) {
        await api.put(`/holidays/${editingItem.id}`, payload);
        showToast('Congé mis à jour avec succès', 'success');
      } else {
        await api.post('/holidays', payload);
        showToast('Congé créé avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchHolidays();
    } catch (err: any) {
      showApiErrorToast(err, "Erreur lors de l'enregistrement du congé");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: HolidayItem, permanent = false) => {
    const isRoot = true; // Root context
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE du congé "${row.name}" ? Action irréversible.`
      : `Supprimer le congé "${row.name}" ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/holidays/${row.id}`, {
        params: { permanent: permanent && isRoot },
      });
      showToast(permanent ? 'Congé supprimé définitivement' : 'Congé supprimé avec succès', 'success');
      await fetchHolidays();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression du congé');
    }
  };

  const handleRestore = async (row: HolidayItem) => {
    if (!window.confirm(`Restaurer le congé "${row.name}" ?`)) return;
    try {
      await api.post(`/holidays/${row.id}/restore`);
      showToast('Congé restauré avec succès', 'success');
      await fetchHolidays();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration du congé');
    }
  };

  const filteredHolidays = holidays.filter((h) => {
    if (!isTrashMode && h.isDeleted) return false;
    if (isTrashMode && !h.isDeleted) return false;
    if (typeFilter && h.type !== typeFilter) return false;
    if (yearFilter && h.academicYear !== yearFilter) return false;
    return true;
  });

  const columns: ColumnDef<HolidayItem>[] = [
    {
      key: 'name',
      header: 'Intitulé des Vacances / Congé',
      sortable: true,
      render: (row) => {
        const typeConfig = {
          ACADEMIC_VACATION: { icon: School, color: 'text-brand bg-brand/10 border-brand/20', label: 'Vacances Scolaires' },
          NATIONAL: { icon: Sun, color: 'text-rose-600 bg-rose-500/10 border-rose-500/20', label: 'Fête Nationale' },
          RELIGIOUS: { icon: Moon, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', label: 'Fête Religieuse' },
        };
        const conf = typeConfig[row.type] || typeConfig.ACADEMIC_VACATION;
        const IconComponent = conf.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${conf.color} shrink-0`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">{row.name}</div>
              <div className="text-xs text-text-tertiary flex items-center gap-2 mt-0.5">
                <span className="font-medium">{conf.label}</span>
                <span>•</span>
                <span className="font-mono">{row.academicYear}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'dates',
      header: 'Période & Durée',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>Du {row.startDate} au {row.endDate}</span>
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{row.durationDays} jour{row.durationDays > 1 ? 's' : ''} de congé</span>
          </div>
        </div>
      ),
    },
    {
      key: 'impact',
      header: 'Impact Établissement',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Élèves:</span>
            <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${row.isClosedForStudents ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {row.isClosedForStudents ? 'Cours Suspendus' : 'Cours Maintenus'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Personnel:</span>
            <span className={`px-2 py-0.2 rounded text-[10px] font-semibold ${row.isClosedForStaff ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'}`}>
              {row.isClosedForStaff ? 'Établissement Fermé' : 'Permanence Assurée'}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Catégorie Officielle',
      sortable: true,
      render: (row) => {
        const badgeMap = {
          ACADEMIC_VACATION: 'bg-brand/10 text-brand border-brand/20',
          NATIONAL: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          RELIGIOUS: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        };
        const labelMap = {
          ACADEMIC_VACATION: 'Calendrier Scolaire',
          NATIONAL: 'Jour Férié National',
          RELIGIOUS: 'Fête Religieuse',
        };
        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeMap[row.type]}`}>
            {labelMap[row.type]}
          </span>
        );
      },
    },
  ];

  const detailSections: DetailSection<HolidayItem>[] = [
    {
      title: 'Détails du Congé Pédagogique',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Intitulé Officiel</span>
            <span className="font-bold text-text-primary text-sm">{item.name}</span>
            <span className="text-xs text-brand block mt-1 font-semibold">{item.academicYear}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Période du Congé</span>
            <span className="font-semibold text-text-primary text-sm">
              Du {item.startDate} au {item.endDate}
            </span>
            <span className="text-xs text-text-secondary block mt-1">{item.durationDays} jour(s) chômé(s)</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Description & Justification</span>
            <span className="text-xs text-text-primary block font-medium mt-1">
              {item.description || 'Congé réglementaire officiel du Ministère de l’Éducation.'}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Traçabilité & Audit Trail',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Création</span>
            <span className="font-medium text-text-primary">
              {new Date(item.createdAt).toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-text-secondary block mt-1">
              Par: {item.createdByName || item.createdBy}
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Dernière Modification</span>
            <span className="font-medium text-text-primary">
              {new Date(item.updatedAt).toLocaleString('fr-FR')}
            </span>
            <span className="text-xs text-text-secondary block mt-1">
              Par: {item.updatedByName || item.updatedBy || 'Système'}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand/10 text-brand">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Calendrier Scolaire & Vacances</h1>
              <p className="text-sm text-text-secondary">
                Gestion des vacances officielles, fêtes nationales et religieuses du système éducatif tunisien.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={isTrashMode ? 'secondary' : 'outline'}
            onClick={() => setIsTrashMode(!isTrashMode)}
            className="flex items-center gap-2"
          >
            {isTrashMode ? <RotateCcw className="w-4 h-4 text-brand" /> : <Building2 className="w-4 h-4 text-text-tertiary" />}
            {isTrashMode ? 'Voir Actifs' : 'Corbeille'}
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Ajouter une Période
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Périodes Déclarées</span>
              <span className="text-2xl font-bold text-text-primary">{holidays.filter((h) => !h.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total Jours Chômés</span>
              <span className="text-2xl font-bold text-emerald-600">
                {holidays
                  .filter((h) => !h.isDeleted)
                  .reduce((acc, curr) => acc + curr.durationDays, 0)}{' '}
                Jours
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Fêtes Nationales</span>
              <span className="text-2xl font-bold text-rose-600">
                {holidays.filter((h) => !h.isDeleted && h.type === 'NATIONAL').length}
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <Sun className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Vacances Pédagogiques</span>
              <span className="text-2xl font-bold text-purple-600">
                {holidays.filter((h) => !h.isDeleted && h.type === 'ACADEMIC_VACATION').length}
              </span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <School className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<HolidayItem>
        title={isTrashMode ? 'Corbeille des Vacances' : 'Calendrier Officiel des Vacances'}
        data={filteredHolidays}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher un congé par intitulé, date ou catégorie..."
        searchKeys={['name', 'startDate', 'endDate', 'academicYear', 'description']}
        exportFilename={`calendrier-vacances-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Calendrier Officiel des Vacances - BSofts School"
        detailSections={detailSections}
        allowedDisplayModes={['list', 'grid', 'split']}
        defaultDisplayMode="list"
        gridCardRender={(item, onSelect) => (
          <Card
            key={item.id}
            onClick={onSelect}
            className="p-5 cursor-pointer hover:border-brand/40 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-text-primary text-sm">{item.name}</h3>
                  <span className="text-xs text-brand font-medium">{item.academicYear}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    item.type === 'ACADEMIC_VACATION'
                      ? 'bg-brand/10 text-brand border-brand/20'
                      : item.type === 'NATIONAL'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  }`}
                >
                  {item.type === 'ACADEMIC_VACATION' ? 'Vacances' : item.type === 'NATIONAL' ? 'National' : 'Religieux'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Début:</span>
                  <span className="font-mono font-medium text-text-primary">{item.startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Fin:</span>
                  <span className="font-mono font-medium text-text-primary">{item.endDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Durée:</span>
                  <span className="font-bold text-brand">{item.durationDays} jour(s)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                {item.isClosedForStudents ? <CheckCircle2 className="w-3 h-3 text-rose-500" /> : <AlertCircle className="w-3 h-3 text-emerald-500" />}
                {item.isClosedForStudents ? 'Cours Suspendus' : 'Cours Actifs'}
              </span>
              <span className="text-[10px] text-text-tertiary">Officiel</span>
            </div>
          </Card>
        )}
        actions={{
          onEdit: (row) => openEditModal(row),
          onDelete: (row) => handleDelete(row, false),
          onRestore: (row) => handleRestore(row),
          onPermanentDelete: (row) => handleDelete(row, true),
        }}
        customFilters={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les catégories</option>
              <option value="ACADEMIC_VACATION">Vacances Scolaires</option>
              <option value="NATIONAL">Fêtes Nationales</option>
              <option value="RELIGIOUS">Fêtes Religieuses</option>
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les années</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>
        }
      />

      {/* Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le Congé : ${editingItem.name}` : 'Déclarer une Nouvelle Période de Congé'}
        size="6xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Définition */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              1. Définition & Typologie du Congé
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Intitulé du Congé"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ex: Vacances de Printemps"
              />
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Catégorie</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'ACADEMIC_VACATION' | 'NATIONAL' | 'RELIGIOUS',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="ACADEMIC_VACATION">Vacances Scolaires Pédagogiques</option>
                  <option value="NATIONAL">Fête Nationale Officielle</option>
                  <option value="RELIGIOUS">Fête Religieuse</option>
                </select>
              </div>
              <Input
                label="Année Scolaire de Référence"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 2: Dates & Durée */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              2. Période Calendaire & Nombre de Jours
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Date de Début"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                label="Date de Fin"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
              <Input
                label="Nombre Total de Jours Chômés"
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 3: Impact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-brand" />
              3. Modalités de Fermeture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Suspension des Cours (Élèves)</div>
                  <div className="text-xs text-text-tertiary">
                    Aucun cours ni devoir n’est planifié durant cette période.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isClosedForStudents}
                  onChange={(e) => setFormData({ ...formData, isClosedForStudents: e.target.checked })}
                  className="w-5 h-5 rounded text-brand focus:ring-brand"
                />
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Fermeture Totale (Personnel)</div>
                  <div className="text-xs text-text-tertiary">
                    Les bureaux administratifs et enseignants sont fermés.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isClosedForStaff}
                  onChange={(e) => setFormData({ ...formData, isClosedForStaff: e.target.checked })}
                  className="w-5 h-5 rounded text-brand focus:ring-brand"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Conformité avec la circulaire ministérielle des jours fériés et vacances.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingItem ? 'Enregistrer les Modifications' : 'Ajouter au Calendrier'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
