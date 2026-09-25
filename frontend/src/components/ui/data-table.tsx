'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Power,
  EyeOff,
  Printer,
  ShieldAlert,
  RefreshCw,
  Loader2,
  GitFork,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';
import { exportToCsv, exportToExcel, printFormattedTable } from '@/lib/export-utils';

import {
  DisplayMode,
  ColumnDef,
  AuditFields,
  DetailSection,
  DataTableProps,
  DataTableActionHandlers,
  TableRowActions,
  TableRowActionProps,
} from './data-table/data-table-types';
import { TableRowActionButtons } from './data-table/data-table-row-actions';
import { DataTableToolbar } from './data-table/data-table-toolbar';
import { DataTablePagination } from './data-table/data-table-pagination';
import { DataTableModals } from './data-table/data-table-modals';

// Re-export all types and sub-components for backward-compatibility
export type {
  DisplayMode,
  ColumnDef,
  AuditFields,
  DetailSection,
  DataTableProps,
  DataTableActionHandlers,
  TableRowActions,
  TableRowActionProps,
};
export { TableRowActionButtons };
export * from './data-table/data-table-toolbar';
export * from './data-table/data-table-pagination';
export * from './data-table/data-table-modals';

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

  const handleConfirmDelete = async (row: T, isPermanent: boolean) => {
    if (isPermanent && effectiveOnPermanentDelete) {
      await effectiveOnPermanentDelete(row);
    } else if (effectiveOnDelete) {
      await effectiveOnDelete(row);
    }
    setDeleteModalRow(null);
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
      {/* Composed Toolbar & Filter Header */}
      <DataTableToolbar
        title={title}
        subtitle={subtitle}
        isRoot={user?.isRoot}
        isCorbeilleActive={isCorbeilleActive}
        onCorbeilleToggle={handleCorbeilleToggle}
        corbeilleCount={corbeilleToggle?.count}
        showTrashButton={Boolean(corbeilleToggle || showTrashToggle)}
        hasImport={Boolean(importTemplateHeaders && onImportSubmit)}
        onOpenImport={() => { setShowImportModal(true); setImportFeedback(null); }}
        hasExport={Boolean(columns.length > 0)}
        isExporting={isExporting}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
        onExport={handleExport}
        primaryAction={primaryAction}
        searchPlaceholder={searchPlaceholder}
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        dateFilter={dateFilter}
        customFilters={customFilters}
        expandable={expandable}
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={onToggleExpandAll}
        effectiveModes={effectiveModes}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        hasGridOption={Boolean(renderGridItem || gridCardRender || renderGridCard)}
        hasSplitOption={Boolean(renderSplitDetails)}
        hasMatrixOption={true}
        hasData={processedData.length > 0}
      />

      {/* Main Data Container */}
      {isLoading ? (
        <Card className="p-12 text-center border border-border/80 bg-surface">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#CCA43B] mb-3" />
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
                                  sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-[#CCA43B]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#CCA43B]" />
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
              <DataTablePagination
                pageSize={pageSize}
                onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
                totalItems={processedData.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                variant="integrated"
              />
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
              <DataTablePagination
                totalItems={processedData.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                variant="card"
              />
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

      {/* Composed Modals (Details, Soft/Hard Delete, CSV Import) */}
      <DataTableModals
        activeDetailRow={activeDetailRow}
        onCloseDetail={() => setActiveDetailRow(null)}
        detailModalSize={effectiveModalSize}
        getDetailSections={getDetailSections}
        renderDetailSections={renderDetailSections}
        detailSections={detailSections}
        deleteModalRow={deleteModalRow}
        onCloseDelete={() => setDeleteModalRow(null)}
        isPermanentDelete={isPermanentDelete}
        onConfirmDelete={handleConfirmDelete}
        showImportModal={showImportModal}
        onCloseImport={() => setShowImportModal(false)}
        importModalSize={modalSize}
        exportFilename={exportFilename}
        importTemplateHeaders={importTemplateHeaders}
        importTemplateSample={importTemplateSample}
        importFile={importFile}
        onImportFileChange={handleImportFileChange}
        onProcessImport={handleProcessImport}
        importLoading={importLoading}
        importFeedback={importFeedback}
      />
    </div>
  );
}
