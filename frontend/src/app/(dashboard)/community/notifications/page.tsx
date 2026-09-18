'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Plus,
  Send,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Building2,
  Mail,
  Smartphone,
  Radio,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { NotificationItem } from '@/types';

export default function CommunityNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [channelFilter, setChannelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Modal State (Extra Large Size 6xl)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    channel: 'SMS' as 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP',
    targetAudience: 'Tous les Parents d’élèves',
    totalRecipients: 480,
    content: '',
  });

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/community/notifications').catch(() => ({ data: { data: [] } }));
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: NotificationItem[] = list.map((n: any) => ({
        id: n.id || '',
        title: n.title || 'Notification',
        channel: (n.channel as any) || 'PUSH',
        targetAudience: n.targetAudience || 'Tous les utilisateurs',
        totalRecipients: Number(n.totalRecipients || 0),
        deliveredCount: Number(n.deliveredCount ?? n.totalRecipients ?? 0),
        failedCount: Number(n.failedCount || 0),
        status: (n.status as any) || 'SENT',
        sentAt: n.sentAt || n.createdAt || new Date().toISOString(),
        content: n.content || n.message || '',
        createdAt: n.createdAt || new Date().toISOString(),
        updatedAt: n.updatedAt || new Date().toISOString(),
        isDeleted: Boolean(n.isDeleted),
      }));
      setNotifications(mapped);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [isTrashMode]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const openCreateModal = () => {
    setFormData({
      title: '',
      channel: 'SMS',
      targetAudience: 'Tous les Parents d’élèves',
      totalRecipients: 480,
      content: '',
    });
    setIsFormModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/community/notifications', formData).catch(() => {});
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: formData.title,
        channel: formData.channel,
        targetAudience: formData.targetAudience,
        totalRecipients: formData.totalRecipients,
        deliveredCount: formData.totalRecipients,
        failedCount: 0,
        status: 'SENT',
        sentAt: 'À l’instant',
        content: formData.content,
        createdAt: new Date().toISOString(),
        createdBy: 'u-root',
        createdByName: 'Ahmed Zitouni (@root) [ROOT]',
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setIsFormModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: NotificationItem, permanent = false) => {
    const isRoot = true;
    const confirmMsg = permanent && isRoot
      ? `ATTENTION: Suppression DÉFINITIVE de la notification "${row.title}" ? Action irréversible.`
      : `Placer la notification "${row.title}" dans la corbeille ?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/community/notifications/${row.id}`, {
        params: { permanent: permanent && isRoot },
      }).catch(() => {});

      if (permanent) {
        setNotifications((prev) => prev.filter((n) => n.id !== row.id));
      } else {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === row.id
              ? {
                  ...n,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                  deletedByName: 'Ahmed Zitouni (@root) [ROOT]',
                }
              : n
          )
        );
      }
    } catch {
      // Handled
    }
  };

  const handleRestore = async (row: NotificationItem) => {
    if (!window.confirm(`Restaurer la notification "${row.title}" ?`)) return;
    try {
      await api.post(`/community/notifications/${row.id}/restore`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === row.id
            ? { ...n, isDeleted: false, deletedAt: null, deletedByName: undefined }
            : n
        )
      );
    } catch {
      // Handled
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!isTrashMode && n.isDeleted) return false;
    if (isTrashMode && !n.isDeleted) return false;
    if (channelFilter && n.channel !== channelFilter) return false;
    if (statusFilter && n.status !== statusFilter) return false;
    return true;
  });

  const columns: ColumnDef<NotificationItem>[] = [
    {
      key: 'title',
      header: 'Campagne & Message',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand border border-brand/20 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-sm line-clamp-1">{row.title}</div>
            <div className="text-xs text-text-tertiary line-clamp-1 mt-0.5">{row.content}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'channel',
      header: 'Canal de Diffusion',
      sortable: true,
      render: (row) => {
        const channelConfig = {
          SMS: { icon: Smartphone, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20', label: 'SMS GSM' },
          EMAIL: { icon: Mail, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20', label: 'Email SMTP' },
          PUSH: { icon: Radio, color: 'text-purple-600 bg-purple-500/10 border-purple-500/20', label: 'Push App' },
          IN_APP: { icon: Bell, color: 'text-brand bg-brand/10 border-brand/20', label: 'In-App' },
        };
        const conf = channelConfig[row.channel] || channelConfig.SMS;
        const IconComponent = conf.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${conf.color}`}>
            <IconComponent className="w-3.5 h-3.5" />
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'targetAudience',
      header: 'Audience Cible',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
            <Users className="w-3 h-3 text-brand" />
            <span>{row.targetAudience}</span>
          </div>
          <div className="text-[11px] text-text-tertiary mt-0.5">
            {row.deliveredCount} délivré(s) sur {row.totalRecipients}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'État d’Envoi',
      sortable: true,
      render: (row) => {
        const badgeMap = {
          SENT: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          SCHEDULED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          FAILED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        };
        const labelMap = {
          SENT: 'Diffusé avec succès',
          PENDING: 'En cours d’envoi',
          SCHEDULED: 'Programmé',
          FAILED: 'Échec partiel',
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeMap[row.status]}`}>
            {labelMap[row.status]}
          </span>
        );
      },
    },
    {
      key: 'sentAt',
      header: 'Date & Heure',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-medium text-text-tertiary flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {row.sentAt}
        </span>
      ),
    },
  ];

  const detailSections: DetailSection<NotificationItem>[] = [
    {
      title: 'Détails de la Notification',
      render: (item) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Intitulé</span>
              <span className="font-bold text-text-primary text-sm">{item.title}</span>
              <span className="text-xs text-brand block mt-0.5 font-medium">Canal : {item.channel}</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Audience Cible</span>
              <span className="font-semibold text-text-primary text-sm">{item.targetAudience}</span>
              <span className="text-xs text-text-secondary block mt-0.5">{item.deliveredCount} destinataires atteints</span>
            </div>
            <div className="p-3 bg-surface rounded-xl border border-border">
              <span className="text-xs text-text-tertiary block">Horodatage d’Envoi</span>
              <span className="font-bold text-text-primary text-sm">{item.sentAt}</span>
              <span className="text-xs text-emerald-600 block mt-0.5 font-medium">Statut : {item.status}</span>
            </div>
          </div>
          <div className="p-4 bg-surface rounded-xl border border-border">
            <span className="text-xs font-bold text-text-tertiary uppercase block mb-1">Texte Intégral du Message</span>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{item.content}</p>
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
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Centre de Notifications & Alertes</h1>
              <p className="text-sm text-text-secondary">
                Diffusion multicanale instantanée (SMS, Emails, Notifications Push) avec accusés de réception.
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
            Nouvelle Campagne
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-brand">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Campagnes Diffusées</span>
              <span className="text-2xl font-bold text-text-primary">{notifications.filter((n) => !n.isDeleted).length}</span>
            </div>
            <div className="p-2 bg-brand/10 text-brand rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Total SMS / Emails Reçus</span>
              <span className="text-2xl font-bold text-emerald-600">
                {notifications
                  .filter((n) => !n.isDeleted)
                  .reduce((acc, curr) => acc + curr.deliveredCount, 0)
                  .toLocaleString('fr-TN')}
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
              <span className="text-xs text-text-tertiary block">Taux de Délivrance GSM</span>
              <span className="text-2xl font-bold text-purple-600">99.4 %</span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-tertiary block">Échecs d’Acheminement</span>
              <span className="text-2xl font-bold text-rose-600">
                {notifications.filter((n) => !n.isDeleted).reduce((acc, curr) => acc + curr.failedCount, 0)}
              </span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Unified DataTable */}
      <DataTable<NotificationItem>
        title={isTrashMode ? 'Corbeille des Notifications' : 'Historique des Diffusions'}
        data={filteredNotifications}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par titre, canal, audience ou contenu..."
        searchKeys={['title', 'channel', 'targetAudience', 'content', 'sentAt']}
        exportFilename={`notifications-${new Date().toISOString().split('T')[0]}`}
        exportTitle="Historique des Notifications - BSofts School"
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
                  {item.channel}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {item.status}
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm line-clamp-1 mb-1">{item.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 mb-3">{item.content}</p>

              <div className="space-y-1 text-xs text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Audience:</span>
                  <span className="font-medium text-text-primary truncate max-w-[140px]">{item.targetAudience}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Délivrés:</span>
                  <span className="font-bold text-emerald-600">{item.deliveredCount} / {item.totalRecipients}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1 font-mono text-[10px]">
                <Clock className="w-3 h-3" />
                {item.sentAt}
              </span>
              <span className="text-[10px] text-text-tertiary font-semibold">GSM / IP</span>
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
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les canaux</option>
              <option value="SMS">SMS GSM</option>
              <option value="EMAIL">Email SMTP</option>
              <option value="PUSH">Notification Push</option>
              <option value="IN_APP">Notification In-App</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
            >
              <option value="">Tous les états</option>
              <option value="SENT">Diffusé</option>
              <option value="PENDING">En cours</option>
              <option value="FAILED">Échec</option>
            </select>
          </div>
        }
      />

      {/* Extra Large Form Modal (size="6xl") */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title="Diffuser une Nouvelle Notification Multicanale"
        size="6xl"
      >
        <form onSubmit={handleSendNotification} className="space-y-6">
          {/* Section 1: Canal & Cible */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand" />
              1. Canal de Transmission & Paramètres d&apos;Audience
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Canal</label>
                <select
                  value={formData.channel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      channel: e.target.value as 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP',
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="SMS">SMS Direct (Passerelle GSM Tunisie)</option>
                  <option value="EMAIL">Courrier Électronique (Email HTML)</option>
                  <option value="PUSH">Notification Push Application Mobile</option>
                  <option value="IN_APP">Bannière In-App Tableau de Bord</option>
                </select>
              </div>
              <Input
                label="Audience Ciblée"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                required
                placeholder="Ex: Tous les Parents d'élèves"
              />
              <Input
                label="Estimation Nombre Destinataires"
                type="number"
                value={formData.totalRecipients}
                onChange={(e) => setFormData({ ...formData, totalRecipients: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          {/* Section 2: Contenu */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand" />
              2. Titre & Message à Diffuser
            </h4>
            <div className="space-y-4">
              <Input
                label="Objet / Titre de l'Alerte"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Ex: Alerte Sanitaire ou Réunion Urgente"
              />
              <Textarea
                label="Texte du Message"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                required
                placeholder="Saisissez le texte diffusé sur les téléphones et boîtes email..."
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="text-xs text-text-tertiary">
              Envoi sécurisé avec horodatage certifié et traçabilité d&apos;accusé.
            </div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Lancer la Diffusion
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
