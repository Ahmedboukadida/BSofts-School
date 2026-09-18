'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Clock, Send, Users, CheckCheck,
  ListFilter, BellRing, Check, X, AlertCircle, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';
import { LoadingCard } from '@/components/ui/spinner';
import type { StudentRosterItem, AttendanceRecord, ClassOption, SessionOption } from '@/types';

export default function AttendancePage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [viewMode, setViewMode] = useState<'roster' | 'history'>('roster');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [classSessions, setClassSessions] = useState<SessionOption[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  // Roster state
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [isSavingRoster, setIsSavingRoster] = useState(false);

  // History state
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Teacher absence alert state
  const [showTeacherAbsenceModal, setShowTeacherAbsenceModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [absenceDuration, setAbsenceDuration] = useState('La journée entière');
  const [absenceNotes, setAbsenceNotes] = useState('');
  const [isSendingTeacherAlert, setIsSendingTeacherAlert] = useState(false);

  const handleSendTeacherAbsenceAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      toast.showToast(t('attendance.enterTeacherName'), 'error');
      return;
    }
    setIsSendingTeacherAlert(true);
    try {
      const title = `${t('attendance.teacherAbsence')}: ${teacherName}`;
      const message = `Avis: ${teacherSubject || 'Cours'} dispensé par ${teacherName} (${absenceDuration}). ${absenceNotes}`;

      await api.post('/notifications', {
        title,
        message,
        type: 'WARNING',
      }).catch(() => null);

      toast.showToast(
        t('attendance.teacherAlertSent'),
        'success'
      );
      setShowTeacherAbsenceModal(false);
      setTeacherName('');
      setTeacherSubject('');
      setAbsenceNotes('');
    } catch {
      toast.showToast(t('attendance.teacherAlertError'), 'error');
    } finally {
      setIsSendingTeacherAlert(false);
    }
  };

  // Load Classes on mount
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await api.get('/classes?limit=100').catch(() => ({ data: { data: [] } }));
        const list = res.data?.data || res.data || [];
        setClasses(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0 && !selectedClassId) {
          setSelectedClassId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load classes:', err);
      }
    }
    loadClasses();
  }, [selectedClassId]);

  // Fetch or find Sessions for selected class and date
  const fetchClassSessions = useCallback(async () => {
    if (!selectedClassId) return;
    try {
      const res = await api.get('/sessions', {
        params: {
          classId: selectedClassId,
          startDate: selectedDate,
          endDate: selectedDate,
          limit: '50',
        },
      }).catch(() => ({ data: { data: [] } }));
      const sessions: SessionOption[] = res.data?.data || res.data || [];
      const sessionList = Array.isArray(sessions) ? sessions : [];
      setClassSessions(sessionList);
      if (sessionList.length > 0) {
        setSelectedSessionId(sessionList[0].id);
      } else {
        setSelectedSessionId('');
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  }, [selectedClassId, selectedDate]);

  useEffect(() => {
    fetchClassSessions();
  }, [fetchClassSessions]);

  // Load Class Roster & existing attendances for the session
  const fetchRosterAndAttendance = useCallback(async () => {
    if (!selectedClassId) return;
    setIsLoadingRoster(true);
    try {
      // 1. Fetch class students
      const classRes = await api.get(`/classes/${selectedClassId}`).catch(() => ({ data: null }));
      const assignments = classRes.data?.studentClassAssignments || [];
      const students = (Array.isArray(assignments) ? assignments : [])
        .filter((a: any) => a?.student)
        .map((a: any) => a.student);

      // 2. Fetch any existing attendance for this class/session on this date
      const existingAttendanceMap: Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; reason?: string }> = {};
      if (selectedSessionId) {
        const attRes = await api.get('/student-attendance', {
          params: { sessionId: selectedSessionId, limit: '100' },
        }).catch(() => ({ data: { data: [] } }));
        const records: AttendanceRecord[] = attRes.data?.data || [];
        (Array.isArray(records) ? records : []).forEach((rec) => {
          if (rec.student?.id) {
            existingAttendanceMap[rec.student.id] = { status: rec.status, reason: rec.reason };
          }
        });
      }

      // 3. Build roster with defaults or existing statuses
      const rosterList: StudentRosterItem[] = students.map((s: any) => ({
        id: s.id || '',
        firstName: s.firstName || '',
        lastName: s.lastName || '',
        registrationNumber: s.registrationNumber || '',
        status: existingAttendanceMap[s.id]?.status || 'PRESENT',
        reason: existingAttendanceMap[s.id]?.reason || '',
      }));

      setRoster(rosterList);
    } catch (err) {
      console.error('Failed to load roster:', err);
      toast.showToast('Erreur lors du chargement des élèves de la classe', 'error');
    } finally {
      setIsLoadingRoster(false);
    }
  }, [selectedClassId, selectedSessionId, toast]);

  useEffect(() => {
    if (viewMode === 'roster') {
      fetchRosterAndAttendance();
    }
  }, [viewMode, fetchRosterAndAttendance]);

  // Load History
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const params: Record<string, string> = { limit: '100' };
      if (selectedDate) {
        params.startDate = selectedDate;
        params.endDate = selectedDate;
      }
      if (selectedClassId) {
        params.classId = selectedClassId;
      }
      const res = await api.get('/student-attendance', { params });
      setHistoryRecords(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [selectedDate, selectedClassId]);

  useEffect(() => {
    if (viewMode === 'history') {
      fetchHistory();
    }
  }, [viewMode, fetchHistory]);

  // 1-Click Status changer for a student
  const setStudentStatus = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setRoster((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, status } : item))
    );
  };

  const setStudentReason = (studentId: string, reason: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, reason } : item))
    );
  };

  // 1-Click Mark All Present
  const markAllPresent = () => {
    setRoster((prev) => prev.map((item) => ({ ...item, status: 'PRESENT' })));
    toast.showToast(t('attendance.allMarkedPresent'), 'info');
  };

  // Submit Bulk Attendance Sheet
  const handleSaveRoster = async () => {
    if (!selectedClassId) {
      toast.showToast(t('attendance.selectClassRequired'), 'error');
      return;
    }

    setIsSavingRoster(true);
    try {
      let activeSessionId = selectedSessionId;

      // If no session existed yet for this date, automatically create a default session for the class!
      if (!activeSessionId) {
        const createSessionRes = await api.post('/sessions', {
          classId: selectedClassId,
          date: selectedDate,
          startTime: '08:00',
          endTime: '10:00',
          topic: `${t('attendance.dailyCall')} - ${selectedDate}`,
        });
        activeSessionId = createSessionRes.data?.data?.id || createSessionRes.data?.id;
        setSelectedSessionId(activeSessionId);
      }

      // Save bulk attendance
      const payload = {
        sessionId: activeSessionId,
        attendances: roster.map((s) => ({
          studentId: s.id,
          status: s.status,
          reason: s.reason || undefined,
        })),
      };

      await api.post('/student-attendance/bulk', payload);

      toast.showToast(t('attendance.rosterSavedSuccess'), 'success');

      fetchRosterAndAttendance();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string }; message?: string } } })?.response?.data;
      toast.showToast(msg?.error?.message || msg?.message || t('common.errorOccurred'), 'error');
    } finally {
      setIsSavingRoster(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!confirmDelete.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/student-attendance/${confirmDelete.id}`);
      setConfirmDelete({ show: false, id: null });
      fetchHistory();
      toast.showToast(t('attendance.recordDeletedSuccess'), 'success');
    } catch (err) {
      console.error('Failed to delete attendance record:', err);
      toast.showToast(t('attendance.recordDeleteError'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // KPIs
  const stats = useMemo(() => {
    const list = viewMode === 'roster' ? roster : historyRecords;
    const total = list.length;
    const present = list.filter((i) => i.status === 'PRESENT').length;
    const absent = list.filter((i) => i.status === 'ABSENT').length;
    const late = list.filter((i) => i.status === 'LATE').length;
    const excused = list.filter((i) => i.status === 'EXCUSED').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 100;
    return { total, present, absent, late, excused, rate };
  }, [roster, historyRecords, viewMode]);

  const { paginatedItems, currentPage, totalPages, goToPage, totalItems } = usePagination({
    items: historyRecords,
    itemsPerPage: 15,
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            {t('attendance.title')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('attendance.subtitle')}
          </p>
        </div>

        {/* View mode toggle & Teacher alert */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowTeacherAbsenceModal(true)}
            className="gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600" />
            {t('attendance.teacherAbsence')}
          </Button>

          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('roster')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'roster' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {t('attendance.viewRoster')}
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              {t('attendance.viewHistory')}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border border-gray-200 bg-white shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{t('attendance.concernedStudents')}</p>
          </CardContent>
        </Card>
        <Card className="border border-emerald-100 bg-emerald-50/50 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.present}</p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">{t('attendance.presents')}</p>
          </CardContent>
        </Card>
        <Card className="border border-rose-100 bg-rose-50/50 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-rose-600 flex items-center justify-center gap-1">
              {stats.absent}
              {stats.absent > 0 && <BellRing className="w-3.5 h-3.5 text-rose-500 animate-pulse" />}
            </p>
            <p className="text-xs text-rose-700 font-medium mt-0.5">
              {t('attendance.absents')} {stats.absent > 0 && `(${t('attendance.parentAlert')})`}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-amber-100 bg-amber-50/50 shadow-xs">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.late}</p>
            <p className="text-xs text-amber-700 font-medium mt-0.5">{t('attendance.lates')}</p>
          </CardContent>
        </Card>
        <Card className="border border-indigo-100 bg-indigo-50/50 shadow-xs col-span-2 md:col-span-1">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-indigo-600">{stats.rate}%</p>
            <p className="text-xs text-indigo-700 font-medium mt-0.5">{t('attendance.attendanceRate')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Class, Date, and Session Selector */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            {/* Class */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('attendance.classLabel')}</label>
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

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('attendance.dateLabel')}</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* Session Selector */}
            {viewMode === 'roster' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('attendance.sessionLabel')} ({classSessions.length})
                </label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white"
                >
                  {classSessions.length === 0 ? (
                    <option value="">{t('attendance.standardSession')}</option>
                  ) : (
                    classSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)} {s.topic ? `(${s.topic})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VIEW 1: ROSTER / 1-CLICK APPEL */}
      {viewMode === 'roster' && (
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                {t('attendance.enrolledStudentsList')} ({roster.length})
              </span>
              <span className="text-[11px] text-gray-500">
                • {t('attendance.clickStatusHint')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={markAllPresent}
                className="h-8 text-xs font-medium text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                {t('attendance.markAllPresent')}
              </Button>
              <Button
                size="sm"
                onClick={handleSaveRoster}
                isLoading={isSavingRoster}
                className="h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                {t('attendance.saveRoster')}
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            {isLoadingRoster ? (
              <LoadingCard />
            ) : roster.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {t('attendance.noStudentsInClass')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">{t('attendance.studentCol')}</th>
                      <th className="py-3 px-4">{t('attendance.registrationCol')}</th>
                      <th className="py-3 px-4 text-center">{t('attendance.statusCol')}</th>
                      <th className="py-3 px-4">{t('attendance.reasonCol')}</th>
                      <th className="py-3 px-4 text-right">{t('attendance.parentAlertCol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {roster.map((student) => {
                      const isAbsent = student.status === 'ABSENT';
                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-gray-50/80 transition-colors ${isAbsent ? 'bg-rose-50/20' : ''
                            }`}
                        >
                          {/* Student info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[11px]">
                                {(student.firstName || '?')[0]}
                                {(student.lastName || '')[0] || ''}
                              </div>
                              <span className="font-semibold text-gray-900">
                                {student.firstName} {student.lastName}
                              </span>
                            </div>
                          </td>

                          {/* Matricule */}
                          <td className="py-3 px-4 font-mono text-gray-500">
                            {student.registrationNumber || '-'}
                          </td>

                          {/* 1-Click Status Toggles */}
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* PRESENT */}
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${student.status === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-600/30'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                              >
                                <Check className="w-3 h-3" />
                                {t('attendance.markedPresent')}
                              </button>

                              {/* ABSENT */}
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${student.status === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-600/30'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                  }`}
                              >
                                <X className="w-3 h-3" />
                                {t('attendance.markedAbsent')}
                              </button>

                              {/* LATE */}
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'LATE')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${student.status === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-600/30'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                  }`}
                              >
                                <Clock className="w-3 h-3" />
                                {t('attendance.markedLate')}
                              </button>

                              {/* EXCUSED */}
                              <button
                                type="button"
                                onClick={() => setStudentStatus(student.id, 'EXCUSED')}
                                className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${student.status === 'EXCUSED'
                                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600/30'
                                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                  }`}
                              >
                                <AlertCircle className="w-3 h-3" />
                                {t('attendance.markedExcused')}
                              </button>
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              placeholder={isAbsent ? t('attendance.absenceReasonPlaceholder') : t('attendance.observationPlaceholder')}
                              value={student.reason || ''}
                              onChange={(e) => setStudentReason(student.id, e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                            />
                          </td>

                          {/* Parent Alert Status */}
                          <td className="py-3 px-4 text-right">
                            {isAbsent ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <BellRing className="w-3 h-3 text-rose-500" />
                                {t('attendance.parentNotified')}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* VIEW 2: HISTORICAL LOG / RECORDS */}
      {viewMode === 'history' && (
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoadingHistory ? (
              <LoadingCard />
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {t('attendance.noHistoryForDate')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">{t('attendance.studentCol')}</th>
                      <th className="py-3 px-4">{t('attendance.classLabel').replace(' *', '')}</th>
                      <th className="py-3 px-4">{t('attendance.sessionDateCol')}</th>
                      <th className="py-3 px-4">{t('attendance.status')}</th>
                      <th className="py-3 px-4">{t('attendance.reasonCol')}</th>
                      <th className="py-3 px-4 text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {paginatedItems.map((rec) => (
                      <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {rec.student?.firstName} {rec.student?.lastName}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {rec.session?.class?.name || '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono">
                          {rec.session?.date ? new Date(rec.session.date).toLocaleDateString('fr-FR') : selectedDate}
                        </td>
                        <td className="py-3 px-4">
                          {rec.status === 'PRESENT' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> {t('attendance.markedPresent')}
                            </span>
                          )}
                          {rec.status === 'ABSENT' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                              <X className="w-3 h-3" /> {t('attendance.markedAbsent')}
                            </span>
                          )}
                          {rec.status === 'LATE' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> {t('attendance.markedLate')}
                            </span>
                          )}
                          {rec.status === 'EXCUSED' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                              <AlertCircle className="w-3 h-3" /> {t('attendance.markedExcused')}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500">{rec.reason || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setConfirmDelete({ show: true, id: rec.id })}
                            className="p-1.5 hover:bg-rose-50 rounded-md text-gray-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalItems > 15 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDeleteHistory}
        title={t('attendance.deleteAttendanceTitle')}
        message={t('attendance.deleteAttendanceMsg')}
        confirmLabel={t('attendance.deleteConfirm')}
        isLoading={deleteLoading}
      />

      {/* Teacher Absence Notification Modal */}
      <Modal
        isOpen={showTeacherAbsenceModal}
        onClose={() => setShowTeacherAbsenceModal(false)}
        title={t('attendance.teacherAbsenceTitle')}
        size="5xl"
      >
        <form onSubmit={handleSendTeacherAbsenceAlert} className="space-y-4">
          <p className="text-xs text-gray-500">
            {t('attendance.teacherAbsenceDesc')} ({classes.find((c) => c.id === selectedClassId)?.name || ''}).
          </p>

          <Input
            label={`${t('attendance.teacherName')} *`}
            placeholder="Ex: Prof. Ahmed Trabelsi"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('attendance.subjectLabel')}
              placeholder="Ex: Mathématiques"
              value={teacherSubject}
              onChange={(e) => setTeacherSubject(e.target.value)}
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('attendance.durationSlot')}</label>
              <select
                value={absenceDuration}
                onChange={(e) => setAbsenceDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800 bg-white"
              >
                <option value="La séance de 08h00">{t('attendance.slotSession8')}</option>
                <option value="La séance de 10h00">{t('attendance.slotSession10')}</option>
                <option value="L'après-midi">{t('attendance.slotAfternoon')}</option>
                <option value="La journée entière">{t('attendance.slotFullDay')}</option>
                <option value="48 heures (Remplacement en cours)">{t('attendance.slot48h')}</option>
              </select>
            </div>
          </div>

          <Textarea
            label={t('attendance.additionalNotes')}
            placeholder={t('attendance.notesPlaceholder')}
            value={absenceNotes}
            onChange={(e) => setAbsenceNotes(e.target.value)}
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowTeacherAbsenceModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={isSendingTeacherAlert}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              <Send className="w-4 h-4" />
              {t('attendance.broadcastAlert')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

