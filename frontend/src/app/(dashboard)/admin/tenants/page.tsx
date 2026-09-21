'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Globe,
  School,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { TenantItem } from '@/types';

export default function SaaSAdminTenantsPage() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TenantItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    ownerName: '',
    ownerEmail: '',
    activePlanName: 'Pack Établissement Pro',
    isActive: true,
  });

  const fetchTenants = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/tenants', {
        params: { includeDeleted: isTrashMode, limit: 100 },
      });

      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        const formatted: TenantItem[] = rawData.map((t: any) => {
          const sub = t.subscriptions?.[0];
          const plan = sub?.plan;
          const owner = t.user;
          return {
            ...t,
            name: t.name || (owner ? `Organisation ${owner.lastName || owner.firstName || t.id.slice(0, 8)}` : `Organisation ${t.id.slice(0, 8)}`),
            slug: t.slug || (owner?.username ? owner.username.toLowerCase() : `org-${t.id.slice(0, 6)}`),
            domain: t.domain || (t.slug ? `${t.slug}.bsofts.tn` : ''),
            ownerName: t.ownerName || (owner ? `${owner.firstName || ''} ${owner.lastName || ''}`.trim() : 'Administrateur Principal'),
            ownerEmail: t.ownerEmail || owner?.email || 'admin@bsofts.tn',
            establishmentsCount: typeof t.establishmentsCount === 'number' ? t.establishmentsCount : (Array.isArray(t.establishments) ? t.establishments.length : 0),
            activePlanName: t.activePlanName || plan?.name || 'Pack Établissement Pro',
            activePlanPrice: Number(t.activePlanPrice ?? plan?.price ?? 350),
            currency: 'TND',
            isActive: t.isActive ?? t.user?.isActive ?? true,
          };
        });
        setTenants(formatted);
      } else {
        setTenants([]);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
      setTenants([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      domain: '',
      ownerName: '',
      ownerEmail: '',
      activePlanName: 'Pack Établissement Pro',
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: TenantItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      domain: item.domain || '',
      ownerName: item.ownerName,
      ownerEmail: item.ownerEmail,
      activePlanName: item.activePlanName,
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/tenants/${editingItem.id}`, formData);
        showToast('Organisation mise à jour avec succès', 'success');
      } else {
        await api.post('/tenants', formData);
        showToast('Organisation créée avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchTenants();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de l’enregistrement de l’organisation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: TenantItem) => {
    try {
      await api.delete(`/tenants/${item.id}`);
      showToast('Organisation suspendue avec succès', 'success');
      await fetchTenants();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suspension de l’organisation');
    }
  };

  const handlePermanentDelete = async (item: TenantItem) => {
    try {
      await api.delete(`/tenants/${item.id}?permanent=true`);
      showToast('Organisation définitivement supprimée', 'success');
      await fetchTenants();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression définitive');
    }
  };

  const handleRestore = async (item: TenantItem) => {
    try {
      await api.post(`/tenants/${item.id}/restore`);
      showToast('Organisation restaurée avec succès', 'success');
      await fetchTenants();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration');
    }
  };

  const handleToggleStatus = async (item: TenantItem) => {
    try {
      const updated = !item.isActive;
      await api.put(`/tenants/${item.id}`, { isActive: updated });
      showToast(updated ? 'Organisation activée' : 'Organisation suspendue', 'success');
      await fetchTenants();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la modification du statut');
    }
  };


  const filteredTenants = tenants.filter((t) => {
    if (statusFilter && (statusFilter === 'active' ? !t.isActive : t.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<TenantItem>[] = [
    {
      key: 'name',
      header: 'Organisation Titulaire (Tenant)',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#CCA43B] font-semibold">
                /{row.slug}
              </span>
              {row.domain && (
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Globe className="w-3 h-3 text-text-tertiary" /> {row.domain}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'ownerName',
      header: 'Administrateur Référent',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-text-primary">{row.ownerName}</p>
          <p className="text-[11px] text-text-secondary">{row.ownerEmail}</p>
        </div>
      ),
    },
    {
      key: 'establishmentsCount',
      header: 'Campus Rattachés',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <School className="w-4 h-4 text-[#CCA43B]" />
          <span>{row.establishmentsCount} établissement(s)</span>
        </div>
      ),
    },
    {
      key: 'activePlanName',
      header: 'Formule Active',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-text-primary block">{row.activePlanName}</span>
          <span className="text-[11px] font-bold text-emerald-600">
            {Number(row.activePlanPrice || 0).toLocaleString('fr-TN')} {row.currency || 'TND'} / mois
          </span>
        </div>
      ),
    },
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
          {row.isActive ? 'Actif' : 'Suspendu'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: TenantItem): DetailSection[] => [
    {
      title: 'Fiche d’Identité Multi-Tenant',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Raison Sociale</span>
            <p className="text-base font-bold text-text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#CCA43B]" /> {item.name}
            </p>
            <div className="mt-2 space-y-1 text-xs text-text-secondary">
              <p>Slug système : <span className="font-mono font-bold text-[#CCA43B]">{item.slug}</span></p>
              <p>Domaine personnalisé : <span className="font-semibold text-text-primary">{item.domain || 'Par défaut'}</span></p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Périmètre & Abonnement</span>
            <p className="text-sm font-semibold text-text-primary">
              Formule : {item.activePlanName} ({item.activePlanPrice} TND / mois)
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Nombre de campus actifs : <span className="font-bold text-text-primary">{item.establishmentsCount}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact Administratif & Sécurité',
      content: (
        <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Contact Principal :</span>
            <span className="font-bold text-text-primary">{item.ownerName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Email Administratif :</span>
            <span className="font-mono text-[#242F40] dark:text-[#E5E5E5] font-semibold">{item.ownerEmail}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-text-secondary">Devise de Facturation :</span>
            <span className="font-bold text-emerald-600">Dinar Tunisien (TND)</span>
          </div>
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: TenantItem,
    onViewDetails: (item: TenantItem) => void,
    actions: TableRowActions<TenantItem>
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
              /{item.slug}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-[#CCA43B] transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-tertiary flex items-center gap-1 mb-3">
          <Globe className="w-3.5 h-3.5" />
          {item.domain || `${item.slug}.bsofts.tn`}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <School className="w-4 h-4 text-[#CCA43B]" />
            <span>Campus</span>
          </div>
          <span className="text-sm font-bold text-text-primary">{item.establishmentsCount} sites</span>
        </div>

        <div className="text-xs text-text-secondary space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Abonnement :</span>
            <span className="font-semibold text-text-primary">{item.activePlanName}</span>
          </div>
          <div className="flex justify-between">
            <span>Administrateur :</span>
            <span className="font-medium text-text-primary">{item.ownerName}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.isActive ? 'Actif' : 'Suspendu'}
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
            <div className="p-2.5 rounded-xl bg-[#242F40] text-[#CCA43B]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Organisations & Tenants SaaS</h1>
              <p className="text-sm text-text-secondary">
                Supervision des comptes clients multi-tenants, domaines personnalisés et périmètre des établissements rattachés.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Créer un Tenant
          </Button>
        </div>
      </div>

      <DataTable<TenantItem>
        title="Répertoire des Comptes Clients Multi-Tenants"
        data={filteredTenants}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par organisation, domaine ou administrateur..."
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
          onToggleStatus: handleToggleStatus,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Tenants_SaaS"
        customFilters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrer par statut"
            className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-[#CCA43B]"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actifs uniquement</option>
            <option value="inactive">Suspendus</option>
          </select>
        }
      />


      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier l’organisation : ${editingItem.name}` : 'Créer une Organisation Multi-Tenant'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Building2 className="w-4 h-4 text-[#CCA43B]" />
                Identité de l’Organisation
              </h3>

              <Input
                label="Raison Sociale / Nom du Groupe *"
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    name: val,
                    slug: !editingItem ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : formData.slug,
                  });
                }}
                placeholder="Ex: Groupe Scolaire Excellence"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Slug URL Unique *"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                  placeholder="groupe-excellence"
                  required
                />
                <Input
                  label="Domaine Dédié"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                  placeholder="excellence.edu.tn"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Users className="w-4 h-4 text-[#CCA43B]" />
                Administrateur & Abonnement
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nom de l’Administrateur *"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Dr. Moncef Trabelsi"
                  required
                />
                <Input
                  label="Email Professionnel *"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="direction@groupe.tn"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Formule Souscrite
                </label>
                <select
                  value={formData.activePlanName}
                  onChange={(e) => setFormData({ ...formData, activePlanName: e.target.value })}
                  aria-label="Formule souscrite"
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                >

                  <option value="Pack Scolarité Essentielle">Pack Scolarité Essentielle (280 TND)</option>
                  <option value="Pack Établissement Pro">Pack Établissement Pro (650 TND)</option>
                  <option value="Campus Groupe Scolaire & Université">Campus Groupe Scolaire (1400 TND)</option>
                </select>
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer l’Organisation'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
