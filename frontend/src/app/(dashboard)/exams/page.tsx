'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Search, FileText, Edit, Trash2, Award, Printer,
  Calculator, CheckCircle, AlertTriangle, XCircle, GraduationCap,
  BookOpen, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useToast } from '@/components/ui/toast';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import { LoadingCard } from '@/components/ui/spinner';
import type { Exam, BulletinSummary, DetailedBulletinData } from '@/types';

export default function ExamsAndBulletinsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'exams' | 'bulletins'>('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [bulletins, setBulletins] = useState<BulletinSummary[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [periods, setPeriods] = useState<{ id: string; name: string }[]>([]);
  const [matieres, setMatieres] = useState<{ id: string; name: string }[]>([]);

  // Bulletin filters & generation state
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedDetailedBulletin, setSelectedDetailedBulletin] = useState<DetailedBulletinData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Exam Search & Form state
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [examFormData, setExamFormData] = useState({
    title: '',
    type: 'QUIZ',
    classId: '',
    matiereId: '',
    maxScore: '20',
    duration: '60',
  });
  const [examFormLoading, setExamFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load initial dropdowns
  const fetchDropdowns = useCallback(async () => {
    try {
      const [classesRes, matieresRes, periodsRes] = await Promise.all([
        api.get('/classes?limit=100'),
        api.get('/matieres?limit=100'),
        api.get('/periods?limit=50').catch(() => ({ data: { data: [] } })),
      ]);
      const classList = classesRes.data?.data || [];
      setClasses(classList);
      setMatieres(matieresRes.data?.data || []);
      const periodList = periodsRes.data?.data || [];
      setPeriods(periodList);

      if (classList.length > 0 && !selectedClassId) {
        setSelectedClassId(classList[0].id);
      }
      if (periodList.length > 0 && !selectedPeriodId) {
        setSelectedPeriodId(periodList[0].id);
      }
    } catch (err) {
      console.error('Failed to load dropdowns:', err);
    }
  }, [selectedClassId, selectedPeriodId]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  // Load Exams
  const fetchExams = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/exams?limit=100');
      setExams(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      toast.showToast(t('common.error') || 'Erreur de chargement', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  // Load Bulletins for selected class and period
  const fetchBulletins = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      setIsLoading(true);
      const params: Record<string, string> = { classId: selectedClassId, limit: '100' };
      if (selectedPeriodId) params.periodId = selectedPeriodId;
      const res = await api.get('/bulletins', { params });
      setBulletins(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch bulletins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedPeriodId]);

  useEffect(() => {
    if (activeTab === 'exams') {
      fetchExams();
    } else {
      fetchBulletins();
    }
  }, [activeTab, fetchExams, fetchBulletins]);

  // Automated Bulletin Calculation & Deliberation for Class
  const handleCalculateBulletins = async () => {
    if (!selectedClassId) {
      toast.showToast(t('exams.selectClassFirst'), 'error');
      return;
    }
    setIsCalculating(true);
    try {
      // Find periodId if not set
      let targetPeriodId = selectedPeriodId;
      if (!targetPeriodId && periods.length > 0) {
        targetPeriodId = periods[0].id;
      }
      
      const res = await api.post('/bulletins/generate-class', {
        classId: selectedClassId,
        periodId: targetPeriodId,
      });

      toast.showToast(res.data?.message || t('exams.calculateBulletinsSuccess'), 'success');
      fetchBulletins();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.showToast(msg || t('exams.calculateBulletinsError'), 'error');
    } finally {
      setIsCalculating(false);
    }
  };

  // Open Detailed Printable Bulletin Modal
  const handleViewDetailedBulletin = async (bulletinId: string) => {
    setLoadingDetail(true);
    setShowPrintModal(true);
    try {
      const res = await api.get(`/bulletins/${bulletinId}/detailed`);
      setSelectedDetailedBulletin(res.data);
    } catch (err) {
      console.error('Failed to load detailed bulletin:', err);
      toast.showToast(t('common.error'), 'error');
      setShowPrintModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Exam CRUD Handlers
  const openAddExamForm = () => {
    setEditingId(null);
    setExamFormData({
      title: '',
      type: 'QUIZ',
      classId: selectedClassId || classes[0]?.id || '',
      matiereId: matieres[0]?.id || '',
      maxScore: '20',
      duration: '60',
    });
    setShowExamForm(true);
  };

  const openEditExamForm = (exam: Exam) => {
    setEditingId(exam.id);
    setExamFormData({
      title: exam.title,
      type: exam.type,
      classId: exam.class?.id || '',
      matiereId: exam.matiere?.id || '',
      maxScore: String(exam.maxScore || '20'),
      duration: String(exam.duration || '60'),
    });
    setShowExamForm(true);
  };

  const handleExamSubmit = async () => {
    if (!examFormData.title) {
      toast.showToast(t('exams.fillExamTitleError'), 'error');
      return;
    }
    setExamFormLoading(true);
    try {
      const payload = {
        title: examFormData.title,
        type: examFormData.type,
        classId: examFormData.classId || undefined,
        matiereId: examFormData.matiereId || undefined,
        maxScore: Number(examFormData.maxScore),
        duration: Number(examFormData.duration),
      };
      if (editingId) {
        await api.put(`/exams/${editingId}`, payload);
        toast.showToast(t('exams.examUpdatedSuccess'), 'success');
      } else {
        await api.post('/exams', payload);
        toast.showToast(t('exams.examCreatedSuccess'), 'success');
      }
      setShowExamForm(false);
      fetchExams();
    } catch (error) {
      console.error('Failed to save exam:', error);
      toast.showToast(t('common.error'), 'error');
    } finally {
      setExamFormLoading(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!confirmDelete.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/exams/${confirmDelete.id}`);
      setConfirmDelete({ show: false, id: null });
      fetchExams();
      toast.showToast(t('exams.examDeletedSuccess'), 'success');
    } catch (error) {
      console.error('Failed to delete exam:', error);
      toast.showToast(t('common.error'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredExams = useMemo(() => {
    return exams.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.class?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.matiere?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [exams, search]);

  const { paginatedItems: paginatedExams, currentPage: examPage, totalPages: examTotalPages, goToPage: goToExamPage, totalItems: examTotalItems } = usePagination({
    items: filteredExams,
    itemsPerPage: 9,
  });

  const { paginatedItems: paginatedBulletins, currentPage: bPage, totalPages: bTotalPages, goToPage: goToBPage, totalItems: bTotalItems } = usePagination({
    items: bulletins,
    itemsPerPage: 15,
  });

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            {t('exams.title')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('exams.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('exams')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              {t('exams.tabExams')}
            </button>
            <button
              onClick={() => setActiveTab('bulletins')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'bulletins' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              {t('exams.tabBulletins')}
            </button>
          </div>

          {activeTab === 'exams' && (
            <Button onClick={openAddExamForm} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              {t('exams.newExam')}
            </Button>
          )}
        </div>
      </div>

      {/* TAB 1: EXAMS LIST */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('exams.searchPlaceholder')}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {isLoading ? (
                <LoadingCard />
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {t('exams.noExams')}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedExams.map((exam) => (
                    <div
                      key={exam.id}
                      className="p-4 border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-xs transition-all bg-white flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-gray-900">{exam.title}</h3>
                              <p className="text-xs text-indigo-600 font-medium">
                                {exam.matiere?.name || t('exams.generalSubject')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditExamForm(exam)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-indigo-600 transition-colors"
                              title={t('common.edit')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ show: true, id: exam.id })}
                              className="p-1 hover:bg-rose-50 rounded text-gray-400 hover:text-rose-600 transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                            <span>{t('exams.class')}: {exam.class?.name || t('exams.allClasses')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{t('common.type')}: {exam.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                          / {exam.maxScore} pts
                        </span>
                        <span className="text-gray-400">
                          {exam.duration ? `${exam.duration} min` : t('exams.standardDuration')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {examTotalItems > 9 && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Pagination currentPage={examPage} totalPages={examTotalPages} onPageChange={goToExamPage} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: BULLETINS & DELIBERATIONS */}
      {activeTab === 'bulletins' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-lg">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('exams.class')} *</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('exams.currentPeriod')}</label>
                    <select
                      value={selectedPeriodId}
                      onChange={(e) => setSelectedPeriodId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white"
                    >
                      <option value="">{t('exams.currentPeriod')}</option>
                      {periods.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleCalculateBulletins}
                  isLoading={isCalculating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs shrink-0"
                >
                  <Calculator className="w-4 h-4 mr-1.5" />
                  {t('exams.calculateBulletins')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulletins Table */}
          <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {t('exams.councilResults')} ({bulletins.length} {t('exams.classifiedStudents')})
              </h3>
              <span className="text-[11px] text-gray-500">
                {t('exams.redemptionThresholdNote')}
              </span>
            </div>

            <CardContent className="p-0">
              {isLoading ? (
                <LoadingCard />
              ) : bulletins.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {t('exams.noBulletins')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4 text-center w-16">{t('exams.rank')}</th>
                        <th className="py-3 px-4">{t('exams.student')}</th>
                        <th className="py-3 px-4">{t('exams.class')}</th>
                        <th className="py-3 px-4 text-center">{t('exams.totalPoints')}</th>
                        <th className="py-3 px-4 text-center">{t('exams.averageOutOf20')}</th>
                        <th className="py-3 px-4">{t('exams.decision')}</th>
                        <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {paginatedBulletins.map((b) => {
                        const avg = Number(b.averageScore);
                        const isRachat = avg >= 9.5 && avg < 10.0;
                        const isAdmis = avg >= 10.0;

                        return (
                          <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                            {/* Rank */}
                            <td className="py-3 px-4 text-center font-bold text-gray-900">
                              {b.rank ? (
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                    b.rank === 1
                                      ? 'bg-amber-100 text-amber-800 font-extrabold'
                                      : b.rank === 2
                                      ? 'bg-gray-200 text-gray-800 font-bold'
                                      : b.rank === 3
                                      ? 'bg-amber-50 text-amber-700 font-bold'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {b.rank}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* Student */}
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-900">
                                {b.student?.firstName} {b.student?.lastName}
                              </span>
                            </td>

                            {/* Class */}
                            <td className="py-3 px-4 text-gray-600">{b.class?.name}</td>

                            {/* Total Points */}
                            <td className="py-3 px-4 text-center font-mono text-gray-600">
                              {Number(b.totalScore).toFixed(2)}
                            </td>

                            {/* Average / 20 */}
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md ${
                                  isAdmis
                                    ? 'text-emerald-700 bg-emerald-50'
                                    : isRachat
                                    ? 'text-amber-700 bg-amber-50'
                                    : 'text-rose-700 bg-rose-50'
                                }`}
                              >
                                {avg.toFixed(2)}
                              </span>
                            </td>

                            {/* Decision / Deliberation */}
                            <td className="py-3 px-4">
                              {isRachat ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/75 px-2 py-0.5 rounded-full border border-amber-300">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  {t('exams.rescued')}
                                </span>
                              ) : isAdmis ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100/75 px-2 py-0.5 rounded-full border border-emerald-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                  {b.comments || t('exams.admitted')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-800 bg-rose-100/75 px-2 py-0.5 rounded-full border border-rose-300">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  {t('exams.adjourned')}
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleViewDetailedBulletin(b.id)}
                                className="h-7 text-xs font-medium text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50"
                              >
                                <Printer className="w-3 h-3 mr-1" />
                                {t('exams.printBulletin')}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {bTotalItems > 15 && (
                <div className="p-4 border-t border-gray-100">
                  <Pagination currentPage={bPage} totalPages={bTotalPages} onPageChange={goToBPage} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* OFFICIAL PRINTABLE BULLETIN MODAL */}
      <Modal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        title={t('exams.officialTitle')}
        size="6xl"
      >
        <div className="space-y-4">
          {loadingDetail || !selectedDetailedBulletin ? (
            <LoadingCard />
          ) : (
            <div>
              {/* Printable Document Container */}
              <div
                id="printable-bulletin"
                className="p-6 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 space-y-5"
              >
                {/* Official Header */}
                <div className="border-b-2 border-gray-900 pb-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold uppercase tracking-wider text-[11px] text-gray-900">
                      {t('exams.republicOfTunisia')}
                    </p>
                    <p className="text-[10px] text-gray-600">{t('exams.ministryOfEducation')}</p>
                    <p className="text-xs font-extrabold text-indigo-900">
                      {t('exams.schoolManagement')}
                    </p>
                  </div>
                  <div className="text-center">
                    <h2 className="text-base font-black uppercase text-gray-900 tracking-wider">
                      {t('exams.reportCardHeader')}
                    </h2>
                    <p className="text-xs font-semibold text-indigo-700">
                      {selectedDetailedBulletin.period?.name || 'Trimestre 1'}
                    </p>
                  </div>
                  <div className="text-right space-y-0.5 text-[11px]">
                    <p className="font-semibold text-gray-900">
                      {t('exams.academicYear')}: {selectedDetailedBulletin.class?.academicYear?.name || '2026/2027'}
                    </p>
                    <p className="text-gray-500 font-mono text-[10px]">
                      {t('exams.issuedOn')}: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Student Identification Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t('exams.fullName')}</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedDetailedBulletin.student?.firstName} {selectedDetailedBulletin.student?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t('exams.studentId')}</span>
                    <span className="font-mono font-medium text-gray-800">
                      {selectedDetailedBulletin.student?.registrationNumber || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t('exams.classAndLevel')}</span>
                    <span className="font-semibold text-indigo-700">
                      {selectedDetailedBulletin.class?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">{t('exams.classRank')}</span>
                    <span className="font-bold text-gray-900">
                      {selectedDetailedBulletin.rank}
                      <span className="text-gray-500 font-normal"> / {selectedDetailedBulletin.classStatistics?.totalStudents || '-'}</span>
                    </span>
                  </div>
                </div>

                {/* Subject Breakdown Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">{t('exams.subject')}</th>
                        <th className="py-2 px-3 text-center">{t('exams.coef')}</th>
                        <th className="py-2 px-3 text-center">{t('exams.subjectAverage')}</th>
                        <th className="py-2 px-3 text-center">{t('exams.weightedPoints')}</th>
                        <th className="py-2 px-3">{t('exams.appreciation')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedDetailedBulletin.subjects?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-gray-400">
                            {t('exams.noSubjectGrades')}
                          </td>
                        </tr>
                      ) : (
                        selectedDetailedBulletin.subjects?.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="py-2 px-3 font-semibold text-gray-900">{sub.name}</td>
                            <td className="py-2 px-3 text-center font-mono">{sub.coefficient}</td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-gray-800">
                              {sub.average.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">{sub.totalPoints.toFixed(2)}</td>
                            <td className="py-2 px-3 font-medium text-gray-600">{sub.appreciation}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Overall Calculation Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-indigo-950">{t('exams.classStats')}</p>
                    <div className="flex gap-4 text-gray-600">
                      <span>{t('exams.classAvg')}: <b>{selectedDetailedBulletin.classStatistics?.classAverage.toFixed(2)}</b></span>
                      <span>{t('exams.max')}: <b>{selectedDetailedBulletin.classStatistics?.maxAverage.toFixed(2)}</b></span>
                      <span>{t('exams.min')}: <b>{selectedDetailedBulletin.classStatistics?.minAverage.toFixed(2)}</b></span>
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="text-xs text-gray-600">
                      {t('exams.totalPoints')}: <b className="font-mono text-gray-900">{Number(selectedDetailedBulletin.totalScore).toFixed(2)}</b>
                    </p>
                    <p className="text-base font-extrabold text-indigo-900">
                      {t('exams.generalAverage')} : <span className="font-mono text-lg">{Number(selectedDetailedBulletin.averageScore).toFixed(2)}</span> / 20
                    </p>
                    <p className="text-xs font-semibold text-indigo-700">
                      {t('exams.councilDecisionLabel')}: {selectedDetailedBulletin.comments || (selectedDetailedBulletin.isPromoted ? t('exams.admitted') : t('exams.adjourned'))}
                    </p>
                  </div>
                </div>

                {/* Signatures & School Stamp */}
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-200 text-center text-xs">
                  <div>
                    <p className="font-semibold text-gray-700 mb-8">{t('exams.headTeacherSignature')}</p>
                    <p className="text-[10px] text-gray-400">{t('exams.signature')}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-8">{t('exams.principalSignature')}</p>
                    <div className="inline-block border border-dashed border-gray-300 px-4 py-1 text-[10px] text-gray-400">
                      {t('exams.officialStamp')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
                  {t('common.close')}
                </Button>
                <Button
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Printer className="w-4 h-4 mr-1.5" />
                  {t('exams.printThisBulletin')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal: Create/Edit Exam */}
      <Modal
        isOpen={showExamForm}
        onClose={() => setShowExamForm(false)}
        title={editingId ? t('exams.editExam') : t('exams.newExam')}
        size="5xl"
      >
        <div className="space-y-4 text-xs">
          <Input
            label={t('exams.examTitleRequired')}
            value={examFormData.title}
            onChange={(e) => setExamFormData({ ...examFormData, title: e.target.value })}
            placeholder={t('exams.examTitlePlaceholder')}
          />

          <Select
            label={t('exams.class')}
            value={examFormData.classId}
            onChange={(e) => setExamFormData({ ...examFormData, classId: e.target.value })}
            options={[
              { value: '', label: t('exams.allClasses') },
              ...classes.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <Select
            label={t('exams.subject')}
            value={examFormData.matiereId}
            onChange={(e) => setExamFormData({ ...examFormData, matiereId: e.target.value })}
            options={[
              { value: '', label: t('exams.unspecified') },
              ...matieres.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('exams.maxScore')}
              type="number"
              value={examFormData.maxScore}
              onChange={(e) => setExamFormData({ ...examFormData, maxScore: e.target.value })}
            />
            <Input
              label={t('exams.durationMinutes')}
              type="number"
              value={examFormData.duration}
              onChange={(e) => setExamFormData({ ...examFormData, duration: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowExamForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExamSubmit} isLoading={examFormLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDeleteExam}
        title={t('crud.deleteExam')}
        message={t('exams.deleteExamConfirm')}
        confirmLabel={t('common.delete')}
        isLoading={deleteLoading}
      />
    </div>
  );
}

