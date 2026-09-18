'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Calculator,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, ColumnDef, DetailSection, TableRowActions } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { MatiereItem, AcademicModuleItem } from '@/types';

export default function AcademicModulesPage() {
  const [modules, setModules] = useState<AcademicModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [filiereFilter, setFiliereFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create / Edit Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademicModuleItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    filiere: 'Tronc Commun & Général',
    description: '',
    matieres: [
      {
        id: 'mat-temp-1',
        name: 'Mathématiques',
        code: 'MATH',
        coefficient: 4,
        maxScore: 20,
        weeklyHours: 5,
        evaluationMode: 'EXAMEN_ET_CC' as MatiereItem['evaluationMode'],
        isActive: true,
      },
    ],
    isActive: true,
  });

  const fetchModules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/academic-modules', {
        params: { includeDeleted: isTrashMode },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const formatted = (Array.isArray(rawData) ? rawData : []).map((m: any) => ({
        ...m,
        matieres: Array.isArray(m.matieres) ? m.matieres : [],
        matieresCount: m.matieres?.length || m._count?.matieres || 0,
        totalCoefficient: (m.matieres || []).reduce((acc: number, cur: any) => acc + Number(cur.coefficient || 0), 0) || m.totalCoefficient || 1,
      }));
      setModules(formatted);
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
      filiere: 'Tronc Commun & Général',
      description: '',
      matieres: [
        {
          id: `mat-${Date.now()}-1`,
          name: 'Matière Principale',
          code: 'MAT-1',
          coefficient: 3,
          maxScore: 20,
          weeklyHours: 3,
          evaluationMode: 'EXAMEN_ET_CC',
          isActive: true,
        },
      ],
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: AcademicModuleItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      filiere: item.filiere,
      description: item.description,
      matieres: Array.isArray(item.matieres) ? item.matieres : [],
      isActive: item.isActive,
    });
    setIsFormModalOpen(true);
  };

  const handleAddMatiereRow = () => {
    setFormData((prev) => ({
      ...prev,
      matieres: [
        ...prev.matieres,
        {
          id: `mat-${Date.now()}-${prev.matieres.length + 1}`,
          name: '',
          code: '',
          coefficient: 2,
          maxScore: 20,
          weeklyHours: 2,
          evaluationMode: 'EXAMEN_ET_CC',
          isActive: true,
        },
      ],
    }));
  };

  const handleRemoveMatiereRow = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      matieres: prev.matieres.filter((m) => m.id !== id),
    }));
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const totalCoef = formData.matieres.reduce((acc, curr) => acc + Number(curr.coefficient || 0), 0);
      const payload = {
        ...formData,
        totalCoefficient: totalCoef,
        matieresCount: formData.matieres.length,
      };

      if (editingItem) {
        await api.put(`/academic-modules/${editingItem.id}`, payload).catch(() => {});
      } else {
        await api.post('/academic-modules', payload).catch(() => {});
      }
      setIsFormModalOpen(false);
      fetchModules();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: AcademicModuleItem) => {
    await api.delete(`/academic-modules/${item.id}`).catch(() => {});
    setModules((prev) => prev.filter((m) => m.id !== item.id));
  };

  const handlePermanentDelete = async (item: AcademicModuleItem) => {
    await api.delete(`/academic-modules/${item.id}?permanent=true`).catch(() => {});
    setModules((prev) => prev.filter((m) => m.id !== item.id));
  };

  const handleToggleStatus = async (item: AcademicModuleItem) => {
    const updated = !item.isActive;
    await api.put(`/academic-modules/${item.id}`, { isActive: updated }).catch(() => {});
    setModules((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, isActive: updated } : m))
    );
  };

  const filteredModules = modules.filter((m) => {
    if (filiereFilter && m.filiere !== filiereFilter) return false;
    if (statusFilter && (statusFilter === 'active' ? !m.isActive : m.isActive)) return false;
    return true;
  });

  const columns: ColumnDef<AcademicModuleItem>[] = [
    {
      key: 'name',
      header: 'Pôle / Module Pédagogique',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-text-primary block">{row.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-surface rounded text-brand font-semibold">
                {row.code}
              </span>
              <span className="text-xs text-text-tertiary">{row.filiere}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalCoefficient',
      header: 'Coefficient Total',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-bold text-sm text-text-primary">
          <Calculator className="w-4 h-4 text-brand" />
          <span>Coef. {row.totalCoefficient}</span>
        </div>
      ),
    },
    {
      key: 'matieresCount',
      header: 'Matières Incluses',
      render: (row) => (
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-primary block">
            {row.matieresCount} matières enseignées
          </span>
          <div className="flex flex-wrap gap-1 max-w-[260px]">
            {(row.matieres || []).slice(0, 3).map((m) => (
              <span
                key={m.id}
                className="px-1.5 py-0.5 bg-surface text-text-secondary border border-border-subtle rounded text-[10px] font-medium"
              >
                {m.name} (×{m.coefficient})
              </span>
            ))}
            {(row.matieres || []).length > 3 && (
              <span className="px-1 py-0.5 text-[10px] font-semibold text-text-tertiary">
                +{(row.matieres || []).length - 3} autres
              </span>
            )}
          </div>
        </div>
      ),
    },
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
          {row.isActive ? 'Actif' : 'Désactivé'}
        </span>
      ),
    },
  ];

  const renderDetailSections = (item: AcademicModuleItem): DetailSection[] => [
    {
      title: 'Pôle Pédagogique & Répartition Horaire',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Désignation Officielle</span>
            <p className="text-base font-bold text-text-primary">{item.name}</p>
            <p className="text-text-secondary">Code Pôle : <span className="font-mono font-bold text-brand">{item.code}</span></p>
            <p className="text-text-secondary">Filière concernée : <span className="font-semibold text-text-primary">{item.filiere}</span></p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-1 text-xs">
            <span className="text-text-tertiary block">Impact Trimestriel</span>
            <p className="text-lg font-black text-text-primary">
              Coefficient Cumulé : {item.totalCoefficient}
            </p>
            <p className="text-text-secondary mt-1">
              Nombre de matières composantes : <span className="font-bold text-text-primary">{(item.matieres || []).length}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Matières Composantes & Barèmes de Notation',
      content: (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left py-2 px-3 font-semibold text-text-secondary">Matière</th>
                  <th className="text-left py-2 px-3 font-semibold text-text-secondary">Code</th>
                  <th className="text-center py-2 px-3 font-semibold text-text-secondary">Coefficient</th>
                  <th className="text-center py-2 px-3 font-semibold text-text-secondary">Note Max</th>
                  <th className="text-center py-2 px-3 font-semibold text-text-secondary">Volume / Semaine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {(item.matieres || []).map((m) => (
                  <tr key={m.id} className="hover:bg-surface-hover">
                    <td className="py-2.5 px-3 font-semibold text-text-primary">{m.name}</td>
                    <td className="py-2.5 px-3 font-mono text-brand">{m.code}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-text-primary">×{m.coefficient}</td>
                    <td className="py-2.5 px-3 text-center">/{m.maxScore}</td>
                    <td className="py-2.5 px-3 text-center">{m.weeklyHours}h / sem</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  const renderGridCard = (
    item: AcademicModuleItem,
    onViewDetails: (item: AcademicModuleItem) => void,
    actions: TableRowActions<AcademicModuleItem>
  ) => (
    <Card
      key={item.id}
      className="p-5 hover:shadow-md transition-all duration-200 border border-border relative group flex flex-col justify-between bg-surface"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-base shadow-xs shrink-0 border border-[#363636]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="text-right">
            <span className="font-mono text-xs px-2 py-0.5 bg-background border border-border-subtle rounded-md font-bold text-[#CCA43B]">
              {item.code}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-brand transition-colors line-clamp-1 mb-1">
          {item.name}
        </h3>

        <p className="text-xs text-text-secondary mb-3 font-semibold">
          {item.filiere}
        </p>

        <div className="p-3 bg-surface rounded-xl border border-border-subtle mb-4 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-medium">Coefficient Total</span>
          <span className="text-sm font-extrabold text-brand">Coef. {item.totalCoefficient}</span>
        </div>

        <div className="space-y-1 mb-4">
          <span className="text-[11px] font-semibold text-text-secondary block mb-1">
            {(item.matieres || []).length} Matières composantes :
          </span>
          <div className="flex flex-wrap gap-1">
            {(item.matieres || []).slice(0, 3).map((m) => (
              <span
                key={m.id}
                className="px-1.5 py-0.5 bg-background text-[10px] text-text-secondary rounded border border-border"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            item.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
          }`}
        >
          {item.isActive ? 'Actif' : 'Inactif'}
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
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Matières & Modules Académiques</h1>
              <p className="text-sm text-text-secondary">
                Configuration des pôles d’enseignement, matières composantes, barèmes et coefficients trimestriels.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button onClick={handleOpenCreate} className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" />
            Nouveau Pôle Pédagogique
          </Button>
        </div>
      </div>

      <DataTable<AcademicModuleItem>
        title="Programme Académique & Coefficients"
        data={filteredModules}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par pôle, matière, code ou filière..."
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
        importExportEntityName="Programmes_Academiques"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filiereFilter}
              onChange={(e) => setFiliereFilter(e.target.value)}
              aria-label="Filtrer par filière"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les Filières</option>
              <option value="Tronc Commun & Général">Tronc Commun & Général</option>
              <option value="Section Mathématiques & Sciences Expérimentales">Section Math & Sciences</option>
              <option value="Section Sciences de l’Informatique">Section Informatique</option>
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
        title={editingItem ? `Modifier le pôle : ${editingItem.name}` : 'Créer un Pôle & Définir les Matières'}
        size="6xl"
      >
        <form onSubmit={handleSaveForm} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border pb-2">
                <BookOpen className="w-4 h-4 text-brand" />
                Informations Générales du Pôle
              </h3>

              <Input
                label="Intitulé du Pôle Pédagogique *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Pôle Scientifique & Exactes"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Code Système Unique *"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                  placeholder="POLE-SCI-01"
                  required
                />
                <Input
                  label="Filière de Référence *"
                  value={formData.filiere}
                  onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                  placeholder="Ex: Tronc Commun"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Objectifs Pédagogiques
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez les compétences visées..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-text-primary outline-none focus:border-brand resize-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-surface space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-brand" />
                  Matières & Coefficients
                </h3>
                <Button type="button" size="sm" variant="secondary" onClick={handleAddMatiereRow}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Ajouter Matière
                </Button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {formData.matieres.map((m, index) => (
                  <div key={m.id} className="p-3 bg-background rounded-xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">Matière n°{index + 1}</span>
                      {formData.matieres.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMatiereRow(m.id)}
                          className="text-xs font-bold text-rose-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => {
                          const updated = [...formData.matieres];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, matieres: updated });
                        }}
                        placeholder="Nom matière"
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-surface border border-border"
                        required
                      />
                      <input
                        type="text"
                        value={m.code}
                        onChange={(e) => {
                          const updated = [...formData.matieres];
                          updated[index].code = e.target.value.toUpperCase();
                          setFormData({ ...formData, matieres: updated });
                        }}
                        placeholder="Code"
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-surface border border-border font-mono"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-text-secondary block">Coef.</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={m.coefficient}
                          onChange={(e) => {
                            const updated = [...formData.matieres];
                            updated[index].coefficient = Number(e.target.value);
                            setFormData({ ...formData, matieres: updated });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg bg-surface border border-border"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-secondary block">Note Max</label>
                        <input
                          type="number"
                          value={m.maxScore}
                          onChange={(e) => {
                            const updated = [...formData.matieres];
                            updated[index].maxScore = Number(e.target.value);
                            setFormData({ ...formData, matieres: updated });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg bg-surface border border-border"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-text-secondary block">Heures/sem</label>
                        <input
                          type="number"
                          value={m.weeklyHours}
                          onChange={(e) => {
                            const updated = [...formData.matieres];
                            updated[index].weeklyHours = Number(e.target.value);
                            setFormData({ ...formData, matieres: updated });
                          }}
                          className="w-full px-2 py-1 text-xs rounded-lg bg-surface border border-border"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
              {editingItem ? 'Enregistrer les Modifications' : 'Créer le Pôle'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
