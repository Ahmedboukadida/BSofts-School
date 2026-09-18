'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';
import type { Class, Matiere, StudentGradeRow } from '@/types';

export default function TeacherPortalPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'grades' | 'call' | 'schedule'>('grades');
  const [classes, setClasses] = useState<Class[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMatiereId, setSelectedMatiereId] = useState<string>('');
  const [term, setTerm] = useState<'T1' | 'T2' | 'T3'>('T1');
  const [students, setStudents] = useState<StudentGradeRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);

  // Call Sheet State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [callSaved, setCallSaved] = useState(false);
  const [isSavingCall, setIsSavingCall] = useState(false);

  const fetchDependencies = useCallback(async () => {
    try {
      const [teacherRes, clsRes, matRes] = await Promise.all([
        api.get('/teachers/me').catch(() => ({ data: null })),
        api.get('/classes?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/matieres?limit=100').catch(() => ({ data: { data: [] } })),
      ]);

      const teacher = teacherRes.data;
      setTeacherData(teacher);

      const clsList = clsRes.data?.data || clsRes.data || [];
      const matList = matRes.data?.data || matRes.data || [];

      // Prefer teacher's own assigned subjects
      const teacherSubjects = (teacher?.matieres || []).map((m: any) => m.matiere).filter(Boolean);
      const safeMat = teacherSubjects.length > 0 ? teacherSubjects : (Array.isArray(matList) ? matList : []);
      const safeCls = Array.isArray(clsList) ? clsList : [];

      setClasses(safeCls);
      setMatieres(safeMat);
      if (safeCls.length > 0) setSelectedClassId(safeCls[0].id);
      if (safeMat.length > 0) setSelectedMatiereId(safeMat[0].id);
    } catch {
      setClasses([]);
      setMatieres([]);
    }
  }, []);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const loadClassStudents = useCallback(async (classId: string) => {
    if (!classId) return;
    try {
      const res = await api.get(`/classes/${classId}`).catch(() => ({ data: {} }));
      const assignments = res.data?.studentClassAssignments || res.data?.data?.studentClassAssignments || [];
      const list = Array.isArray(assignments) ? assignments : [];
      if (list.length > 0) {
        const rows: StudentGradeRow[] = list
          .filter((a: any) => a?.student || a?.studentId)
          .map(
            (a: any, idx: number) => ({
              studentId: a.student?.id || a.studentId || `stu-${idx}`,
              name: `${a.student?.firstName || 'Élève'} ${a.student?.lastName || `#${idx + 1}`}`,
              registrationNumber: a.student?.registrationNumber || '-',
              continuousScore: Number(a.continuousScore ?? 0),
              examScore: Number(a.examScore ?? 0),
              appreciation: a.appreciation || '',
            })
          );
        setStudents(rows);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadClassStudents(selectedClassId);
    }
  }, [selectedClassId, loadClassStudents]);

  const handleScoreChange = (studentId: string, field: 'continuousScore' | 'examScore', val: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, [field]: Math.max(0, Math.min(20, val)) } : s))
    );
  };

  const handleAppreciationChange = (studentId: string, val: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, appreciation: val } : s))
    );
  };

  const handleSaveGrades = async () => {
    if (!selectedClassId || !selectedMatiereId || students.length === 0) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.post('/notes/bulk', {
        classId: selectedClassId,
        matiereId: selectedMatiereId,
        term,
        grades: students.map((s) => ({
          studentId: s.studentId,
          continuousScore: s.continuousScore,
          examScore: s.examScore,
          average: Number((s.continuousScore * 0.4 + s.examScore * 0.6).toFixed(2)),
          appreciation: s.appreciation,
        })),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de l’enregistrement des notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveCallSheet = async () => {
    if (!selectedClassId || students.length === 0) return;
    setIsSavingCall(true);
    setCallSaved(false);
    try {
      const records = students.map((stu) => ({
        studentId: stu.studentId,
        status: (attendanceMarks[stu.studentId] || 'PRESENT') as 'PRESENT' | 'ABSENT' | 'LATE',
      }));

      await api.post('/student-attendance/bulk', {
        classId: selectedClassId,
        date: attendanceDate,
        attendances: records,
      });

      setCallSaved(true);
      setTimeout(() => setCallSaved(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de l’enregistrement de l’appel');
    } finally {
      setIsSavingCall(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t('portals.teacherPortalTitle')}
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                {t('portals.teacherPortalSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-hover rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'grades' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('portals.enterGrades')}
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'call' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('portals.dailyCall')}
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schedule' ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('portals.myTimetable')}
          </button>
        </div>
      </div>

      {/* TAB 1: GRADES ENTRY */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          {/* Class, Matiere & Term Filter Bar */}
          <Card className="p-4 border-border/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('portals.myClasses')}
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('portals.mySubjects')}
                </label>
                <select
                  value={selectedMatiereId}
                  onChange={(e) => setSelectedMatiereId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {matieres.map((mat) => (
                    <option key={mat.id} value={mat.id}>
                      {mat.name} (Coef {mat.coefficient})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  {t('exams.session')}
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as 'T1' | 'T2' | 'T3')}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="T1">{t('portals.term1')}</option>
                  <option value="T2">{t('portals.term2')}</option>
                  <option value="T3">{t('portals.term3')}</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">{t('portals.gradesSavedSuccess')}</span>
              </div>
            </div>
          )}

          {/* Grades Table */}
          <Card className="overflow-hidden border-border/80">
            <div className="p-4 border-b border-border bg-surface-hover/30 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-text-primary">{t('portals.gradeEntrySheet')}</h2>
                <p className="text-xs text-text-secondary">{t('portals.gradingScaleNote')}</p>
              </div>

              <Button
                onClick={handleSaveGrades}
                disabled={isSaving}
                className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold"
              >
                <Save className="w-4 h-4" />
                {isSaving ? t('common.loading') : t('portals.saveGrades')}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-hover/40 text-xs font-bold text-text-secondary uppercase">
                    <th className="py-3 px-4">{t('portals.student')}</th>
                    <th className="py-3 px-4">{t('portals.registrationNumber')}</th>
                    <th className="py-3 px-4 w-32">{t('portals.continuousAssessment')} (/20)</th>
                    <th className="py-3 px-4 w-32">{t('portals.termExam')} (/20)</th>
                    <th className="py-3 px-4 w-28 text-center">{t('portals.calculatedAverage')}</th>
                    <th className="py-3 px-4 min-w-[240px]">{t('portals.appreciation')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {students.map((stu) => {
                    const avg = (stu.continuousScore * 0.4 + stu.examScore * 0.6).toFixed(2);
                    const isAdmis = Number(avg) >= 10;
                    return (
                      <tr key={stu.studentId} className="hover:bg-surface-hover/20 transition-colors">
                        <td className="py-3 px-4 font-bold text-text-primary">{stu.name}</td>
                        <td className="py-3 px-4 text-xs font-mono text-text-secondary">{stu.registrationNumber}</td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            value={stu.continuousScore}
                            onChange={(e) => handleScoreChange(stu.studentId, 'continuousScore', parseFloat(e.target.value) || 0)}
                            className="w-24 h-9 px-2.5 text-center font-bold bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="20"
                            value={stu.examScore}
                            onChange={(e) => handleScoreChange(stu.studentId, 'examScore', parseFloat(e.target.value) || 0)}
                            className="w-24 h-9 px-2.5 text-center font-bold bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                              isAdmis
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-coral/10 text-coral border border-coral/20'
                            }`}
                          >
                            {avg}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={stu.appreciation}
                            onChange={(e) => handleAppreciationChange(stu.studentId, e.target.value)}
                            placeholder={t('portals.pedagogicalObservations')}
                            className="w-full h-9 px-3 text-xs bg-surface border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: DAILY CALL SHEET */}
      {activeTab === 'call' && (
        <div className="space-y-6">
          <Card className="p-4 border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">{t('portals.callDate')}</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="h-10 px-3 bg-surface border border-border rounded-xl text-sm font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">{t('common.class') || 'Classe'}</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="h-10 px-3 bg-surface border border-border rounded-xl text-sm font-semibold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleSaveCallSheet} disabled={isSavingCall} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              {isSavingCall ? t('common.loading') : t('portals.validateCall')}
            </Button>
          </Card>

          {callSaved && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">{t('portals.callSheetSuccess')}</span>
            </div>
          )}

          <Card className="overflow-hidden border-border/80">
            <div className="divide-y divide-border/50">
              {students.map((stu) => {
                const currentStatus = attendanceMarks[stu.studentId] || 'PRESENT';
                return (
                  <div key={stu.studentId} className="p-4 flex items-center justify-between hover:bg-surface-hover/20">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        {stu.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-primary">{stu.name}</p>
                        <p className="text-xs font-mono text-text-secondary">{stu.registrationNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(stu.studentId, 'PRESENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentStatus === 'PRESENT'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-surface-hover text-text-secondary'
                        }`}
                      >
                        {t('attendance.markedPresent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(stu.studentId, 'ABSENT')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentStatus === 'ABSENT'
                            ? 'bg-coral text-white shadow-sm'
                            : 'bg-surface-hover text-text-secondary'
                        }`}
                      >
                        {t('attendance.markedAbsent')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(stu.studentId, 'LATE')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          currentStatus === 'LATE'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-surface-hover text-text-secondary'
                        }`}
                      >
                        {t('attendance.markedLate')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <Card className="p-5 border-border/80">
            <h2 className="text-base font-bold text-text-primary mb-4">{t('portals.myTimetable')}</h2>
            {(!teacherData?.sessions || teacherData.sessions.length === 0) ? (
              <div className="p-8 text-center text-text-secondary text-sm bg-surface-hover/20 rounded-2xl border border-border">
                Aucune séance d&apos;enseignement n&apos;est actuellement programmée à votre emploi du temps.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {teacherData.sessions.map((s: any, idx: number) => {
                  const d = new Date(s.date);
                  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                  const dayName = dayNames[d.getDay()] || 'Lundi';
                  const st = new Date(s.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  const et = new Date(s.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={s.id || idx} className="p-4 bg-surface rounded-xl border border-border text-xs shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary uppercase text-[11px]">{dayName}</span>
                        <span className="font-mono text-text-secondary font-semibold">{st} - {et}</span>
                      </div>
                      <h4 className="font-bold text-sm text-text-primary">
                        {s.schedule?.matiere?.name || s.topic || 'Cours'}
                      </h4>
                      <div className="flex items-center justify-between text-text-secondary pt-1 border-t border-border/50">
                        <span className="font-semibold text-text-primary">{s.class?.name || 'Classe'}</span>
                        <span>{s.room?.name || 'Salle de classe'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
