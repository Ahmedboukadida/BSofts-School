'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { AuditLogItem } from '@/types';

export default function SaaSAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: {
          action: actionFilter || undefined,
          entity: entityFilter || undefined,
        },
      }).catch(() => ({ data: { data: [] } }));

      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: AuditLogItem[] = list.map((l: any) => ({
        id: l.id || '',
        action: l.action || 'UPDATE',
        entity: l.entity || l.tableName || 'Système',
        entityId: l.entityId || l.recordId || '',
        actorName: l.actorName || l.userName || (l.user ? `${l.user.firstName} ${l.user.lastName}` : 'Utilisateur'),
        actorEmail: l.actorEmail || l.user?.email || '',
        actorRole: l.actorRole || l.userRole || 'USER',
        ipAddress: l.ipAddress || '127.0.0.1',
        userAgent: l.userAgent || '',
        oldValues: l.oldValues || null,
        newValues: l.newValues || null,
        createdAt: l.createdAt || new Date().toISOString(),
        createdBy: l.createdBy || l.userId || '',
      }));
      setLogs(mapped);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const getActionBadge = (action: AuditLogItem['action']) => {
    const map = {
      CREATE: { label: 'CRÉATION', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
      UPDATE: { label: 'MODIFICATION', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
      DELETE: { label: 'SUPPRESSION', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
      PERMANENT_DELETE: { label: 'PURGE ROOT (HARD)', color: 'bg-rose-500/15 text-rose-700 border-rose-300' },
      LOGIN: { label: 'CONNEXION', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
      LOGOUT: { label: 'DÉCONNEXION', color: 'bg-surface text-text-secondary border-border' },
      RESTORE: { label: 'RESTAURATION', color: 'bg-teal-500/10 text-teal-600 border-teal-200' },
    };
    const c = map[action] || { label: action, color: 'bg-surface text-text-secondary border-border' };
    return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${c.color}`}>{c.label}</span>;
  };

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      key: 'actorName',
      header: 'Auteur de l’Action (Composed)',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-text-primary text-xs">{row.actorName}</span>
              <span className="text-[10px] font-mono text-brand">(@{row.actorEmail.split('@')[0]})</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface border border-border-subtle font-mono text-text-secondary">
              [{row.actorRole}]
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Type d’Événement',
      render: (row) => getActionBadge(row.action),
    },
    {
      key: 'entity',
      header: 'Entité Modifiée',
      render: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-semibold text-text-primary block">{row.entity}</span>
          {row.entityId && (
            <span className="text-[10px] font-mono text-text-tertiary">ID: {row.entityId}</span>
          )}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'Traçabilité Réseau',
      render: (row) => (
        <div className="space-y-0.5 text-xs font-mono text-text-secondary">
          <p>{row.ipAddress || '127.0.0.1'}</p>
          <p className="text-[10px] text-text-tertiary truncate max-w-[200px]">{row.userAgent}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Horodatage',
      render: (row) => (
        <div className="text-xs text-text-secondary">
          <p className="font-medium text-text-primary">{new Date(row.createdAt).toLocaleDateString('fr-TN')}</p>
          <p className="text-[11px] font-mono text-text-tertiary">{new Date(row.createdAt).toLocaleTimeString('fr-TN')}</p>
        </div>
      ),
    },
  ];

  const renderDetailSections = (item: AuditLogItem): DetailSection[] => [
    {
      title: 'Identité de l’Opérateur & Contexte Réseau',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
            <span className="text-text-tertiary block">Opérateur Connecté</span>
            <p className="text-sm font-bold text-text-primary">
              {item.actorName} <span className="font-mono text-brand">(@{item.actorEmail})</span>
            </p>
            <p className="text-text-secondary">Rôle de sécurité : <span className="font-mono font-bold text-text-primary">[{item.actorRole}]</span></p>
            <div className="mt-2">{getActionBadge(item.action)}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs font-mono">
            <span className="text-text-tertiary block font-sans">Empreinte Système</span>
            <p>Adresse IP : <span className="text-brand font-bold">{item.ipAddress || 'Non capturée'}</span></p>
            <p className="text-[11px] text-text-secondary leading-relaxed break-all">Agent : {item.userAgent}</p>
            <p className="text-text-tertiary font-sans pt-1">Horodatage UTC : {new Date(item.createdAt).toISOString()}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Différence & Données Mutées (Payload)',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs font-bold text-rose-600 block mb-2 flex items-center gap-1">
              Valeurs Antérieures (Old State)
            </span>
            {item.oldValues ? (
              <pre className="p-3 bg-background rounded-lg border border-border text-[11px] font-mono text-text-secondary overflow-x-auto">
                {JSON.stringify(item.oldValues, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-text-tertiary italic">Aucun état antérieur (Nouvel enregistrement créé).</p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border">
            <span className="text-xs font-bold text-emerald-600 block mb-2 flex items-center gap-1">
              Nouvelles Valeurs (New State)
            </span>
            {item.newValues ? (
              <pre className="p-3 bg-background rounded-lg border border-border text-[11px] font-mono text-text-primary overflow-x-auto">
                {JSON.stringify(item.newValues, null, 2)}
              </pre>
            ) : (
              <p className="text-xs text-text-tertiary italic">Aucun nouvel état (Enregistrement détruit).</p>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-800 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Journal d’Audit & Sécurité</h1>
              <p className="text-sm text-text-secondary">
                Traçabilité immuable de toutes les actions, connexions, mutations de données et suppressions sur la plateforme.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={fetchAuditLogs}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Actualiser
          </Button>
        </div>
      </div>

      <DataTable<AuditLogItem>
        title="Piste d’Audit des Événements Applicatifs"
        data={logs}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par opérateur, email, IP ou entité modifiée..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'split']}
        detailModalSize="6xl"
        renderDetailSections={renderDetailSections}
        importExportEntityName="Audit_Logs_Security"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              aria-label="Filtrer par action"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les Actions</option>
              <option value="CREATE">Créations (CREATE)</option>
              <option value="UPDATE">Modifications (UPDATE)</option>
              <option value="DELETE">Suppressions (DELETE)</option>
              <option value="PERMANENT_DELETE">Purges Root (HARD)</option>
              <option value="LOGIN">Connexions (LOGIN)</option>
            </select>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              aria-label="Filtrer par entité"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Toutes les Entités</option>
              <option value="Student">Élèves (Student)</option>
              <option value="StudentPayment">Finance (PaymentReceipt)</option>
              <option value="ExamGrade">Notes & Examens</option>
              <option value="UserSession">Sessions Utilisateurs</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
