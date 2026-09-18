'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  CreditCard,
  Users,
  RotateCcw,
  Trash2,
  School,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import api from '@/lib/api';
import type { StudentItem } from '@/types';

export default function StudentsPage() {
  const { user } = useAuthStore();
  const { currentEstablishmentId, establishments } = useEstablishmentStore();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    gender: 'MALE' as 'MALE' | 'FEMALE',
    dateOfBirth: '2008-05-14',
    birthPlace: 'Tunis',
    nationalId: '14520987',
    email: '',
    phone: '+216 98 123 456',
    address: '12 Rue de la Liberté',
    city: 'Tunis',
    className: '4-MATH (Bac)',
    academicYear: '2025/2026',
    parentName: 'Youssef Trabelsi',
    parentPhone: '+216 98 456 789',
    parentEmail: 'youssef.trabelsi@gmail.com',
    paymentStatus: 'PAID' as 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT',
    tuitionDue: 3600,
    tuitionPaid: 3600,
    isActive: true,
    establishmentId: '',
  });

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeEst = (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
        ? currentEstablishmentId
        : undefined;

      const res = await api.get('/students', {
        params: {
          includeDeleted: isTrashMode,
          establishmentId: activeEst,
        },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const formatted: StudentItem[] = list.map((item: any) => ({
        ...item,
        matricule: item.matricule || item.registrationNumber || 'N/A',
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        gender: item.gender || 'MALE',
        dateOfBirth: item.dateOfBirth ? String(item.dateOfBirth).split('T')[0] : '2008-01-01',
        birthPlace: item.birthPlace || 'Tunis',
        nationalId: item.nationalId || item.cin || 'N/A',
        email: item.email || item.user?.email || 'N/A',
        phone: item.phone || '+216 -- --- ---',
        address: item.address || 'Tunis, Tunisie',
        city: item.city || 'Tunis',
        className:
          item.className ||
          item.classAssignments?.[0]?.class?.name ||
          (typeof item.class === 'object' ? item.class?.name : item.class) ||
          'Non affecté',
        academicYear:
          item.academicYear ||
          item.classAssignments?.[0]?.academicYear?.name ||
          '2025/2026',
        parentName:
          item.parentName ||
          (item.parents?.[0]?.parent
            ? `${item.parents[0].parent.firstName || ''} ${item.parents[0].parent.lastName || ''}`.trim()
            : 'Tuteur légal'),
        parentPhone: item.parentPhone || item.parents?.[0]?.parent?.phone || '+216 -- --- ---',
        parentEmail: item.parentEmail || item.parents?.[0]?.parent?.email || 'parent@ecole.tn',
        paymentStatus: item.paymentStatus || 'PAID',
        tuitionDue: Number(item.tuitionDue ?? 3600),
        tuitionPaid: Number(item.tuitionPaid ?? 3600),
        isActive: item.isActive ?? true,
        establishmentName: item.establishment?.name || item.establishmentName || '',
        establishmentId: item.establishmentId || '',
      }));
      setStudents(formatted);
    } catch {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode, currentEstablishmentId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const openCreateModal = () => {
    setEditingItem(null);
    const defaultEst = (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all')
      ? currentEstablishmentId
      : (establishments[0]?.id || user?.establishmentId || '');
    setFormData({
      matricule: `ELEV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '2008-05-14',
      birthPlace: 'Tunis',
      nationalId: '',
      email: '',
      phone: '+216 ',
      address: '',
      city: 'Tunis',
      className: '4-MATH (Bac)',
      academicYear: '2025/2026',
      parentName: '',
      parentPhone: '+216 ',
      parentEmail: '',
      paymentStatus: 'PAID',
      tuitionDue: 3600,
      tuitionPaid: 3600,
      isActive: true,
      establishmentId: defaultEst,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: StudentItem) => {
    setEditingItem(item);
    setFormData({
      matricule: item.matricule,
      firstName: item.firstName,
      lastName: item.lastName,
      gender: item.gender,
      dateOfBirth: item.dateOfBirth,
      birthPlace: item.birthPlace,
      nationalId: item.nationalId,
      email: item.email,
      phone: item.phone,
      address: item.address,
      city: item.city,
      className: item.className,
      academicYear: item.academicYear,
      parentName: item.parentName,
      parentPhone: item.parentPhone,
      parentEmail: item.parentEmail,
      paymentStatus: item.paymentStatus,
      tuitionDue: item.tuitionDue,
      tuitionPaid: item.tuitionPaid,
      isActive: item.isActive,
      establishmentId: (item as any).establishmentId || currentEstablishmentId || '',
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        establishmentId: formData.establishmentId || (currentEstablishmentId && currentEstablishmentId !== 'ALL' ? currentEstablishmentId : (establishments[0]?.id || user?.establishmentId)),
      };
      if (editingItem) {
        await api.put(`/students/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/students', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchStudents();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: StudentItem, permanent = false) => {
    const isRoot = true; // Admin/Root dual-delete context
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE de l'élève ${row.firstName} ${row.lastName} (${row.matricule}) ? Cette action est irréversible en base de données.`
      : `Placer l'élève ${row.firstName} ${row.lastName} dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/students/${row.id}`, {
        params: { permanent: permanent && isRoot },
      }).catch(() => {});

      if (permanent) {
        setStudents((prev) => prev.filter((s) => s.id !== row.id));
      } else {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === row.id
              ? {
                  ...s,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  deletedByName: 'Ahmed Zitouni (@root) [ROOT]',
                }
              : s
          )
        );
      }
    } catch {
      // Handled
    }
  };

  const handleRestore = async (row: StudentItem) => {
    if (!window.confirm(`Restaurer l'élève ${row.firstName} ${row.lastName} ?`)) return;
    try {
      await api.post(`/students/${row.id}/restore`).catch(() => {});
      setStudents((prev) =>
        prev.map((s) =>
          s.id === row.id
            ? { ...s, isDeleted: false, deletedAt: null, deletedByName: undefined }
            : s
        )
      );
    } catch {
      // Handled
    }
  };

  // Filtered dataset
  const filteredStudents = students.filter((s) => {
    if (!isTrashMode && s.isDeleted) return false;
    if (isTrashMode && !s.isDeleted) return false;
    if (classFilter && s.className !== classFilter) return false;
    if (paymentFilter && s.paymentStatus !== paymentFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !s.isActive : s.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<StudentItem>[] = [
    {
      key: 'matricule',
      header: 'Matricule',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-surface border border-border text-brand">
          {row.matricule}
        </span>
      ),
    },
    {
      key: 'fullName',
      header: 'Élève & Identité',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center font-bold text-brand text-sm shadow-sm">
            {row.firstName[0]}
            {row.lastName[0]}
          </div>
          <div>
            <div className="font-semibold text-text-primary flex items-center gap-1.5">
              <span>{row.firstName} {row.lastName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${row.gender === 'MALE' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                {row.gender === 'MALE' ? 'G' : 'F'}
              </span>
            </div>
            <div className="text-xs text-text-tertiary flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-text-tertiary" />
                {row.dateOfBirth} ({row.birthPlace})
              </span>
              <span>•</span>
              <span className="font-mono">CIN: {row.nationalId}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Classe & Année',
      sortable: true,
      render: (row) => (
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
            <GraduationCap className="w-3.5 h-3.5" />
            {row.className}
          </span>
          <div className="text-[11px] text-text-tertiary mt-0.5 font-mono">{row.academicYear}</div>
        </div>
      ),
    },
    {
      key: 'parentName',
      header: 'Parent / Tuteur',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1">
            <Users className="w-3 h-3 text-brand" />
            {row.parentName}
          </div>
          <div className="text-[11px] text-text-secondary flex items-center gap-1 font-mono mt-0.5">
            <Phone className="w-3 h-3 text-text-tertiary" />
            {row.parentPhone}
          </div>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Scolarité (TND)',
      sortable: true,
      render: (row) => {
        const tuitionDue = Number(row.tuitionDue ?? 0);
        const tuitionPaid = Number(row.tuitionPaid ?? 0);
        const remaining = Math.max(0, tuitionDue - tuitionPaid);
        const badgeMap: Record<string, { bg: string; label: string }> = {
          PAID: { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Soldé' },
          PARTIAL: { bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Partiel' },
          UNPAID: { bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Impayé' },
          EXEMPT: { bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20', label: 'Exonéré' },
        };
        const conf = badgeMap[row.paymentStatus] || badgeMap.PAID;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${conf.bg}`}>
                {conf.label}
              </span>
              <span className="font-bold text-xs text-text-primary">
                {tuitionPaid.toLocaleString('fr-TN')} TND
              </span>
            </div>
            {remaining > 0 && (
              <div className="text-[10px] text-rose-500 font-medium mt-0.5">
                Reste: {remaining.toLocaleString('fr-TN')} TND / {tuitionDue.toLocaleString('fr-TN')} TND
              </div>
            )}
          </div>
        );
      },
    },
    ...(user?.isRoot
      ? [
          {
            key: 'establishmentName' as keyof StudentItem,
            header: 'Établissement',
            sortable: true,
            render: (row: StudentItem) => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                {row.establishmentName || 'Principal'}
              </span>
            ),
          },
        ]
      : []),
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
          {row.isActive ? 'Inscrit Actif' : 'Inactif / Suspendu'}
        </span>
      ),
    },
  ];

  const detailSections: DetailSection<StudentItem>[] = [
    {
      title: 'Identité Civile & Coordonnées',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Matricule & Genre</span>
            <span className="font-mono font-bold text-brand">{item.matricule}</span>
            <span className="text-xs text-text-secondary block mt-1 font-medium">
              Sexe: {item.gender === 'MALE' ? 'Masculin' : 'Féminin'} | CIN: {item.nationalId}
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Naissance</span>
            <span className="font-semibold text-text-primary">{item.dateOfBirth}</span>
            <span className="text-xs text-text-secondary block mt-1">Lieu: {item.birthPlace}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Adresse & Ville</span>
            <span className="font-semibold text-text-primary">{item.city}</span>
            <span className="text-xs text-text-secondary block mt-1 truncate">{item.address}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Parent & Tuteur Légal',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Nom du Tuteur</span>
            <span className="font-semibold text-text-primary">{item.parentName}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Téléphone Parent</span>
            <span className="font-mono font-semibold text-text-primary">{item.parentPhone}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Email Parent</span>
            <span className="font-semibold text-text-primary truncate block">{item.parentEmail}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Scolarité & Règlement Financier (TND)',
      render: (item) => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Classe & Année</span>
            <span className="font-bold text-brand">{item.className}</span>
            <span className="text-xs text-text-secondary block mt-0.5">{item.academicYear}</span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Montant Total Dû</span>
            <span className="font-mono font-bold text-text-primary">
              {item.tuitionDue.toLocaleString('fr-TN')} TND
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Total Encaissé</span>
            <span className="font-mono font-bold text-emerald-600">
              {item.tuitionPaid.toLocaleString('fr-TN')} TND
            </span>
          </div>
          <div className="p-3 bg-surface rounded-xl border border-border">
            <span className="text-xs text-text-tertiary block">Reste à Payer</span>
            <span className="font-mono font-bold text-rose-600">
              {(item.tuitionDue - item.tuitionPaid).toLocaleString('fr-TN')} TND
            </span>
          </div>
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
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Gestion des Élèves</h1>
              <p className="text-sm text-text-secondary">
                Dossiers scolaires, identité civile, affectation de classe et suivi des frais de scolarité en Dinars Tunisiens (TND).
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
            {isTrashMode ? <RotateCcw className="w-4 h-4 text-brand" /> : <Trash2 className="w-4 h-4 text-text-tertiary" />}
            {isTrashMode ? 'Voir Actifs' : 'Corbeille'}
          </Button>
          <Button onClick={openCreateModal} className="flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Inscrire un Élève
          </Button>
        </div>
      </div>

      {/* KPI Cards in TND */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total Élèves Inscrits</span>
              <span className="text-2xl font-bold text-text-primary">{students.filter((s) => !s.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Frais Encaissés (TND)</span>
              <span className="text-2xl font-bold text-emerald-600">
                {students
                  .filter((s) => !s.isDeleted)
                  .reduce((acc, curr) => acc + Number(curr.tuitionPaid || 0), 0)
                  .toLocaleString('fr-TN')}{' '}
                TND
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Reste à Recouvrer (TND)</span>
              <span className="text-2xl font-bold text-rose-600">
                {students
                  .filter((s) => !s.isDeleted)
                  .reduce((acc, curr) => acc + Math.max(0, Number(curr.tuitionDue || 0) - Number(curr.tuitionPaid || 0)), 0)
                  .toLocaleString('fr-TN')}{' '}
                TND
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Taux de Recouvrement</span>
              <span className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (students.filter((s) => !s.isDeleted).reduce((acc, curr) => acc + curr.tuitionPaid, 0) /
                    (students.filter((s) => !s.isDeleted).reduce((acc, curr) => acc + curr.tuitionDue, 0) || 1)) *
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
      <DataTable<StudentItem>
        title={isTrashMode ? 'Corbeille des Élèves' : 'Registre des Élèves'}
        data={filteredStudents}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par nom, matricule, CIN ou ville..."
        searchKeys={['matricule', 'firstName', 'lastName', 'nationalId', 'city', 'parentName', 'className']}
        exportFilename={`eleves-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Registre des Élèves - BSofts School"
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
                    <h3 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                      {item.firstName} {item.lastName}
                      <span className={`text-[10px] px-1 py-0.2 rounded font-medium ${item.gender === 'MALE' ? 'bg-blue-500/10 text-blue-600' : 'bg-pink-500/10 text-pink-600'}`}>
                        {item.gender === 'MALE' ? 'G' : 'F'}
                      </span>
                    </h3>
                    <span className="font-mono text-[11px] text-brand">{item.matricule}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    item.paymentStatus === 'PAID'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : item.paymentStatus === 'PARTIAL'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}
                >
                  {item.paymentStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Classe:</span>
                  <span className="font-semibold text-brand">{item.className}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Parent:</span>
                  <span className="font-medium text-text-primary">{item.parentName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Scolarité Payée:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {item.tuitionPaid.toLocaleString('fr-TN')} TND
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Né(e) le {item.dateOfBirth}
              </span>
              <span className="font-mono text-[10px]">{item.city}</span>
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
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les classes</option>
              <option value="4-MATH (Bac)">4-MATH (Bac)</option>
              <option value="4-SC-EXP (Bac)">4-SC-EXP (Bac)</option>
              <option value="3-INFO">3-INFO</option>
              <option value="3-MATH-A">3-MATH-A</option>
              <option value="2-SC-1">2-SC-1</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les règlements</option>
              <option value="PAID">Soldé (100%)</option>
              <option value="PARTIAL">Partiellement Réglé</option>
              <option value="UNPAID">Impayé</option>
              <option value="EXEMPT">Exonéré</option>
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
        title={editingItem ? `Dossier Élève : ${editingItem.firstName} ${editingItem.lastName}` : "Inscription d'un Nouvel Élève"}
        size="6xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Identité Civile */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand" />
              1. Identité Civile & Numéro d&apos;Élève
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Matricule d'Inscription"
                value={formData.matricule}
                onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                required
              />
              <Input
                label="Prénom"
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
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Genre</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="MALE">Masculin (Garçon)</option>
                  <option value="FEMALE">Féminin (Fille)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
              <Input
                label="Date de Naissance"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
              <Input
                label="Lieu de Naissance"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                required
              />
              <Input
                label="CIN ou N° Acte de Naissance"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                required
              />
              <Input
                label="Téléphone Personnel Élève"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Affectation Pédagogique */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand" />
              2. Affectation Scolaire & Classe
            </h4>
            <div className={`grid grid-cols-1 ${user?.isRoot ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4`}>
              {user?.isRoot && (
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Établissement Scolaire *
                  </label>
                  <select
                    value={formData.establishmentId}
                    onChange={(e) => setFormData({ ...formData, establishmentId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand font-medium"
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
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Classe d&apos;Affectation</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="4-MATH (Bac)">4ème Année Mathématiques (Bac)</option>
                  <option value="4-SC-EXP (Bac)">4ème Année Sciences Expérimentales (Bac)</option>
                  <option value="3-INFO">3ème Année Sciences de l&apos;Informatique</option>
                  <option value="3-MATH-A">3ème Année Mathématiques Section A</option>
                  <option value="2-SC-1">2ème Année Sciences 1</option>
                </select>
              </div>
              <Input
                label="Année Scolaire"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
              <Input
                label="Email Scolaire BSofts"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="prenom.nom@ecole.tn"
              />
            </div>
          </div>

          {/* Section 3: Parent & Tuteur Légal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              3. Tuteur Légal & Contact d&apos;Urgence
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nom et Prénom du Parent/Tuteur"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                required
              />
              <Input
                label="Téléphone d'Urgence Parent"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                required
              />
              <Input
                label="Email du Parent"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <Input
                label="Adresse de Résidence"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                label="Gouvernorat / Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          {/* Section 4: Frais de Scolarité en Dinars Tunisiens (TND) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand" />
              4. Tarification & Scolarité (TND)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Statut Règlement</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentStatus: e.target.value as 'PAID' | 'PARTIAL' | 'UNPAID' | 'EXEMPT',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="PAID">Soldé en totalité (PAID)</option>
                  <option value="PARTIAL">Partiellement Réglé (PARTIAL)</option>
                  <option value="UNPAID">Impayé / En attente (UNPAID)</option>
                  <option value="EXEMPT">Exonération Totale (Bourse/Personnel)</option>
                </select>
              </div>
              <Input
                label="Frais Annuels Fixés (TND)"
                type="number"
                value={formData.tuitionDue}
                onChange={(e) => setFormData({ ...formData, tuitionDue: Number(e.target.value) })}
                required
              />
              <Input
                label="Montant Encaissé à ce jour (TND)"
                type="number"
                value={formData.tuitionPaid}
                onChange={(e) => setFormData({ ...formData, tuitionPaid: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Tous les montants sont libellés en Dinar Tunisien (TND) avec audit trail de création.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingItem ? 'Enregistrer les Modifications' : 'Finaliser l’Inscription'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
