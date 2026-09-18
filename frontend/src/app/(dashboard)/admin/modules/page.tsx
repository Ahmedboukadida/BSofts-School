'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Boxes,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { ModuleItem } from '@/types';

export default function SaaSAdminModulesPage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ModuleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'ACADEMIC' as ModuleItem['category'],
    description: '',
    isCore: false,
    plans: ['BASIC', 'STANDARD', 'ENTERPRISE'],
    isActive: true,
  });

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/saas-modules', {
        params: { includeDeleted: isTrashMode },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        const formatted: ModuleItem[] = rawData.map((m: any) => ({
          ...m,
          functionsCount: typeof m.functionsCount === 'number' ? m.functionsCount : (Array.isArray(m.functionsList) ? m.functionsList.length : (m._count?.permissions ?? 0)),
          functionsList: Array.isArray(m.functionsList)
            ? m.functionsList
            : Array.isArray(m.permissions)
            ? m.permissions.map((p: any) => p.name || p.code)
            : ['Consultation', 'Gestion des dossiers', 'Paramétrage'],
          plans: Array.isArray(m.plans)
            ? m.plans
            : ['BASIC', 'STANDARD', 'ENTERPRISE'],
          isCore: m.isCore ?? false,
          isActive: m.isActive ?? true,
        }));
        setModules(formatted);
      } else {
        setModules([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      category: 'ACADEMIC',
      description: '',
      isCore: false,
      plans: ['BASIC', 'STANDARD', 'ENTERPRISE'],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: ModuleItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category,
      description: item.description,
      isCore: item.isCore,
      plans: item.plans,
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const togglePlanInForm = (plan: string) => {
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.includes(plan)
        ? prev.plans.filter((p) => p !== plan)
        : [...prev.plans, plan],
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/saas-modules/${editingItem.id}`, formData).catch(() => {});
      } else {
        await api.post('/saas-modules', formData).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchModules();
    } catch {
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ModuleItem) => {
    await api.delete(`/saas-modules/${item.id}`).catch(() => {});
    setModules((prev) => prev.filter((m) => m.id !== item.id));
  };

  const handlePermanentDelete = async (item: ModuleItem) => {
    await api.delete(`/saas-modules/${item.id}?permanent=true`).catch(() => {});
    setModules((prev) => prev.filter((m) => m.id !== item.id));
  };

  const handleToggleStatus = async (item: ModuleItem) => {
    const updated = !item.isActive;
    await api.put(`/saas-modules/${item.id}`, { isActive: updated }).catch(() => {});
    setModules((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, isActive: updated } : m))
    );
  };

  const getCategoryBadge = (category: ModuleItem['category']) => {
    const map = {
      CORE: { label: 'Système & Sécurité', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
      ACADEMIC: { label: 'Pédagogie & Scolarité', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
      FINANCE: { label: 'Comptabilité & Caisses', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
      COMMUNITY: { label: 'Communication & Échanges', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
      INTELLIGENCE: { label: 'Analytique & Décision', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
    };
    const c = map[category] || { label: category, color: 'bg-surface text-text-secondary border-border' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>{c.label}</span>;
  };

  const filteredModules = modules.filter((m) => {
    if (categoryFilter && m.category !== categoryFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !m.isActive : m.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<ModuleItem>[] = [
    {
      key: 'name',
      header: 'Module SaaS & Code',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-brand font-semibold">
                {row.code}
              </span>
              {row.isCore && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-200 rounded">
                  Socle Indispensable
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie Métier',
      render: (row) => getCategoryBadge(row.category),
    },
    {
      key: 'functionsCount',
      header: 'Fonctions Incluses',
      render: (row) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {row.functionsCount} fonctions métier
          </span>
          <div className="flex flex-wrap gap-1 max-w-[240px]">
            {(row.functionsList || []).slice(0, 2).map((fn, idx) => (
              <span key={idx} className="px-1.5 py-0.5 bg-surface text-text-secondary text-[10px] rounded border border-border-subtle">
                {fn}
              </span>
            ))}
            {(row.functionsList || []).length > 2 && (
              <span className="px-1 py-0.5 text-[10px] font-semibold text-text-tertiary">
                +{(row.functionsList || []).length - 2}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'plans',
      header: 'Disponibilité Abonnements',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {(row.plans || []).map((p) => (
            <span
              key={p}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface border border-border text-text-secondary font-mono"
            >
              {p}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut Module',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Opérationnel' : 'Désactivé'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: ModuleItem): DetailSection[] => [
    {
      title: 'Présentation & Périmètre du Module',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Désignation & Catégorisation</span>
            <p className="text-base font-bold text-text-primary">{item.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-brand/10 text-brand rounded">
                Code : {item.code}
              </span>
              {getCategoryBadge(item.category)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Inclusion dans les Abonnements SaaS</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(item.plans || []).map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-brand/5 border border-brand/20 text-brand rounded-lg text-xs font-mono font-bold"
                >
                  {p}
                </span>
              ))}
            </div>
            {item.isCore && (
              <p className="text-xs text-amber-600 font-semibold mt-2">
                * Module Socle : activé automatiquement sur tous les tenants scolaires.
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Fonctionnalités Métier Opérationnelles',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(item.functionsList || []).map((fn, i) => (
              <div
                key={i}
                className="p-3 bg-surface rounded-xl border border-border flex items-center gap-2 text-xs font-semibold text-text-primary shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>{fn}</span>
              </div>
            ))}
          </div>
          {item.description && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-secondary leading-relaxed mt-2">
              <span className="font-bold text-text-primary block mb-1">Description d’architecture :</span>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: ModuleItem,
    onViewDetails: (item: ModuleItem) => void,
    actions: TableRowActions<ModuleItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.code}
            </span>
            <div className="mt-1.5">{getCategoryBadge(item.category)}</div>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-tertiary line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-text-secondary font-medium">Fonctions incluses</span>
            <span className="font-bold text-text-primary">{item.functionsCount}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(item.functionsList || []).slice(0, 3).map((f, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-background text-[10px] text-text-secondary rounded border border-border"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-surface text-text-secondary'
          }`}
        >
          {item.isActive ? 'Opérationnel' : 'Désactivé'}
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
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Modules Applicatifs SaaS</h1>
              <p className="text-sm text-text-secondary">
                Configuration des modules métier, dépendances logicielles et intégration aux plans d’abonnement des établissements.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Module
          </Button>
        </div>
      </div>

      <DataTable<ModuleItem>
        title="Catalogue des Modules de la Solution"
        data={filteredModules}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par nom de module, code ou fonctionnalité..."
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
        importExportEntityName="Modules_SaaS"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrer par catégorie"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les Catégories</option>
              <option value="CORE">Système & Sécurité</option>
              <option value="ACADEMIC">Pédagogie & Scolarité</option>
              <option value="FINANCE">Comptabilité & Caisses</option>
              <option value="COMMUNITY">Communication & Échanges</option>
              <option value="INTELLIGENCE">Analytique & Décision</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Opérationnels uniquement</option>
              <option value="inactive">Désactivés</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le module : ${editingItem.name}` : 'Enregistrer un Nouveau Module SaaS'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Boxes className="w-4 h-4 text-brand" />
                Identité du Module
              </h3>

              <Input
                label="Nom commercial du module *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Facturation & Caisse Établissement"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Système Unique *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="Ex: MOD_FINANCE_TND"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Catégorie Métier *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ModuleItem['category'] })}
                    aria-label="Catégorie métier"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="CORE">Système & Sécurité</option>
                    <option value="ACADEMIC">Pédagogie & Scolarité</option>
                    <option value="FINANCE">Comptabilité & Caisses</option>
                    <option value="COMMUNITY">Communication & Échanges</option>
                    <option value="INTELLIGENCE">Analytique & Décision</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description détaillée
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Expliquez la proposition de valeur et les services inclus..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCore}
                    onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span className="text-xs font-semibold text-text-primary">
                    Module Socle Indispensable (Actif par défaut sans surcoût)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-brand" />
                  <span>Attribution aux Forfaits SaaS</span>
                </div>
                <span className="text-xs text-brand font-semibold">
                  {formData.plans.length} forfait(s)
                </span>
              </h3>

              <div className="space-y-2">
                {[
                  { code: 'FREE', label: 'Pack Découverte / Essai', desc: 'Accès limité au noyau uniquement' },
                  { code: 'BASIC', label: 'Formule Essentielle', desc: 'Gestion administrative et scolarité de base' },
                  { code: 'STANDARD', label: 'Formule Avancée Pro', desc: 'Comprend la finance, caisse et communauté' },
                  { code: 'ENTERPRISE', label: 'Campus Multi-Sites', desc: 'Accès complet à tous les modules et IA' },
                ].map((tier) => {
                  const isChecked = formData.plans.includes(tier.code);
                  return (
                    <div
                      key={tier.code}
                      onClick={() => togglePlanInForm(tier.code)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-brand bg-brand/5 shadow-2xs'
                          : 'border-border bg-background hover:bg-surface-hover'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{tier.label}</span>
                          <span className="text-[10px] font-mono px-1 rounded bg-surface text-text-secondary">
                            {tier.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary mt-0.5">{tier.desc}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-brand border-brand text-white' : 'border-border bg-surface'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer le Module'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
