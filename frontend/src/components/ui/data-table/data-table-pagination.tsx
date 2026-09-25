'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface DataTablePaginationProps {
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: 'card' | 'integrated';
}

export function DataTablePagination({
  pageSize = 10,
  onPageSizeChange,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  variant = 'integrated',
}: DataTablePaginationProps) {
  const content = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary w-full">
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <>
            <span>Afficher</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 bg-surface-hover border border-border rounded-lg text-xs font-semibold text-text-primary focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>lignes par page • </span>
          </>
        )}
        <span>Total : <strong>{totalItems}</strong> éléments</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          className="h-8 px-2.5 text-xs"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
        >
          Suivant
        </Button>
      </div>
    </div>
  );

  if (variant === 'card') {
    return <Card className="p-3 border border-border/80">{content}</Card>;
  }

  return <div className="p-4 border-t border-border/60">{content}</div>;
}
