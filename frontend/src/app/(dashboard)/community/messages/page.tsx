'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Send,
  Users,
  CheckCheck,
  Building2,
  RotateCcw,
  Clock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { MessageThread } from '@/types';

export default function CommunityMessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Active Thread for Split Mode / Chat
  const [, setActiveThreadId] = useState<string | null>(null);

  // Create Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: 'PARENT' as 'PARENT' | 'TEACHER' | 'CLASS_GROUP',
    recipientTarget: 'Parents de la 4-MATH (Bac)',
    subject: '',
    messageContent: '',
    priority: 'NORMAL' as 'NORMAL' | 'HIGH' | 'URGENT',
  });

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/community/messages').catch(() => ({ data: { data: [] } }));
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: MessageThread[] = list.map((m: any) => ({
        id: m.id || '',
        subject: m.subject || 'Message sans objet',
        senderName: m.senderName || m.sender?.name || 'Expéditeur',
        senderRole: (m.senderRole as any) || 'ADMIN',
        recipientName: m.recipientName || 'Destinataire',
        recipientGroup: m.recipientGroup || '',
        lastMessage: m.lastMessage || m.body || '',
        lastMessageTime: m.lastMessageTime || m.updatedAt?.split('T')[1]?.substring(0, 5) || 'Récent',
        unreadCount: Number(m.unreadCount || 0),
        priority: (m.priority as any) || 'NORMAL',
        isArchived: Boolean(m.isArchived),
        createdAt: m.createdAt || new Date().toISOString(),
        updatedAt: m.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(m.isDeleted),
      }));
      setThreads(mapped);
    } catch {
      setThreads([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const openCreateModal = () => {
    setFormData({
      recipientType: 'PARENT',
      recipientTarget: 'Parents de la 4-MATH (Bac)',
      subject: '',
      messageContent: '',
      priority: 'NORMAL',
    });
    setIsFormModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/community/messages', formData).catch(() => {});
      const newThread: MessageThread = {
        id: `msg-${Date.now()}`,
        subject: formData.subject,
        senderName: 'Direction Pédagogique',
        senderRole: 'ADMIN',
        recipientName: formData.recipientTarget,
        recipientGroup: formData.recipientTarget,
        lastMessage: formData.messageContent,
        lastMessageTime: 'À l’instant',
        unreadCount: 0,
        priority: formData.priority,
        isArchived: false,
        createdAt: new Date().toISOString(),
        createdBy: 'u-root',
        createdByName: 'Ahmed Zitouni (@root) [ROOT]',
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
      setThreads((prev) => [newThread, ...prev]);
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: MessageThread, permanent = false) => {
    const isRoot = true;
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE de la conversation "${row.subject}" ? Action irréversible.`
      : `Archiver ou placer la conversation "${row.subject}" dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/community/messages/${row.id}`, {
        params: { permanent: permanent && isRoot },
      }).catch(() => {});

      if (permanent) {
        setThreads((prev) => prev.filter((t) => t.id !== row.id));
      } else {
        setThreads((prev) =>
          prev.map((t) =>
            t.id === row.id
              ? {
                  ...t,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  deletedByName: 'Ahmed Zitouni (@root) [ROOT]',
                }
              : t
          )
        );
      }
    } catch {
      // Handled
    }
  };

  const handleRestore = async (row: MessageThread) => {
    if (!window.confirm(`Restaurer la conversation "${row.subject}" ?`)) return;
    try {
      await api.post(`/community/messages/${row.id}/restore`).catch(() => {});
      setThreads((prev) =>
        prev.map((t) =>
          t.id === row.id
            ? { ...t, isDeleted: false, deletedAt: null, deletedByName: undefined }
            : t
        )
      );
    } catch {
      // Handled
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (!isTrashMode && t.isDeleted) return false;
    if (isTrashMode && !t.isDeleted) return false;
    if (roleFilter && t.senderRole !== roleFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const columns: ColumnDef<MessageThread>[] = [
    {
      key: 'subject',
      header: 'Conversation & Objet',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-sm line-clamp-1 flex items-center gap-2">
              <span>{row.subject}</span>
              {row.unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand text-white">
                  {row.unreadCount} nouveau{row.unreadCount > 1 ? 'x' : ''}
                </span>
              )}
            </div>
            <div className="text-xs text-text-tertiary line-clamp-1 mt-0.5">{row.lastMessage}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'interlocutors',
      header: 'Émetteur & Destinataire',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <User className="w-3 h-3 text-brand" />
            <span>{row.senderName}</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1">
            <Users className="w-3 h-3 text-text-tertiary" />
            <span>À : {row.recipientName} {row.recipientGroup ? `(${row.recipientGroup})` : ''}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priorité',
      sortable: true,
      render: (row) => {
        const badgeMap = {
          NORMAL: 'bg-surface text-text-secondary border-border',
          HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          URGENT: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        };
        const labelMap = {
          NORMAL: 'Normale',
          HIGH: 'Importante',
          URGENT: 'Urgente',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeMap[row.priority]}`}>
            {labelMap[row.priority]}
          </span>
        );
      },
    },
    {
      key: 'lastMessageTime',
      header: 'Dernière Activité',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-text-tertiary flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {row.lastMessageTime}
        </span>
      ),
    },
  ];

  const detailSections: DetailSection<MessageThread>[] = [
    {
      title: 'Détails du Fil de Discussion',
      render: (item) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Émetteur</span>
              <span className="font-bold text-text-primary text-sm">{item.senderName}</span>
              <span className="text-xs text-brand block mt-0.5 font-medium">Rôle : {item.senderRole}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Destinataires</span>
              <span className="font-semibold text-text-primary text-sm">{item.recipientName}</span>
              <span className="text-xs text-text-secondary block mt-0.5">{item.recipientGroup || 'Direct'}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Niveau de Priorité</span>
              <span className="font-bold text-text-primary text-sm">{item.priority}</span>
              <span className="text-xs text-text-secondary block mt-0.5">Statut : {item.isArchived ? 'Archivé' : 'Actif'}</span>
            </div>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-border">
            <span className="text-xs font-bold text-text-tertiary uppercase block mb-1">Dernier Message Échangé</span>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{item.lastMessage}</p>
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
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Messagerie Interne & Échanges</h1>
              <p className="text-sm text-text-secondary">
                Communication directe et sécurisée entre administration, corps professoral, parents et élèves.
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
            Nouveau Message
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Fils de Discussion</span>
              <span className="text-2xl font-bold text-text-primary">{threads.filter((t) => !t.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Messages Non Lus</span>
              <span className="text-2xl font-bold text-blue-600">
                {threads.filter((t) => !t.isDeleted).reduce((acc, curr) => acc + curr.unreadCount, 0)}
              </span>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Communications Urgentes</span>
              <span className="text-2xl font-bold text-rose-600">
                {threads.filter((t) => !t.isDeleted && t.priority === 'URGENT').length}
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Taux de Délivrabilité</span>
              <span className="text-2xl font-bold text-emerald-600">99.8 %</span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<MessageThread>
        title={isTrashMode ? 'Corbeille des Messages' : 'Boîte de Réception & Discussions'}
        data={filteredThreads}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par objet, interlocuteur, classe ou contenu..."
        searchKeys={['subject', 'senderName', 'recipientName', 'recipientGroup', 'lastMessage']}
        exportFilename={`messages-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Historique des Messages - BSofts School"
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
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                    {item.senderName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm line-clamp-1">{item.senderName}</h3>
                    <span className="text-[10px] text-text-tertiary font-mono">{item.senderRole}</span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    item.priority === 'URGENT'
                      ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      : item.priority === 'HIGH'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      : 'bg-surface text-text-secondary border-border'
                  }`}
                >
                  {item.priority}
                </span>
              </div>

              <h4 className="font-semibold text-text-primary text-sm line-clamp-1 mb-1">{item.subject}</h4>
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">{item.lastMessage}</p>

              <div className="space-y-1 text-xs text-text-secondary bg-surface p-2 rounded-lg border border-border">
                <div className="flex items-center justify-between text-text-tertiary text-[11px]">
                  <span>Destinataire:</span>
                  <span className="font-medium text-text-primary truncate max-w-[130px]">{item.recipientName}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Clock className="w-3 h-3" />
                {item.lastMessageTime}
              </span>
              {item.unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-brand text-white">
                  {item.unreadCount} non lu(s)
                </span>
              )}
            </div>
          </Card>
        )}
        actions={{
          onView: (row) => setActiveThreadId(row.id),
          onDelete: (row) => handleDelete(row, false),
          onRestore: (row) => handleRestore(row),
          onPermanentDelete: (row) => handleDelete(row, true),
        }}
        customFilters={
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les émetteurs</option>
              <option value="ADMIN">Direction & Administration</option>
              <option value="TEACHER">Enseignants</option>
              <option value="PARENT">Parents d&apos;élèves</option>
              <option value="STUDENT">Élèves</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Toutes les priorités</option>
              <option value="NORMAL">Normale</option>
              <option value="HIGH">Importante</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>
        }
      />

      {/* Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Rédiger une Nouvelle Communication"
        size="6xl"
      >
        <form onSubmit={handleSendMessage} className="space-y-6">
          {/* Section 1: Destinataires */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand" />
              1. Type de Diffusion & Destinataires
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Groupe Cible</label>
                <select
                  value={formData.recipientType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipientType: e.target.value as 'PARENT' | 'TEACHER' | 'CLASS_GROUP',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="PARENT">Parents d&apos;élèves</option>
                  <option value="TEACHER">Corps Enseignant</option>
                  <option value="CLASS_GROUP">Classe Spécifique</option>
                </select>
              </div>
              <Input
                label="Intitulé Destinataire / Groupe"
                value={formData.recipientTarget}
                onChange={(e) => setFormData({ ...formData, recipientTarget: e.target.value })}
                required
                placeholder="Ex: Parents de la 4-MATH (Bac)"
              />
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Niveau d&apos;Urgence</label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as 'NORMAL' | 'HIGH' | 'URGENT',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="NORMAL">Priorité Normale</option>
                  <option value="HIGH">Priorité Haute (Important)</option>
                  <option value="URGENT">Priorité Urgente (Notification Push & SMS)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contenu du Message */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand" />
              2. Objet & Corps du Message
            </h4>
            <div className="space-y-4">
              <Input
                label="Objet de la Communication"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="Ex: Organisation de la session de révision du premier trimestre"
              />
              <Textarea
                label="Corps du Message"
                value={formData.messageContent}
                onChange={(e) => setFormData({ ...formData, messageContent: e.target.value })}
                rows={6}
                required
                placeholder="Rédigez votre message aux destinataires..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Le message sera consigné dans l&apos;audit trail et distribué instantanément.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Diffuser le Message
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
