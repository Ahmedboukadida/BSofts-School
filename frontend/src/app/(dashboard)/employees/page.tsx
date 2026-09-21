'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { EmployeeItem } from '@/types';

export default function EmployeesPage() {
  const { showToast, showApiErrorToast } = useToast();
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EmployeeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    department: 'Administration',
    position: 'Secrétaire Général(e)',
    contractType: 'CDI' as EmployeeItem['contractType'],
    salaryTnd: 1200,
    email: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          limit: 100,
          includeDeleted: isTrashMode,
        },
      });
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: EmployeeItem[] = list.map((e: any) => ({
        id: e.id || '',
        matricule: e.matricule || '',
        firstName: e.firstName || e.user?.firstName || '',
        lastName: e.lastName || e.user?.lastName || '',
        department: e.department || 'Administration',
        position: e.position || e.jobTitle || 'Personnel',
        contractType: (e.contractType as any) || 'CDI',
        salaryTnd: Number(e.salaryTnd ?? e.salary ?? 1200),
        email: e.email || e.user?.email || '',
        phone: e.phone || '',
        hireDate: e.hireDate || e.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        isActive: e.isActive !== false,
        establishmentName: e.establishmentName || e.establishment?.name || 'Établissement Principal',
        createdAt: e.createdAt || new Date().toISOString(),
        updatedAt: e.updatedAt || new Date().toISOString(),
        isDeleted: e.isActive === false,
      }));
      setEmployees(mapped);
    } catch (err: any) {
      setEmployees([]);
      showApiErrorToast(err, 'Impossible de charger la liste des employés');
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, showApiErrorToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      matricule: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      department: 'Administration',
      position: 'Secrétaire Général(e)',
      contractType: 'CDI',
      salaryTnd: 1200,
      email: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: EmployeeItem) => {
    setEditingItem(item);
    setFormData({
      matricule: item.matricule,
      firstName: item.firstName,
      lastName: item.lastName,
      department: item.department,
      position: item.position,
      contractType: item.contractType,
      salaryTnd: item.salaryTnd || 1200,
      email: item.email,
      phone: item.phone,
      hireDate: item.hireDate?.split('T')[0] || '',
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        salaryTnd: Number(formData.salaryTnd),
      };
      if (editingItem) {
        await api.put(`/employees/${editingItem.id}`, payload);
        showToast('Collaborateur mis à jour avec succès', 'success');
      } else {
        await api.post('/employees', payload);
        showToast('Collaborateur ajouté avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchEmployees();
    } catch (err: any) {
      showApiErrorToast(err, "Erreur lors de l'enregistrement du collaborateur");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: EmployeeItem) => {
    try {
      await api.delete(`/employees/${item.id}`);
      showToast('Collaborateur placé dans la corbeille', 'success');
      await fetchEmployees();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la désactivation');
    }
  };

  const handlePermanentDelete = async (item: EmployeeItem) => {
    if (!window.confirm(`Suppression DÉFINITIVE de ${item.firstName} ${item.lastName} ? Cette action est irréversible.`)) return;
    try {
      await api.delete(`/employees/${item.id}?permanent=true`);
      showToast('Collaborateur supprimé définitivement', 'success');
      await fetchEmployees();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression définitive');
    }
  };

  const handleRestore = async (item: EmployeeItem) => {
    try {
      await api.post(`/employees/${item.id}/restore`);
      showToast('Collaborateur restauré avec succès', 'success');
      await fetchEmployees();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration');
    }
  };

  const handleToggleStatus = async (item: EmployeeItem) => {
    const updated = !item.isActive;
    try {
      await api.put(`/employees/${item.id}`, { isActive: updated });
      showToast(`Statut mis à jour (${updated ? 'Actif' : 'Inactif'})`, 'success');
      await fetchEmployees();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la modification du statut');
    }
  };

  const filteredEmployees = employees.filter((e) => {
    if (!isTrashMode && e.isActive === false) return false;
    if (isTrashMode && e.isActive !== false) return false;
    if (departmentFilter && e.department !== departmentFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !e.isActive : e.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<EmployeeItem>[] = [
    {
      key: 'name',
      header: 'Collaborateur & Matricule',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">
              {row.firstName} {row.lastName}
            </span>
            <span className="text-[11px] font-mono text-brand font-semibold">
              {row.matricule}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Fonction & Département',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-text-primary block">{row.position}</span>
          <span className="text-[11px] text-text-secondary flex items-center gap-1">
            <Building className="w-3 h-3 text-text-tertiary" /> {row.department}
          </span>
        </div>
      ),
    },
    {
      key: 'contractType',
      header: 'Contrat & Salaire',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface border border-border text-text-secondary font-mono">
            {row.contractType}
          </span>
          {row.salaryTnd && (
            <span className="text-xs font-bold text-emerald-600 block">
              {row.salaryTnd.toLocaleString('fr-TN')} TND
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Coordonnées',
      render: (row) => (
        <div className="space-y-0.5 text-xs text-text-secondary">
          <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-text-tertiary" /> {row.email}</p>
          <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-text-tertiary" /> {row.phone}</p>
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
          {row.isActive ? 'En Poste' : 'Inactif'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: EmployeeItem): DetailSection[] => [
    {
      title: 'Fiche d’État-Civil & Affectation Scolaire',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
            <span className="text-text-tertiary block">Identité Complète</span>
            <p className="text-base font-bold text-text-primary">
              {item.firstName} {item.lastName}
            </p>
            <p className="text-text-secondary">Matricule interne : <span className="font-mono font-bold text-brand">{item.matricule}</span></p>
            <p className="text-text-secondary">Établissement : <span className="font-semibold text-text-primary">{item.establishmentName || 'Siège'}</span></p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
            <span className="text-text-tertiary block">Contrat de Travail</span>
            <p className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-brand" /> {item.position}
            </p>
            <p className="text-text-secondary">Département : <span className="font-semibold text-text-primary">{item.department}</span></p>
            <p className="text-text-secondary">Rémunération : <span className="font-bold text-emerald-600">{item.salaryTnd ? `${item.salaryTnd} TND / mois` : 'Non renseignée'}</span></p>
          </div>
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: EmployeeItem,
    onViewDetails: (item: EmployeeItem) => void,
    actions: TableRowActions<EmployeeItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-surface border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.matricule}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.firstName} {item.lastName}
        </h3>

        <p className="text-xs text-text-secondary mb-3 font-semibold">
          {item.position}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4 space-y-1 text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Département :</span>
            <span className="font-semibold text-text-primary">{item.department}</span>
          </div>
          <div className="flex justify-between">
            <span>Contrat :</span>
            <span className="font-mono font-bold text-text-primary">{item.contractType}</span>
          </div>
          {item.salaryTnd && (
            <div className="flex justify-between">
              <span>Salaire TND :</span>
              <span className="font-bold text-emerald-600">{item.salaryTnd.toLocaleString('fr-TN')} TND</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.isActive ? 'En Poste' : 'Inactif'}
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
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Personnel & Collaborateurs</h1>
              <p className="text-sm text-text-secondary">
                Gestion des ressources humaines administratives, comptabilité, surveillance générale et agents d’encadrement.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Collaborateur
          </Button>
        </div>
      </div>

      <DataTable<EmployeeItem>
        title="Registre du Personnel Administratif"
        data={filteredEmployees}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par nom, prénom, matricule ou poste..."
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
          onRestore: handleRestore,
        }}
        showTrashToggle={true}
        isTrashActive={isTrashMode}
        onToggleTrash={(active) => setIsTrashMode(active)}
        importExportEntityName="Personnel_RH"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              aria-label="Filtrer par département"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les Départements</option>
              <option value="Direction & Administration">Direction & Administration</option>
              <option value="Comptabilité & Caisses">Comptabilité & Caisses</option>
              <option value="Vie Scolaire & Discipline">Vie Scolaire & Discipline</option>
              <option value="Service Médical & Santé">Service Médical & Santé</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="active">En poste uniquement</option>
              <option value="inactive">Inactifs / Départs</option>
            </select>
          </div>
        }
      />

      {/* Form Modal (Extra Large Size "6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier collaborateur : ${editingItem.firstName} ${editingItem.lastName}` : 'Enregistrer un Collaborateur'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <UserCheck className="w-4 h-4 text-brand" />
                Identité & Contact
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Prénom *"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Mohamed"
                  required
                />
                <Input
                  label="Nom de famille *"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Ben Amor"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Matricule Interne *"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  placeholder="EMP-2026-001"
                  required
                />
                <Input
                  label="Date d’embauche *"
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email Professionnel *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="m.benamor@ecole.tn"
                  required
                />
                <Input
                  label="Téléphone *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+216 98 123 456"
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <Briefcase className="w-4 h-4 text-brand" />
                Affectation & Contrat
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Département *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    aria-label="Département"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="Direction & Administration">Direction & Administration</option>
                    <option value="Comptabilité & Caisses">Comptabilité & Caisses</option>
                    <option value="Vie Scolaire & Discipline">Vie Scolaire & Discipline</option>
                    <option value="Service Médical & Santé">Service Médical & Santé</option>
                    <option value="Maintenance & Logistique">Maintenance & Logistique</option>
                  </select>
                </div>

                <Input
                  label="Intitulé du Poste *"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Ex: Surveillant Général"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Type de Contrat *
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value as EmployeeItem['contractType'] })}
                    aria-label="Type de Contrat"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand"
                    required
                  >
                    <option value="CDI">CDI (Contrat Durée Indéterminée)</option>
                    <option value="CDD">CDD (Contrat Durée Déterminée)</option>
                    <option value="STAGE">Stage Professionnel</option>
                    <option value="VACATAIRE">Vacataire / Prestataire</option>
                  </select>
                </div>

                <Input
                  label="Salaire Mensuel Brut (TND)"
                  type="number"
                  min={0}
                  step="10"
                  value={formData.salaryTnd}
                  onChange={(e) => setFormData({ ...formData, salaryTnd: Number(e.target.value) })}
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
              {editingItem ? 'Enregistrer les Modifications' : 'Enregistrer le Collaborateur'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
