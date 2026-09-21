'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DoorOpen,
  Plus,
  Users,
  Building,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import type { RoomItem } from '@/types';

export default function RoomsPage() {
  const { showToast, showApiErrorToast } = useToast();
  const { user } = useAuthStore();
  const { currentEstablishmentId, establishments, fetchEstablishments } = useEstablishmentStore();

  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoomItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    establishmentId: '',
    name: '',
    code: '',
    type: 'CLASSROOM' as RoomItem['type'],
    capacity: 30,
    floor: '1',
    building: 'Bâtiment Principal',
    description: '',
    equipment: ['Projecteur', 'Tableau Blanc'],
  });
  const [newEquipmentTag, setNewEquipmentTag] = useState('');

  useEffect(() => {
    if (user?.isRoot && establishments.length === 0) {
      fetchEstablishments();
    }
  }, [user?.isRoot, establishments.length, fetchEstablishments]);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeEstId =
        currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all'
          ? currentEstablishmentId
          : undefined;

      const res = await api.get('/rooms', {
        params: {
          limit: 100,
          includeDeleted: isTrashMode,
          ...(activeEstId ? { establishmentId: activeEstId } : {}),
        },
      });

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped = list.map((r: any) => ({
        ...r,
        establishmentId: r.establishmentId || r.establishment?.id || '',
        establishmentName: r.establishment?.name || r.establishmentName || 'Principal',
        isDeleted: r.isActive === false,
      }));
      setRooms(mapped);
    } catch (err: any) {
      setRooms([]);
      showApiErrorToast(err, 'Impossible de charger les salles et espaces');
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, currentEstablishmentId, showApiErrorToast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      establishmentId: (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
        ? currentEstablishmentId
        : (establishments[0]?.id || ''),
      name: '',
      code: '',
      type: 'CLASSROOM',
      capacity: 30,
      floor: '1',
      building: 'Bâtiment Principal',
      description: '',
      equipment: ['Projecteur', 'Tableau Blanc'],
    });
    setNewEquipmentTag('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      establishmentId: item.establishmentId || item.establishment?.id || '',
      name: item.name,
      code: item.code,
      type: item.type,
      capacity: item.capacity,
      floor: String(item.floor || '1'),
      building: item.building || '',
      description: item.description || '',
      equipment: item.equipment || ['Projecteur', 'Tableau Blanc'],
    });
    setNewEquipmentTag('');
    setIsFormModalOpen(true);
  };

  const handleAddEquipmentTag = () => {
    if (!newEquipmentTag.trim()) return;
    if (!formData.equipment.includes(newEquipmentTag.trim())) {
      setFormData({ ...formData, equipment: [...formData.equipment, newEquipmentTag.trim()] });
    }
    setNewEquipmentTag('');
  };

  const handleRemoveEquipmentTag = (tag: string) => {
    setFormData({ ...formData, equipment: formData.equipment.filter((t) => t !== tag) });
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity) || 30,
        floor: Number(formData.floor) || 0,
        establishmentId: formData.establishmentId || (currentEstablishmentId && currentEstablishmentId !== 'ALL' ? currentEstablishmentId : (establishments[0]?.id || user?.establishmentId)),
      };
      if (editingItem) {
        await api.put(`/rooms/${editingItem.id}`, payload);
        showToast('Salle mise à jour avec succès', 'success');
      } else {
        await api.post('/rooms', payload);
        showToast('Salle ajoutée avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchRooms();
    } catch (err: any) {
      showApiErrorToast(err, "Erreur lors de l'enregistrement de la salle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: RoomItem) => {
    try {
      await api.delete(`/rooms/${item.id}`);
      showToast('Salle placée dans la corbeille', 'success');
      await fetchRooms();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la désactivation');
    }
  };

  const handlePermanentDelete = async (item: RoomItem) => {
    if (!window.confirm(`Suppression DÉFINITIVE de la salle ${item.name} (${item.code}) ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/rooms/${item.id}?permanent=true`);
      showToast('Salle supprimée définitivement', 'success');
      await fetchRooms();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression définitive');
    }
  };

  const handleRestore = async (item: RoomItem) => {
    try {
      await api.post(`/rooms/${item.id}/restore`);
      showToast('Salle restaurée avec succès', 'success');
      await fetchRooms();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration');
    }
  };

  const handleToggleStatus = async (item: RoomItem) => {
    const updated = !item.isActive;
    try {
      await api.put(`/rooms/${item.id}`, { isActive: updated });
      showToast(`Statut mis à jour (${updated ? 'Disponible' : 'Indisponible'})`, 'success');
      await fetchRooms();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la modification du statut');
    }
  };

  const getTypeBadge = (type: RoomItem['type']) => {
    const map = {
      CLASSROOM: { label: 'Salle de Classe', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
      LABORATORY: { label: 'Laboratoire Sciences', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
      COMPUTER_LAB: { label: 'Lab Informatique', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
      LIBRARY: { label: 'Bibliothèque / CDI', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
      AUDITORIUM: { label: 'Amphithéâtre', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
      GYM: { label: 'Gymnase / Sport', color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
      ART_ROOM: { label: 'Atelier d’Art', color: 'bg-rose-500/10 text-rose-600 border-rose-200' },
      MUSIC_ROOM: { label: 'Salle de Musique', color: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200' },
      OTHER: { label: 'Autre Espace', color: 'bg-surface-hover text-text-secondary border-border' },
    };
    const c = map[type] || { label: type, color: 'bg-surface-hover text-text-secondary border-border' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>{c.label}</span>;
  };

  const filteredRooms = rooms.filter((r) => {
    if (!isTrashMode && r.isActive === false) return false;
    if (isTrashMode && r.isActive !== false) return false;
    if (statusFilter && (statusFilter === 'active' ? !r.isActive : r.isActive)) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    return true;
  });

  const columns: ColumnDef<RoomItem>[] = [
    {
      key: 'name',
      header: 'Salle / Espace',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-text-secondary font-semibold">
                {row.code}
              </span>
              <span className="text-xs text-text-tertiary">
                {row.building ? `${row.building} • Ét. ${row.floor ?? '0'}` : `Étage ${row.floor ?? '0'}`}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type d’usage',
      render: (row) => getTypeBadge(row.type),
    },
    {
      key: 'capacity',
      header: 'Capacité d’accueil',
      render: (row) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
            <Users className="w-3.5 h-3.5 text-brand" />
            <span>{row.capacity} places</span>
          </div>
          <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                row.capacity > 100
                  ? 'bg-purple-500'
                  : row.capacity > 40
                  ? 'bg-indigo-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(15, (row.capacity / 180) * 100))}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'equipment',
      header: 'Équipements clés',
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[260px]">
          {(row.equipment || []).slice(0, 3).map((eq, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-surface text-text-secondary border border-border-subtle rounded-md text-[11px] font-medium"
            >
              {eq}
            </span>
          ))}
          {(row.equipment || []).length > 3 && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-text-tertiary">
              +{row.equipment!.length - 3}
            </span>
          )}
        </div>
      ),
    },
    ...(user?.isRoot
      ? [
          {
            key: 'establishmentName' as keyof RoomItem,
            header: 'Établissement',
            render: (row: RoomItem) => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                {row.establishmentName || 'Principal'}
              </span>
            ),
          },
        ]
      : []),
    {
      key: 'isActive',
      header: 'Disponibilité',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-rose-500/10 text-rose-600 border border-rose-200'
          }`}
        >
          {row.isActive ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {row.isActive ? 'Opérationnelle' : 'En Maintenance'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: RoomItem): DetailSection[] => [
    {
      title: 'Caractéristiques Générales',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Désignation Officielle</span>
            <p className="text-base font-bold text-text-primary">{item.name}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-brand/10 text-brand rounded">
                Code: {item.code}
              </span>
              {getTypeBadge(item.type)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs text-text-tertiary block mb-1">Localisation & Capacité</span>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Building className="w-4 h-4 text-brand" /> {item.building || 'Non spécifié'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Étage: <span className="font-semibold text-text-primary">{item.floor ?? 0}</span>
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>Capacité maximale : {item.capacity} places assises</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Équipements & Infrastructure Matérielle',
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {(item.equipment || ['Projecteur', 'Tableau Blanc']).map((eq, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-brand/5 border border-brand/20 text-brand rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
              >
                <Monitor className="w-3.5 h-3.5" />
                {eq}
              </span>
            ))}
          </div>
          {item.description && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text-secondary leading-relaxed">
              <span className="font-bold text-text-primary block mb-1">Notes d’affectation pédagogique :</span>
              {item.description}
            </div>
          )}
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: RoomItem,
    onViewDetails: (item: RoomItem) => void,
    actions: TableRowActions<RoomItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.code}
            </span>
            <div className="mt-1.5">{getTypeBadge(item.type)}</div>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-tertiary flex items-center gap-1 mb-3">
          <Building className="w-3.5 h-3.5" />
          {item.building ? `${item.building} • Étage ${item.floor ?? 0}` : `Étage ${item.floor ?? 0}`}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Users className="w-4 h-4 text-brand" />
            <span>Capacité</span>
          </div>
          <span className="text-sm font-bold text-text-primary">{item.capacity} places</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {(item.equipment || []).slice(0, 3).map((eq, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-surface-hover text-text-secondary text-[10px] font-medium rounded border border-border-subtle"
            >
              {eq}
            </span>
          ))}
          {(item.equipment || []).length > 3 && (
            <span className="px-1 py-0.5 text-[10px] text-text-tertiary font-bold">
              +{item.equipment!.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.isActive ? 'Disponible' : 'Indisponible'}
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
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Salles et Espaces Pédagogiques</h1>
              <p className="text-sm text-text-secondary">
                Gestion du parc immobilier, amphithéâtres, laboratoires, capacités et équipements d’enseignement.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Ajouter une Salle
          </Button>
        </div>
      </div>

      <DataTable<RoomItem>
        title="Inventaire des Salles et Laboratoires"
        data={filteredRooms}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par salle, code, bâtiment ou équipement..."
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
        importExportEntityName="Salles"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filtrer par type de salle"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les types de salles</option>
              <option value="CLASSROOM">Salles de classe ordinaires</option>
              <option value="LABORATORY">Laboratoires de Sciences (PC / SVT)</option>
              <option value="COMPUTER_LAB">Laboratoires Informatiques</option>
              <option value="AUDITORIUM">Amphithéâtres</option>
              <option value="LIBRARY">Médiathèque et CDI</option>
              <option value="ART_ROOM">Ateliers d’Art</option>
              <option value="GYM">Installations Sportives</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par disponibilité"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les disponibilités</option>
              <option value="active">Opérationnelles uniquement</option>
              <option value="inactive">En maintenance / Inactives</option>
            </select>
          </div>
        }
      />

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier l’espace : ${editingItem.name}` : 'Créer une Nouvelle Salle / Espace'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <DoorOpen className="w-4 h-4 text-brand" />
                Identification et Type
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

              <Input
                label="Nom de la salle / Espace *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Salle Ibn Khaldoun, Labo Chimie 2"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Salle *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="Ex: A-101, LAB-01"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Type d’espace *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RoomItem['type'] })}
                    aria-label="Type d’espace"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="CLASSROOM">Salle de Classe</option>
                    <option value="LABORATORY">Laboratoire de Sciences</option>
                    <option value="COMPUTER_LAB">Laboratoire Informatique</option>
                    <option value="AUDITORIUM">Amphithéâtre</option>
                    <option value="LIBRARY">Bibliothèque / CDI</option>
                    <option value="ART_ROOM">Atelier d’Art</option>
                    <option value="GYM">Installations Sportives</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Description / Remarques d’utilisation
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Précisez les consignes d'accès ou l'usage spécifique..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Building className="w-4 h-4 text-brand" />
                Localisation et Capacité
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Bâtiment / Pavillon"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="Ex: Bâtiment A - Sciences"
                />
                <Input
                  label="Étage"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="Ex: 0, 1, 2..."
                />
              </div>

              <Input
                label="Capacité d’accueil (places assises) *"
                type="number"
                min={1}
                max={500}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Équipements installés
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newEquipmentTag}
                    onChange={(e) => setNewEquipmentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddEquipmentTag();
                      }
                    }}
                    placeholder="Ex: Vidéoprojecteur 4K, Climatiseur..."
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-text-primary outline-none focus:border-brand"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddEquipmentTag}>
                    Ajouter
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-background rounded-lg border border-border-subtle">
                  {formData.equipment.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-xs font-medium flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipmentTag(tag)}
                        className="hover:text-destructive text-brand/70 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer la Salle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
