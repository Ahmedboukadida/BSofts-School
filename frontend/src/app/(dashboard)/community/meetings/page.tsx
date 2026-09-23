'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Video,
  Plus,
  Calendar,
  Users,
  Clock,
  RotateCcw,
  Building2,
  Trash2,
  Radio,
  Vote,
  Copy,
  Check,
  Search,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useEstablishmentStore } from '@/store/establishment-store';
import { useAuthStore } from '@/store/auth-store';
import type { MeetingItem, MeetingType, MeetingMode } from '@/types';

const MEETING_TYPE_LABELS: Record<string, string> = {
  GENERAL: 'Assemblée Générale',
  PARENT_TEACHER: 'Parents-Enseignants',
  STAFF: 'Réunion du Personnel',
  DISCIPLINE: 'Conseil de Discipline',
  PEDAGOGICAL: 'Conseil Pédagogique',
  BOARD: "Conseil d'Administration",
  CLASS_COUNCIL: 'Conseil de Classe',
  ADMINISTRATIVE: 'Réunion Administrative',
};

const MEETING_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GENERAL: { bg: 'bg-[#242F40]/10', text: 'text-[#242F40]', border: 'border-[#242F40]/20' },
  PARENT_TEACHER: { bg: 'bg-[#CCA43B]/10', text: 'text-[#CCA43B]', border: 'border-[#CCA43B]/30' },
  STAFF: { bg: 'bg-[#363636]/10', text: 'text-[#363636]', border: 'border-[#363636]/20' },
  DISCIPLINE: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20' },
  PEDAGOGICAL: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20' },
  BOARD: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20' },
  CLASS_COUNCIL: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20' },
  ADMINISTRATIVE: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500/20' },
};

