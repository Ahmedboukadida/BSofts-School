'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Layers,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { FunctionItem } from '@/types';

const AVAILABLE_PERMISSIONS_CATALOG = [
  { id: 'p1', code: 'students:read', name: 'Consulter les élèves', module: 'Élèves' },
  { id: 'p2', code: 'students:create', name: 'Inscrire un nouvel élève', module: 'Élèves' },
  { id: 'p3', code: 'students:update', name: 'Modifier fiche élève', module: 'Élèves' },
  { id: 'p4', code: 'students:delete', name: 'Supprimer / Archiver élève', module: 'Élèves' },
  { id: 'p5', code: 'grades:read', name: 'Consulter notes et moyennes', module: 'Pédagogie' },
  { id: 'p6', code: 'grades:create', name: 'Saisir des notes d’examen', module: 'Pédagogie' },
  { id: 'p7', code: 'grades:publish', name: 'Publier les bulletins officiels', module: 'Pédagogie' },
  { id: 'p8', code: 'finance:read', name: 'Consulter état des paiements', module: 'Finance' },
  { id: 'p9', code: 'finance:charge', name: 'Encaisser frais et émettre reçus', module: 'Finance' },
  { id: 'p10', code: 'finance:caisse_open', name: 'Ouvrir / Clôturer la caisse TND', module: 'Finance' },
  { id: 'p11', code: 'attendance:log', name: 'Pointer les présences & absences', module: 'Vie Scolaire' },
  { id: 'p12', code: 'schedule:manage', name: 'Gérer les emplois du temps', module: 'Vie Scolaire' },
  { id: 'p13', code: 'portal:access', name: 'Accéder aux espaces dédiés', module: 'Portails' },
];

