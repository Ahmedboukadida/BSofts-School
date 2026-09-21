'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Phone,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  Building2,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  Briefcase,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { ParentItem } from '@/types';

export default function ParentsPage() {
  const { showToast, showApiErrorToast } = useToast();
  const [parents, setParents] = useState<ParentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [professionFilter, setProfessionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ParentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cin: '',
    firstName: '',
    lastName: '',
    profession: 'Cadre Supérieur / Fonction Publique',
    phone: '+216 98 123 456',
    phoneSecondary: '+216 22 123 456',
    email: '',
    address: '15 Avenue Habib Bourguiba',
    city: 'Tunis',
    emergencyContact: '+216 98 999 888 (Oncle)',
    portalAccess: true,
    isActive: true,
  });

  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/parents', {
        params: { limit: 100, includeDeleted: isTrashMode },
      });

      const rawData = res.data?.data || res.data || [];
      if (Array.isArray(rawData)) {
        const formatted: ParentItem[] = rawData.map((item: any) => ({
          ...item,
          cin: item.cin || 'N/A',
          profession: item.profession || item.occupation || 'N/A',
          phone: item.phone || item.emergencyPhone || 'N/A',
          email: item.email || item.user?.email || 'N/A',
          address: item.address || 'Tunis, Tunisie',
          city: item.city || 'Tunis',
          emergencyContact: item.emergencyContact || item.emergencyPhone || item.phone || 'N/A',
          portalAccess: item.portalAccess ?? !!item.userId,
          isActive: item.isActive ?? true,
          establishmentName: item.establishment?.name || 'Lycée Pilote Bourguiba',
          linkedStudents: Array.isArray(item.linkedStudents)
            ? item.linkedStudents
            : Array.isArray(item.students)
            ? item.students.map((s: any) => ({
                id: s.student?.id || s.id || `stu-${Math.random()}`,
                name: `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.trim() || 'Élève',
                matricule: s.student?.registrationNumber || 'N/A',
                className: s.student?.classAssignments?.[0]?.class?.name || s.relation || s.relationship || 'Enfant',
              }))
            : [],
        }));
        setParents(formatted);
      } else {
        setParents([]);
      }
    } catch (err: any) {
      setParents([]);
      showApiErrorToast(err, 'Impossible de charger la liste des parents');
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      cin: `08${Math.floor(100000 + Math.random() * 900000)}`,
      firstName: '',
      lastName: '',
      profession: 'Cadre Supérieur',
      phone: '+216 ',
      phoneSecondary: '+216 ',
      email: '',
      address: '',
      city: 'Tunis',
      emergencyContact: '+216 ',
      portalAccess: true,
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: ParentItem) => {
    setEditingItem(item);
    setFormData({
      cin: item.cin,
      firstName: item.firstName,
      lastName: item.lastName,
      profession: item.profession,
      phone: item.phone,
      phoneSecondary: item.phoneSecondary || '',
      email: item.email,
      address: item.address,
      city: item.city,
      emergencyContact: item.emergencyContact,
      portalAccess: item.portalAccess,
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/parents/${editingItem.id}`, formData);
        showToast('Parent mis à jour avec succès', 'success');
      } else {
        await api.post('/parents', formData);
        showToast('Parent créé avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchParents();
    } catch (err: any) {
      showApiErrorToast(err, "Erreur lors de l'enregistrement du parent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: ParentItem, permanent = false) => {
    const isRoot = true; // Root context
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE du parent ${row.firstName} ${row.lastName} (CIN: ${row.cin}) ? Cette action est irréversible en base de données.`
      : `Placer le dossier parent ${row.firstName} ${row.lastName} dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/parents/${row.id}`, {
        params: { permanent: permanent && isRoot },
      });
      showToast(permanent ? 'Parent supprimé définitivement' : 'Parent placé dans la corbeille', 'success');
      await fetchParents();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression');
    }
  };

  const handleRestore = async (row: ParentItem) => {
    if (!window.confirm(`Restaurer le dossier de ${row.firstName} ${row.lastName} ?`)) return;
    try {
      await api.post(`/parents/${row.id}/restore`);
      showToast('Parent restauré avec succès', 'success');
      await fetchParents();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration');
    }
  };

  const filteredParents = parents.filter((p) => {
    if (!isTrashMode && p.isActive === false) return false;
    if (isTrashMode && p.isActive !== false) return false;
    if (professionFilter && !p.profession?.toLowerCase().includes(professionFilter.toLowerCase())) return false;
    if (statusFilter && (statusFilter === 'active' ? !p.isActive : p.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<ParentItem>[] = [
    {
      key: 'cin',
      header: 'CIN Parent',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-brand">
          {row.cin}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Parent / Tuteur & Profession',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm shadow-sm">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-text-primary">
              {row.firstName} {row.lastName}
            </div>
            <div className="text-xs text-text-tertiary flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3 h-3 text-brand" />
              <span>{row.profession}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'contacts',
      header: 'Téléphone & Email',
      render: (row) => (
        <div>
          <div className="text-xs font-mono font-semibold text-text-primary flex items-center gap-1">
            <Phone className="w-3 h-3 text-brand" />
            {row.phone}
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5 truncate max-w-[200px]">
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'linkedStudents',
      header: 'Enfants Scolarisés',
      render: (row) => (
        <div className="space-y-1">
          {(row.linkedStudents || []).length > 0 ? (
            (row.linkedStudents || []).map((stu) => (
              <div
                key={stu.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs bg-brand/10 border border-brand/20 text-brand font-medium"
              >
                <GraduationCap className="w-3 h-3" />
                <span>{stu.name}</span>
                <span className="text-[10px] text-text-tertiary">({stu.className})</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-text-tertiary italic">Aucun élève rattaché</span>
          )}
        </div>
      ),
    },
    {
      key: 'portalAccess',
      header: 'Accès Portail',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            row.portalAccess
              ? 'bg-blue-500/10 text-blue-600'
              : 'bg-surface-hover text-text-tertiary'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          {row.portalAccess ? 'Portail Activé' : 'Non Invité'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Statut',
      sortable: true,
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            row.isActive
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-surface-hover text-text-tertiary'
          }`}
        >
          {row.isActive ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          ) : (
            <AlertCircle className="w-3 h-3 text-text-tertiary" />
          )}
          {row.isActive ? 'Dossier Actif' : 'Désactivé'}
        </span>
      ),
    },
  ];

  const detailSections: DetailSection<ParentItem>[] = [
    {
      title: 'Identité Civile & Profession',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">CIN & Identité</span>
            <span className="font-mono font-bold text-brand">{item.cin}</span>
            <span className="text-xs text-text-secondary block mt-1 font-medium">
              {item.firstName} {item.lastName}
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Profession & Fonction</span>
            <span className="font-semibold text-text-primary">{item.profession}</span>
            <span className="text-xs text-text-secondary block mt-1">Ville: {item.city}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Adresse Domicile</span>
            <span className="font-semibold text-text-primary truncate block">{item.address}</span>
            <span className="text-xs text-text-secondary block mt-1">{item.city}, Tunisie</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Communications & Contact d’Urgence',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Téléphone Principal</span>
            <span className="font-mono font-semibold text-text-primary">{item.phone}</span>
            {item.phoneSecondary && (
              <span className="text-xs text-text-secondary block mt-0.5 font-mono">
                Sec: {item.phoneSecondary}
              </span>
            )}
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Adresse Email</span>
            <span className="font-semibold text-text-primary truncate block">{item.email}</span>
            <span className="text-xs text-emerald-600 block mt-0.5">Vérifiée pour notifications</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Contact d’Urgence Alternatif</span>
            <span className="font-mono font-semibold text-rose-600">{item.emergencyContact}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Enfants Rattachés dans l’Établissement',
      render: (item) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(item.linkedStudents || []).length > 0 ? (
            (item.linkedStudents || []).map((stu) => (
              <div key={stu.id} className="p-3 bg-surface rounded-xl border border-border flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand/10 text-brand">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-text-primary text-xs">{stu.name}</div>
                  <div className="text-[11px] text-brand font-medium">{stu.className}</div>
                  <div className="text-[10px] font-mono text-text-tertiary">{stu.matricule}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-text-tertiary italic p-3">Aucun élève rattaché dans cet établissement</p>
          )}
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
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Gestion des Parents & Tuteurs</h1>
              <p className="text-sm text-text-secondary">
                Fiches des tuteurs légaux, rattachement des élèves scolarisés, coordonnées d&apos;urgence et accès au portail parental.
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
            Ajouter un Parent
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total Parents Enregistrés</span>
              <span className="text-2xl font-bold text-text-primary">{parents.filter((p) => !p.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Élèves Rattachés</span>
              <span className="text-2xl font-bold text-emerald-600">
                {parents
                  .filter((p) => !p.isDeleted)
                  .reduce((acc, curr) => acc + (curr.linkedStudents?.length || 0), 0)}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Comptes Portail Activés</span>
              <span className="text-2xl font-bold text-blue-600">
                {parents.filter((p) => !p.isDeleted && p.portalAccess).length}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Taux d&apos;Adhésion Portail</span>
              <span className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (parents.filter((p) => !p.isDeleted && p.portalAccess).length /
                    (parents.filter((p) => !p.isDeleted).length || 1)) *
                    100
                )}
                %
              </span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<ParentItem>
        title={isTrashMode ? 'Corbeille des Parents' : 'Répertoire des Parents & Tuteurs'}
        data={filteredParents}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par nom, CIN, email ou profession..."
        searchKeys={['cin', 'firstName', 'lastName', 'profession', 'email', 'phone', 'city']}
        exportFilename={`parents-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Répertoire des Parents - BSofts School"
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
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm shadow-sm">
                    {item.firstName[0]}
                    {item.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">
                      {item.firstName} {item.lastName}
                    </h3>
                    <span className="font-mono text-[11px] text-brand">CIN: {item.cin}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    item.portalAccess
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      : 'bg-surface text-text-tertiary border-border'
                  }`}
                >
                  {item.portalAccess ? 'Portail Actif' : 'Sans Accès'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Profession:</span>
                  <span className="font-medium text-text-primary truncate max-w-[140px]">{item.profession}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Téléphone:</span>
                  <span className="font-mono font-medium text-text-primary">{item.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Enfants rattachés:</span>
                  <span className="font-bold text-brand">{(item.linkedStudents || []).length}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="truncate max-w-[150px]">{item.city}</span>
              <span className="font-mono text-[10px]">{item.emergencyContact.split(' ')[0]}</span>
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
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les professions</option>
              <option value="Médecin">Médecine & Santé</option>
              <option value="Ingénieur">Ingénierie & IT</option>
              <option value="Professeur">Enseignement</option>
              <option value="Avocat">Droit & Justice</option>
              <option value="Chef d’Entreprise">Chefs d&apos;Entreprise</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        }
      />

      {/* Modern Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Fiche Parent : ${editingItem.firstName} ${editingItem.lastName}` : 'Nouveau Parent / Tuteur Légal'}
        size="6xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Identité & Profession */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand" />
              1. Identité Civile & Situation Professionnelle
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Numéro de CIN"
                value={formData.cin}
                onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                required
                placeholder="Ex: 08456123"
              />
              <Input
                label="Prénom du Parent"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Nom de Famille"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
              <Input
                label="Profession & Activité"
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 2: Coordonnées & Urgence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand" />
              2. Coordonnées Téléphoniques & Contact d&apos;Urgence
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Téléphone Principal (GSM)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Téléphone Secondaire (Optionnel)"
                value={formData.phoneSecondary}
                onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
              />
              <Input
                label="Email Personnel (Accès Portail)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <Input
                label="Contact Alternatif d'Urgence"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+216 98 123 456 (Oncle/Médecin)"
                required
              />
              <Input
                label="Adresse de Résidence"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <Input
                label="Gouvernorat / Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Section 3: Accès Portail & Droits */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              3. Paramètres du Portail Parental & Droits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Activer le Compte Portail</div>
                  <div className="text-xs text-text-tertiary">
                    Permet au parent de consulter les notes, absences et règlements en temps réel.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.portalAccess}
                  onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                  className="w-5 h-5 rounded text-brand focus:ring-brand"
                />
              </div>
              <div className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text-primary text-sm">Statut Dossier Actif</div>
                  <div className="text-xs text-text-tertiary">
                    Le parent est actif dans le système et reçoit les alertes SMS et notifications.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded text-brand focus:ring-brand"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Données protégées conformément aux normes de confidentialité de BSofts School.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingItem ? 'Enregistrer les Modifications' : 'Créer le Dossier Parent'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
