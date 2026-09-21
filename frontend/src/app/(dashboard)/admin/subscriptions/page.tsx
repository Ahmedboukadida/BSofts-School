'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/auth-store';
import type { SubscriptionItem } from '@/types';

export default function SaaSAdminSubscriptionsPage() {
  const { user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'REQUESTED' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED'>('ALL');

  // Create Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubscriptionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tenantName: '',
    planName: 'Pack Établissement Pro',
    price: 650,
    status: 'ACTIVE' as SubscriptionItem['status'],
    startDate: new Date().toISOString().split('T')[0],
    durationMonths: 12,
    autoRenew: true,
    contactPerson: '',
    contactEmail: '',
    notes: '',
  });

  // Renewal Modal State (Extra Large Size 6xl)
  const [renewItem, setRenewItem] = useState<SubscriptionItem | null>(null);
  const [renewMonths, setRenewMonths] = useState(12);
  const [renewPrice, setRenewPrice] = useState(650);
  const [isRenewing, setIsRenewing] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tenant-subscriptions', {
        params: { includeDeleted: isTrashMode },
      });

      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        const formatted: SubscriptionItem[] = rawData.map((s: any) => {
          const tenantName =
            s.tenantName ||
            (s.tenant?.user
              ? `${s.tenant.user.firstName || ''} ${s.tenant.user.lastName || ''}`.trim()
              : 'Établissement Scolaire');
          const planName = s.planName || s.plan?.name || 'Pack Standard';
          const price = Number(s.price ?? s.plan?.price ?? 650);
          const currency = s.currency || s.plan?.currency || 'TND';
          const subNum = s.subscriptionNumber || `SUB-${s.id.slice(0, 8).toUpperCase()}`;
          const startStr = s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const endStr = s.endDate ? new Date(s.endDate).toISOString().split('T')[0] : '';
          let daysRemaining = 0;
          if (endStr) {
            const diff = new Date(endStr).getTime() - new Date().getTime();
            daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }
          return {
            ...s,
            tenantName,
            planName,
            price,
            currency,
            subscriptionNumber: subNum,
            startDate: startStr,
            endDate: endStr,
            daysRemaining,
            status: s.status || 'ACTIVE',
          };
        });
        setSubscriptions(formatted);
      } else {
        setSubscriptions([]);
      }
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors du chargement des souscriptions');
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Handle Approve Request
  const handleApprove = async (item: SubscriptionItem) => {
    const actor = user
      ? `${user.firstName || ''} ${user.lastName || ''} (@${user.username || user.email || 'user'}) [${user.role || 'ROOT'}]`.trim()
      : 'Root Administrator';
    try {
      await api.post(`/tenant-subscriptions/${item.id}/approve`, {
        approvedBy: actor,
      });
      showToast.success(`Souscription ${item.subscriptionNumber} approuvée avec succès`);
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de l’approbation de la souscription');
    }
  };

  // Open Renewal Modal
  const handleOpenRenew = (item: SubscriptionItem) => {
    setRenewItem(item);
    setRenewMonths(12);
    setRenewPrice(item.price);
  };

  // Submit Renewal
  const handleConfirmRenew = async () => {
    if (!renewItem) return;
    setIsRenewing(true);
    try {
      const currentEnd = new Date(renewItem.endDate || new Date());
      currentEnd.setMonth(currentEnd.getMonth() + renewMonths);
      const newEndDate = currentEnd.toISOString().split('T')[0];

      await api.post(`/tenant-subscriptions/${renewItem.id}/renew`, {
        months: renewMonths,
        price: renewPrice,
        newEndDate,
      });

      showToast.success(`Abonnement prolongé de ${renewMonths} mois`);
      setRenewItem(null);
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors du renouvellement de l’abonnement');
    } finally {
      setIsRenewing(false);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      tenantName: '',
      planName: 'Pack Établissement Pro',
      price: 650,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      durationMonths: 12,
      autoRenew: true,
      contactPerson: '',
      contactEmail: '',
      notes: '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: SubscriptionItem) => {
    setEditingItem(item);
    setFormData({
      tenantName: item.tenantName,
      planName: item.planName,
      price: item.price,
      status: item.status,
      startDate: item.startDate,
      durationMonths: 12,
      autoRenew: item.autoRenew,
      contactPerson: item.contactPerson || '',
      contactEmail: item.contactEmail || '',
      notes: item.notes || '',
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const start = new Date(formData.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + Number(formData.durationMonths));

      const payload = {
        ...formData,
        endDate: end.toISOString().split('T')[0],
        price: Number(formData.price),
      };

      if (editingItem) {
        await api.put(`/tenant-subscriptions/${editingItem.id}`, payload);
        showToast.success('Souscription modifiée avec succès');
      } else {
        await api.post('/tenant-subscriptions', payload);
        showToast.success('Souscription enregistrée avec succès');
      }
      setIsFormModalOpen(false);
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de l’enregistrement de la souscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: SubscriptionItem) => {
    try {
      await api.delete(`/tenant-subscriptions/${item.id}`);
      showToast.success('Souscription résiliée et déplacée dans la corbeille');
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de la résiliation');
    }
  };

  const handlePermanentDelete = async (item: SubscriptionItem) => {
    try {
      await api.delete(`/tenant-subscriptions/${item.id}?permanent=true`);
      showToast.success('Souscription supprimée définitivement');
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Impossible de supprimer définitivement cette souscription');
    }
  };

  const handleRestore = async (item: SubscriptionItem) => {
    try {
      await api.post(`/tenant-subscriptions/${item.id}/restore`);
      showToast.success('Souscription réactivée avec succès');
      fetchSubscriptions();
    } catch (err) {
      showApiErrorToast(err, 'Erreur lors de la réactivation');
    }
  };

  const getStatusBadge = (status: SubscriptionItem['status']) => {
    const map = {
      REQUESTED: { label: 'Demande Soumise', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
      ACTIVE: { label: 'Souscription Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
      EXPIRING_SOON: { label: 'À Renouveler (<30j)', color: 'bg-orange-500/10 text-orange-600 border-orange-200', icon: AlertTriangle },
      EXPIRED: { label: 'Abonnement Expiré', color: 'bg-rose-500/10 text-rose-600 border-rose-200', icon: XCircle },
      CANCELLED: { label: 'Résilié', color: 'bg-surface text-text-secondary border-border', icon: XCircle },
    };
    const c = map[status] || { label: status, color: 'bg-surface text-text-secondary border-border', icon: Clock };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  // Filtered dataset according to Tabs
  const filteredSubscriptions = subscriptions.filter((s) => {
    if (tabFilter === 'REQUESTED' && s.status !== 'REQUESTED') return false;
    if (tabFilter === 'ACTIVE' && s.status !== 'ACTIVE') return false;
    if (tabFilter === 'EXPIRING_SOON' && s.status !== 'EXPIRING_SOON') return false;
    if (tabFilter === 'EXPIRED' && s.status !== 'EXPIRED' && s.status !== 'CANCELLED') return false;
    return true;
  });

  const columns: ColumnDef<SubscriptionItem>[] = [
    {
      key: 'tenantName',
      header: 'Établissement & Référence',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.tenantName}</span>
            <span className="text-[11px] font-mono text-[#CCA43B] font-semibold">
              {row.subscriptionNumber}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'planName',
      header: 'Formule & Montant',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-text-primary block">{row.planName}</span>
          <span className="text-xs font-bold text-emerald-600">
            {row.price.toLocaleString('fr-TN')} {row.currency}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut du Contrat',
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: 'endDate',
      header: 'Validité & Échéance',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-text-primary">Jusqu’au {row.endDate}</p>
          <p className={`text-[11px] font-semibold ${row.daysRemaining < 30 ? 'text-orange-600' : 'text-text-tertiary'}`}>
            {row.daysRemaining > 0 ? `${row.daysRemaining} jours restants` : 'Expiré'}
          </p>
        </div>
      ),
    },
    {
      key: 'actions_flow',
      header: 'Opérations Commerciales',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'REQUESTED' && (
            <Button
              size="sm"
              onClick={() => handleApprove(row)}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Approuver
            </Button>
          )}

          {(row.status === 'EXPIRING_SOON' || row.status === 'EXPIRED') && (
            <Button
              size="sm"
              onClick={() => handleOpenRenew(row)}
              className="h-7 text-xs bg-[#CCA43B] hover:bg-[#b59132] text-[#242F40] shadow-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Renouveler
            </Button>
          )}
        </div>
      ),
    },
  ];

  const renderDetailSections = (item: SubscriptionItem): DetailSection[] => [
    {
      title: 'Contrat d’Abonnement Scolaire',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Établissement Titulaire</span>
            <p className="text-base font-bold text-text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#CCA43B]" /> {item.tenantName}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#CCA43B]/10 text-[#CCA43B] rounded">
                Réf: {item.subscriptionNumber}
              </span>
              {getStatusBadge(item.status)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Modalités Financières</span>
            <p className="text-lg font-black text-text-primary">
              {item.price.toLocaleString('fr-TN')} {item.currency}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Plan souscrit : <span className="font-semibold text-text-primary">{item.planName}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Cycle de Vie & Workflow de Validation',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-text-tertiary block mb-0.5">Date Début</span>
              <span className="font-bold text-text-primary">{item.startDate}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-text-tertiary block mb-0.5">Date Échéance</span>
              <span className="font-bold text-text-primary">{item.endDate}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-text-tertiary block mb-0.5">Approbation</span>
              <span className="font-semibold text-text-primary">{item.approvedBy || 'En attente validation'}</span>
            </div>
          </div>
          {item.notes && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-text-primary block mb-1">Notes administratives :</span>
              {item.notes}
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: SubscriptionItem,
    onViewDetails: (item: SubscriptionItem) => void,
    actions: TableRowActions<SubscriptionItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.subscriptionNumber}
            </span>
            <div className="mt-1.5">{getStatusBadge(item.status)}</div>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-[#CCA43B] transition-colors line-clamp-1 mb-1">
          {item.tenantName}
        </h3>

        <p className="text-xs text-text-tertiary mb-3 font-semibold">
          {item.planName}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-3 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">Facturation TND</span>
          <span className="text-sm font-extrabold text-emerald-600">
            {item.price.toLocaleString('fr-TN')} TND
          </span>
        </div>

        <div className="space-y-1 text-xs text-text-secondary mb-4">
          <div className="flex justify-between">
            <span>Échéance :</span>
            <span className="font-semibold text-text-primary">{item.endDate}</span>
          </div>
          <div className="flex justify-between">
            <span>Jours restants :</span>
            <span className={`font-bold ${item.daysRemaining < 30 ? 'text-orange-600' : 'text-emerald-600'}`}>
              {item.daysRemaining} j
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {item.status === 'REQUESTED' && (
            <Button size="sm" onClick={() => handleApprove(item)} className="h-7 text-xs bg-emerald-600 text-white">
              Approuver
            </Button>
          )}
          {(item.status === 'EXPIRING_SOON' || item.status === 'EXPIRED') && (
            <Button size="sm" onClick={() => handleOpenRenew(item)} className="h-7 text-xs bg-[#CCA43B] hover:bg-[#b59132] text-[#242F40] font-semibold">
              Renouveler
            </Button>
          )}
        </div>

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
            <div className="p-2.5 rounded-xl bg-[#CCA43B]/10 text-[#CCA43B]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Souscriptions & Abonnements</h1>
              <p className="text-sm text-text-secondary">
                Gestion des demandes d’abonnement, approbations, renouvellements et cycle de vie des licences scolaires.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle Souscription
          </Button>
        </div>
      </div>

      {/* Quick Status Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: 'ALL', label: 'Toutes les Souscriptions' },
          { key: 'REQUESTED', label: 'En Attente / Demandées' },
          { key: 'ACTIVE', label: 'Actives & En Règle' },
          { key: 'EXPIRING_SOON', label: 'À Renouveler (<30j)' },
          { key: 'EXPIRED', label: 'Expirées / Clôturées' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabFilter(tab.key as typeof tabFilter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              tabFilter === tab.key
                ? 'bg-[#CCA43B] text-[#242F40] shadow-xs'
                : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable<SubscriptionItem>
        title="Registre des Souscriptions Actives & Demandes"
        data={filteredSubscriptions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par établissement, numéro SUB ou contact..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'grid', 'split']}
        detailModalSize="6xl"
        renderGridCard={renderGridCard}
        renderDetailSections={renderDetailSections}
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
          onPermanentDelete: handlePermanentDelete,
          onRestore: handleRestore,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Souscriptions_SaaS"
      />

      {/* Create / Edit Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier la souscription : ${editingItem.subscriptionNumber}` : 'Enregistrer une Souscription / Demande'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Building2 className="w-4 h-4 text-[#CCA43B]" />
                Établissement & Formule
              </h3>

              <Input
                label="Nom de l’Établissement Scolaire *"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                placeholder="Ex: Collège Les Pépites"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Formule Souscrite *
                  </label>
                  <select
                    value={formData.planName}
                    onChange={(e) => {
                      const prices: Record<string, number> = {
                        'Formule Découverte': 0,
                        'Pack Scolarité Essentielle': 280,
                        'Pack Établissement Pro': 650,
                        'Campus Groupe Scolaire': 1400,
                      };
                      setFormData({
                        ...formData,
                        planName: e.target.value,
                        price: prices[e.target.value] || 650,
                      });
                    }}
                    aria-label="Formule souscrite"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                    required
                  >
                    <option value="Formule Découverte">Formule Découverte (0 TND)</option>
                    <option value="Pack Scolarité Essentielle">Pack Scolarité (280 TND)</option>
                    <option value="Pack Établissement Pro">Pack Établissement Pro (650 TND)</option>
                    <option value="Campus Groupe Scolaire">Campus Groupe Scolaire (1400 TND)</option>
                  </select>
                </div>

                <Input
                  label="Tarif Négocié (TND) *"
                  type="number"
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date de début *"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Durée d’engagement *
                  </label>
                  <select
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                    aria-label="Durée d’engagement"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                  >
                    <option value={1}>1 Mois (Test)</option>
                    <option value={3}>3 Mois (Trimestre)</option>
                    <option value={6}>6 Mois (Semestre)</option>
                    <option value={12}>12 Mois (Année Scolaire)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Sparkles className="w-4 h-4 text-[#CCA43B]" />
                Validation & Contacts
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Contact Référent"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="Ex: Dr. Rafik Mansour"
                />
                <Input
                  label="Email de Facturation"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="compta@ecole.tn"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Statut initial
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as SubscriptionItem['status'] })}
                  aria-label="Statut initial"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                >
                  <option value="REQUESTED">Demande en Attente d’Approbation</option>
                  <option value="ACTIVE">Souscription Active Immédiate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Notes administratives & Bon de commande
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Précisez le mode de paiement (Chèque, Virement) ou conditions particulières..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B] resize-none"
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer la Souscription'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renewal Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={!!renewItem}
        onClose={() => setRenewItem(null)}
        title={renewItem ? `Renouvellement Contrat : ${renewItem.tenantName}` : 'Renouveler'}
        size="6xl"
      >
        {renewItem && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-[#CCA43B]/10 border border-[#CCA43B]/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-text-primary">
                  Abonnement actuel : {renewItem.planName}
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  Échéance courante au {renewItem.endDate} ({renewItem.daysRemaining} jours restants)
                </p>
              </div>
              <span className="text-base font-extrabold text-[#CCA43B]">
                {renewItem.subscriptionNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <label className="block text-xs font-semibold text-text-secondary">
                  Prolongation de la durée *
                </label>
                <select
                  value={renewMonths}
                  onChange={(e) => setRenewMonths(Number(e.target.value))}
                  aria-label="Prolongation de la durée"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                >
                  <option value={3}>+ 3 Mois (Trimestre Supplémentaire)</option>
                  <option value={6}>+ 6 Mois (Semestre)</option>
                  <option value={12}>+ 12 Mois (Année Scolaire Complète)</option>
                  <option value={24}>+ 24 Mois (Offre Pluriannuelle)</option>
                </select>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface space-y-3">
                <label className="block text-xs font-semibold text-text-secondary">
                  Montant du Renouvellement (TND) *
                </label>
                <Input
                  type="number"
                  min={0}
                  value={renewPrice}
                  onChange={(e) => setRenewPrice(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="secondary" onClick={() => setRenewItem(null)}>
                Annuler
              </Button>
              <Button onClick={handleConfirmRenew} isLoading={isRenewing}>
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Valider le Renouvellement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
