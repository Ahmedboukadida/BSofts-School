'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Plus,
  Key,
  Users,
  Lock,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { RoleItem } from '@/types';

const ALL_SYSTEM_PERMISSIONS = [
  { code: 'students:read', name: 'Consulter les élèves', module: 'Élèves' },
  { code: 'students:create', name: 'Inscrire un élève', module: 'Élèves' },
  { code: 'students:update', name: 'Modifier fiche élève', module: 'Élèves' },
  { code: 'students:delete', name: 'Supprimer un élève', module: 'Élèves' },
  { code: 'grades:read', name: 'Consulter notes et moyennes', module: 'Pédagogie' },
  { code: 'grades:create', name: 'Saisir les notes', module: 'Pédagogie' },
  { code: 'grades:publish', name: 'Publier les bulletins officiels', module: 'Pédagogie' },
  { code: 'finance:read', name: 'Consulter les paiements', module: 'Finance' },
  { code: 'finance:charge', name: 'Encaisser les frais en TND', module: 'Finance' },
  { code: 'finance:caisse_open', name: 'Gestion de caisse journalière', module: 'Finance' },
  { code: 'attendance:log', name: 'Pointer les présences & absences', module: 'Vie Scolaire' },
  { code: 'schedule:manage', name: 'Organiser les emplois du temps', module: 'Vie Scolaire' },
  { code: 'portal:access', name: 'Accéder aux portails dédiés', module: 'Portails' },
];

