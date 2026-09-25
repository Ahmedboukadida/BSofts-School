import React from 'react';
import { ExportColumn } from '@/lib/export-utils';

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
