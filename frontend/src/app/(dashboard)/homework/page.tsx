'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  RotateCcw,
  GraduationCap,
  Users,
  FileText,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import api from '@/lib/api';
import type { HomeworkItem } from '@/types';

export default function HomeworkPage() {
  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HomeworkItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    className: '4-MATH (Bac)',
    matiereName: 'Mathématiques',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: '2026-09-22',
    totalStudents: 32,
    status: 'OPEN' as 'OPEN' | 'SUBMITTED' | 'GRADED' | 'EXPIRED',
  });

  const fetchHomework = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/homework', { params: { limit: 100, isDeleted: isTrashMode } });
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: HomeworkItem[] = list.map((h: any) => ({
        id: h.id || '',
        title: h.title || 'Devoir sans titre',
        description: h.description || '',
        className: h.className || h.class?.name || 'Classe standard',
        matiereName: h.matiereName || h.matiere?.name || 'Général',
        assignedDate: h.assignedDate || h.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        dueDate: h.dueDate || new Date().toISOString().split('T')[0],
        submissionsCount: Number(h.submissionsCount ?? h._count?.submissions ?? 0),
        totalStudents: Number(h.totalStudents ?? h.class?.maxStudents ?? 30),
        status: (h.status as any) || 'OPEN',
        createdAt: h.createdAt || new Date().toISOString(),
        updatedAt: h.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(h.isDeleted),
      }));
      setHomeworkList(mapped);
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement des devoirs');
      setHomeworkList([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      className: '4-MATH (Bac)',
      matiereName: 'Mathématiques',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      totalStudents: 32,
      status: 'OPEN',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: HomeworkItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      className: item.className,
      matiereName: item.matiereName,
      assignedDate: item.assignedDate,
      dueDate: item.dueDate,
      totalStudents: item.totalStudents,
      status: item.status,
    });
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/homework/${editingItem.id}`, formData);
        showToast('Devoir mis à jour avec succès', 'success');
      } else {
        await api.post('/homework', formData);
        showToast('Devoir créé avec succès', 'success');
      }
      setIsFormModalOpen(false);
      await fetchHomework();
    } catch (err: any) {
      showApiErrorToast(err, "Erreur lors de l'enregistrement du devoir");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: HomeworkItem, permanent = false) => {
    const isRoot = true; // Root context
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE du devoir "${row.title}" ? Action irréversible.`
      : `Mettre le devoir "${row.title}" dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/homework/${row.id}`, {
        params: { permanent: permanent && isRoot },
      });
      showToast(permanent ? 'Devoir supprimé définitivement' : 'Devoir placé dans la corbeille', 'success');
      await fetchHomework();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la suppression du devoir');
    }
  };

  const handleRestore = async (row: HomeworkItem) => {
    if (!window.confirm(`Restaurer le devoir "${row.title}" ?`)) return;
    try {
      await api.post(`/homework/${row.id}/restore`);
      showToast('Devoir restauré avec succès', 'success');
      await fetchHomework();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la restauration du devoir');
    }
  };

  const filteredHomework = homeworkList.filter((hw) => {
    if (!isTrashMode && hw.isDeleted) return false;
    if (isTrashMode && !hw.isDeleted) return false;
    if (classFilter && hw.className !== classFilter) return false;
    if (statusFilter && hw.status !== statusFilter) return false;
    return true;
  });

  const columns: ColumnDef<HomeworkItem>[] = [
    {
      key: 'title',
      header: 'Devoir & Matière',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-sm line-clamp-1">{row.title}</div>
            <div className="text-xs text-text-tertiary flex items-center gap-2 mt-0.5">
              <span className="font-medium text-brand">{row.matiereName}</span>
              <span>•</span>
              <span className="line-clamp-1">{row.description}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      header: 'Classe Concernee',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
          <GraduationCap className="w-3.5 h-3.5" />
          {row.className}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Échéance & Rendu',
      sortable: true,
      render: (row) => {
        const isPast = new Date(row.dueDate) < new Date();
        return (
          <div>
            <div className={`text-xs font-semibold flex items-center gap-1.5 ${isPast ? 'text-rose-600' : 'text-text-primary'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Pour le {row.dueDate}</span>
            </div>
            <div className="text-[11px] text-text-tertiary mt-0.5">
              Assigné le {row.assignedDate}
            </div>
          </div>
        );
      },
    },
    {
      key: 'submissions',
      header: 'Taux de Rendu',
      render: (row) => {
        const pct = Math.round((row.submissionsCount / (row.totalStudents || 1)) * 100);
        return (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-xs text-text-primary">
                {row.submissionsCount} / {row.totalStudents}
              </span>
              <span className="text-[11px] text-text-tertiary">({pct}%)</span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-surface-hover overflow-hidden">
              <div
                className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (row) => {
        const badgeMap = {
          OPEN: { bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20', label: 'En cours' },
          SUBMITTED: { bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'Clôturé' },
          GRADED: { bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Corrigé' },
          EXPIRED: { bg: 'bg-rose-500/10 text-rose-600 border-rose-500/20', label: 'Délai Dépassé' },
        };
        const conf = badgeMap[row.status] || badgeMap.OPEN;
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.bg}`}>
            {conf.label}
          </span>
        );
      },
    },
  ];

  const detailSections: DetailSection<HomeworkItem>[] = [
    {
      title: 'Consignes Pédagogiques & Contenu',
      render: (item) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Titre du Devoir</span>
              <span className="font-bold text-text-primary text-sm">{item.title}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Matière & Classe</span>
              <span className="font-semibold text-brand text-sm">{item.matiereName}</span>
              <span className="text-xs text-text-secondary block mt-0.5">{item.className}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Date Limite de Dépôt</span>
              <span className="font-bold text-rose-600 text-sm">{item.dueDate}</span>
              <span className="text-xs text-text-secondary block mt-0.5">Donné le {item.assignedDate}</span>
            </div>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-border">
            <span className="text-xs font-bold text-text-tertiary uppercase block mb-1">Énoncé Complet & Consignes</span>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{item.description}</p>
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
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Cahier de Textes & Devoirs</h1>
              <p className="text-sm text-text-secondary">
                Gestion des devoirs à la maison, travaux pratiques, dates de rendu et suivi des dépôts d&apos;élèves.
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
            Nouveau Devoir
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total Devoirs Assignés</span>
              <span className="text-2xl font-bold text-text-primary">{homeworkList.filter((h) => !h.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Devoirs en Cours</span>
              <span className="text-2xl font-bold text-blue-600">
                {homeworkList.filter((h) => !h.isDeleted && h.status === 'OPEN').length}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Taux Moyen de Rendu</span>
              <span className="text-2xl font-bold text-emerald-600">
                {Math.round(
                  (homeworkList.filter((h) => !h.isDeleted).reduce((acc, c) => acc + c.submissionsCount, 0) /
                    (homeworkList.filter((h) => !h.isDeleted).reduce((acc, c) => acc + c.totalStudents, 0) || 1)) *
                    100
                )}
                %
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Devoirs Corrigés</span>
              <span className="text-2xl font-bold text-purple-600">
                {homeworkList.filter((h) => !h.isDeleted && h.status === 'GRADED').length}
              </span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<HomeworkItem>
        title={isTrashMode ? 'Corbeille des Devoirs' : 'Registre des Devoirs & Travaux'}
        data={filteredHomework}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par titre, matière, classe ou consigne..."
        searchKeys={['title', 'matiereName', 'className', 'description', 'dueDate']}
        exportFilename={`devoirs-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Registre des Devoirs - BSofts School"
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-brand/10 text-brand border border-brand/20">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {item.className}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    item.status === 'OPEN'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                      : item.status === 'GRADED'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm line-clamp-1 mb-1">{item.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">{item.description}</p>

              <div className="space-y-1.5 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Matière:</span>
                  <span className="font-semibold text-brand">{item.matiereName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Dépôts:</span>
                  <span className="font-bold text-text-primary">
                    {item.submissionsCount} / {item.totalStudents} élèves
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1 font-semibold text-rose-600">
                <Calendar className="w-3 h-3" />
                {item.dueDate}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3" />
                {Math.round((item.submissionsCount / (item.totalStudents || 1)) * 100)}%
              </span>
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
              <option value="2-SC-1">2-SC-1</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les statuts</option>
              <option value="OPEN">En cours (OPEN)</option>
              <option value="SUBMITTED">Clôturé (SUBMITTED)</option>
              <option value="GRADED">Corrigé (GRADED)</option>
              <option value="EXPIRED">Expiré (EXPIRED)</option>
            </select>
          </div>
        }
      />

      {/* Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingItem ? `Modifier le Devoir : ${editingItem.title}` : 'Créer une Nouvelle Assignation de Devoir'}
        size="6xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Section 1: Classe & Matière */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand" />
              1. Classe Cible & Matière Pédagogique
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Classe</label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="4-MATH (Bac)">4ème Année Mathématiques (Bac)</option>
                  <option value="4-SC-EXP (Bac)">4ème Année Sciences Expérimentales (Bac)</option>
                  <option value="3-INFO">3ème Année Sciences de l&apos;Informatique</option>
                  <option value="2-SC-1">2ème Année Sciences 1</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Matière</label>
                <select
                  value={formData.matiereName}
                  onChange={(e) => setFormData({ ...formData, matiereName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="Mathématiques">Mathématiques</option>
                  <option value="Sciences Physiques">Sciences Physiques</option>
                  <option value="Informatique">Informatique & Algorithmique</option>
                  <option value="Français">Français & Littérature</option>
                  <option value="Histoire-Géo">Histoire-Géographie</option>
                </select>
              </div>
              <Input
                label="Effectif d'Élèves Concernés"
                type="number"
                value={formData.totalStudents}
                onChange={(e) => setFormData({ ...formData, totalStudents: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 2: Consignes & Dates */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              2. Titre, Échéance & Consignes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2">
                <Input
                  label="Titre du Devoir / Sujet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Série d'exercices sur les suites numériques"
                />
              </div>
              <Input
                label="Date Limite de Remise"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
            <Textarea
              label="Description Complète & Instructions Pédagogiques"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
              placeholder="Préciser les exercices à faire, le barème indicatif ou le support de rendu..."
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Le devoir sera instantanément visible sur les portails Élèves et Parents.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {editingItem ? 'Enregistrer les Modifications' : 'Publier le Devoir'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
