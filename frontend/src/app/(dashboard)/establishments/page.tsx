'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  School,
  MapPin,
  Phone,
  Users,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import api from '@/lib/api';
import type { EstablishmentItem } from '@/types';

export default function EstablishmentsPage() {
  const { user } = useAuthStore();
  const { currentTenantId, tenants, setTenants } = useEstablishmentStore();

  const [establishments, setEstablishments] = useState<EstablishmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstablishmentItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'HIGH_SCHOOL' as EstablishmentItem['category'],
    address: '',
    phone: '',
    email: '',
    directorName: '',
    capacity: 500,
    tenantId: '',
  });

  useEffect(() => {
    if (user?.isRoot && tenants.length === 0) {
      api.get('/tenants?limit=100').then((res) => {
        const raw = res.data?.data || res.data || [];
        const list = (Array.isArray(raw) ? raw : []).map((t: any) => ({
          id: t.id,
          name: t.user ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.id : t.id,
        }));
        setTenants(list);
      }).catch(() => {});
    }
  }, [user?.isRoot, tenants.length, setTenants]);

  const fetchEstablishments = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeTenant = (currentTenantId && currentTenantId !== 'ALL' && currentTenantId !== 'all')
        ? currentTenantId
        : undefined;

      const res = await api.get('/establishments', {
        params: {
          includeDeleted: isTrashMode,
          limit: 100,
          ...(activeTenant ? { tenantId: activeTenant } : {}),
        },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: EstablishmentItem[] = list.map((item: any) => ({
        ...item,
        tenantName: item.tenant?.user
          ? `${item.tenant.user.firstName || ''} ${item.tenant.user.lastName || ''}`.trim()
          : item.tenantName || item.tenantId || 'Tenant Principal',
      }));
      setEstablishments(mapped);
    } catch {
      setEstablishments([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, currentTenantId]);

  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);

  // Handle Create / Edit Open
  const handleOpenCreate = () => {
    setEditingItem(null);
    const defaultTenant = (currentTenantId && currentTenantId !== 'ALL' && currentTenantId !== 'all')
      ? currentTenantId
      : (tenants[0]?.id || user?.tenantId || '');
    setFormData({
      name: '',
      code: '',
      category: 'HIGH_SCHOOL',
      address: '',
      phone: '',
      email: '',
      directorName: '',
      capacity: 500,
      tenantId: defaultTenant,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: EstablishmentItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      category: item.category,
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      directorName: item.directorName || '',
      capacity: item.capacity || 500,
      tenantId: item.tenantId || (currentTenantId && currentTenantId !== 'ALL' ? currentTenantId : tenants[0]?.id || ''),
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tenantId = formData.tenantId || (currentTenantId && currentTenantId !== 'ALL' ? currentTenantId : (tenants[0]?.id || user?.tenantId));
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        category: formData.category,
        tenantId,
        capacity: Number(formData.capacity) || 500,
      };

      if (formData.address?.trim()) payload.address = formData.address.trim();
      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.email?.trim()) payload.email = formData.email.trim();
      if (formData.directorName?.trim()) payload.directorName = formData.directorName.trim();

      if (editingItem) {
        await api.put(`/establishments/${editingItem.id}`, payload);
      } else {
        await api.post('/establishments', payload);
      }
      setIsFormModalOpen(false);
      fetchEstablishments();
    } catch (err: any) {
      console.error('Failed to save establishment:', err?.response?.data || err?.message);
      alert(err?.response?.data?.message || 'Erreur lors de la sauvegarde de l’établissement');
    }
  };

  // Soft Delete handler
  const handleDelete = async (item: EstablishmentItem) => {
    await api.delete(`/establishments/${item.id}`).catch(() => {});
    setEstablishments((prev) => prev.filter((e) => e.id !== item.id));
  };

  // Hard Delete handler (Root only)
  const handlePermanentDelete = async (item: EstablishmentItem) => {
    await api.delete(`/establishments/${item.id}?permanent=true`).catch(() => {});
    setEstablishments((prev) => prev.filter((e) => e.id !== item.id));
  };

  // Toggle Status
  const handleToggleStatus = async (item: EstablishmentItem) => {
    const updated = !item.isActive;
    await api.put(`/establishments/${item.id}`, { isActive: updated }).catch(() => {});
    setEstablishments((prev) =>
      prev.map((e) => (e.id === item.id ? { ...e, isActive: updated } : e))
    );
  };

  // Category labels helper
  const getCategoryBadge = (cat: EstablishmentItem['category']) => {
    const map = {
      DAYCARE: { label: 'Crèche / Jardin d’enfants', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
      PRIMARY: { label: 'École Primaire', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      MIDDLE_SCHOOL: { label: 'Collège', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
      HIGH_SCHOOL: { label: 'Lycée', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
      UNIVERSITY: { label: 'Enseignement Supérieur', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
    };
    const c = map[cat] || { label: cat, color: 'bg-surface-hover text-text-secondary border-border' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>{c.label}</span>;
  };

  // Filtered dataset
  const filteredEstablishments = establishments.filter((item) => {
    if (statusFilter && (statusFilter === 'active' ? !item.isActive : item.isActive)) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    return true;
  });

  // Table Columns Definition
  const columns: ColumnDef<EstablishmentItem>[] = [
    {
      key: 'name',
      header: 'Établissement & Campus',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <School className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <span className="text-[11px] font-mono text-text-secondary">{row.code}</span>
          </div>
        </div>
      ),
    },
    ...(user?.isRoot
      ? [
          {
            key: 'tenant',
            header: 'Tenant / Client SaaS',
            render: (row: EstablishmentItem) => (
              <div className="flex flex-col text-xs">
                <span className="font-bold text-[#242F40] dark:text-[#E5E5E5] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#CCA43B] shrink-0" />
                  {row.tenantName || 'Tenant Principal'}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {row.tenantId ? `ID: ${row.tenantId.slice(0, 8)}...` : '—'}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      key: 'category',
      header: 'Catégorie',
      render: (row) => getCategoryBadge(row.category),
    },
    {
      key: 'directorName',
      header: 'Direction & Contact',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <p className="font-medium text-text-primary">{row.directorName || 'Non assigné'}</p>
          <p className="text-[11px] text-text-secondary flex items-center gap-1">
            <Phone className="w-3 h-3 text-text-tertiary" /> {row.phone || '—'}
          </p>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Effectifs & Salles',
      render: (row) => (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-text-primary">{row.studentsCount || 0}</span>
            <span className="text-text-tertiary">/ {row.capacity || '∞'} élèves</span>
          </div>
          <p className="text-[11px] text-text-secondary">
            {row.teachersCount || 0} enseignants • {row.roomsCount || 0} salles
          </p>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-text-tertiary/10 text-text-tertiary border border-border'
          }`}
        >
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
  ];

  // Detailed Modal Section Breakdown
  const getDetailSections = (row: EstablishmentItem): DetailSection<EstablishmentItem>[] => [
    {
      title: 'Informations Générales de l’Établissement',
      fields: [
        { label: 'Nom Officiel', value: row.name },
        { label: 'Code Identification', value: <span className="font-mono">{row.code}</span> },
        { label: 'Catégorie d’Enseignement', value: getCategoryBadge(row.category) },
        { label: 'Organisme / Tenant', value: row.tenantName || row.tenantId },
        { label: 'Directeur d’Établissement', value: row.directorName || 'Non renseigné' },
      ],
    },
    {
      title: 'Localisation & Coordonnées',
      fields: [
        { label: 'Adresse Physique', value: row.address || 'Non spécifiée' },
        { label: 'Numéro Téléphonique', value: row.phone || 'Non spécifié' },
        { label: 'Adresse Email Institutionnelle', value: row.email || 'Non spécifiée' },
      ],
    },
    {
      title: 'Capacités d’Accueil & Statistiques',
      fields: [
        { label: 'Capacité Maximale', value: `${row.capacity || 0} élèves` },
        { label: 'Élèves Actuellement Inscrits', value: `${row.studentsCount || 0} élèves` },
        { label: 'Corps Enseignant', value: `${row.teachersCount || 0} professeurs` },
        { label: 'Salles & Laboratoires', value: `${row.roomsCount || 0} locaux pédagogiques` },
      ],
    },
  ];

  // Grid Card View Renderer
  const renderGridItem = (row: EstablishmentItem, actions: TableRowActions<EstablishmentItem>) => (
    <Card className="p-5 border border-border/80 hover:border-primary/40 transition-all shadow-xs space-y-4 flex flex-col justify-between h-full group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <School className="w-6 h-6" />
          </div>
          {getCategoryBadge(row.category)}
        </div>

        <h3 className="text-base font-black text-text-primary group-hover:text-primary transition-colors">
          {row.name}
        </h3>
        <p className="text-xs font-mono text-text-secondary mt-0.5">{row.code}</p>

        <div className="mt-4 space-y-2 text-xs text-text-secondary border-t border-border pt-3">
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span className="truncate">{row.address || 'Adresse non renseignée'}</span>
          </p>
          <p className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span>{row.phone || '—'}</span>
          </p>
          <p className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
            <span>{row.studentsCount || 0} élèves • {row.roomsCount || 0} salles</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            row.isActive ? 'text-emerald-600 bg-emerald-500/10' : 'text-text-tertiary bg-surface-hover'
          }`}
        >
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>

        <div className="flex items-center gap-1">
          <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => actions.viewDetails(row)}>
            Détails
          </Button>
          {actions.edit && (
            <Button variant="secondary" className="h-8 px-2.5 text-xs" onClick={() => actions.edit?.(row)}>
              Modifier
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <DataTable<EstablishmentItem>
        data={filteredEstablishments}
        columns={columns}
        title="Gestion des Établissements & Campus"
        subtitle="Supervisez les sites scolaires, leurs capacités d’accueil, leurs infrastructures et leurs directions"
        isLoading={isLoading}
        allowedModes={['list', 'grid', 'split']}
        initialMode="list"
        renderGridItem={renderGridItem}
        renderSplitDetails={(row) =>
          row ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  <School className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-text-primary">{row.name}</h3>
                  <p className="text-xs text-text-secondary">{row.code} • {row.tenantName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><span className="text-text-tertiary">Direction :</span> <p className="font-bold text-text-primary">{row.directorName || '—'}</p></div>
                <div><span className="text-text-tertiary">Téléphone :</span> <p className="font-bold text-text-primary">{row.phone || '—'}</p></div>
                <div><span className="text-text-tertiary">Capacité :</span> <p className="font-bold text-text-primary">{row.capacity} élèves</p></div>
                <div><span className="text-text-tertiary">Salles :</span> <p className="font-bold text-text-primary">{row.roomsCount} locaux</p></div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-text-secondary">Sélectionnez un établissement pour voir ses détails</div>
          )
        }
        statusFilter={{
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { label: 'Établissements Actifs', value: 'active' },
            { label: 'Établissements Inactifs', value: 'inactive' },
          ],
        }}
        categoryFilter={{
          value: categoryFilter,
          onChange: setCategoryFilter,
          options: [
            { label: 'Lycée', value: 'HIGH_SCHOOL' },
            { label: 'Collège', value: 'MIDDLE_SCHOOL' },
            { label: 'École Primaire', value: 'PRIMARY' },
            { label: 'Enseignement Supérieur', value: 'UNIVERSITY' },
            { label: 'Crèche', value: 'DAYCARE' },
          ],
        }}
        exportFilename="etablissements_bsofts"
        importTemplateHeaders={['name', 'code', 'category', 'address', 'phone', 'email', 'directorName', 'capacity']}
        importTemplateSample={['Lycée Pilote Bourguiba', 'LPB-01', 'HIGH_SCHOOL', 'Avenue Bourguiba Tunis', '+216 71 000 000', 'admin@lpb.tn', 'M. Trabelsi', '1200']}
        onImportSubmit={async (rows) => {
          await new Promise((r) => setTimeout(r, 800));
          return { successCount: rows.length };
        }}
        primaryAction={{
          label: 'Ajouter un Établissement',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
        onViewDetails={(row) => getDetailSections(row)}
        getDetailSections={getDetailSections}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onPermanentDelete={user?.isRoot ? handlePermanentDelete : undefined}
        onToggleStatus={handleToggleStatus}
        corbeilleToggle={{
          isTrash: isTrashMode,
          onToggle: () => setIsTrashMode(!isTrashMode),
          count: 0,
        }}
        modalSize="6xl"
      />

      {/* Form Modal (Create / Edit) with size="6xl" */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier l'Établissement — ${editingItem.name}` : 'Créer un Nouvel Établissement Scolaire'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {user?.isRoot && (
              <div className="space-y-1 sm:col-span-3">
                <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#CCA43B]" />
                  Tenant Propriétaire / Client SaaS *
                </label>
                <select
                  value={formData.tenantId}
                  onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                  className="w-full h-11 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">-- Sélectionner un Tenant --</option>
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      🏢 {t.name} ({t.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-text-primary">Nom Officiel du Campus / École *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lycée Pilote Bourguiba"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Code Unique d&apos;Établissement *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: LPB-TUNIS"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Catégorie d&apos;Établissement *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as EstablishmentItem['category'] })}
                className="w-full h-11 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary"
              >
                <option value="DAYCARE">Crèche / Jardin d’enfants</option>
                <option value="PRIMARY">École Primaire</option>
                <option value="MIDDLE_SCHOOL">Collège</option>
                <option value="HIGH_SCHOOL">Lycée Secondaire</option>
                <option value="UNIVERSITY">Institut / Université</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Directeur(trice) / Responsable</label>
              <Input
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                placeholder="Ex: Dr. Moncef Trabelsi"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Capacité Maximale d&apos;Accueil</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                placeholder="1000"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-text-primary">Adresse Physique</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Avenue Habib Bourguiba, Tunis"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Téléphone Standard</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+216 71 000 000"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-text-primary">Email Institutionnel</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@ecole.tn"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold">
              {editingItem ? 'Enregistrer les Modifications' : 'Créer l’Établissement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