export default function SaaSFunctionsPage() {
  const [functions, setFunctions] = useState<FunctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FunctionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    moduleId: 'mod-academic',
    moduleName: 'Gestion Pédagogique & Scolarité',
    description: '',
    selectedPermissionIds: [] as string[],
    isActive: true,
  });

  const fetchFunctions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/saas-functions', {
        params: { includeDeleted: isTrashMode },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: FunctionItem[] = list.map((f: any) => ({
        id: f.id || '',
        name: f.name || 'Sans nom',
        code: f.code || '',
        moduleId: f.moduleId || f.module?.id || '',
        moduleName: f.moduleName || f.module?.name || 'Général',
        description: f.description || '',
        permissions: Array.isArray(f.permissions) ? f.permissions : [],
        rolesCount: Number(f.rolesCount || 0),
        isActive: f.isActive !== false,
        createdAt: f.createdAt || new Date().toISOString(),
        updatedAt: f.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(f.isDeleted),
      }));
      setFunctions(mapped);
    } catch {
      setFunctions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      moduleId: 'mod-academic',
      moduleName: 'Gestion Pédagogique & Scolarité',
      description: '',
      selectedPermissionIds: ['p1', 'p5'],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: FunctionItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      moduleId: item.moduleId,
      moduleName: item.moduleName,
      description: item.description,
      selectedPermissionIds: (item.permissions || []).map((p) => p.id),
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const togglePermissionSelection = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissionIds: prev.selectedPermissionIds.includes(permId)
        ? prev.selectedPermissionIds.filter((id) => id !== permId)
        : [...prev.selectedPermissionIds, permId],
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedPerms = AVAILABLE_PERMISSIONS_CATALOG.filter((p) =>
        formData.selectedPermissionIds.includes(p.id)
      ).map((p) => ({ id: p.id, code: p.code, name: p.name }));

      const payload = {
        ...formData,
        permissions: selectedPerms,
      };

      if (editingItem) {
        await api.put(`/saas-functions/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/saas-functions', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchFunctions();
    } catch {
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: FunctionItem) => {
    await api.delete(`/saas-functions/${item.id}`).catch(() => {});
    setFunctions((prev) => prev.filter((f) => f.id !== item.id));
  };

  const handlePermanentDelete = async (item: FunctionItem) => {
    await api.delete(`/saas-functions/${item.id}?permanent=true`).catch(() => {});
    setFunctions((prev) => prev.filter((f) => f.id !== item.id));
  };

  const handleToggleStatus = async (item: FunctionItem) => {
    const updated = !item.isActive;
    await api.put(`/saas-functions/${item.id}`, { isActive: updated }).catch(() => {});
    setFunctions((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, isActive: updated } : f))
    );
  };

  // Filtered functions
  const filteredFunctions = functions.filter((fn) => {
    if (statusFilter && (statusFilter === 'active' ? !fn.isActive : fn.isActive)) return false;
    if (moduleFilter && fn.moduleId !== moduleFilter) return false;
    return true;
  });

  const columns: ColumnDef<FunctionItem>[] = [
    {
      key: 'name',
      header: 'Fonction Métier & Clé Système',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-brand font-semibold">
              {row.code}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'moduleName',
      header: 'Module Parent',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>{row.moduleName}</span>
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions Associées',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1 max-w-[280px]">
            {(row.permissions || []).slice(0, 2).map((p) => (
              <span
                key={p.id}
                className="px-2 py-0.5 bg-surface text-text-secondary border border-border-subtle rounded-md text-[11px] font-mono"
              >
                {p.code}
              </span>
            ))}
            {(row.permissions || []).length > 2 && (
              <span className="px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary">
                +{(row.permissions || []).length - 2} autres
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut Fonction',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Active' : 'Désactivée'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: FunctionItem): DetailSection[] => [
    {
      title: 'Cartographie de la Fonction Métier',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Rattachement SaaS</span>
            <p className="text-base font-bold text-text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> {item.moduleName}
            </p>
            <p className="text-xs text-text-secondary mt-1 font-mono font-semibold">
              Code : {item.code}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Étendue & Usage</span>
            <p className="text-sm font-semibold text-text-primary">
              Utilisé par {item.rolesCount || 3} rôles applicatifs
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Contrôle granulaire d’accès aux écrans et points d’API correspondants.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Matrice des Permissions Granulaires Rattachées',
      content: (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {(item.permissions || []).map((p) => (
              <div
                key={p.id}
                className="p-3 bg-surface rounded-xl border border-border flex items-start gap-2.5 shadow-2xs"
              >
                <div className="p-1.5 rounded-lg bg-brand/10 text-brand mt-0.5">
                  <Key className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-text-primary block">{p.code}</span>
                  <span className="text-[11px] text-text-secondary">{p.name}</span>
                </div>
              </div>
            ))}
          </div>
          {item.description && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-secondary leading-relaxed mt-2">
              <span className="font-bold text-text-primary block mb-1">Description fonctionnelle :</span>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: FunctionItem,
    onViewDetails: (item: FunctionItem) => void,
    actions: TableRowActions<FunctionItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
            {item.code}
          </span>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-secondary flex items-center gap-1 mb-3">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          {item.moduleName}
        </p>

        <p className="text-xs text-text-tertiary line-clamp-2 mb-4 leading-relaxed">
          {item.description}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4">
          <span className="text-[11px] font-semibold text-text-secondary block mb-1.5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-brand" /> {(item.permissions || []).length} Permissions incluses
          </span>
          <div className="flex flex-wrap gap-1">
            {(item.permissions || []).slice(0, 3).map((p) => (
              <span
                key={p.id}
                className="px-1.5 py-0.5 bg-background text-[10px] font-mono text-text-secondary rounded border border-border"
              >
                {p.code}
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
          {item.isActive ? 'Active' : 'Désactivée'}
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
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Fonctions Métier SaaS</h1>
              <p className="text-sm text-text-secondary">
                Configuration des fonctionnalités métier de la plateforme et orchestration des relations avec les permissions fines.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouvelle Fonction
          </Button>
        </div>
      </div>

      <DataTable<FunctionItem>
        title="Répertoire des Fonctions Système & Droits"
        data={filteredFunctions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher une fonction métier, un code ou une permission..."
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
        importExportEntityName="Fonctions_SaaS"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              aria-label="Filtrer par module"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les Modules SaaS</option>
              <option value="mod-students">Gestion Scolaire</option>
              <option value="mod-academic">Pédagogie & Évaluations</option>
              <option value="mod-finance">Comptabilité & Finance</option>
              <option value="mod-attendance">Vie Scolaire</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actives uniquement</option>
              <option value="inactive">Désactivées</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier la fonction : ${editingItem.name}` : 'Créer une Fonction Métier SaaS'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Sparkles className="w-4 h-4 text-brand" />
                Définition & Rattachement
              </h3>

              <Input
                label="Nom de la fonction métier *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Gestion des Bulletins & Délibérations"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Système Unique *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="Ex: FN_GRADEBOOK_AUDIT"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Module Parent *
                  </label>
                  <select
                    value={formData.moduleId}
                    onChange={(e) => {
                      const modNames: Record<string, string> = {
                        'mod-students': 'Gestion Scolaire',
                        'mod-academic': 'Pédagogie & Évaluations',
                        'mod-finance': 'Comptabilité & Finance',
                        'mod-attendance': 'Vie Scolaire',
                      };
                      setFormData({
                        ...formData,
                        moduleId: e.target.value,
                        moduleName: modNames[e.target.value] || 'Général',
                      });
                    }}
                    aria-label="Module parent"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="mod-students">Gestion Scolaire</option>
                    <option value="mod-academic">Pédagogie & Évaluations</option>
                    <option value="mod-finance">Comptabilité & Finance</option>
                    <option value="mod-attendance">Vie Scolaire</option>
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
                  placeholder="Décrivez les cas d'usage et les écrans débloqués par cette fonction..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand" />
                  <span>Permissions Rattachées</span>
                </div>
                <span className="text-xs text-brand font-semibold">
                  {formData.selectedPermissionIds.length} sélectionnée(s)
                </span>
              </h3>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {AVAILABLE_PERMISSIONS_CATALOG.map((p) => {
                  const isSelected = formData.selectedPermissionIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => togglePermissionSelection(p.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-brand bg-brand/5 shadow-2xs'
                          : 'border-border bg-background hover:bg-surface-hover'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-text-primary">{p.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface text-text-secondary">
                            {p.module}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary mt-0.5">{p.name}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-brand border-brand text-white' : 'border-border bg-surface'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer la Fonction'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
