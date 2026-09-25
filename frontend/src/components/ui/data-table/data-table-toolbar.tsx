'use client';

import React from 'react';
import {
  LayoutList,
  LayoutGrid,
  Columns2,
  GitFork,
  ChevronsUpDown,
  ChevronDown,
  Download,
  Upload,
  Search,
  Archive,
  Loader2,
  FileSpreadsheet,
  FileText,
  FileCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/components/providers/i18n-provider';
import { DisplayMode } from './data-table-types';

export interface DataTableToolbarProps {
  title?: string;
  subtitle?: string;
  isRoot?: boolean;
  isCorbeilleActive: boolean;
  onCorbeilleToggle: () => void;
  corbeilleCount?: number;
  showTrashButton: boolean;
  // Import & Export
  hasImport: boolean;
  onOpenImport: () => void;
  hasExport: boolean;
  isExporting: boolean;
  showExportMenu: boolean;
  setShowExportMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  // Primary CTA
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  // Search & Filter
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  customFilters?: React.ReactNode;
  // Expand / Modes
  expandable?: boolean;
  isAllExpanded?: boolean;
  onToggleExpandAll?: (expanded: boolean) => void;
  effectiveModes: DisplayMode[];
  currentMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  hasGridOption: boolean;
  hasSplitOption: boolean;
  hasMatrixOption: boolean;
  hasData: boolean;
}

export function DataTableToolbar({
  title,
  subtitle,
  isRoot,
  isCorbeilleActive,
  onCorbeilleToggle,
  corbeilleCount,
  showTrashButton,
  hasImport,
  onOpenImport,
  hasExport,
  isExporting,
  showExportMenu,
  setShowExportMenu,
  onExport,
  primaryAction,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  statusFilter,
  categoryFilter,
  dateFilter,
  customFilters,
  expandable,
  isAllExpanded,
  onToggleExpandAll,
  effectiveModes,
  currentMode,
  onModeChange,
  hasGridOption,
  hasSplitOption,
  hasMatrixOption,
  hasData,
}: DataTableToolbarProps) {
  const { t } = useTranslation();

  return (
    <>
      {/* Top Header & Contextual Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">{title}</h1>}
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end">
          {/* Corbeille (Trash) Toggle for Root */}
          {isRoot && showTrashButton && (
            <button
              onClick={onCorbeilleToggle}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isCorbeilleActive
                  ? 'bg-coral/10 text-coral border-coral/30 shadow-xs'
                  : 'bg-surface-hover text-text-secondary border-border hover:text-text-primary'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isCorbeilleActive ? 'Quitter la Corbeille' : 'Corbeille'}</span>
              {corbeilleCount !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full bg-coral text-white text-[10px] font-mono">
                  {corbeilleCount}
                </span>
              )}
            </button>
          )}

          {/* Import Wizard */}
          {hasImport && (
            <Button
              variant="secondary"
              className="text-xs gap-1.5"
              onClick={onOpenImport}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importer</span>
            </Button>
          )}

          {/* 1-Click Export Dropdown */}
          {hasExport && (
            <div className="relative">
              <Button
                variant="secondary"
                className="text-xs gap-1.5 font-semibold"
                onClick={() => setShowExportMenu((prev) => !prev)}
                disabled={isExporting || !hasData}
              >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Exporter</span>
                <ChevronDown className="w-3 h-3" />
              </Button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface rounded-xl shadow-xl border border-border py-1.5 z-40 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => onExport('excel')}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Format Excel (.xls)</span>
                  </button>
                  <button
                    onClick={() => onExport('csv')}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                  >
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>Format CSV (.csv)</span>
                  </button>
                  <button
                    onClick={() => onExport('pdf')}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs text-text-primary hover:bg-surface-hover transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-coral" />
                    <span>Document Imprimable (PDF)</span>
                  </button>
                </div>
              )}
            </div>
          )}

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
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-surface-hover border border-border text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Status Filter */}
            {statusFilter && (
              <select
                value={statusFilter.value}
                onChange={(e) => statusFilter.onChange(e.target.value)}
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
                onChange={(e) => categoryFilter.onChange(e.target.value)}
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
                  onChange={(e) => dateFilter.onStartDateChange(e.target.value)}
                  className="h-9 text-xs w-32"
                  placeholder="Date début"
                />
                <span className="text-text-tertiary text-xs">→</span>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => dateFilter.onEndDateChange(e.target.value)}
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
                title={isAllExpanded ? 'Tout réduire' : 'Développer tout'}
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
                    onClick={() => onModeChange('list')}
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

                {effectiveModes.includes('grid') && hasGridOption && (
                  <button
                    type="button"
                    onClick={() => onModeChange('grid')}
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

                {effectiveModes.includes('split') && hasSplitOption && (
                  <button
                    type="button"
                    onClick={() => onModeChange('split')}
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

                {effectiveModes.includes('matrix') && hasMatrixOption && (
                  <button
                    type="button"
                    onClick={() => onModeChange('matrix')}
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
    </>
  );
}
