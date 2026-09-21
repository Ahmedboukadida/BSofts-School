'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Layers,
  Shield,
  CheckCircle2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { PermissionItem } from '@/types';

const SYSTEM_ROLES = [
  { code: 'ROOT', label: 'Root Dev' },
  { code: 'SUPER_ADMIN', label: 'Super Admin' },
  { code: 'ADMIN', label: 'Direction / Admin' },
  { code: 'TEACHER', label: 'Enseignant' },
  { code: 'ACCOUNTANT', label: 'Comptable' },
  { code: 'SURVEILLANT', label: 'Surveillant' },
  { code: 'STUDENT', label: 'Élève' },
  { code: 'PARENT', label: 'Parent' },
];

export default function SaaSAdminPermissionsPage() {
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PermissionItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    module: 'Élèves',
    action: 'READ' as PermissionItem['action'],
    description: '',
    roles: ['ROOT', 'SUPER_ADMIN'],
    isActive: true,
  });

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/permissions', {
        params: { includeDeleted: isTrashMode, limit: 100 },
      });

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: PermissionItem[] = list.map((p: any) => {
        const modName = typeof p.module === 'string'
          ? p.module
          : (p.module?.name || 'Général');
        const actionDerived = p.action || (p.code?.includes(':') ? p.code.split(':')[1]?.toUpperCase() : 'ADMIN');
        const rolesList: string[] = Array.isArray(p.roles)
          ? p.roles
          : Array.isArray(p.rolePermissions)
          ? p.rolePermissions.map((rp: any) => rp.role?.name || rp.role?.code || rp.roleId).filter(Boolean)
          : ['ROOT'];
        return {
          id: p.id || '',
          code: p.code || '',
          name: p.name || 'Permission',
          module: modName,
          action: (actionDerived as any) || 'READ',
          description: p.description || '',
          roles: rolesList,
          isActive: p.isActive !== false,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
          isDeleted: Boolean(p.isDeleted),
        };
      });
      setPermissions(mapped);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      name: '',
      module: 'Élèves',
      action: 'READ',
      description: '',
      roles: ['ROOT', 'SUPER_ADMIN'],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: PermissionItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name: item.name,
      module: item.module,
      action: item.action,
      description: item.description || '',
      roles: item.roles || ['ROOT'],
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const toggleRoleInForm = (roleCode: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleCode)
        ? prev.roles.filter((r) => r !== roleCode)
        : [...prev.roles, roleCode],
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/permissions/${editingItem.id}`, formData);
        showToast('Permission mise à jour avec succès', 'success');
      } else {
        await api.post('/permissions', formData);
        showToast('Permission créée avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchPermissions();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de l’enregistrement de la permission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: PermissionItem) => {
    try {
      await api.delete(`/permissions/${item.id}`);
      showToast('Permission supprimée avec succès', 'success');
      await fetchPermissions();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression de la permission');
    }
  };

  const handlePermanentDelete = async (item: PermissionItem) => {
    try {
      await api.delete(`/permissions/${item.id}?permanent=true`);
      showToast('Permission définitivement supprimée', 'success');
      await fetchPermissions();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression définitive');
    }
  };

  const handleRestore = async (item: PermissionItem) => {
    try {
      await api.post(`/permissions/${item.id}/restore`);
      showToast('Permission restaurée avec succès', 'success');
      await fetchPermissions();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration de la permission');
    }
  };

  const handleToggleStatus = async (item: PermissionItem) => {
    try {
      const updated = !item.isActive;
      await api.put(`/permissions/${item.id}`, { isActive: updated });
      showToast(updated ? 'Permission activée' : 'Permission désactivée', 'success');
      await fetchPermissions();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la mise à jour du statut');
    }
  };

  const getActionBadge = (action: PermissionItem['action']) => {
    const map = {
      READ: { label: 'LECTURE', color: 'bg-[#242F40]/10 text-[#242F40] dark:text-[#E5E5E5] border-[#242F40]/20' },
      CREATE: { label: 'CRÉATION', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
      UPDATE: { label: 'MODIFICATION', color: 'bg-[#CCA43B]/10 text-[#CCA43B] border-[#CCA43B]/30' },
      DELETE: { label: 'SUPPRESSION', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
      EXECUTE: { label: 'EXÉCUTION', color: 'bg-[#363636]/10 text-[#363636] dark:text-[#E5E5E5] border-[#363636]/20' },
      ADMIN: { label: 'ADMINISTRATION', color: 'bg-[#242F40] text-[#CCA43B] border-[#363636]' },
    };
    const c = (map as any)[action] || { label: action, color: 'bg-surface text-text-secondary border-border' };
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${c.color}`}>{c.label}</span>;
  };


  const filteredPermissions = permissions.filter((p) => {
    if (moduleFilter && p.module !== moduleFilter) return false;
    if (actionFilter && p.action !== actionFilter) return false;
    return true;
  });

  const columns: ColumnDef<PermissionItem>[] = [
    {
      key: 'code',
      header: 'Code Droit & Intitulé',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-[#CCA43B] block">{row.code}</span>
            <span className="text-xs font-semibold text-text-primary">{row.name}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module Métier',
      render: (row) => (
        <span className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-semibold text-text-secondary">
          {row.module}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Type d’Action',
      render: (row) => getActionBadge(row.action),
    },
    {
      key: 'roles',
      header: 'Rôles Autorisés',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {(row.roles || []).map((r) => (
            <span
              key={r}
              className="px-1.5 py-0.5 bg-surface text-text-secondary border border-border-subtle rounded text-[10px] font-mono font-medium"
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'État',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: PermissionItem): DetailSection[] => [
    {
      title: 'Informations Techniques du Droit',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Clé de contrôle API / Guard</span>
            <p className="text-base font-mono font-bold text-[#CCA43B]">{item.code}</p>
            <div className="mt-2 flex items-center gap-2">
              {getActionBadge(item.action)}
              <span className="text-xs text-text-secondary">Module : {item.module}</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Désignation Fonctionnelle</span>
            <p className="text-sm font-semibold text-text-primary">{item.name}</p>
            {item.description && (
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Matrice de Déploiement par Rôle Applicatif',
      content: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SYSTEM_ROLES.map((r) => {
            const hasRole = (item.roles || []).includes(r.code);
            return (
              <div
                key={r.code}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasRole
                    ? 'border-emerald-200 bg-emerald-500/5 text-emerald-700'
                    : 'border-border bg-surface text-text-tertiary opacity-60'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">{r.label}</span>
                  <span className="text-[10px] font-mono opacity-80">{r.code}</span>
                </div>
                {hasRole ? (
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                ) : (
                  <X className="w-4 h-4 text-text-tertiary" />
                )}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  // Hierarchy / Matrix Custom Renderer
  const renderMatrixView = () => {
    // Group permissions by module
    const grouped: Record<string, PermissionItem[]> = {};
    for (const p of filteredPermissions) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }

    return (
      <div className="space-y-6">
        {Object.entries(grouped).map(([modName, perms]) => (
          <Card key={modName} className="p-5 border border-border overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#CCA43B]" />
                <h3 className="font-bold text-base text-text-primary">{modName}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-[#242F40] text-[#CCA43B] rounded-full">
                  {perms.length} permissions
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface/50">
                    <th className="text-left py-2.5 px-3 font-semibold text-text-secondary w-1/3">
                      Permission & Action
                    </th>
                    {SYSTEM_ROLES.map((r) => (
                      <th key={r.code} className="text-center py-2.5 px-2 font-mono text-[11px] text-text-secondary">
                        {r.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {perms.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#CCA43B]">{p.code}</span>
                          {getActionBadge(p.action)}
                        </div>
                        <span className="text-[11px] text-text-secondary block mt-0.5">{p.name}</span>
                      </td>
                      {SYSTEM_ROLES.map((r) => {
                        const hasRole = (p.roles || []).includes(r.code);
                        return (
                          <td key={r.code} className="py-2.5 px-2 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                                hasRole
                                  ? 'bg-emerald-500/15 text-emerald-600'
                                  : 'bg-surface text-text-tertiary/40'
                              }`}
                            >
                              {hasRole ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-xs">•</span>}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#242F40] text-[#CCA43B]">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Permissions Système (RBAC)</h1>
              <p className="text-sm text-text-secondary">
                Définition granulaire des privilèges d’accès aux actions et ressources pour la sécurité applicative.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Droit
          </Button>
        </div>
      </div>

      <DataTable<PermissionItem>
        title="Registre des Permissions Granulaires"
        data={filteredPermissions}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par code de permission, module ou intitulé..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'matrix', 'split']}
        detailModalSize="6xl"
        renderDetailSections={renderDetailSections}
        renderCustomMatrixView={renderMatrixView}
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
        importExportEntityName="Permissions_RBAC"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              aria-label="Filtrer par module"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-[#CCA43B]"
            >
              <option value="">Tous les Modules</option>
              <option value="Élèves">Élèves</option>
              <option value="Pédagogie">Pédagogie</option>
              <option value="Finance">Finance</option>
              <option value="Vie Scolaire">Vie Scolaire</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filtrer par action"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-[#CCA43B]"
            >
              <option value="">Toutes les Actions</option>
              <option value="READ">LECTURE</option>
              <option value="CREATE">CRÉATION</option>
              <option value="UPDATE">MODIFICATION</option>
              <option value="DELETE">SUPPRESSION</option>
              <option value="ADMIN">ADMINISTRATION</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le droit : ${editingItem.code}` : 'Créer une Permission Granulaire'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Key className="w-4 h-4 text-[#CCA43B]" />
                Spécification du Droit
              </h3>

              <Input
                label="Code Technique Unique *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().trim() })}
                placeholder="Ex: students:create, finance:refund"
                required
              />

              <Input
                label="Libellé Compréhensible *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Inscrire un nouvel élève"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Module *
                  </label>
                  <select
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    aria-label="Module"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                    required
                  >
                    <option value="Élèves">Élèves</option>
                    <option value="Pédagogie">Pédagogie</option>
                    <option value="Finance">Finance</option>
                    <option value="Vie Scolaire">Vie Scolaire</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Action *
                  </label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value as PermissionItem['action'] })}
                    aria-label="Action"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B]"
                    required
                  >
                    <option value="READ">READ (Lecture)</option>
                    <option value="CREATE">CREATE (Création)</option>
                    <option value="UPDATE">UPDATE (Modification)</option>
                    <option value="DELETE">DELETE (Suppression)</option>
                    <option value="EXECUTE">EXECUTE (Exécution)</option>
                    <option value="ADMIN">ADMIN (Contrôle total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description technique / Cas de sécurité
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez les endpoints API et opérations protégés..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-[#CCA43B] resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#CCA43B]" />
                  <span>Attribution Initiale par Rôle</span>
                </div>
                <span className="text-xs text-[#CCA43B] font-semibold">
                  {formData.roles.length} rôle(s)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                {SYSTEM_ROLES.map((r) => {
                  const isChecked = formData.roles.includes(r.code);
                  return (
                    <div
                      key={r.code}
                      onClick={() => toggleRoleInForm(r.code)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#CCA43B] bg-[#CCA43B]/10 shadow-2xs'
                          : 'border-border bg-background hover:bg-surface-hover'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-text-primary block">{r.label}</span>
                        <span className="text-[10px] font-mono text-text-tertiary">{r.code}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-[#CCA43B] border-[#CCA43B] text-[#242F40]' : 'border-border bg-surface'
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer la Permission'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
