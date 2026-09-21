'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Search, Calendar as CalendarIcon, Edit, Trash2,
  ChevronLeft, ChevronRight, LayoutGrid, List, Clock,
  MapPin, User, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { ScheduleSessionItem as Session } from '@/types';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

const DAYS = [
  { key: 'monday', dayIndex: 1 },
  { key: 'tuesday', dayIndex: 2 },
  { key: 'wednesday', dayIndex: 3 },
  { key: 'thursday', dayIndex: 4 },
  { key: 'friday', dayIndex: 5 },
  { key: 'saturday', dayIndex: 6 },
];

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatTimeString(isoOrTime: string): string {
  if (!isoOrTime) return '';
  if (isoOrTime.includes('T')) {
    const d = new Date(isoOrTime);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return isoOrTime.substring(0, 5);
}

export default function SchedulePage() {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() => getMonday(new Date()));
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Dropdowns
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);

  // Modal / Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    classId: '',
    teacherId: '',
    roomId: '',
    date: '',
    startTime: '08:00',
    endTime: '10:00',
    topic: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formConflictError, setFormConflictError] = useState('');

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Dates for the current week (Mon-Sat)
  const weekDates = useMemo(() => {
    return DAYS.map((d, i) => {
      const date = new Date(currentWeekMonday);
      date.setDate(currentWeekMonday.getDate() + i);
      return {
        ...d,
        date,
        isoDate: date.toISOString().split('T')[0],
      };
    });
  }, [currentWeekMonday]);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = { limit: '200' };
      if (selectedClassId) params.classId = selectedClassId;
      if (selectedTeacherId) params.teacherId = selectedTeacherId;

      const response = await api.get('/sessions', { params });
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.showToast(t('common.error') || 'Erreur lors du chargement', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedTeacherId, t, toast]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const [classesRes, teachersRes, roomsRes] = await Promise.all([
        api.get('/classes?limit=100'),
        api.get('/teachers?limit=100'),
        api.get('/rooms?limit=100'),
      ]);
      setClasses(classesRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
      setRooms(roomsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdowns:', error);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Week navigation
  const prevWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() - 7);
    setCurrentWeekMonday(next);
  };

  const nextWeek = () => {
    const next = new Date(currentWeekMonday);
    next.setDate(next.getDate() + 7);
    setCurrentWeekMonday(next);
  };

  const currentWeek = () => {
    setCurrentWeekMonday(getMonday(new Date()));
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !search ||
        s.class?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.teacher?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        s.teacher?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
        s.room?.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.topic?.toLowerCase().includes(search.toLowerCase());

      const matchClass = !selectedClassId || s.class?.id === selectedClassId;
      const matchTeacher = !selectedTeacherId || s.teacher?.id === selectedTeacherId;
      const matchRoom = !selectedRoomId || s.room?.id === selectedRoomId;

      return matchSearch && matchClass && matchTeacher && matchRoom;
    });
  }, [sessions, search, selectedClassId, selectedTeacherId, selectedRoomId]);

  // Quick Open Create modal
  const openCreateForm = (presetDate?: string, presetStartTime?: string) => {
    setEditingId(null);
    setFormConflictError('');
    
    let endTime = '10:00';
    if (presetStartTime) {
      const hour = parseInt(presetStartTime.split(':')[0], 10);
      endTime = `${String(hour + 1).padStart(2, '0')}:00`;
    }

    setFormData({
      classId: selectedClassId || (classes[0]?.id ?? ''),
      teacherId: selectedTeacherId || '',
      roomId: selectedRoomId || '',
      date: presetDate || new Date().toISOString().split('T')[0],
      startTime: presetStartTime || '08:00',
      endTime,
      topic: '',
    });
    setShowForm(true);
  };

  const openEditForm = (session: Session) => {
    setEditingId(session.id);
    setFormConflictError('');
    setFormData({
      classId: session.class?.id || '',
      teacherId: session.teacher?.id || '',
      roomId: session.room?.id || '',
      date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
      startTime: formatTimeString(session.startTime),
      endTime: formatTimeString(session.endTime),
      topic: session.topic || '',
    });
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    if (!formData.classId || !formData.date || !formData.startTime || !formData.endTime) {
      setFormConflictError(t('schedule.validationRequired'));
      return;
    }

    setFormConflictError('');
    setFormLoading(true);
    try {
      if (editingId) {
        await api.patch(`/sessions/${editingId}`, formData);
        toast.showToast(t('schedule.sessionUpdated'), 'success');
      } else {
        await api.post('/sessions', formData);
        toast.showToast(t('schedule.sessionPlannedSuccess'), 'success');
      }
      setShowForm(false);
      fetchSessions();
    } catch (error: unknown) {
      const errRes = (error as { response?: { data?: { error?: { message?: string }; message?: string }; status?: number } })?.response;
      const message = errRes?.data?.error?.message || errRes?.data?.message || t('common.error');
      setFormConflictError(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/sessions/${confirmDelete.id}`);
      setConfirmDelete({ show: false, id: null });
      fetchSessions();
      toast.showToast(t('schedule.sessionCancelSuccess'), 'success');
    } catch (error) {
      console.error('Failed to cancel session:', error);
      toast.showToast(t('schedule.sessionCancelError'), 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> {t('schedule.status.completed')}</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> {t('schedule.status.inProgress')}</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> {t('schedule.status.cancelled')}</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#242F40] bg-[#242F40]/10 px-2 py-0.5 rounded-full">{t('schedule.status.scheduled')}</span>;
    }
  };

  const { paginatedItems, currentPage, totalPages, goToPage, totalItems } = usePagination({ items: filteredSessions, itemsPerPage: 12 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#242F40] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#CCA43B]" />
            {t('schedule.title')}
          </h1>
          <p className="text-sm text-gray-500">
            {t('schedule.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-[#242F40] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              {t('schedule.gridView')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-[#242F40] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              {t('schedule.listView')}
            </button>
          </div>

          <Button onClick={() => openCreateForm()} className="bg-[#242F40] hover:bg-[#363636] text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            {t('schedule.newSession')}
          </Button>
        </div>
      </div>

      {/* Control Bar: Filters & Week Navigator */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('schedule.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#CCA43B] text-gray-800"
              />
            </div>

            {/* Filter: Class */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#CCA43B] text-gray-800 bg-white"
            >
              <option value="">{t('schedule.allClasses')}</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Filter: Teacher */}
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#CCA43B] text-gray-800 bg-white"
            >
              <option value="">{t('schedule.allTeachers')}</option>
              {teachers.map((tItem) => (
                <option key={tItem.id} value={tItem.id}>
                  {tItem.firstName} {tItem.lastName}
                </option>
              ))}
            </select>

            {/* Filter: Room */}
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#CCA43B] text-gray-800 bg-white"
            >
              <option value="">{t('schedule.allRooms')}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Week Navigator */}
          {viewMode === 'grid' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-gray-100 gap-3">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={prevWeek} className="h-8 px-2.5">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={currentWeek} className="h-8 text-xs font-medium">
                  {t('schedule.thisWeek')}
                </Button>
                <Button variant="secondary" size="sm" onClick={nextWeek} className="h-8 px-2.5">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-xs font-semibold text-gray-700 ml-2">
                  {t('schedule.from')} {weekDates[0]?.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} {t('schedule.to')}{' '}
                  {weekDates[5]?.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#242F40]"></span> {t('schedule.scheduledCourse')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> {t('schedule.completedCourse')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> {t('schedule.cancelledCourse')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingCard />
      ) : viewMode === 'grid' ? (
        /* ================= WEEKLY GRID VIEW ================= */
        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Grid Header (Days) */}
              <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/75">
                <div className="p-3 text-center text-xs font-bold text-gray-500 border-r border-gray-200 uppercase tracking-wider">
                  {t('schedule.hour')}
                </div>
                {weekDates.map((day) => {
                  const isToday = new Date().toDateString() === day.date.toDateString();
                  return (
                    <div
                      key={day.dayIndex}
                      className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                        isToday ? 'bg-[#242F40]/5' : ''
                      }`}
                    >
                      <div className={`text-xs font-bold ${isToday ? 'text-[#CCA43B]' : 'text-gray-900'}`}>
                        {t(`schedule.days.${day.key}`)}
                      </div>
                      <div className={`text-[11px] ${isToday ? 'font-semibold text-[#CCA43B]' : 'text-gray-400'}`}>
                        {day.date.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid Body (Hours x Days) */}
              <div className="divide-y divide-gray-100">
                {TIME_SLOTS.map((slotHour) => (
                  <div key={slotHour} className="grid grid-cols-7 min-h-[92px]">
                    {/* Time Label Column */}
                    <div className="p-2.5 text-center text-xs font-semibold text-gray-400 border-r border-gray-200 bg-gray-50/40 flex flex-col justify-start">
                      <span>{slotHour}</span>
                      <span className="text-[10px] text-gray-300 font-normal">
                        {String(parseInt(slotHour.split(':')[0], 10) + 1).padStart(2, '0')}:00
                      </span>
                    </div>

                    {/* Day Columns */}
                    {weekDates.map((day) => {
                      // Find sessions occurring on this day and time slot
                      const slotHourNum = parseInt(slotHour.split(':')[0], 10);
                      const matchingSessions = filteredSessions.filter((s) => {
                        const sDate = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
                        if (sDate !== day.isoDate) return false;
                        
                        const sStartTime = formatTimeString(s.startTime);
                        const sStartHour = parseInt(sStartTime.split(':')[0], 10);
                        return sStartHour === slotHourNum;
                      });

                      return (
                        <div
                          key={day.dayIndex}
                          className="relative p-1.5 border-r border-gray-100 last:border-r-0 hover:bg-gray-50/60 transition-colors group flex flex-col gap-1.5"
                        >
                          {matchingSessions.length === 0 ? (
                            <button
                              onClick={() => openCreateForm(day.isoDate, slotHour)}
                              className="w-full h-full min-h-[68px] rounded-lg border border-dashed border-transparent group-hover:border-gray-300 flex items-center justify-center text-gray-300 hover:text-[#CCA43B] transition-all opacity-0 group-hover:opacity-100"
                              title={t('schedule.clickToAdd')}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          ) : (
                            matchingSessions.map((session) => {
                              const matiereName =
                                session.lessons?.[0]?.matiere?.name || session.topic || t('schedule.defaultSubject');
                              const isCancelled = session.status === 'CANCELLED';

                              return (
                                <div
                                  key={session.id}
                                  className={`rounded-lg p-2 text-xs border transition-all shadow-xs flex flex-col justify-between ${
                                    isCancelled
                                      ? 'bg-rose-50/60 border-rose-200 text-rose-800 line-through opacity-75'
                                      : session.status === 'COMPLETED'
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                      : 'bg-[#242F40]/5 border-[#E5E5E5] text-[#242F40] hover:border-[#CCA43B]'
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-1 mb-1">
                                      <span className="font-bold truncate text-[11px]">
                                        {matiereName}
                                      </span>
                                      <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                        {formatTimeString(session.startTime)}-{formatTimeString(session.endTime)}
                                      </span>
                                    </div>

                                    <div className="space-y-0.5 text-[10px] text-gray-600">
                                      <div className="font-medium text-[#CCA43B] truncate">
                                        🏫 {session.class?.name}
                                      </div>
                                      {session.room && (
                                        <div className="flex items-center gap-1 text-gray-500 truncate">
                                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                                          {session.room.name}
                                        </div>
                                      )}
                                      {session.teacher && (
                                        <div className="flex items-center gap-1 text-gray-500 truncate">
                                          <User className="w-2.5 h-2.5 shrink-0" />
                                          {session.teacher.firstName} {session.teacher.lastName}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-[#E5E5E5]">
                                    {getStatusBadge(session.status)}
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => openEditForm(session)}
                                        className="p-1 hover:bg-white rounded text-gray-500 hover:text-[#CCA43B] transition-colors"
                                        title={t('common.edit')}
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => setConfirmDelete({ show: true, id: session.id })}
                                        className="p-1 hover:bg-white rounded text-gray-400 hover:text-rose-600 transition-colors"
                                        title={t('schedule.cancelSession')}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* ================= LIST / TABLE VIEW ================= */
        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardContent className="p-0">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                {t('schedule.noSessions')}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/75 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">{t('schedule.class')}</th>
                      <th className="py-3 px-4">{t('schedule.date')}</th>
                      <th className="py-3 px-4">{t('schedule.hour')}</th>
                      <th className="py-3 px-4">{t('schedule.subject')}</th>
                      <th className="py-3 px-4">{t('schedule.teacher')}</th>
                      <th className="py-3 px-4">{t('schedule.room')}</th>
                      <th className="py-3 px-4">{t('common.status')}</th>
                      <th className="py-3 px-4 text-right">{t('schedule.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y border-gray-100 text-gray-700">
                    {paginatedItems.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">
                          {session.class?.name}
                        </td>
                        <td className="py-3 px-4">
                          {session.date ? new Date(session.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {formatTimeString(session.startTime)} - {formatTimeString(session.endTime)}
                        </td>
                        <td className="py-3 px-4">
                          {session.lessons?.[0]?.matiere?.name || session.topic || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {session.teacher ? `${session.teacher.firstName} ${session.teacher.lastName}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {session.room?.name || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(session.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditForm(session)}
                              className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 hover:text-[#CCA43B] transition-colors"
                              title={t('common.edit')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ show: true, id: session.id })}
                              className="p-1.5 hover:bg-rose-50 rounded-md text-gray-400 hover:text-rose-600 transition-colors"
                              title={t('schedule.cancelSession')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalItems > 12 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal: Create / Edit Session */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? t('schedule.editSession') : t('schedule.planSession')}
        size="5xl"
      >
        <div className="space-y-4 text-xs">
          {/* Collision Warning Banner */}
          {formConflictError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">{t('schedule.conflictDetected')}</span>
                <span>{formConflictError}</span>
              </div>
            </div>
          )}

          <Select
            label={t('schedule.classRequired')}
            value={formData.classId}
            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            options={[
              { value: '', label: t('schedule.selectClass') },
              ...classes.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label={t('schedule.teacher')}
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              options={[
                { value: '', label: t('schedule.unassigned') },
                ...teachers.map((tItem) => ({ value: tItem.id, label: `${tItem.firstName} ${tItem.lastName}` })),
              ]}
            />
            <Select
              label={t('schedule.room')}
              value={formData.roomId}
              onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
              options={[
                { value: '', label: t('schedule.unassignedRoom') },
                ...rooms.map((r) => ({ value: r.id, label: r.name })),
              ]}
            />
          </div>

          <Input
            label={t('schedule.sessionDate')}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`${t('schedule.startTime')} *`}
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label={`${t('schedule.endTime')} *`}
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <Input
            label={t('schedule.topicLabel')}
            placeholder={t('schedule.topicPlaceholder')}
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleFormSubmit} isLoading={formLoading} className="bg-[#242F40] hover:bg-[#363636] text-white">
              {editingId ? t('schedule.saveChanges') : t('schedule.planCourse')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDelete}
        title={t('schedule.cancelSession')}
        message={t('schedule.cancelSessionConfirmMsg')}
        confirmLabel={t('schedule.confirmCancel')}
        isLoading={deleteLoading}
      />
    </div>
  );
}

