'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AlertOctagon,
  RefreshCw,
  Bug,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, ColumnDef, DetailSection } from '@/components/ui/data-table';
import api from '@/lib/api';
import type { SystemLogItem } from '@/types';

export default function SaaSSystemLogsPage() {
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSystemLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/system-logs', {
        params: {
          level: levelFilter || undefined,
          resolved: statusFilter === 'resolved' ? true : statusFilter === 'unresolved' ? false : undefined,
        },
      }).catch(() => ({ data: { data: [] } }));
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const mapped: SystemLogItem[] = list.map((l: any) => ({
        id: l.id || '',
        level: l.level || 'ERROR',
        service: l.service || 'System',
        message: l.message || '',
        statusCode: Number(l.statusCode || 500),
        endpoint: l.endpoint || '',
        tenantName: l.tenantName || l.tenant?.name || '',
        stackTrace: l.stackTrace || '',
        resolved: Boolean(l.resolved),
        resolvedBy: l.resolvedBy || '',
        resolvedAt: l.resolvedAt || null,
        createdAt: l.createdAt || new Date().toISOString(),
      }));
      setLogs(mapped);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [levelFilter, statusFilter]);

  useEffect(() => {
    fetchSystemLogs();
  }, [fetchSystemLogs]);

  // Mark resolved
  const handleMarkResolved = async (item: SystemLogItem) => {
    try {
      await api.patch(`/system-logs/${item.id}/resolve`, {
        resolvedBy: 'Ahmed Zitouni (@root) [ROOT]',
      }).catch(() => {});

      setLogs((prev) =>
        prev.map((l) =>
          l.id === item.id
            ? {
                ...l,
                resolved: true,
                resolvedBy: 'Ahmed Zitouni (@root) [ROOT]',
                resolvedAt: new Date().toISOString(),
              }
            : l
        )
      );
    } catch {
      // Handled
    }
  };

  const getLevelBadge = (level: SystemLogItem['level']) => {
    const map = {
      FATAL: { label: 'CRITIQUE / FATAL', color: 'bg-rose-600 text-white font-extrabold shadow-2xs', icon: AlertOctagon },
      ERROR: { label: 'ERREUR SERVEUR', color: 'bg-rose-500/10 text-rose-600 border border-rose-200 font-bold', icon: Bug },
      WARN: { label: 'AVERTISSEMENT', color: 'bg-amber-500/10 text-amber-600 border border-amber-200 font-semibold', icon: AlertTriangle },
      INFO: { label: 'INFORMATION', color: 'bg-blue-500/10 text-blue-600 border border-blue-200 font-medium', icon: Info },
    };
    const c = map[level] || { label: level, color: 'bg-surface text-text-secondary border-border', icon: Info };
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const filteredLogs = logs.filter((l) => {
    if (levelFilter && l.level !== levelFilter) return false;
    if (statusFilter && (statusFilter === 'resolved' ? !l.resolved : l.resolved)) return false;
    return true;
  });

  const columns: ColumnDef<SystemLogItem>[] = [
    {
      key: 'service',
      header: 'Composant / Service Défaillant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 border border-[#363636]">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-text-primary block">{row.service}</span>
            {row.tenantName && (
              <span className="text-[11px] text-text-secondary">{row.tenantName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Gravité',
      render: (row) => getLevelBadge(row.level),
    },
    {
      key: 'message',
      header: 'Message d’Erreur Système',
      render: (row) => (
        <div className="space-y-0.5 max-w-[340px]">
          <p className="text-xs font-semibold text-rose-600 line-clamp-1">{row.message}</p>
          {row.endpoint && (
            <p className="text-[10px] font-mono text-text-tertiary truncate">
              {row.statusCode ? `[HTTP ${row.statusCode}] ` : ''}{row.endpoint}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'resolved',
      header: 'Prise en Charge',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              row.resolved
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
                : 'bg-rose-500/10 text-rose-600 border border-rose-200'
            }`}
          >
            {row.resolved ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            {row.resolved ? 'Résolu' : 'En Attente'}
          </span>

          {!row.resolved && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleMarkResolved(row)}
              className="h-6 text-[10px] px-2"
            >
              <Check className="w-3 h-3 mr-0.5" />
              Résoudre
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Survenu à',
      render: (row) => (
        <div className="text-xs text-text-secondary">
          <p className="font-medium text-text-primary">{new Date(row.createdAt).toLocaleDateString('fr-TN')}</p>
          <p className="text-[11px] font-mono text-text-tertiary">{new Date(row.createdAt).toLocaleTimeString('fr-TN')}</p>
        </div>
      ),
    },
  ];

  const renderDetailSections = (item: SystemLogItem): DetailSection[] => [
    {
      title: 'Détail de la Panne & Contexte Opérationnel',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
            <span className="text-text-tertiary block">Service & Point d’Accès</span>
            <p className="text-base font-mono font-bold text-rose-600">{item.service}</p>
            <p className="text-text-primary font-mono">{item.endpoint || 'Opération en tâche de fond'}</p>
            <div className="mt-2 flex items-center gap-2">
              {getLevelBadge(item.level)}
              {item.statusCode && (
                <span className="px-2 py-0.5 bg-background rounded text-xs font-mono font-bold">
                  Code: {item.statusCode}
                </span>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs">
            <span className="text-text-tertiary block">Statut de Traitement</span>
            <p className="text-sm font-semibold text-text-primary">
              {item.resolved ? 'Incident clôturé par l’équipe technique' : 'Non résolu — Nécessite inspection'}
            </p>
            {item.resolvedBy && (
              <p className="text-text-secondary">
                Résolu par : <span className="font-semibold text-text-primary">{item.resolvedBy}</span>
              </p>
            )}
            <p className="text-text-tertiary">
              Établissement affecté : {item.tenantName || 'Infrastructure Globale'}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Trace d’Exécution (Stack Trace / Debug Payload)',
      content: (
        <div className="space-y-2">
          <div className="p-3 bg-surface rounded-xl border border-border text-xs text-rose-600 font-semibold leading-relaxed">
            {item.message}
          </div>
          {item.stackTrace && (
            <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono overflow-x-auto leading-relaxed max-h-72">
              {item.stackTrace}
            </pre>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Journal des Défaillances & Pannes Système</h1>
              <p className="text-sm text-text-secondary">
                Monitoring en temps réel des erreurs non traitées, déconnexions de base de données et pannes opérationnelles.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={fetchSystemLogs}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Actualiser les Pannes
          </Button>
        </div>
      </div>

      <DataTable<SystemLogItem>
        title="Journal des Incidents & Exceptions Système"
        data={filteredLogs}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par service, message d'erreur ou point d'accès..."
        defaultDisplayMode="list"
        allowedDisplayModes={['list', 'split']}
        detailModalSize="6xl"
        renderDetailSections={renderDetailSections}
        importExportEntityName="System_Failure_Logs"
        customFilters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              aria-label="Filtrer par niveau de gravité"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les Niveaux de Gravité</option>
              <option value="FATAL">FATAL (Bloquant Plateforme)</option>
              <option value="ERROR">ERROR (Erreurs Applicatives)</option>
              <option value="WARN">WARN (Avertissements)</option>
              <option value="INFO">INFO (Événements)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrer par statut de résolution"
              className="px-3 py-1.5 text-xs rounded-xl bg-surface border border-border text-text-primary outline-none focus:border-brand"
            >
              <option value="">Tous les Statuts</option>
              <option value="unresolved">En Attente (Non Résolus)</option>
              <option value="resolved">Résolus Uniquement</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
