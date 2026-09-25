'use client';

import React from 'react';
import {
  Eye,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { TableRowActionProps } from './data-table-types';

export function TableRowActionButtons({
  onView,
  onEdit,
  onDelete,
  onRestore,
  onHardDelete,
  onToggleStatus,
  isActive = true,
}: TableRowActionProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onView && (
        <button
          type="button"
          onClick={onView}
          className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
          title="Voir Détails"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 rounded-lg text-text-secondary hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
          title="Modifier"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}
      {onToggleStatus && (
        <button
          type="button"
          onClick={onToggleStatus}
          className={`p-1.5 rounded-lg transition-colors ${
            isActive ? 'text-emerald-600 hover:bg-emerald-500/10' : 'text-text-tertiary hover:bg-surface-hover'
          }`}
          title={isActive ? 'Désactiver' : 'Activer'}
        >
          <Power className="w-4 h-4" />
        </button>
      )}
      {onRestore && (
        <button
          type="button"
          onClick={onRestore}
          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          title="Restaurer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 rounded-lg text-text-secondary hover:text-coral hover:bg-coral/10 transition-colors"
          title="Mettre en corbeille (Soft Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {onHardDelete && (
        <button
          type="button"
          onClick={onHardDelete}
          className="p-1.5 rounded-lg text-coral hover:bg-coral/20 transition-colors"
          title="Suppression Définitive (Root)"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
