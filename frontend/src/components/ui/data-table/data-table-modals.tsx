'use client';

import React from 'react';
import {
  Clock,
  User,
  Archive,
  RefreshCw,
  AlertTriangle,
  Upload,
  Download,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { downloadSampleCsvTemplate } from '@/lib/export-utils';
import { AuditFields, DetailSection } from './data-table-types';

export interface DataTableModalsProps<T extends AuditFields = AuditFields> {
  // Detail Modal
  activeDetailRow: T | null;
  onCloseDetail: () => void;
  detailModalSize: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  getDetailSections?: (row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[];
  renderDetailSections?: (row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[];
  detailSections?:
    | (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[]
    | ((row: T) => (DetailSection<T> | DetailSection<Record<string, unknown>> | DetailSection<unknown>)[]);
  // Delete Modal
  deleteModalRow: T | null;
  onCloseDelete: () => void;
  isPermanentDelete: boolean;
  onConfirmDelete: (row: T, isPermanent: boolean) => Promise<void> | void;
  // Import Modal
  showImportModal: boolean;
  onCloseImport: () => void;
  importModalSize: 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  exportFilename: string;
  importTemplateHeaders?: string[];
  importTemplateSample?: string[];
  importFile: File | null;
  onImportFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessImport: () => Promise<void>;
  importLoading: boolean;
  importFeedback: { successCount: number; errors?: string[] } | null;
}

export function DataTableModals<T extends AuditFields = AuditFields>({
  activeDetailRow,
  onCloseDetail,
  detailModalSize,
  getDetailSections,
  renderDetailSections,
  detailSections,
  deleteModalRow,
  onCloseDelete,
  isPermanentDelete,
  onConfirmDelete,
  showImportModal,
  onCloseImport,
  importModalSize,
  exportFilename,
  importTemplateHeaders,
  importTemplateSample,
  importFile,
  onImportFileChange,
  onProcessImport,
  importLoading,
  importFeedback,
}: DataTableModalsProps<T>) {
  return (
    <>
      {/* Comprehensive Details View Modal with Full Audit Lifecycle Timeline */}
      <Modal
        isOpen={!!activeDetailRow}
        onClose={onCloseDetail}
        title={`Fiche Complète — ${activeDetailRow ? String((activeDetailRow as Record<string, unknown>).name || (activeDetailRow as Record<string, unknown>).title || (activeDetailRow as Record<string, unknown>).id || '') : ''}`}
        size={detailModalSize}
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
              <Button variant="secondary" onClick={onCloseDetail}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete / Permanent Delete Confirmation Dialog */}
      <Modal
        isOpen={!!deleteModalRow}
        onClose={onCloseDelete}
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
              <Button variant="secondary" onClick={onCloseDelete}>
                Annuler
              </Button>
              <Button
                className="bg-coral hover:bg-coral/90 text-white font-bold"
                onClick={async () => {
                  await onConfirmDelete(deleteModalRow, isPermanentDelete);
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
        onClose={onCloseImport}
        title="Assistant d'Importation en Masse (CSV)"
        size={importModalSize}
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
              onChange={onImportFileChange}
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
            <Button variant="secondary" onClick={onCloseImport}>
              Annuler
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 font-bold gap-2"
              onClick={onProcessImport}
              disabled={!importFile || importLoading}
            >
              {importLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Lancer l&apos;Importation</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
