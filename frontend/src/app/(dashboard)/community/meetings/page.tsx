'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  RotateCcw,
  Building2,
  ExternalLink,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { MeetingItem } from '@/types';

export default function CommunityMeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [roomFilter, setRoomFilter] = useState('');

  // Create Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'CLASS_COUNCIL' as 'PARENT_TEACHER' | 'CLASS_COUNCIL' | 'PEDAGOGICAL' | 'ADMINISTRATIVE',
    roomType: 'VIRTUAL' as 'VIRTUAL' | 'PRESENTIAL',
    locationOrUrl: 'https://meet.bsofts.tn/classe-4math',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '18:00',
    organizer: 'M. Ahmed Zitouni (Direction)',
    participantsCount: 18,
    agenda: 'Ordre du jour : Bilan trimestriel, assiduité et préparation aux examens de synthèse.',
  });

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/community/meetings').catch(() => ({ data: { data: [] } }));
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: MeetingItem[] = list.map((m: any) => ({
        id: m.id || '',
        title: m.title || 'Réunion',
        type: (m.type as any) || 'PEDAGOGICAL',
        roomType: (m.roomType as any) || 'PRESENTIAL',
        locationOrUrl: m.locationOrUrl || 'Salle de réunion',
        date: m.date || new Date().toISOString().split('T')[0],
        startTime: m.startTime || '14:00',
        endTime: m.endTime || '16:00',
        organizer: m.organizer || 'Direction Pédagogique',
        participantsCount: Number(m.participantsCount || 0),
        status: (m.status as any) || 'SCHEDULED',
        agenda: m.agenda || '',
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(m.isDeleted),
      }));
      setMeetings(mapped);
    } catch {
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const openCreateModal = () => {
    setFormData({
      title: '',
      type: 'CLASS_COUNCIL',
      roomType: 'VIRTUAL',
      locationOrUrl: 'https://meet.bsofts.tn/visio-' + Math.floor(100 + Math.random() * 900),
      date: new Date().toISOString().split('T')[0],
      startTime: '16:00',
      endTime: '17:30',
      organizer: 'Direction Pédagogique',
      participantsCount: 20,
      agenda: '',
    });
    setIsFormModalOpen(true);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/community/meetings', formData).catch(() => {});
      const newMeeting: MeetingItem = {
        id: `meet-${Date.now()}`,
        ...formData,
        status: 'SCHEDULED',
        createdAt: new Date().toISOString(),
        createdBy: 'u-root',
        createdByName: 'Ahmed Zitouni (@root) [ROOT]',
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
      setMeetings((prev) => [newMeeting, ...prev]);
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: MeetingItem, permanent = false) => {
    const isRoot = true;
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE de la réunion "${row.title}" ? Action irréversible.`
      : `Annuler ou placer la réunion "${row.title}" dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/community/meetings/${row.id}`, {
        params: { permanent: permanent && isRoot },
      }).catch(() => {});

      if (permanent) {
        setMeetings((prev) => prev.filter((m) => m.id !== row.id));
      } else {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === row.id
              ? {
                  ...m,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  deletedByName: 'Ahmed Zitouni (@root) [ROOT]',
                }
              : m
          )
        );
      }
    } catch {
      // Handled
    }
  };

  const handleRestore = async (row: MeetingItem) => {
    if (!window.confirm(`Restaurer la réunion "${row.title}" ?`)) return;
    try {
      await api.post(`/community/meetings/${row.id}/restore`).catch(() => {});
      setMeetings((prev) =>
        prev.map((m) =>
          m.id === row.id
            ? { ...m, isDeleted: false, deletedAt: null, deletedByName: undefined }
            : m
        )
      );
    } catch {
      // Handled
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    if (!isTrashMode && m.isDeleted) return false;
    if (isTrashMode && !m.isDeleted) return false;
    if (typeFilter && m.type !== typeFilter) return false;
    if (roomFilter && m.roomType !== roomFilter) return false;
    return true;
  });

  const columns: ColumnDef<MeetingItem>[] = [
    {
      key: 'title',
      header: 'Intitulé de la Réunion & Ordre du Jour',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
            {row.roomType === 'VIRTUAL' ? <Video className="w-5 h-5 text-brand" /> : <Building2 className="w-5 h-5 text-purple-600" />}
          </div>
          <div>
            <div className="font-semibold text-text-primary text-sm line-clamp-1">{row.title}</div>
            <div className="text-xs text-text-tertiary line-clamp-1 mt-0.5">{row.agenda}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'dateTime',
      header: 'Date & Horaires',
      sortable: true,
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand" />
            <span>{row.date}</span>
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            <span>{row.startTime} - {row.endTime}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'roomType',
      header: 'Modalité & Lieu',
      render: (row) => (
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              row.roomType === 'VIRTUAL'
                ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
            }`}
          >
            {row.roomType === 'VIRTUAL' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {row.roomType === 'VIRTUAL' ? 'Visioconférence' : 'Présentiel'}
          </span>
          <div className="text-[11px] text-text-secondary mt-1 truncate max-w-[180px]">
            {row.locationOrUrl}
          </div>
        </div>
      ),
    },
    {
      key: 'organizer',
      header: 'Organisateur & Effectif',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-text-primary truncate max-w-[160px]">{row.organizer}</div>
          <div className="text-[11px] text-text-tertiary mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{row.participantsCount} participants</span>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      sortable: true,
      render: (row) => {
        const badgeMap = {
          SCHEDULED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          IN_PROGRESS: 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse',
          COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        };
        const labelMap = {
          SCHEDULED: 'Planifiée',
          IN_PROGRESS: 'En cours',
          COMPLETED: 'Terminée',
          CANCELLED: 'Annulée',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeMap[row.status]}`}>
            {labelMap[row.status]}
          </span>
        );
      },
    },
  ];

  const detailSections: DetailSection<MeetingItem>[] = [
    {
      title: 'Informations de la Séance',
      render: (item) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Type de Réunion</span>
              <span className="font-bold text-text-primary text-sm">{item.type}</span>
              <span className="text-xs text-brand block mt-0.5 font-medium">{item.roomType}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Accès / Lieu</span>
              <span className="font-semibold text-text-primary text-sm truncate block">{item.locationOrUrl}</span>
              {item.roomType === 'VIRTUAL' && (
                <a
                  href={item.locationOrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Rejoindre la visio
                </a>
              )}
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Date & Durée</span>
              <span className="font-bold text-text-primary text-sm">{item.date}</span>
              <span className="text-xs text-text-secondary block mt-0.5 font-mono">{item.startTime} à {item.endTime}</span>
            </div>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-border">
            <span className="text-xs font-bold text-text-tertiary uppercase block mb-1">Ordre du Jour & Objectifs</span>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{item.agenda}</p>
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
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Réunions Virtuelles & Conseils</h1>
              <p className="text-sm text-text-secondary">
                Organisation des conseils de classe, réunions parents-professeurs et salons de visioconférence.
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
            Programmer une Réunion
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Réunions Programmées</span>
              <span className="text-2xl font-bold text-text-primary">{meetings.filter((m) => !m.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <Video className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Salons Visioconférence</span>
              <span className="text-2xl font-bold text-blue-600">
                {meetings.filter((m) => !m.isDeleted && m.roomType === 'VIRTUAL').length}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <ExternalLink className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Conseils de Classe</span>
              <span className="text-2xl font-bold text-purple-600">
                {meetings.filter((m) => !m.isDeleted && m.type === 'CLASS_COUNCIL').length}
              </span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total Participants Convoqués</span>
              <span className="text-2xl font-bold text-emerald-600">
                {meetings.filter((m) => !m.isDeleted).reduce((acc, curr) => acc + curr.participantsCount, 0)}
              </span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<MeetingItem>
        title={isTrashMode ? 'Corbeille des Réunions' : 'Calendrier des Réunions & Conseils'}
        data={filteredMeetings}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par titre, type, organisateur ou salle..."
        searchKeys={['title', 'type', 'organizer', 'locationOrUrl', 'date', 'agenda']}
        exportFilename={`reunions-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Calendrier des Réunions - BSofts School"
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
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand/10 text-brand border border-brand/20">
                  {item.roomType === 'VIRTUAL' ? 'VISIO' : 'PRÉSENTIEL'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm line-clamp-1 mb-1">{item.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">{item.agenda}</p>

              <div className="space-y-1 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Organisateur:</span>
                  <span className="font-medium text-text-primary truncate max-w-[140px]">{item.organizer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Lieu / Lien:</span>
                  <span className="font-mono text-brand truncate max-w-[140px]">{item.locationOrUrl}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Calendar className="w-3 h-3" />
                {item.date} ({item.startTime})
              </span>
              <span className="text-[10px] text-text-tertiary font-semibold">{item.participantsCount} part.</span>
            </div>
          </Card>
        )}
        actions={{
          onDelete: (row) => handleDelete(row, false),
          onRestore: (row) => handleRestore(row),
          onPermanentDelete: (row) => handleDelete(row, true),
        }}
        customFilters={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les types</option>
              <option value="CLASS_COUNCIL">Conseil de Classe</option>
              <option value="PARENT_TEACHER">Parents-Professeurs</option>
              <option value="PEDAGOGICAL">Comité Pédagogique</option>
              <option value="ADMINISTRATIVE">Commission Administrative</option>
            </select>
            <select
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les modalités</option>
              <option value="VIRTUAL">Visioconférence</option>
              <option value="PRESENTIAL">Présentiel</option>
            </select>
          </div>
        }
      />

      {/* Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Programmer une Nouvelle Réunion ou Conseil"
        size="6xl"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-6">
          {/* Section 1: Type & Modalité */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Video className="w-4 h-4 text-brand" />
              1. Typologie & Modalité de Réunion
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Type de Séance</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'PARENT_TEACHER' | 'CLASS_COUNCIL' | 'PEDAGOGICAL' | 'ADMINISTRATIVE',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="CLASS_COUNCIL">Conseil de Classe Trimestriel</option>
                  <option value="PARENT_TEACHER">Réunion Parents-Professeurs</option>
                  <option value="PEDAGOGICAL">Comité Pédagogique / Département</option>
                  <option value="ADMINISTRATIVE">Commission Administrative</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Modalité</label>
                <select
                  value={formData.roomType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roomType: e.target.value as 'VIRTUAL' | 'PRESENTIAL',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="VIRTUAL">Visioconférence en Ligne (Salon Virtuel)</option>
                  <option value="PRESENTIAL">Présentiel dans l’Établissement</option>
                </select>
              </div>
              <Input
                label="Lien Visio ou Salle de Réunion"
                value={formData.locationOrUrl}
                onChange={(e) => setFormData({ ...formData, locationOrUrl: e.target.value })}
                required
                placeholder="https://meet.bsofts.tn/... ou Salle 1"
              />
            </div>
          </div>

          {/* Section 2: Date, Horaires & Participants */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              2. Planification Temporelle & Convocations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Date de la Séance"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              <Input
                label="Heure de Début"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
              <Input
                label="Heure de Fin"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
              <Input
                label="Nombre de Participants Attendu"
                type="number"
                value={formData.participantsCount}
                onChange={(e) => setFormData({ ...formData, participantsCount: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 3: Titre & Ordre du Jour */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              3. Titre & Ordre du Jour
            </h4>
            <div className="space-y-4">
              <Input
                label="Intitulé de la Réunion"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ex: Conseil de Classe Trimestre 1 - 4ème Math"
              />
              <Textarea
                label="Ordre du Jour Détaillé & Points à l'Ordre"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                rows={4}
                required
                placeholder="Préciser les thématiques, bilans et décisions attendues..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Des invitations avec lien de visio seront envoyées automatiquement aux participants.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Valider et Programmer
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