export default function SaaSAdminRolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isSystem: false,
    selectedPermissions: ['students:read', 'grades:read'],
    isActive: true,
  });

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/roles', {
        params: { includeDeleted: isTrashMode },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: RoleItem[] = list.map((r: any) => {
        const perms: string[] = Array.isArray(r.permissionsList)
          ? r.permissionsList
          : Array.isArray(r.permissions)
          ? r.permissions.map((p: any) => p.permission?.code || p.code || p).filter(Boolean)
          : [];
        return {
          id: r.id || '',
          name: r.name || 'Sans nom',
          code: r.code || '',
          description: r.description || '',
          isSystem: Boolean(r.isSystem),
          usersCount: Number(r.usersCount ?? r._count?.userRoles ?? 0),
          permissionsCount: Number(r.permissionsCount ?? perms.length),
          permissionsList: perms,
          isActive: r.isActive !== false,
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: r.updatedAt || new Date().toISOString(),
          isDeleted: Boolean(r.isDeleted),
        };
      });
      setRoles(mapped);
    } catch {
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isSystem: false,
      selectedPermissions: ['students:read', 'grades:read'],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: RoleItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      isSystem: item.isSystem,
      selectedPermissions: item.permissionsList,
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const togglePermissionInForm = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPermissions: prev.selectedPermissions.includes(code)
        ? prev.selectedPermissions.filter((c) => c !== code)
        : [...prev.selectedPermissions, code],
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().replace(/\s+/g, '_'),
      };
      if (editingItem) {
        await api.put(`/roles/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/roles', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchRoles();
    } catch {
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: RoleItem) => {
    if (item.isSystem) return;
    await api.delete(`/roles/${item.id}`).catch(() => {});
    setRoles((prev) => prev.filter((r) => r.id !== item.id));
  };

  const handlePermanentDelete = async (item: RoleItem) => {
    if (item.isSystem) return;
    await api.delete(`/roles/${item.id}?permanent=true`).catch(() => {});
    setRoles((prev) => prev.filter((r) => r.id !== item.id));
  };

  const handleToggleStatus = async (item: RoleItem) => {
    if (item.isSystem) return;
    const updated = !item.isActive;
    await api.put(`/roles/${item.id}`, { isActive: updated }).catch(() => {});
    setRoles((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, isActive: updated } : r))
    );
  };

  const filteredRoles = roles.filter((r) => {
    if (typeFilter && (typeFilter === 'system' ? !r.isSystem : r.isSystem)) return false;
    if (statusFilter && (statusFilter === 'active' ? !r.isActive : r.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<RoleItem>[] = [
    {
      key: 'name',
      header: 'Profil de Rôle & Clé Système',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-brand font-semibold">
                {row.code}
              </span>
              {row.isSystem && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-200 rounded flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Système
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'usersCount',
      header: 'Membres Assignés',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
          <Users className="w-4 h-4 text-brand" />
          <span>{Number(row.usersCount || 0)} utilisateurs</span>
        </div>
      ),
    },
    {
      key: 'permissionsCount',
      header: 'Droits & Permissions',
      render: (row) => {
        const perms = row.permissionsList || [];
        return (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-purple-600" />
              {row.permissionsCount ?? perms.length} permissions accordées
            </span>
            <div className="flex flex-wrap gap-1 max-w-[240px]">
              {perms.slice(0, 2).map((p) => (
                <span key={p} className="px-1.5 py-0.5 bg-surface text-text-secondary text-[10px] font-mono rounded border border-border-subtle">
                  {p}
                </span>
              ))}
              {perms.length > 2 && (
                <span className="px-1 py-0.5 text-[10px] font-semibold text-text-tertiary">
                  +{perms.length - 2}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Statut Rôle',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-surface text-text-secondary border border-border'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Actif' : 'Désactivé'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: RoleItem): DetailSection[] => [
    {
      title: 'Caractéristiques du Profil de Sécurité',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Identifiant & Scope</span>
            <p className="text-base font-bold text-text-primary">{item.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-brand/10 text-brand rounded">
                Code : {item.code}
              </span>
              {item.isSystem ? (
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-200 rounded-md">
                  Rôle Système Intouchable
                </span>
              ) : (
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-200 rounded-md">
                  Rôle Personnalisé Campus
                </span>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Membres Actifs</span>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand" /> {item.usersCount} utilisateurs détiennent ce rôle
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {item.permissionsCount} permissions actives sur l’ensemble des modules applicatifs.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Détail des Droits Associés à ce Rôle',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {(item.permissionsList || []).map((p) => (
              <div
                key={p}
                className="p-2.5 bg-surface rounded-xl border border-border flex items-center gap-2 shadow-2xs"
              >
                <div className="p-1 rounded bg-brand/10 text-brand">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-xs font-mono font-semibold text-text-primary">{p}</span>
              </div>
            ))}
          </div>
          {item.description && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-secondary leading-relaxed mt-2">
              <span className="font-bold text-text-primary block mb-1">Description du rôle :</span>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
  ];

  // Matrix View: Interactive Role vs Permission Grid
  const renderMatrixView = () => {
    return (
      <Card className="p-5 border border-border overflow-hidden">
        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand" />
            <h3 className="font-bold text-base text-text-primary">Matrice de Déploiement : Rôles vs Droits</h3>
          </div>
          <span className="text-xs font-semibold text-text-secondary">
            {roles.length} Rôles configurés • {ALL_SYSTEM_PERMISSIONS.length} Permissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left py-2.5 px-3 font-semibold text-text-secondary w-1/4">
                  Permission / Fonctionnalité
                </th>
                {roles.map((r) => (
                  <th key={r.code} className="text-center py-2.5 px-2 font-mono text-[11px] text-text-secondary">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => (
                <tr key={perm.code} className="hover:bg-surface-hover transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-brand block">{perm.code}</span>
                    <span className="text-[11px] text-text-secondary">{perm.name}</span>
                  </td>
                  {roles.map((r) => {
                    const hasPerm = (r.permissionsList || []).includes(perm.code);
                    return (
                      <td key={r.code} className="py-2.5 px-2 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-md ${
                            hasPerm
                              ? 'bg-emerald-500/15 text-emerald-600 font-bold'
                              : 'bg-surface text-text-tertiary/40'
                          }`}
                        >
                          {hasPerm ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-xs">•</span>}
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Rôles & Habilitations (RBAC)</h1>
              <p className="text-sm text-text-secondary">
                Gestion des profils d’utilisateurs, matrice d’attribution des droits et gouvernance de sécurité.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Profil Rôle
          </Button>
        </div>
      </div>

      <DataTable<RoleItem>
        title="Registre des Profils de Rôles"
        data={filteredRoles}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par profil de rôle, clé système ou code..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'matrix', 'split']}
        detailModalSize="6xl"
        renderDetailSections={renderDetailSections}
        renderCustomMatrixView={renderMatrixView}
        actions={{
          onEdit: handleOpenEdit,
          onDelete: handleDelete,
          onPermanentDelete: handlePermanentDelete,
          onToggleStatus: handleToggleStatus,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Roles_RBAC"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filtrer par type de rôle"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les types de rôles</option>
              <option value="system">Rôles Système uniquement</option>
              <option value="custom">Rôles Personnalisés</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs uniquement</option>
              <option value="inactive">Désactivés</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le rôle : ${editingItem.name}` : 'Créer un Profil de Rôle'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Shield className="w-4 h-4 text-brand" />
                Définition du Profil
              </h3>

              <Input
                label="Nom du Rôle *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Responsable des Admissions"
                required
              />

              <Input
                label="Code Système Unique *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                placeholder="Ex: ADMISSIONS_OFFICER"
                disabled={editingItem?.isSystem}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description / Responsabilités associées
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Précisez les prérogatives accordées aux titulaires de ce rôle..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand" />
                  <span>Droits & Permissions Inclus</span>
                </div>
                <span className="text-xs text-brand font-semibold">
                  {formData.selectedPermissions.length} droit(s)
                </span>
              </h3>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {ALL_SYSTEM_PERMISSIONS.map((perm) => {
                  const isChecked = formData.selectedPermissions.includes(perm.code);
                  return (
                    <div
                      key={perm.code}
                      onClick={() => togglePermissionInForm(perm.code)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-brand bg-brand/5 shadow-2xs'
                          : 'border-border bg-background hover:bg-surface-hover'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-text-primary">{perm.code}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-surface text-text-secondary">
                            {perm.module}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-tertiary mt-0.5">{perm.name}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-brand border-brand text-white' : 'border-border bg-surface'
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer le Rôle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
