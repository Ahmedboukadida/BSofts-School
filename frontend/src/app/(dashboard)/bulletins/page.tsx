'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FileText, Search, Download, CheckCircle, XCircle, AlertCircle, Eye, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useToast } from '@/components/ui/toast';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import { useActiveContext } from '@/hooks/use-active-context';
import { useTenantAi } from '@/hooks/use-tenant-ai';
import { AiBulletinModal } from '@/components/ai/ai-bulletin-modal';
import type { BulletinItem, DetailedBulletin, Class } from '@/types';

export default function BulletinsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { contextParams } = useActiveContext();
  const { hasAiFeature } = useTenantAi();

  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [selectedBulletin, setSelectedBulletin] = useState<DetailedBulletin | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showAiBulletinModal, setShowAiBulletinModal] = useState(false);
  const [aiStudentData, setAiStudentData] = useState<{ studentId: string; studentName: string; periodId: string } | null>(null);

  // Pagination
  const filteredBulletins = useMemo(() => {
    if (!searchQuery) return bulletins;
    const lowerSearch = searchQuery.toLowerCase();
    return bulletins.filter((b) =>
      ((b.student?.firstName || '') + ' ' + (b.student?.lastName || ''))
        .toLowerCase()
        .includes(lowerSearch)
    );
  }, [bulletins, searchQuery]);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToPage,
  } = usePagination({ items: filteredBulletins, itemsPerPage: 10 });

  const fetchDependencies = useCallback(async () => {
    try {
      const [clsRes, perRes] = await Promise.all([
        api.get('/classes?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/academic-periods?limit=100').catch(() => ({ data: { data: [] } })),
      ]);
      const clsList = clsRes.data?.data ?? clsRes.data ?? [];
      const perList = perRes.data?.data ?? perRes.data ?? [];

      setClasses(Array.isArray(clsList) ? clsList : []);
      setPeriods(Array.isArray(perList) ? perList : []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchBulletins = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/bulletins', {
        params: {
          classId: selectedClassId || undefined,
          periodId: selectedPeriodId || undefined,
          ...contextParams,
        },
      });
      const data = res.data?.data ?? res.data;
      setBulletins(Array.isArray(data) ? data : []);
    } catch {
      showToast(t('common.error') || 'Erreur lors du chargement des bulletins', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedPeriodId, contextParams, showToast, t]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  useEffect(() => {
    fetchBulletins();
  }, [fetchBulletins]);

  const handleGenerate = async () => {
    if (!selectedClassId || !selectedPeriodId) {
      showToast('Veuillez sélectionner une classe et une période', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      await api.post('/bulletins/generate', {
        classId: selectedClassId,
        periodId: selectedPeriodId,
      });
      showToast(t('exams.calculateBulletinsSuccess') || 'Bulletins calculés avec succès', 'success');
      setShowGenerateModal(false);
      fetchBulletins();
    } catch {
      showToast(t('exams.calculateBulletinsError') || 'Erreur lors de la génération', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    setIsDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await api.get(`/bulletins/${id}/detailed`);
      const data = res.data?.data ?? res.data;
      setSelectedBulletin(data);
    } catch {
      showToast('Erreur lors du chargement des détails', 'error');
      setShowDetailModal(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string, studentName: string) => {
    try {
      const res = await api.get(`/bulletins/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulletin_${studentName.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast('Erreur lors du téléchargement du PDF', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('navigation.bulletinsTitle') || 'Bulletins Scolaires'}
          </h1>
          <p className="text-muted-foreground">
            {t('navigation.bulletinsDesc') || 'Gérez et éditez les bulletins officiels des élèves'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasAiFeature && (
            <Button
              variant="outline"
              onClick={() => {
                setAiStudentData(null);
                setShowAiBulletinModal(true);
              }}
              className="border-[#CCA43B] text-[#8C6D1F] hover:bg-[#FAF6EC] dark:hover:bg-[#2A2415] font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4 text-[#CCA43B]" />
              Appréciation IA
            </Button>
          )}
          <Button onClick={() => setShowGenerateModal(true)}>
            <FileText className="mr-2 h-4 w-4" />
            {t('exams.calculateBulletins') || 'Générer les Bulletins'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher un élève..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                options={[
                  { label: 'Toutes les classes', value: '' },
                  ...classes.map((c) => ({ label: c.name, value: c.id })),
                ]}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                options={[
                  { label: 'Toutes les périodes', value: '' },
                  ...periods.map((p) => ({ label: p.name, value: p.id })),
                ]}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              {t('common.loading') || 'Chargement...'}
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {t('exams.noBulletins') || 'Aucun bulletin disponible'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-4 py-3">{t('exams.student') || 'Élève'}</th>
                      <th className="px-4 py-3">{t('exams.class') || 'Classe'}</th>
                      <th className="px-4 py-3">Période</th>
                      <th className="px-4 py-3">{t('exams.averageOutOf20') || 'Moyenne / 20'}</th>
                      <th className="px-4 py-3">{t('exams.rank') || 'Rang'}</th>
                      <th className="px-4 py-3">Décision</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedItems.map((item) => {
                      const avg = Number(item.averageScore || 0);
                      const isAdmitted = avg >= 10;
                      const isDeliberation = avg >= 9.5 && avg < 10;

                      return (
                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 font-medium">
                            {item.student?.firstName} {item.student?.lastName}
                          </td>
                          <td className="px-4 py-3">{item.class?.name || '-'}</td>
                          <td className="px-4 py-3">{item.period?.name || '-'}</td>
                          <td className="px-4 py-3 font-bold">{avg.toFixed(2)}</td>
                          <td className="px-4 py-3">{item.rank ? String(item.rank) : '-'}</td>
                          <td className="px-4 py-3">
                            {isAdmitted ? (
                              <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                {t('exams.admitted') || 'Admis'}
                              </span>
                            ) : isDeliberation ? (
                              <span className="inline-flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {t('exams.rescued') || 'Rachat'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
                                <XCircle className="w-3 h-3 mr-1" />
                                {t('exams.adjourned') || 'Ajourné'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(item.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDownloadPdf(
                                    item.id,
                                    `${item.student?.lastName || ''}_${item.student?.firstName || ''}`
                                  )
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Générer les bulletins de classe"
      >
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Classe</label>
            <Select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={[
                { label: 'Sélectionner une classe...', value: '' },
                ...classes.map((c) => ({ label: c.name, value: c.id })),
              ]}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Période académique</label>
            <Select
              value={selectedPeriodId}
              onChange={(e) => setSelectedPeriodId(e.target.value)}
              options={[
                { label: 'Sélectionner une période...', value: '' },
                ...periods.map((p) => ({ label: p.name, value: p.id })),
              ]}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
            {t('common.cancel') || 'Annuler'}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedClassId || !selectedPeriodId}>
            {isGenerating ? t('common.loading') || 'Calcul en cours...' : 'Calculer & Délibérer'}
          </Button>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails du Bulletin Scolaire"
        size="xl"
      >
        {isDetailLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            {t('common.loading') || 'Chargement...'}
          </div>
        ) : selectedBulletin ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">Informations de l&apos;élève</h3>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    <strong>{t('exams.fullName') || 'Nom & Prénom'}:</strong>{' '}
                    {selectedBulletin.student.lastName.toUpperCase()} {selectedBulletin.student.firstName}
                  </p>
                  <p>
                    <strong>{t('exams.studentId') || 'Matricule'}:</strong>{' '}
                    {selectedBulletin.student.registrationNumber || '-'}
                  </p>
                  <p>
                    <strong>{t('exams.class') || 'Classe'}:</strong> {selectedBulletin.class.name}
                  </p>
                  <p>
                    <strong>Période:</strong> {selectedBulletin.period.name}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">Résultats & Statistiques</h3>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>
                    <strong>{t('exams.averageOutOf20') || 'Moyenne'}:</strong>{' '}
                    <span className="font-bold text-lg text-brand">
                      {Number(selectedBulletin.averageScore || 0).toFixed(2)} / 20
                    </span>
                  </p>
                  <p>
                    <strong>{t('exams.rank') || 'Rang'}:</strong>{' '}
                    {selectedBulletin.rank
                      ? `${selectedBulletin.rank} / ${selectedBulletin.classStatistics?.totalStudents || '-'}`
                      : '-'}
                  </p>
                  <p>
                    <strong>Moyenne de classe:</strong>{' '}
                    {selectedBulletin.classStatistics?.classAverage != null
                      ? `${Number(selectedBulletin.classStatistics.classAverage).toFixed(2)} / 20`
                      : '-'}
                  </p>
                  <div className="mt-2">
                    {Number(selectedBulletin.averageScore || 0) >= 10 ? (
                      <span className="inline-flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-md font-medium text-xs">
                        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                        {t('exams.admitted') || 'Admis'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-md font-medium text-xs">
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        {t('exams.adjourned') || 'Ajourné'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-2">Matière</th>
                    <th className="px-4 py-2 text-center">Coef</th>
                    <th className="px-4 py-2 text-center">Moyenne</th>
                    <th className="px-4 py-2 text-center">{t('exams.totalPoints') || 'Points'}</th>
                    <th className="px-4 py-2">Appréciation</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedBulletin.subjects?.map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-2 font-medium">{subject.name}</td>
                      <td className="px-4 py-2 text-center">{subject.coefficient}</td>
                      <td className="px-4 py-2 text-center font-bold">
                        {Number(subject.average || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {Number(subject.totalPoints || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-xs">{subject.appreciation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2">
              {hasAiFeature && selectedBulletin && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAiStudentData({
                      studentId: selectedBulletin.student.id,
                      studentName: `${selectedBulletin.student.firstName} ${selectedBulletin.student.lastName}`,
                      periodId: selectedBulletin.period.id,
                    });
                    setShowAiBulletinModal(true);
                  }}
                  className="border-[#CCA43B] text-[#8C6D1F] hover:bg-[#FAF6EC] dark:hover:bg-[#2A2415] font-medium"
                >
                  <Sparkles className="mr-2 h-4 w-4 text-[#CCA43B]" />
                  Générer appréciation IA
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadPdf(
                    selectedBulletin.id,
                    `${selectedBulletin.student.lastName}_${selectedBulletin.student.firstName}`
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                {t('exams.downloadReportCard') || 'Télécharger le Bulletin (PDF)'}
              </Button>
              <Button onClick={() => setShowDetailModal(false)}>
                {t('common.cancel') || 'Fermer'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* AI Bulletin Remarks Generator Modal */}
      {hasAiFeature && (
        <AiBulletinModal
          isOpen={showAiBulletinModal}
          onClose={() => setShowAiBulletinModal(false)}
          studentId={aiStudentData?.studentId}
          periodId={aiStudentData?.periodId}
          studentName={aiStudentData?.studentName}
        />
      )}
    </div>
  );
}
