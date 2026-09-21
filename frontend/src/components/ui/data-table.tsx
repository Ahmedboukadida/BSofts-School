'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  LayoutList,
  LayoutGrid,
  Columns2,
  GitFork,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  EyeOff,
  Printer,
  Clock,
  User,
  ShieldAlert,
  Archive,
  RefreshCw,
  Loader2,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';
import {
  exportToCsv,
  exportToExcel,
  printFormattedTable,
  downloadSampleCsvTemplate,
  ExportColumn,
} from '@/lib/export-utils';

export type DisplayMode = 'list' | 'grid' | 'split' | 'matrix';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface AuditFields {
  createdAt?: string | Date;
  createdBy?: string;
  createdByName?: string;
  updatedAt?: string | Date;
  updatedBy?: string;
  updatedByName?: string;
  isDeleted?: boolean;
  deletedAt?: string | Date | null;
  deletedBy?: string;
  deletedByName?: string;
  status?: string;
  isActive?: boolean;
}

export interface DetailSection<T = Record<string, unknown>> {
  title: string;
  fields?: { label: string; value: React.ReactNode }[];
  content?: React.ReactNode;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T extends AuditFields = AuditFields> {
  data: T[];
  columns: ColumnDef<T>[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
  allowedModes?: DisplayMode[];
  allowedDisplayModes?: DisplayMode[];
  initialMode?: DisplayMode;
  defaultDisplayMode?: DisplayMode;
  renderGridItem?: (row: T, actions: TableRowActions<T>) => React.ReactNode;
  gridCardRender?: (item: T, onSelect: () => void) => React.ReactNode;
  renderGridCard?: (item: T, onViewDetails: (item: T) => void, actions: TableRowActions<T>) => React.ReactNode;
  renderSplitDetails?: (row: T | null) => React.ReactNode;
  renderHierarchyItem?: (row: T, depth: number) => React.ReactNode;
  renderCustomMatrixView?: (data?: T[]) => React.ReactNode;
  getItemParentId?: (row: T) => string | null | undefined;
  getItemId?: (row: T) => string;
  expandable?: boolean;
  isAllExpanded?: boolean;
  onToggleExpandAll?: (expanded: boolean) => void;
  // Row Actions
  onViewDetails?: (row: T) => void;
  getDetailSections?: (row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[];
  renderDetailSections?: (row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[];
  detailSections?:
    | (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[]
    | ((row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[]);
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => Promise<void> | void;
  onPermanentDelete?: (row: T) => Promise<void> | void;
  onRestore?: (row: T) => Promise<void> | void;
  onToggleStatus?: (row: T) => Promise<void> | void;
  onToggleVisibility?: (row: T) => Promise<void> | void;
  onPrintSingle?: (row: T) => void;
  // Filters & Search
  searchPlaceholder?: string;
  searchFields?: string[];
  searchKeys?: string[];
  statusFilter?: {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
  };
  categoryFilter?: {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
  };
  dateFilter?: {
    startDate: string;
    endDate: string;
    onStartDateChange: (val: string) => void;
    onEndDateChange: (val: string) => void;
  };
  // Export & Import
  exportFilename?: string;
  exportTitle?: string;
  importExportEntityName?: string;
  exportColumns?: ExportColumn<T>[];
  importTemplateHeaders?: string[];
  importTemplateSample?: string[];
  onImportSubmit?: (parsedRows: Record<string, string>[]) => Promise<{ successCount: number; errors?: string[] }>;
  // Primary CTA
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  // Root Corbeille
  corbeilleToggle?: {
    isTrash: boolean;
    onToggle: () => void;
    count?: number;
  };
  showTrashToggle?: boolean;
  isTrashActive?: boolean;
  onToggleTrash?: (active: boolean) => void;
  modalSize?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  detailModalSize?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  actions?: ((row: T) => React.ReactNode) | DataTableActionHandlers<T>;
  customFilters?: React.ReactNode;
}

export interface DataTableActionHandlers<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void | Promise<void>;
  onPermanentDelete?: (row: T) => void | Promise<void>;
  onRestore?: (row: T) => void | Promise<void>;
  onToggleStatus?: (row: T, active?: boolean) => void | Promise<void>;
  onToggleVisibility?: (row: T) => void | Promise<void>;
  onPrint?: (row: T) => void;
}

export interface TableRowActions<T = AuditFields> {
  viewDetails: (row: T) => void;
  edit?: (row: T) => void;
  onEdit?: (row: T) => void;
  delete?: (row: T) => void;
  onDelete?: (row: T) => void;
  permanentDelete?: (row: T) => void;
  onPermanentDelete?: (row: T) => void;
  onHardDelete?: (row: T) => void;
  toggleStatus?: (row: T) => void;
  onToggleStatus?: (row: T) => void;
  toggleVisibility?: (row: T) => void;
  printSingle?: (row: T) => void;
}

export interface TableRowActionProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onHardDelete?: () => void;
  onToggleStatus?: () => void;
  isActive?: boolean;
}

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

export function DataTable<T extends AuditFields = AuditFields>({
  data,
  columns,
  title,
  subtitle,
  isLoading = false,
  allowedModes = ['list', 'grid'],
  allowedDisplayModes,
  initialMode = 'list',
  defaultDisplayMode,
  renderGridItem,
  gridCardRender,
  renderGridCard,
  renderSplitDetails,
  renderHierarchyItem,
  renderCustomMatrixView,
  getItemParentId,
  getItemId = (r) => {
    const raw = (r as Record<string, unknown>)?.id;
    return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : String(Math.random());
  },
  expandable = false,
  isAllExpanded = false,
  onToggleExpandAll,
  onViewDetails,
  getDetailSections,
  renderDetailSections,
  detailSections,
  onEdit,
  onDelete,
  onPermanentDelete,
  onRestore,
  onToggleStatus,
  onToggleVisibility,
  onPrintSingle,
  searchPlaceholder,
  searchFields = ['name', 'title', 'code', 'email', 'firstName', 'lastName'],
  searchKeys,
  statusFilter,
  categoryFilter,
  dateFilter,
  exportFilename = 'export',
  exportTitle,
  importExportEntityName,
  exportColumns,
  importTemplateHeaders,
  importTemplateSample,
  onImportSubmit,
  primaryAction,
  corbeilleToggle,
  showTrashToggle,
  isTrashActive,
  onToggleTrash,
  modalSize = '6xl',
  detailModalSize,
  actions,
  customFilters,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const isCorbeilleActive = isTrashActive ?? corbeilleToggle?.isTrash ?? false;
  const handleCorbeilleToggle = () => {
    if (onToggleTrash) onToggleTrash(!isCorbeilleActive);
    if (corbeilleToggle) corbeilleToggle.onToggle();
  };
  const effectiveExportFilename = importExportEntityName || exportFilename || 'export';

  const effectiveModalSize = detailModalSize || modalSize || '6xl';
  const actionHandlers = typeof actions === 'object' && actions !== null ? (actions as DataTableActionHandlers<T>) : undefined;
  const customActionRenderer = typeof actions === 'function' ? actions : undefined;

  const effectiveOnView = actionHandlers?.onView || onViewDetails;
  const effectiveOnEdit = actionHandlers?.onEdit || onEdit;
  const effectiveOnDelete = actionHandlers?.onDelete || onDelete;
  const effectiveOnPermanentDelete = actionHandlers?.onPermanentDelete || onPermanentDelete;
  const effectiveOnRestore = actionHandlers?.onRestore || onRestore;
  const rawToggleStatus = actionHandlers?.onToggleStatus;
  const effectiveOnToggleStatus = useMemo(() => {
    if (rawToggleStatus) {
      return (row: T) => rawToggleStatus(row, row.isActive);
    }
    return onToggleStatus;
  }, [rawToggleStatus, onToggleStatus]);
  const effectiveOnToggleVisibility = actionHandlers?.onToggleVisibility || onToggleVisibility;
  const effectiveOnPrintSingle = actionHandlers?.onPrint || onPrintSingle;

  const effectiveModes: DisplayMode[] = allowedDisplayModes || allowedModes || ['list', 'grid'];
  const effectiveInitialMode: DisplayMode = defaultDisplayMode || initialMode || 'list';
  const effectiveSearchFields = useMemo(
    () => searchKeys || searchFields || ['name', 'title', 'code', 'email', 'firstName', 'lastName'],
    [searchKeys, searchFields]
  );

  // State
  const [currentMode, setCurrentMode] = useState<DisplayMode>(effectiveInitialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedSplitRow, setSelectedSplitRow] = useState<T | null>(data[0] || null);

  // Modals state
  const [activeDetailRow, setActiveDetailRow] = useState<T | null>(null);
  const [deleteModalRow, setDeleteModalRow] = useState<T | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{ successCount: number; errors?: string[] } | null>(null);

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let list = [...data];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        effectiveSearchFields.some((field) => {
          const val = (item as Record<string, unknown>)[field];
          return val && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Sort
    if (sortColumn) {
      list.sort((a, b) => {
        const valA = (a as Record<string, unknown>)[sortColumn];
        const valB = (b as Record<string, unknown>)[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return list;
  }, [data, searchQuery, effectiveSearchFields, sortColumn, sortOrder]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize, totalPages]);

  // Handle Sort Toggle
  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortOrder('asc');
    }
  };

  // Row Action Handlers
  const handleOpenDetails = useCallback(
    (row: T) => {
      if (effectiveOnView) effectiveOnView(row);
      setActiveDetailRow(row);
    },
    [effectiveOnView]
  );

  const rowActions: TableRowActions<T> = useMemo(
    () => ({
      viewDetails: handleOpenDetails,
      edit: effectiveOnEdit,
      onEdit: effectiveOnEdit,
      delete: effectiveOnDelete ? (row: T) => { setDeleteModalRow(row); setIsPermanentDelete(false); } : undefined,
      onDelete: effectiveOnDelete ? (row: T) => { setDeleteModalRow(row); setIsPermanentDelete(false); } : undefined,
      permanentDelete: effectiveOnPermanentDelete ? (row: T) => { setDeleteModalRow(row); setIsPermanentDelete(true); } : undefined,
      onPermanentDelete: effectiveOnPermanentDelete ? (row: T) => { setDeleteModalRow(row); setIsPermanentDelete(true); } : undefined,
      onHardDelete: effectiveOnPermanentDelete ? (row: T) => { setDeleteModalRow(row); setIsPermanentDelete(true); } : undefined,
      toggleStatus: effectiveOnToggleStatus,
      onToggleStatus: effectiveOnToggleStatus,
      toggleVisibility: effectiveOnToggleVisibility,
      printSingle: effectiveOnPrintSingle,
    }),
    [handleOpenDetails, effectiveOnEdit, effectiveOnDelete, effectiveOnPermanentDelete, effectiveOnToggleStatus, effectiveOnToggleVisibility, effectiveOnPrintSingle]
  );

  // Export Trigger
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const expCols = exportColumns || columns.map((c) => ({ header: c.header, key: c.key }));
      const rowsForExport = processedData as unknown as Record<string, unknown>[];
      if (format === 'csv') {
        exportToCsv(effectiveExportFilename, expCols, rowsForExport);
      } else if (format === 'excel') {
        exportToExcel(effectiveExportFilename, expCols, rowsForExport, exportTitle || title || 'Data');
      } else if (format === 'pdf') {
        printFormattedTable(exportTitle || title || 'Export Rapport', expCols, rowsForExport);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Import Trigger
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleProcessImport = async () => {
    if (!importFile || !onImportSubmit) return;
    setImportLoading(true);
    try {
      const text = await importFile.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;
      const headers = lines[0].split(';').map((h) => h.replace(/^"|"$/g, '').trim());
      const parsedRows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(';').map((v) => v.replace(/^"|"$/g, '').trim());
        const rowObj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        parsedRows.push(rowObj);
      }

      const res = await onImportSubmit(parsedRows);
      setImportFeedback(res);
      if (res.successCount > 0) {
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportFeedback(null);
        }, 3000);
      }
    } finally {
      setImportLoading(false);
    }
  };

  // Hierarchy Tree Builder with Recursion Guard
  const hierarchyTree = useMemo(() => {
    if (currentMode !== 'matrix' || !getItemParentId) return [];
    const roots: T[] = [];
    const childMap = new Map<string, T[]>();

    processedData.forEach((item) => {
      const pId = getItemParentId(item);
      if (!pId) {
        roots.push(item);
      } else {
        const existing = childMap.get(pId) || [];
        existing.push(item);
        childMap.set(pId, existing);
      }
    });

    const buildTree = (node: T, depth = 0, visited = new Set<string>()): { item: T; depth: number }[] => {
      const id = getItemId(node);
      if (visited.has(id) || depth > 10) return [{ item: node, depth }];
      visited.add(id);

      const res: { item: T; depth: number }[] = [{ item: node, depth }];
      const children = childMap.get(id) || [];
      children.forEach((c) => {
        res.push(...buildTree(c, depth + 1, new Set(visited)));
      });
      return res;
    };

    return roots.flatMap((r) => buildTree(r));
  }, [currentMode, getItemParentId, getItemId, processedData]);

  return (
    <div className="space-y-4">
      {/* Top Header & Contextual Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{title}</h1>}
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Corbeille (Trash) Toggle for Root */}
          {user?.isRoot && (corbeilleToggle || showTrashToggle) && (
            <button
              onClick={handleCorbeilleToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isCorbeilleActive
                  ? 'bg-coral/10 text-coral border-coral/30 shadow-xs'
                  : 'bg-surface-hover text-text-secondary border-border hover:text-text-primary'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isCorbeilleActive ? 'Quitter la Corbeille' : 'Corbeille'}</span>
              {corbeilleToggle?.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-coral text-white text-[10px] font-mono">
                  {corbeilleToggle.count}
                </span>
              )}
            </button>
          )}

          {/* Import Wizard */}
          {importTemplateHeaders && onImportSubmit && (
            <Button
              variant="secondary"
              className="text-xs gap-1.5"
              onClick={() => { setShowImportModal(true); setImportFeedback(null); }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer</span>
            </Button>
          )}

          {/* 1-Click Export Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              className="text-xs gap-1.5 font-semibold"
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || processedData.length === 0}
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Exporter</span>
              <ChevronDown className="w-3 h-3" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-xl shadow-xl border border-border py-1.5 z-40 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => handleExport('excel')}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Format Excel (.xls)</span>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Format CSV (.csv)</span>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-coral" />
                  <span>Document Imprimable (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {primaryAction && (
            <Button className="text-xs gap-1.5 bg-primary hover:bg-primary/90 font-bold" onClick={primaryAction.onClick}>
              {primaryAction.icon ? <primaryAction.icon className="w-3.5 h-3.5" /> : null}
              <span>{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Display Mode Strip */}
      <Card className="p-3.5 border border-border/80 bg-surface shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Multi-Criteria Search & Filter Inputs */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {/* Search */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder={searchPlaceholder || t('common.search') || 'Rechercher...'}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-hover border border-border text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Status Filter */}
            {statusFilter && (
              <select
                value={statusFilter.value}
                onChange={(e) => { statusFilter.onChange(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">{statusFilter.placeholder || 'Tous les statuts'}</option>
                {statusFilter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Category Filter */}
            {categoryFilter && (
              <select
                value={categoryFilter.value}
                onChange={(e) => { categoryFilter.onChange(e.target.value); setCurrentPage(1); }}
                className="h-9 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">{categoryFilter.placeholder || 'Toutes les catégories'}</option>
                {categoryFilter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {/* Date Range Start -> End */}
            {dateFilter && (
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) => { dateFilter.onStartDateChange(e.target.value); setCurrentPage(1); }}
                  className="h-9 text-xs w-32"
                  placeholder="Date début"
                />
                <span className="text-text-tertiary text-xs">→</span>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => { dateFilter.onEndDateChange(e.target.value); setCurrentPage(1); }}
                  className="h-9 text-xs w-32"
                  placeholder="Date fin"
                />
              </div>
            )}

            {/* Custom filters from parent view */}
            {customFilters}
          </div>

          {/* Right: Expand/Collapse Toggle & Contextual Display Mode Switcher */}
          <div className="flex items-center gap-1.5 self-end lg:self-center">
            {/* Expand / Collapse Toggle (for views with parent-child / grouped data) */}
            {expandable && onToggleExpandAll && (
              <button
                type="button"
                onClick={() => onToggleExpandAll(!isAllExpanded)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-hover text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
                title={isAllExpanded ? 'Tout réduire' : 'Tout développer'}
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isAllExpanded ? 'Réduire tout' : 'Développer tout'}</span>
              </button>
            )}

            {/* Contextual Display Mode Switcher */}
            {effectiveModes.length > 1 && (
              <div className="flex items-center p-1 bg-surface-hover rounded-xl border border-border">
                {effectiveModes.includes('list') && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      currentMode === 'list'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Vue Liste / Tableau"
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                )}

                {effectiveModes.includes('grid') && (renderGridItem || gridCardRender || renderGridCard) && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      currentMode === 'grid'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Vue Grille / Cartes"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                )}

                {effectiveModes.includes('split') && renderSplitDetails && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode('split')}
                    className={`p-1.5 rounded-lg transition-all hidden md:block ${
                      currentMode === 'split'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Vue Fractionnée (Split)"
                  >
                    <Columns2 className="w-4 h-4" />
                  </button>
                )}

                {effectiveModes.includes('matrix') && (
                  <button
                    type="button"
                    onClick={() => setCurrentMode('matrix')}
                    className={`p-1.5 rounded-lg transition-all hidden md:block ${
                      currentMode === 'matrix'
                        ? 'bg-primary text-white shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    title="Vue Hiérarchie / Arborescence"
                  >
                    <GitFork className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Main Data Container */}
      {isLoading ? (
        <Card className="p-12 text-center border border-border/80 bg-surface">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
          <p className="text-sm font-semibold text-text-secondary">{t('common.loading') || 'Chargement des données...'}</p>
        </Card>
      ) : processedData.length === 0 ? (
        <Card className="p-12 text-center border border-dashed border-border bg-surface">
          <Filter className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary">Aucun résultat trouvé</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
            Aucun enregistrement ne correspond aux critères de recherche actuels.
          </p>
        </Card>
      ) : (
        <>
          {/* MODE 1: Standard Sortable DataTable */}
          {currentMode === 'list' && (
            <Card className="overflow-hidden border border-border/80 shadow-xs bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-hover/70 text-[11px] uppercase font-bold text-text-secondary border-b border-border tracking-wider">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          className={`py-3.5 px-4 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-text-primary' : ''} ${col.className || ''}`}
                          onClick={() => col.sortable !== false && handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{col.header}</span>
                            {col.sortable !== false && (
                              <span className="text-text-tertiary">
                                {sortColumn === col.key ? (
                                  sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />
                                ) : (
                                  <ChevronsUpDown className="w-3.5 h-3.5" />
                                )}
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedData.map((row) => {
                      const id = getItemId(row);
                      return (
                        <tr key={id} className="hover:bg-surface-hover/40 transition-colors group">
                          {columns.map((col) => (
                            <td key={col.key} className={`py-3.5 px-4 text-xs ${col.className || ''}`}>
                              {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                            </td>
                          ))}

                          {/* Row Actions */}
                          <td className="py-3.5 px-4 text-right">
                            {customActionRenderer ? (
                              customActionRenderer(row)
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                {/* View Details */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenDetails(row)}
                                  className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                                  title="Voir Détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit */}
                                {effectiveOnEdit && (
                                  <button
                                    type="button"
                                    onClick={() => effectiveOnEdit(row)}
                                    className="p-1.5 rounded-lg text-text-secondary hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Toggle Status */}
                                {effectiveOnToggleStatus && (
                                  <button
                                    type="button"
                                    onClick={() => effectiveOnToggleStatus(row)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      row.isActive !== false
                                        ? 'text-emerald-600 hover:bg-emerald-500/10'
                                        : 'text-text-tertiary hover:bg-surface-hover'
                                    }`}
                                    title={row.isActive !== false ? 'Désactiver' : 'Activer'}
                                  >
                                    <Power className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Toggle Visibility */}
                                {effectiveOnToggleVisibility && (
                                  <button
                                    type="button"
                                    onClick={() => effectiveOnToggleVisibility(row)}
                                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                                    title="Afficher / Masquer"
                                  >
                                    <EyeOff className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Print Single */}
                                {effectiveOnPrintSingle && (
                                  <button
                                    type="button"
                                    onClick={() => effectiveOnPrintSingle(row)}
                                    className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                                    title="Imprimer"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Restore (if item is in trash) */}
                                {row.isDeleted && effectiveOnRestore && (
                                  <button
                                    type="button"
                                    onClick={() => effectiveOnRestore(row)}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                                    title="Restaurer cet élément"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Soft Delete (only if active) */}
                                {!row.isDeleted && effectiveOnDelete && (
                                  <button
                                    type="button"
                                    onClick={() => { setDeleteModalRow(row); setIsPermanentDelete(false); }}
                                    className="p-1.5 rounded-lg text-text-secondary hover:text-coral hover:bg-coral/10 transition-colors"
                                    title="Mettre en corbeille (Soft Delete)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}

                                {/* Permanent Hard Delete (Root Only) */}
                                {user?.isRoot && effectiveOnPermanentDelete && (
                                  <button
                                    type="button"
                                    onClick={() => { setDeleteModalRow(row); setIsPermanentDelete(true); }}
                                    className="p-1.5 rounded-lg text-coral hover:bg-coral/20 transition-colors"
                                    title="Suppression Définitive (Hard Delete)"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Integrated Bottom Pagination */}
              <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>Afficher</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className="h-8 px-2 bg-surface-hover border border-border rounded-lg text-xs font-semibold text-text-primary focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>lignes par page • Total: <strong>{processedData.length}</strong> éléments</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <span className="px-3 font-semibold text-text-primary">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* MODE 2: Card Grid */}
          {currentMode === 'grid' && (renderGridItem || gridCardRender || renderGridCard) && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map((row) => (
                  <div key={getItemId(row)}>
                    {renderGridCard
                      ? renderGridCard(row, () => handleOpenDetails(row), rowActions)
                      : gridCardRender
                      ? gridCardRender(row, () => handleOpenDetails(row))
                      : renderGridItem
                      ? renderGridItem(row, rowActions)
                      : null}
                  </div>
                ))}
              </div>

              {/* Grid Pagination */}
              <Card className="p-3 border border-border/80 flex items-center justify-between text-xs text-text-secondary">
                <span>Total: <strong>{processedData.length}</strong> éléments</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  <span className="px-3 font-semibold text-text-primary">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    className="h-8 px-2.5 text-xs"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* MODE 3: Split View */}
          {currentMode === 'split' && renderSplitDetails && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <Card className="md:col-span-5 max-h-[700px] overflow-y-auto border border-border/80 divide-y divide-border">
                {paginatedData.map((row) => {
                  const isSelected = selectedSplitRow && getItemId(selectedSplitRow) === getItemId(row);
                  const rRec = row as Record<string, unknown>;
                  return (
                    <div
                      key={getItemId(row)}
                      onClick={() => setSelectedSplitRow(row)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-surface-hover'
                      }`}
                    >
                      <h4 className="text-sm font-bold text-text-primary">{String(rRec.name || rRec.title || rRec.id || '')}</h4>
                      <p className="text-xs text-text-secondary mt-0.5">{String(rRec.category || rRec.code || '')}</p>
                    </div>
                  );
                })}
              </Card>

              <Card className="md:col-span-7 p-6 border border-border/80 bg-surface">
                {renderSplitDetails(selectedSplitRow)}
              </Card>
            </div>
          )}

          {/* MODE 4: Matrix / Hierarchy Tree */}
          {currentMode === 'matrix' && (
            renderCustomMatrixView ? (
              renderCustomMatrixView(processedData)
            ) : (
              <Card className="p-4 border border-border/80 bg-surface divide-y divide-border">
                {hierarchyTree.map(({ item, depth }) => {
                  const id = getItemId(item);
                  if (renderHierarchyItem) {
                    return <div key={id}>{renderHierarchyItem(item, depth)}</div>;
                  }
                  return (
                    <div
                      key={id}
                      className="py-3 flex items-center justify-between hover:bg-surface-hover/50 rounded-xl px-2 transition-colors"
                      style={{ paddingLeft: `${Math.max(8, depth * 28)}px` }}
                    >
                      <div className="flex items-center gap-3">
                        <GitFork className="w-4 h-4 text-primary shrink-0" />
                        <div>
                          <span className="text-sm font-bold text-text-primary">
                            {String((item as Record<string, unknown>).name || (item as Record<string, unknown>).title || id)}
                          </span>
                          {Boolean((item as Record<string, unknown>).code) && (
                            <span className="ml-2 text-xs font-mono text-text-secondary">
                              ({String((item as Record<string, unknown>).code)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" className="h-7 text-xs px-2" onClick={() => handleOpenDetails(item)}>
                          Détails
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </Card>
            )
          )}
        </>
      )}

      {/* Comprehensive Details View Modal with Full Audit Lifecycle Timeline */}
      <Modal
        isOpen={!!activeDetailRow}
        onClose={() => setActiveDetailRow(null)}
        title={`Fiche Complète — ${activeDetailRow ? String((activeDetailRow as Record<string, unknown>).name || (activeDetailRow as Record<string, unknown>).title || (activeDetailRow as Record<string, unknown>).id || '') : ''}`}
        size={effectiveModalSize}
      >
        {activeDetailRow && (
          <div className="space-y-6">
            {/* Custom Structured Sections */}
            {(() => {
              const sections = getDetailSections
                ? getDetailSections(activeDetailRow)
                : renderDetailSections
                ? renderDetailSections(activeDetailRow)
                : typeof detailSections === 'function'
                ? detailSections(activeDetailRow)
                : detailSections;
              if (!sections || sections.length === 0) return null;
              return (
                <div className="space-y-4">
                  {sections.map((sec, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-surface-hover/40 border border-border/70 space-y-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">{sec.title}</h3>
                      {sec.render && (sec.render as (item: unknown) => React.ReactNode)(activeDetailRow)}
                      {sec.content && sec.content}
                      {sec.fields && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          {sec.fields.map((f, fIdx) => (
                            <div key={fIdx}>
                              <span className="text-text-tertiary block mb-0.5">{f.label} :</span>
                              <span className="font-semibold text-text-primary">{f.value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Audit Lifecycle Timeline Section */}
            <div className="p-5 rounded-2xl bg-surface-hover/20 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Traçabilité & Cycle de Vie (Audit Lifecycle)</span>
                </h3>
                {activeDetailRow.isDeleted ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-coral/10 text-coral text-xs font-bold border border-coral/30">
                    Supprimé (Dans la Corbeille)
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/30">
                    Actif en Base
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Created By / At */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <User className="w-3.5 h-3.5 text-brand" />
                    <span className="font-semibold">Création initiale :</span>
                  </div>
                  <p className="font-bold text-text-primary">
                    {activeDetailRow.createdByName || activeDetailRow.createdBy || 'Système'}
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {activeDetailRow.createdAt ? new Date(activeDetailRow.createdAt).toLocaleString('fr-TN') : '—'}
                  </p>
                </div>

                {/* Updated By / At */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="font-semibold">Dernière modification :</span>
                  </div>
                  <p className="font-bold text-text-primary">
                    {activeDetailRow.updatedByName || activeDetailRow.updatedBy || 'Aucune modification'}
                  </p>
                  <p className="text-[11px] text-text-tertiary">
                    {activeDetailRow.updatedAt ? new Date(activeDetailRow.updatedAt).toLocaleString('fr-TN') : '—'}
                  </p>
                </div>

                {/* Deleted By / At */}
                <div className="p-3.5 rounded-xl border border-border/80 bg-surface space-y-1">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Archive className="w-3.5 h-3.5 text-coral" />
                    <span className="font-semibold">Statut Corbeille :</span>
                  </div>
                  {activeDetailRow.isDeleted ? (
                    <>
                      <p className="font-bold text-coral">
                        {activeDetailRow.deletedByName || activeDetailRow.deletedBy || 'Supprimé'}
                      </p>
                      <p className="text-[11px] text-text-tertiary">
                        {activeDetailRow.deletedAt ? new Date(activeDetailRow.deletedAt).toLocaleString('fr-TN') : '—'}
                      </p>
                    </>
                  ) : (
                    <p className="text-text-tertiary italic">Non supprimé</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setActiveDetailRow(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete / Permanent Delete Confirmation Dialog */}
      <Modal
        isOpen={!!deleteModalRow}
        onClose={() => setDeleteModalRow(null)}
        title={isPermanentDelete ? 'Suppression Définitive (Hard Delete)' : 'Mettre à la Corbeille (Soft Delete)'}
        size="lg"
      >
        {deleteModalRow && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-coral/10 border border-coral/20 text-coral">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                {(() => {
                  const delRec = deleteModalRow as Record<string, unknown>;
                  const displayName = String(delRec.name || delRec.title || delRec.id || 'cet enregistrement');
                  return isPermanentDelete ? (
                    <p>
                      <strong>Action irréversible :</strong> Vous vous apprêtez à purger définitivement l&apos;enregistrement{' '}
                      <strong>{displayName}</strong> de la base de données PostgreSQL. Cette action ne peut pas être annulée.
                    </p>
                  ) : (
                    <p>
                      Êtes-vous sûr de vouloir déplacer <strong>{displayName}</strong> vers la corbeille ? L&apos;enregistrement sera masqué pour les utilisateurs normaux mais pourra être restauré par un administrateur Root.
                    </p>
                  );
                })()}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button variant="secondary" onClick={() => setDeleteModalRow(null)}>
                Annuler
              </Button>
              <Button
                className="bg-coral hover:bg-coral/90 text-white font-bold"
                onClick={async () => {
                  if (isPermanentDelete && effectiveOnPermanentDelete) {
                    await effectiveOnPermanentDelete(deleteModalRow);
                  } else if (effectiveOnDelete) {
                    await effectiveOnDelete(deleteModalRow);
                  }
                  setDeleteModalRow(null);
                }}
              >
                {isPermanentDelete ? 'Purger Définitivement' : 'Mettre en Corbeille'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Import Wizard Modal with Sample Template Download */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Assistant d'Importation en Masse (CSV)"
        size={modalSize}
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-text-primary">Télécharger le Modèle CSV Vierge</h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Utilisez notre modèle pré-formaté avec les en-têtes obligatoires pour garantir un import sans erreur.
              </p>
            </div>
            {importTemplateHeaders && (
              <Button
                variant="secondary"
                className="gap-2 text-xs font-bold"
                onClick={() => downloadSampleCsvTemplate(exportFilename, importTemplateHeaders, importTemplateSample)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger Modèle</span>
              </Button>
            )}
          </div>

          <div className="p-6 border-2 border-dashed border-border rounded-2xl text-center space-y-3">
            <Upload className="w-10 h-10 text-primary mx-auto" />
            <div>
              <p className="text-sm font-bold text-text-primary">Sélectionnez ou glissez votre fichier CSV</p>
              <p className="text-xs text-text-secondary mt-0.5">Fichiers .csv uniquement (séparateur point-virgule &apos;;&apos;)</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportFileChange}
              className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-border file:bg-surface-hover file:text-xs file:font-semibold cursor-pointer"
            />
          </div>

          {importFeedback && (
            <div className={`p-4 rounded-2xl text-xs space-y-1 ${importFeedback.errors?.length ? 'bg-amber-500/10 text-amber-800' : 'bg-emerald-500/10 text-emerald-700'}`}>
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{importFeedback.successCount} ligne(s) importée(s) avec succès.</span>
              </div>
              {importFeedback.errors && importFeedback.errors.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-coral">
                  {importFeedback.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="secondary" onClick={() => setShowImportModal(false)}>
              Annuler
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 font-bold gap-2"
              onClick={handleProcessImport}
              disabled={!importFile || importLoading}
            >
              {importLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Lancer l&apos;Importation</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