export default function CommunityMeetingsPage() {
  const router = useRouter();
  const { currentEstablishmentId } = useEstablishmentStore();
  const { user: _user } = useAuthStore();

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [modeFilter, setModeFilter] = useState('ALL');

  // Create Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    subject: '',
    type: 'PEDAGOGICAL' as MeetingType,
    mode: 'ONLINE' as MeetingMode,
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    location: 'Visioconférence LiveKit HD',
    description: '',
    points: [{ title: 'Bilan pédagogique du trimestre', description: 'Évaluation des résultats et objectifs', isVote: false }],
    participants: [{ name: '', email: '', role: 'ATTENDEE' }],
  });

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 100 };
      if (currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all') {
        params.establishmentId = currentEstablishmentId;
      }
      const res = await api.get('/meetings', { params }).catch(() => ({ data: { data: [] } }));
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      setMeetings(list);
    } catch {
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentEstablishmentId]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const openCreateModal = () => {
    setFormError(null);
    setFormData({
      subject: '',
      type: 'PEDAGOGICAL',
      mode: 'ONLINE',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:30',
      duration: 90,
      location: 'Visioconférence LiveKit HD',
      description: '',
      points: [{ title: "Point d'ordre du jour", description: '', isVote: false }],
      participants: [{ name: '', email: '', role: 'ATTENDEE' }],
    });
    setIsFormModalOpen(true);
  };

  const handleAddPoint = () => {
    setFormData((prev) => ({
      ...prev,
      points: [...prev.points, { title: '', description: '', isVote: false }],
    }));
  };

  const handleRemovePoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index),
    }));
  };

  const handleAddParticipant = () => {
    setFormData((prev) => ({
      ...prev,
      participants: [...prev.participants, { name: '', email: '', role: 'ATTENDEE' }],
    }));
  };

  const handleRemoveParticipant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index),
    }));
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      setFormError('Le titre de la réunion est obligatoire');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        subject: formData.subject,
        type: formData.type,
        mode: formData.mode,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: Number(formData.duration) || 60,
        location: formData.location,
        description: formData.description,
        establishmentId: currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all'
          ? currentEstablishmentId
          : undefined,
        points: formData.points.filter((p) => p.title.trim().length > 0),
        participants: formData.participants.filter((p) => p.name.trim().length > 0 && p.email.trim().length > 0),
      };

      const res = await api.post('/meetings', payload);
      const created = res.data;
      setMeetings((prev) => [created, ...prev]);
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Erreur lors de la création de la réunion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (meeting: MeetingItem) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir archiver la réunion "${meeting.subject || meeting.title}" ?`)) return;
    try {
      await api.delete(`/meetings/${meeting.id}`);
      setMeetings((prev) => prev.filter((m) => m.id !== meeting.id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la suppression de la réunion");
    }
  };

  const openMeetingDetail = async (meeting: MeetingItem) => {
    try {
      const res = await api.get(`/meetings/${meeting.id}`);
      setSelectedMeeting(res.data);
    } catch {
      setSelectedMeeting(meeting);
    }
    setIsDetailModalOpen(true);
  };

  const copyMeetingLink = (id: string) => {
    const url = `${window.location.origin}/community/meetings/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filters
  const filteredMeetings = meetings.filter((m) => {
    const titleMatch = (m.subject || m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description || m.agenda || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!titleMatch) return false;
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    if (modeFilter !== 'ALL' && m.mode !== modeFilter) return false;
    return true;
  });

  // KPI Counters
  const totalCount = meetings.length;
  const liveCount = meetings.filter((m) => m.status === 'IN_PROGRESS').length;
  const scheduledCount = meetings.filter((m) => m.status === 'SCHEDULED').length;
  const onlineCount = meetings.filter((m) => m.mode === 'ONLINE' || m.mode === 'HYBRID').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E5E5] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#242F40]">Visioconférences & Réunions Scolaires</h1>
              <p className="text-xs text-[#363636]/70 mt-0.5">
                Salles WebRTC LiveKit Cloud, votes en séance et planification collégiale
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={fetchMeetings}
            variant="outline"
            className="border-[#E5E5E5] text-[#363636] hover:bg-[#E5E5E5]/30 text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Actualiser
          </Button>

          <Button
            onClick={openCreateModal}
            className="bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF] text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#CCA43B]" />
            Planifier une Réunion
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#242F40]/5 text-[#242F40] flex items-center justify-center">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#242F40]">{totalCount}</div>
            <div className="text-xs text-[#363636]/60">Total Réunions</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center relative">
            <Radio className="w-5 h-5" />
            {liveCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            )}
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{liveCount}</div>
            <div className="text-xs text-[#363636]/60">En Direct Actuellement</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#CCA43B]/10 text-[#CCA43B] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#242F40]">{scheduledCount}</div>
            <div className="text-xs text-[#363636]/60">À Venir / Programmées</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#242F40]">{onlineCount}</div>
            <div className="text-xs text-[#363636]/60">En Visioconférence</div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#363636]/40" />
            <input
              type="text"
              placeholder="Rechercher par sujet, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-hidden focus:border-[#242F40] text-[#363636]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636] focus:outline-hidden"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="IN_PROGRESS">En Direct (Live)</option>
              <option value="SCHEDULED">Prévue</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636] focus:outline-hidden"
            >
              <option value="ALL">Tous les types</option>
              <option value="PEDAGOGICAL">Conseil Pédagogique</option>
              <option value="PARENT_TEACHER">Parents-Enseignants</option>
              <option value="CLASS_COUNCIL">Conseil de Classe</option>
              <option value="STAFF">Réunion du Personnel</option>
              <option value="DISCIPLINE">Conseil de Discipline</option>
              <option value="BOARD">Conseil d&apos;Administration</option>
              <option value="GENERAL">Assemblée Générale</option>
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="text-xs px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636] focus:outline-hidden"
            >
              <option value="ALL">Toutes les modalités</option>
              <option value="ONLINE">Visioconférence (En ligne)</option>
              <option value="IN_PERSON">Présentiel</option>
              <option value="HYBRID">Hybride</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Meetings List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5]">
            <div className="w-8 h-8 border-2 border-[#242F40] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#363636]/60">Chargement des réunions en cours...</p>
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5]">
            <Video className="w-12 h-12 text-[#363636]/20 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#242F40]">Aucune réunion trouvée</h3>
            <p className="text-xs text-[#363636]/60 mt-1 max-w-sm mx-auto">
              Planifiez une nouvelle visioconférence ou modifiez vos critères de recherche.
            </p>
            <Button
              onClick={openCreateModal}
              className="mt-4 bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF] text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-[#CCA43B]" />
              Planifier une Réunion
            </Button>
          </div>
        ) : (
          filteredMeetings.map((meeting) => {
            const isLive = meeting.status === 'IN_PROGRESS';
            const isOnline = meeting.mode === 'ONLINE' || meeting.mode === 'HYBRID';
            const typeConfig = MEETING_TYPE_COLORS[meeting.type] || {
              bg: 'bg-[#242F40]/10',
              text: 'text-[#242F40]',
              border: 'border-[#242F40]/20',
            };
            const dateStr = meeting.date ? new Date(meeting.date).toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }) : 'Date non définie';

            const participantCount = meeting._count?.participants || meeting.participants?.length || meeting.participantsCount || 0;
            const pointsCount = meeting._count?.points || meeting.points?.length || 0;

            return (
              <Card
                key={meeting.id}
                className="p-5 bg-[#FFFFFF] border border-[#E5E5E5] hover:border-[#242F40]/30 transition-all rounded-2xl shadow-xs"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: Meeting Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                        isLive
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : isOnline
                          ? 'bg-[#242F40] text-[#CCA43B] border-[#242F40]'
                          : 'bg-[#363636]/10 text-[#363636] border-[#363636]/20'
                      }`}
                    >
                      {isLive ? <Radio className="w-6 h-6 animate-pulse" /> : <Video className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
                        >
                          {MEETING_TYPE_LABELS[meeting.type] || meeting.type}
                        </span>

                        {isLive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            EN DIRECT
                          </span>
                        )}

                        {meeting.status === 'SCHEDULED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            Prévue
                          </span>
                        )}

                        {meeting.status === 'COMPLETED' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#363636]/10 text-[#363636] border border-[#363636]/20">
                            Terminée
                          </span>
                        )}

                        <span className="text-[11px] text-[#363636]/50">
                          {isOnline ? 'Visioconférence WebRTC' : 'Présentiel'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#242F40] truncate">
                        {meeting.subject || meeting.title}
                      </h3>

                      <p className="text-xs text-[#363636]/70 line-clamp-1">
                        {meeting.description || meeting.agenda || 'Aucune description détaillée'}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#363636]/70 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#CCA43B]" />
                          <span>{dateStr}</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#363636]/50" />
                          <span>{meeting.startTime} {meeting.endTime ? `- ${meeting.endTime}` : ''} ({meeting.duration || 60}m)</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#363636]/50" />
                          <span>{participantCount} participant{participantCount > 1 ? 's' : ''}</span>
                        </div>

                        {pointsCount > 0 && (
                          <div className="flex items-center gap-1.5 text-[#242F40] font-medium">
                            <Vote className="w-3.5 h-3.5 text-[#CCA43B]" />
                            <span>{pointsCount} point{pointsCount > 1 ? 's' : ''} à l&apos;ordre du jour</span>
                          </div>
                        )}

                        {meeting.establishment?.name && (
                          <div className="flex items-center gap-1.5 text-xs text-[#363636]/60">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{meeting.establishment.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    {isOnline && meeting.status !== 'CANCELLED' && (
                      <Button
                        onClick={() => router.push(`/community/meetings/${meeting.id}`)}
                        className={`text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-xs ${
                          isLive
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-[#FFFFFF]'
                            : 'bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF]'
                        }`}
                      >
                        <Video className="w-4 h-4 text-[#CCA43B]" />
                        {isLive ? 'Rejoindre la Séance' : 'Entrer dans la Salle'}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => openMeetingDetail(meeting)}
                      className="border-[#E5E5E5] text-[#363636] hover:bg-[#E5E5E5]/40 text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Détails
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => copyMeetingLink(meeting.id)}
                      className="border-[#E5E5E5] text-[#363636] hover:bg-[#E5E5E5]/40 text-xs flex items-center gap-1.5"
                      title="Copier le lien d'invitation"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDeleteMeeting(meeting)}
                      className="border-red-200 text-red-600 hover:bg-red-50 text-xs"
                      title="Supprimer / Archiver"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Planifier une Réunion Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Planifier une Réunion & Visioconférence"
        size="2xl"
      >
        <form onSubmit={handleCreateMeeting} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Titre / Ordre du jour de la Réunion *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Ex: Conseil de classe - 4ème Année Mathématiques"
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Type de Réunion
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as MeetingType })}
                className="w-full text-xs px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636] focus:outline-hidden"
              >
                <option value="PEDAGOGICAL">Conseil Pédagogique</option>
                <option value="PARENT_TEACHER">Parents-Enseignants</option>
                <option value="CLASS_COUNCIL">Conseil de Classe</option>
                <option value="STAFF">Réunion du Personnel</option>
                <option value="DISCIPLINE">Conseil de Discipline</option>
                <option value="BOARD">Conseil d&apos;Administration</option>
                <option value="GENERAL">Assemblée Générale</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Modalité
              </label>
              <select
                value={formData.mode}
                onChange={(e) => {
                  const m = e.target.value as MeetingMode;
                  setFormData({
                    ...formData,
                    mode: m,
                    location: m === 'IN_PERSON' ? 'Salle de réunion' : 'Visioconférence LiveKit HD',
                  });
                }}
                className="w-full text-xs px-3 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636] focus:outline-hidden"
              >
                <option value="ONLINE">Visioconférence en ligne (LiveKit WebRTC)</option>
                <option value="IN_PERSON">Présentiel sur site</option>
                <option value="HYBRID">Hybride (En ligne + Présentiel)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Date de la séance *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#242F40] mb-1">
                  Début *
                </label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#242F40] mb-1">
                  Fin
                </label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Lieu ou URL de connexion
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Salle des professeurs ou LiveKit Room"
                className="text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#242F40] mb-1">
                Description & Objectifs
              </label>
              <Textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le contexte, les documents à préparer..."
                className="text-xs"
              />
            </div>
          </div>

          {/* Agenda Points (Ordre du jour) */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#242F40] flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-[#CCA43B]" />
                Points à l&apos;ordre du jour &amp; Résolutions
              </label>
              <button
                type="button"
                onClick={handleAddPoint}
                className="text-[11px] font-semibold text-[#242F40] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#CCA43B]" />
                Ajouter un point
              </button>
            </div>

            {formData.points.map((point, index) => (
              <div key={index} className="p-3 bg-[#F8F9FA] border border-[#E5E5E5] rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={`Point ${index + 1} (ex: Approbation des notes trimestrielles)`}
                    value={point.title}
                    onChange={(e) => {
                      const updated = [...formData.points];
                      updated[index].title = e.target.value;
                      setFormData({ ...formData, points: updated });
                    }}
                    className="text-xs flex-1 bg-[#FFFFFF]"
                  />
                  {formData.points.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(index)}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Input
                    placeholder="Description / précisions (facultatif)"
                    value={point.description || ''}
                    onChange={(e) => {
                      const updated = [...formData.points];
                      updated[index].description = e.target.value;
                      setFormData({ ...formData, points: updated });
                    }}
                    className="text-[11px] flex-1 mr-3 bg-[#FFFFFF]"
                  />

                  <label className="flex items-center gap-1.5 text-xs text-[#363636] shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={point.isVote}
                      onChange={(e) => {
                        const updated = [...formData.points];
                        updated[index].isVote = e.target.checked;
                        setFormData({ ...formData, points: updated });
                      }}
                      className="rounded border-[#E5E5E5] text-[#242F40] focus:ring-0"
                    />
                    <span>Soumis au vote</span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Participants */}
          <div className="border-t border-[#E5E5E5] pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#242F40] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#CCA43B]" />
                Participants invités
              </label>
              <button
                type="button"
                onClick={handleAddParticipant}
                className="text-[11px] font-semibold text-[#242F40] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-[#CCA43B]" />
                Ajouter un invité
              </button>
            </div>

            {formData.participants.map((p, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    placeholder="Nom complet"
                    value={p.name}
                    onChange={(e) => {
                      const updated = [...formData.participants];
                      updated[index].name = e.target.value;
                      setFormData({ ...formData, participants: updated });
                    }}
                    className="text-xs bg-[#FFFFFF]"
                  />
                </div>
                <div className="col-span-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={p.email}
                    onChange={(e) => {
                      const updated = [...formData.participants];
                      updated[index].email = e.target.value;
                      setFormData({ ...formData, participants: updated });
                    }}
                    className="text-xs bg-[#FFFFFF]"
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={p.role}
                    onChange={(e) => {
                      const updated = [...formData.participants];
                      updated[index].role = e.target.value;
                      setFormData({ ...formData, participants: updated });
                    }}
                    className="w-full text-xs px-2 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg text-[#363636]"
                  >
                    <option value="ATTENDEE">Participant</option>
                    <option value="MODERATOR">Modérateur</option>
                    <option value="PRESENTER">Présentateur</option>
                  </select>
                </div>
                <div className="col-span-1 text-right">
                  {formData.participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(index)}
                      className="text-red-500 hover:text-red-700 text-xs p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E5E5E5] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
              className="text-xs border-[#E5E5E5]"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF] text-xs font-semibold px-5"
            >
              {isSubmitting ? 'Planification en cours...' : 'Planifier la Réunion'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Détails Réunion Modal */}
      {selectedMeeting && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Détails de la Réunion : ${selectedMeeting.subject || selectedMeeting.title}`}
          size="xl"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#242F40]/10 text-[#242F40]">
                {MEETING_TYPE_LABELS[selectedMeeting.type] || selectedMeeting.type}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                {selectedMeeting.status}
              </span>
              <span className="text-xs text-[#363636]/60">
                {selectedMeeting.mode}
              </span>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E5E5] space-y-2">
              <div className="text-xs text-[#363636]/70">
                <span className="font-semibold text-[#242F40]">Date & Heure : </span>
                {selectedMeeting.date ? new Date(selectedMeeting.date).toLocaleDateString('fr-FR') : ''} à {selectedMeeting.startTime}
              </div>
              <div className="text-xs text-[#363636]/70">
                <span className="font-semibold text-[#242F40]">Lieu / Salle : </span>
                {selectedMeeting.location}
              </div>
              {selectedMeeting.description && (
                <div className="text-xs text-[#363636]/80 pt-1">
                  <span className="font-semibold text-[#242F40]">Description : </span>
                  {selectedMeeting.description}
                </div>
              )}
            </div>

            {/* Agenda points */}
            {selectedMeeting.points && selectedMeeting.points.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#242F40] uppercase tracking-wider">
                  Ordre du Jour ({selectedMeeting.points.length})
                </h4>
                <div className="space-y-2">
                  {selectedMeeting.points.map((pt, idx) => (
                    <div key={idx} className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#242F40]">
                          {idx + 1}. {pt.title}
                        </span>
                        {pt.isVote && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CCA43B]/15 text-[#CCA43B]">
                            Vote Délibératif
                          </span>
                        )}
                      </div>
                      {pt.description && <p className="text-[11px] text-[#363636]/70">{pt.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Participants */}
            {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#242F40] uppercase tracking-wider">
                  Participants ({selectedMeeting.participants.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedMeeting.participants.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-[#242F40]">{p.name}</div>
                        <div className="text-[10px] text-[#363636]/60">{p.email}</div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#242F40]/10 text-[#242F40]">
                        {p.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4">
              <Button
                variant="outline"
                onClick={() => copyMeetingLink(selectedMeeting.id)}
                className="text-xs flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Lien Copié !' : 'Copier le Lien Direct'}
              </Button>

              {(selectedMeeting.mode === 'ONLINE' || selectedMeeting.mode === 'HYBRID') && (
                <Button
                  onClick={() => router.push(`/community/meetings/${selectedMeeting.id}`)}
                  className="bg-[#242F40] hover:bg-[#363636] text-[#FFFFFF] text-xs font-bold flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-[#CCA43B]" />
                  Rejoindre la Réunion Live
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
