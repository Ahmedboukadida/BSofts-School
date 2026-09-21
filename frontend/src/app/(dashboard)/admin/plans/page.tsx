'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Users,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Check,
  Award,
  Crown,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import type { PlanItem } from '@/types';

const DEFAULT_PLAN_FEATURES = [
  { code: 'feat_students', name: 'Gestion des Inscriptions & Dossiers Élèves' },
  { code: 'feat_grades', name: 'Carnet de Notes & Bulletins Trimestriels' },
  { code: 'feat_attendance', name: 'Appel Numérique & Suivi Présences' },
  { code: 'feat_timetable', name: 'Emploi du Temps Dynamique & Salles' },
  { code: 'feat_finance', name: 'Gestion Financière & Caisses (TND)' },
  { code: 'feat_portals', name: 'Espaces Dédiés Enseignants & Parents' },
  { code: 'feat_visio', name: 'Salon Virtuel de Visioconférence' },
  { code: 'feat_reports_ai', name: 'Analytique KPI & Rapports Ministériels' },
];

export default function SaaSAdminPlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [intervalFilter, setIntervalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: 350,
    currency: 'TND' as const,
    interval: 'MONTHLY' as PlanItem['interval'],
    maxStudents: 500,
    maxTeachers: 40,
    maxStorageGb: 50,
    isPopular: false,
    includedFeatureCodes: ['feat_students', 'feat_grades', 'feat_attendance', 'feat_timetable'],
    isActive: true,
  });

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/saas-plans', {
        params: { includeDeleted: isTrashMode },
      });

      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        const formatted: PlanItem[] = rawData.map((p: any) => ({
          ...p,
          code: p.code || p.name.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
          price: Number(p.price ?? 350),
          currency: 'TND',
          interval: p.interval || 'MONTHLY',
          maxStudents: Number(p.maxStudents ?? 500),
          maxTeachers: Number(p.maxTeachers ?? 40),
          maxStorageGb: Number(p.maxStorageGb ?? 50),
          activeSubscribers: typeof p.activeSubscribers === 'number' ? p.activeSubscribers : (p._count?.subscriptions ?? 0),
          features: Array.isArray(p.features) && p.features.length > 0 && typeof p.features[0] === 'object' && 'code' in p.features[0]
            ? p.features
            : DEFAULT_PLAN_FEATURES.map((df) => ({
                ...df,
                included: Array.isArray(p.features)
                  ? p.features.some((f: any) => (typeof f === 'string' ? f === df.code : f.code === df.code))
                  : true,
              })),
          isActive: p.isActive ?? true,
          sortOrder: Number(p.sortOrder ?? 0),
        }));
        setPlans(formatted);
      } else {
        setPlans([]);
      }
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors du chargement des forfaits SaaS');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      price: 350,
      currency: 'TND',
      interval: 'MONTHLY',
      maxStudents: 500,
      maxTeachers: 40,
      maxStorageGb: 50,
      isPopular: false,
      includedFeatureCodes: ['feat_students', 'feat_grades', 'feat_attendance', 'feat_timetable'],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: PlanItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      price: item.price,
      currency: 'TND',
      interval: item.interval,
      maxStudents: item.maxStudents,
      maxTeachers: item.maxTeachers,
      maxStorageGb: item.maxStorageGb,
      isPopular: !!item.isPopular,
      includedFeatureCodes: item.features.filter((f) => f.included).map((f) => f.code),
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const toggleFeatureInForm = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      includedFeatureCodes: prev.includedFeatureCodes.includes(code)
        ? prev.includedFeatureCodes.filter((c) => c !== code)
        : [...prev.includedFeatureCodes, code],
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formattedFeatures = DEFAULT_PLAN_FEATURES.map((f) => ({
        ...f,
        included: formData.includedFeatureCodes.includes(f.code),
      }));

      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        currency: 'TND',
        interval: formData.interval,
        maxStudents: Number(formData.maxStudents),
        maxTeachers: Number(formData.maxTeachers),
        maxStorageGb: Number(formData.maxStorageGb),
        isPopular: formData.isPopular,
        isActive: formData.isActive,
        features: formattedFeatures,
      };

      if (editingItem) {
        await api.put(`/saas-plans/${editingItem.id}`, payload);
        showToast.success('Forfait modifié avec succès');
      } else {
        await api.post('/saas-plans', payload);
        showToast.success('Nouveau forfait créé avec succès');
      }
      setIsFormModalOpen(false);
      fetchPlans();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de l’enregistrement du forfait');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PlanItem) => {
    try {
      await api.delete(`/saas-plans/${item.id}`);
      showToast.success('Forfait archivé et déplacé dans la corbeille');
      fetchPlans();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de la suppression');
    }
  };

  const handlePermanentDelete = async (item: PlanItem) => {
    try {
      await api.delete(`/saas-plans/${item.id}?permanent=true`);
      showToast.success('Forfait supprimé définitivement');
      fetchPlans();
    } catch (err) {
      showApiErrorToast(err, 'Impossible de supprimer définitivement ce forfait');
    }
  };

  const handleRestore = async (item: PlanItem) => {
    try {
      await api.post(`/saas-plans/${item.id}/restore`);
      showToast.success('Forfait restauré avec succès');
      fetchPlans();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de la restauration');
    }
  };

  const handleToggleStatus = async (item: PlanItem) => {
    const updated = !item.isActive;
    try {
      await api.put(`/saas-plans/${item.id}`, { isActive: updated });
      showToast.success(updated ? 'Forfait activé' : 'Forfait archivé');
      fetchPlans();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de la modification du statut');
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (intervalFilter && p.interval !== intervalFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !p.isActive : p.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<PlanItem>[] = [
    {
      key: 'name',
      header: 'Forfait & Code',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-[#CCA43B] font-semibold border border-border">
                {row.code}
              </span>
              {row.isPopular && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#CCA43B]/10 text-[#CCA43B] border border-[#CCA43B]/30 rounded">
                  Recommandé
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Tarif (TND)',
      render: (row) => (
        <div>
          <span className="text-base font-extrabold text-text-primary">
            {Number(row.price || 0).toLocaleString('fr-TN')} {row.currency || 'TND'}
          </span>
          <span className="text-xs text-text-tertiary block">
            {row.interval === 'MONTHLY' ? '/ mois' : '/ an'}
          </span>
        </div>
      ),
    },
    {
      key: 'maxStudents',
      header: 'Quotas & Capacités',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-text-primary flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#CCA43B]" /> {row.maxStudents} élèves max
          </p>
          <p className="text-[11px] text-text-secondary flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-text-tertiary" /> {row.maxStorageGb} Go stockage
          </p>
        </div>
      ),
    },
    {
      key: 'activeSubscribers',
      header: 'Abonnements Actifs',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{row.activeSubscribers} établissements</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Disponibilité',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Actif' : 'Archivé'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: PlanItem): DetailSection[] => [
    {
      title: 'Détails Financiers & Quotas du Forfait',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Tarification Réglementée</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-text-primary">
                {item.price.toLocaleString('fr-TN')} TND
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {item.interval === 'MONTHLY' ? 'par mois d’engagement' : 'facturation annuelle'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Limites Techniques par Établissement</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-text-primary mt-1">
              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-text-tertiary text-[10px] block">Élèves Inscrits</span>
                {item.maxStudents} max
              </div>
              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-text-tertiary text-[10px] block">Enseignants</span>
                {item.maxTeachers} max
              </div>
              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-text-tertiary text-[10px] block">Stockage Cloud</span>
                {item.maxStorageGb} Go
              </div>
              <div className="p-2 bg-background rounded-lg border border-border-subtle">
                <span className="text-text-tertiary text-[10px] block">Souscriptions</span>
                {item.activeSubscribers} actifs
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Grille des Fonctionnalités Incluses',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {(item.features || []).map((f) => (
            <div
              key={f.code}
              className={`p-3 rounded-xl border flex items-center justify-between ${
                f.included
                  ? 'border-emerald-200 bg-emerald-500/5 text-emerald-800'
                  : 'border-border bg-surface text-text-tertiary line-through opacity-60'
              }`}
            >
              <span className="text-xs font-semibold">{f.name}</span>
              {f.included ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : (
                <span className="text-xs text-text-tertiary font-bold">Non inclus</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: PlanItem,
    onViewDetails: (item: PlanItem) => void,
    actions: TableRowActions<PlanItem>
  ) => (
    <Card
      key={item.id}
      className={`p-6 hover:shadow-lg transition-all duration-200 border relative group flex flex-col justify-between ${
        item.isPopular ? 'border-[#CCA43B] ring-2 ring-[#CCA43B]/20 shadow-md' : 'border-border'
      }`}
    >
      <div>
        {item.isPopular && (
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#CCA43B] text-[#242F40] text-[10px] font-bold tracking-wide uppercase shadow-xs">
            Recommandé
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-lg shadow-xs shrink-0 border border-[#363636]">
            <Crown className="w-6 h-6" />
          </div>
          <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
            {item.code}
          </span>
        </div>

        <h3 className="font-bold text-lg text-text-primary group-hover:text-[#CCA43B] transition-colors mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-tertiary line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="p-4 bg-surface rounded-2xl border border-border-subtle mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-text-primary">
              {item.price.toLocaleString('fr-TN')}
            </span>
            <span className="text-sm font-extrabold text-[#CCA43B]">TND</span>
            <span className="text-xs text-text-tertiary ml-1">
              {item.interval === 'MONTHLY' ? '/ mois' : '/ an'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#CCA43B]" /> Capacité élèves
            </span>
            <span className="font-bold text-text-primary">{item.maxStudents} max</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1 border-b border-border-subtle">
            <span className="text-text-secondary flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#CCA43B]" /> Stockage fichiers
            </span>
            <span className="font-bold text-text-primary">{item.maxStorageGb} Go</span>
          </div>
          <div className="flex items-center justify-between text-xs py-1">
            <span className="text-text-secondary flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Abonnements
            </span>
            <span className="font-bold text-emerald-600">{item.activeSubscribers} actifs</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface text-text-secondary'
          }`}
        >
          {item.isActive ? 'Actif' : 'Archivé'}
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
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Forfaits & Abonnements SaaS</h1>
              <p className="text-sm text-text-secondary">
                Configuration des plans tarifaires en Dinar Tunisien (TND), quotas d’élèves et grille des fonctionnalités.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Forfait
          </Button>
        </div>
      </div>

      <DataTable<PlanItem>
        title="Catalogue des Formules SaaS (TND)"
        data={filteredPlans}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par forfait, code ou quota..."
        defaultDisplayMode="grid"
        allowedDisplayModes={['list', 'grid', 'split']}
        detailModalSize="6xl"
        renderGridCard={renderGridCard}
        renderDetailSections={renderDetailSections}
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
          onPermanentDelete: handlePermanentDelete,
          onRestore: handleRestore,
          onToggleStatus: handleToggleStatus,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Forfaits_SaaS_TND"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              aria-label="Filtrer par fréquence"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-[#CCA43B]"
            >
              <option value="">Toutes les fréquences</option>
              <option value="MONTHLY">Facturation Mensuelle</option>
              <option value="YEARLY">Facturation Annuelle</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par disponibilité"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-[#CCA43B]"
            >
              <option value="">Toutes les disponibilités</option>
              <option value="active">Actifs uniquement</option>
              <option value="inactive">Archivés</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le forfait : ${editingItem.name}` : 'Créer un Forfait d’Abonnement SaaS'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Award className="w-4 h-4 text-[#CCA43B]" />
                Désignation & Tarification (TND)
              </h3>

              <Input
                label="Intitulé du forfait *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pack Lycée Avancé"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Système Unique *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="Ex: PACK_LYCEE_PRO"
                  required
                />
                <Input
                  label="Tarif en TND *"
                  type="number"
                  min={0}
                  step="0.1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Périodicité de Facturation *
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value as PlanItem['interval'] })}
                    aria-label="Périodicité de facturation"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                    required
                  >
                    <option value="MONTHLY">Mensuelle (/ mois)</option>
                    <option value="YEARLY">Annuelle (/ an)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded text-[#CCA43B] focus:ring-[#CCA43B]"
                    />
                    <span className="text-xs font-semibold text-text-primary">
                      Marquer comme Recommandé
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description commerciale
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez les cibles pédagogiques de cette formule..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B] resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#CCA43B]" />
                  <span>Quotas & Fonctionnalités Incluses</span>
                </div>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Élèves max"
                  type="number"
                  min={1}
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Profs max"
                  type="number"
                  min={1}
                  value={formData.maxTeachers}
                  onChange={(e) => setFormData({ ...formData, maxTeachers: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Stockage Go"
                  type="number"
                  min={1}
                  value={formData.maxStorageGb}
                  onChange={(e) => setFormData({ ...formData, maxStorageGb: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {DEFAULT_PLAN_FEATURES.map((feat) => {
                  const isChecked = formData.includedFeatureCodes.includes(feat.code);
                  return (
                    <div
                      key={feat.code}
                      onClick={() => toggleFeatureInForm(feat.code)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-emerald-200 bg-emerald-500/5 shadow-2xs'
                          : 'border-border bg-background hover:bg-surface-hover'
                      }`}
                    >
                      <span className="text-xs font-semibold text-text-primary">{feat.name}</span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border bg-surface'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer le Forfait'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
