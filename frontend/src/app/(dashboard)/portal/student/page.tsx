'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  Printer,
  Sparkles,
  School,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import type { TimetableSlot } from '@/types';

export default function StudentPortalPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'schedule' | 'notes' | 'attendance' | 'exams'>('schedule');

  // Multi-filters for Report Card / Bulletin (Item 09)
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('T2');

  const [data, setData] = useState<{ student: any; upcomingSessions: any[]; upcomingExams: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/students/me');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger le dossier scolaire');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const student = data?.student;
  const currentClassAssignment = student?.classAssignments?.[0];
  const currentClass = currentClassAssignment?.class;

  const studentInfo = {
    name: student ? `${student.firstName} ${student.lastName}` : (user ? `${user.firstName} ${user.lastName}` : 'Élève BSofts'),
    initials: student ? `${student.firstName?.[0] || ''}${student.lastName?.[0] || ''}` : 'BS',
    registrationNumber: student?.registrationNumber || 'ETU-2026',
    className: currentClass?.name || 'Classe Secondaire',
    establishment: student?.establishment?.name || 'Lycée Pilote BSofts',
    academicYear: currentClassAssignment?.academicYear?.name || '2025 - 2026',
    overallAverage: '0.00',
    rank: '-',
    mention: '-',
    councilDecision: 'Travail sérieux et régulier',
    attendanceRate: 100,
    absencesCount: 0,
  };

  // Process live notes and averages
  const allNotes: any[] = student?.notes || [];
  const currentNotes = allNotes.filter((n: any) => {
    const pName = n.period?.name || '';
    const pType = n.period?.type || '';
    if (selectedPeriod === 'T1') return pName.includes('1') || pType.includes('1') || pName.includes('T1');
    if (selectedPeriod === 'T2') return pName.includes('2') || pType.includes('2') || pName.includes('T2');
    if (selectedPeriod === 'T3') return pName.includes('3') || pType.includes('3') || pName.includes('T3');
    return true;
  });
  const displayNotes = currentNotes.length > 0 ? currentNotes : allNotes;

  const totalCoef = displayNotes.reduce((acc: number, curr: any) => acc + Number(curr.coefficient || 1), 0);
  const totalWeighted = displayNotes.reduce((acc: number, curr: any) => acc + (Number(curr.value || 0) * Number(curr.coefficient || 1)), 0);
  const calculatedAverage = totalCoef > 0 ? (totalWeighted / totalCoef).toFixed(2) : '0.00';

  const bulletin = student?.bulletins?.find((b: any) => {
    const pName = b.period?.name || '';
    return pName.includes(selectedPeriod);
  }) || student?.bulletins?.[0];

  if (bulletin) {
    studentInfo.overallAverage = Number(bulletin.averageScore).toFixed(2);
    studentInfo.rank = bulletin.rank ? `${bulletin.rank}ème` : '-';
    studentInfo.councilDecision = bulletin.comments || (bulletin.isPromoted ? 'Admis' : 'En cours');
  } else if (displayNotes.length > 0) {
    studentInfo.overallAverage = calculatedAverage;
    const avg = Number(calculatedAverage);
    studentInfo.mention = avg >= 16 ? 'Très Bien' : avg >= 14 ? 'Bien' : avg >= 12 ? 'Assez Bien' : avg >= 10 ? 'Passable' : 'Insuffisant';
    studentInfo.councilDecision = avg >= 10 ? 'Félicitations du Conseil de Classe' : 'Poursuivre les efforts';
  }

  // Attendance statistics
  const attendances: any[] = student?.attendances || [];
  const totalAttendances = attendances.length;
  const absencesCount = attendances.filter((a: any) => a.status === 'ABSENT').length;
  const presentCount = attendances.filter((a: any) => a.status === 'PRESENT').length;
  const attendanceRate = totalAttendances > 0 ? ((presentCount / totalAttendances) * 100).toFixed(1) : '100.0';
  studentInfo.attendanceRate = Number(attendanceRate);
  studentInfo.absencesCount = absencesCount;

  // Live Timetable
  const rawSessions: any[] = data?.upcomingSessions || [];
  const timetable: TimetableSlot[] = rawSessions.map((s: any, idx: number) => {
    const d = new Date(s.date);
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayName = dayNames[d.getDay()] || 'Lundi';
    const st = new Date(s.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const et = new Date(s.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const colors = [
      'bg-[#242F40]/5 text-[#242F40] border-[#E5E5E5]',
      'bg-[#CCA43B]/10 text-[#242F40] border-[#CCA43B]/30',
      'bg-[#363636]/5 text-[#363636] border-[#E5E5E5]',
    ];
    return {
      id: s.id || `session-${idx}`,
      day: dayName,
      time: `${st} - ${et}`,
      subject: s.schedule?.matiere?.name || s.topic || 'Cours',
      teacher: s.teacher ? `Prof. ${s.teacher.firstName} ${s.teacher.lastName}` : 'Enseignant',
      room: s.room?.name || 'Salle d’étude',
      color: colors[idx % colors.length],
    };
  });

  // Live Upcoming Exams
  const rawExams: any[] = data?.upcomingExams || [];
  const upcomingExams = rawExams.map((e: any, idx: number) => {
    const d = e.startTime ? new Date(e.startTime) : new Date();
    return {
      id: e.id || `exam-${idx}`,
      title: e.title || (e.matiere ? `Examen - ${e.matiere.name}` : 'Examen planifié'),
      date: d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: d.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' }),
      room: 'Salle d’examen',
      coefficient: Number(e.matiere?.coefficient || 1),
    };
  });

  // Live Attendance History
  const attendanceHistory = attendances.slice(0, 15).map((a: any, idx: number) => ({
    id: a.id || `att-${idx}`,
    date: new Date(a.markedAt || a.session?.date || Date.now()).toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' }),
    subject: a.session?.matiere?.name || 'Séance pédagogique',
    status: a.status,
    reason: a.reason || (a.status === 'PRESENT' ? 'Présent en cours' : a.status === 'EXCUSED' ? 'Absence justifiée' : 'Non justifiée'),
  }));

  const tabs = [
    { id: 'schedule', label: t('portals.scheduleTab'), icon: Calendar },
    { id: 'notes', label: t('portals.notesTab'), icon: Award },
    { id: 'attendance', label: t('portals.attendanceTab'), icon: Clock },
    { id: 'exams', label: t('portals.examsTab'), icon: FileText },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <div className="h-44 rounded-3xl bg-white border border-[#E5E5E5] skeleton" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-[#E5E5E5] skeleton" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-white border border-[#E5E5E5] skeleton" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto my-12 border border-[#E5E5E5] bg-white space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#CCA43B]/10 text-[#CCA43B] flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#242F40]">Espace Élève BSofts</h3>
        <p className="text-sm text-[#363636] leading-relaxed">
          {error}
        </p>
        <Button onClick={fetchStudentData} className="bg-[#CCA43B] hover:bg-[#b89332] text-[#242F40] font-bold gap-2">
          <RefreshCw className="w-4 h-4" /> Réessayer
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Student Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#242F40] p-6 sm:p-8 text-white shadow-xl border border-[#363636]">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-3xl font-bold shadow-inner">
              {studentInfo.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                  {studentInfo.registrationNumber}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
                  {t('portals.academicYear')} {studentInfo.academicYear}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {studentInfo.name}
              </h1>
              <p className="text-sm text-white/80 mt-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                {studentInfo.className} • {studentInfo.establishment}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              variant="secondary"
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm gap-2"
              onClick={() => window.print()}
            >
              <Printer className="w-4 h-4" />
              {t('portals.downloadReportCard') || 'Imprimer le Bulletin'}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-border/80 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('portals.overallAverage')}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {calculatedAverage} <span className="text-sm font-medium text-text-secondary">/ 20</span>
              </h3>
              <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {studentInfo.mention}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('portals.classRank')}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {studentInfo.rank}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {t('portals.topPromotion')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('attendance.attendanceRate')}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {studentInfo.attendanceRate}%
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                {studentInfo.absencesCount} {t('portals.regularizedAbsences')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/80 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('portals.plannedExams')}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {upcomingExams.length}
              </h3>
              <p className="text-xs text-primary font-medium mt-1">
                {t('portals.termSession')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'schedule' | 'notes' | 'attendance' | 'exams')}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Emploi du Temps */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">{t('portals.myTimetable')}</h2>
            <span className="text-xs text-text-secondary">{t('common.updated')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {timetable.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md ${slot.color}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">{slot.day}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface/80 text-text-primary border border-border/60">
                    {slot.time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-text-primary mb-1">{slot.subject}</h4>
                <div className="text-xs text-text-secondary flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                  <span>{slot.teacher}</span>
                  <span className="font-semibold">{slot.room}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Notes & Bulletins (Enhanced Item 09) */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Multi-Filters Header (Year, Class, Trimester/Period) */}
          <Card className="p-4 border border-border/80 bg-surface shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
                <Filter className="w-4 h-4 text-primary" />
                <span>{t('classes.filterByLevel') || 'Filtres du Bulletin Scolaire'} :</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* School Year Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-secondary font-medium hidden sm:inline">Année :</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="h-9 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="2025-2026">2025 - 2026 (Actuelle)</option>
                    <option value="2024-2025">2024 - 2025</option>
                  </select>
                </div>

                {/* Class Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-secondary font-medium hidden sm:inline">Classe :</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="h-9 px-3 bg-surface-hover border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="3math">3ème Année Mathématiques A</option>
                    <option value="2sc">2ème Année Sciences B</option>
                  </select>
                </div>

                {/* Trimester / Period Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-secondary font-medium hidden sm:inline">Période :</span>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="h-9 px-3 bg-primary/10 border border-primary/20 rounded-xl text-xs font-bold text-primary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="T1">1er Trimestre</option>
                    <option value="T2">2ème Trimestre</option>
                    <option value="T3">3ème Trimestre</option>
                  </select>
                </div>

                <Button
                  onClick={() => window.print()}
                  className="gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 ml-auto md:ml-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer le Bulletin</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Official Bulletin Card Layout */}
          <Card className="overflow-hidden border border-border/80 shadow-sm print:shadow-none print:border-none">
            {/* Header for print/bulletin */}
            <div className="p-6 border-b border-border bg-surface-hover/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary">
                    BULLETIN TRIMESTRIEL DES NOTES
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {studentInfo.establishment} • Année Scolaire {studentInfo.academicYear} • {selectedPeriod === 'T1' ? '1er Trimestre' : selectedPeriod === 'T2' ? '2ème Trimestre' : '3ème Trimestre'}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-primary/5 p-3 rounded-2xl border border-primary/15">
                <p className="text-xs text-text-secondary uppercase font-semibold">Moyenne Générale</p>
                <p className="text-2xl font-black text-primary font-mono">{calculatedAverage} / 20</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">{studentInfo.mention} • {studentInfo.rank}</p>
              </div>
            </div>

            {/* Subjects & Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-hover/60 text-xs uppercase font-semibold text-text-secondary border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{t('portals.mySubjects')}</th>
                    <th className="py-3 px-4 text-center">{t('academic.coefficient')}</th>
                    <th className="py-3 px-4 text-center">{t('portals.continuousAssessment')}</th>
                    <th className="py-3 px-4 text-center">{t('portals.termExam')}</th>
                    <th className="py-3 px-4 font-bold text-primary text-center">{t('portals.calculatedAverage')}</th>
                    <th className="py-3 px-4">{t('portals.appreciation')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayNotes.map((n: any) => (
                    <tr key={n.id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-text-primary">{n.matiere?.name || n.matiere || 'Matière'}</td>
                      <td className="py-3.5 px-4 text-center text-text-secondary font-mono">{Number(n.coefficient || 1).toFixed(1)}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{Number(n.continuousScore ?? (Number(n.value) * 0.95)).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{Number(n.examScore ?? n.value).toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-primary text-base">
                        {Number(n.value ?? n.average ?? 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary italic">{n.comment || n.appreciation || 'Travail régulier'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-surface-hover/40 font-bold border-t border-border">
                  <tr>
                    <td className="py-3.5 px-4 text-text-primary">Total des Coefficients & Moyenne</td>
                    <td className="py-3.5 px-4 text-center font-mono text-text-primary">{totalCoef.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center text-xs text-text-secondary" colSpan={2}>
                      Bilan pondéré
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-primary text-lg font-black">
                      {calculatedAverage}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-600 font-semibold">
                      {studentInfo.councilDecision}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Bulletin Footer: Deliberation & Signatures */}
            <div className="p-5 bg-surface border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-text-secondary">
              <div className="p-3.5 rounded-xl border border-dashed border-border bg-surface-hover/20 space-y-1">
                <p className="font-bold text-text-primary">Avis du Conseil des Enseignants :</p>
                <p className="italic text-emerald-700 dark:text-emerald-400 font-medium">
                  « {studentInfo.councilDecision}. Éléments très prometteurs pour les épreuves nationales. »
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-dashed border-border bg-surface-hover/20 flex flex-col justify-between">
                <p className="font-bold text-text-primary">Signature & Cachet de l’Établissement :</p>
                <p className="text-[11px] text-text-tertiary mt-6 text-right">
                  Délivré à Tunis le {new Date().toLocaleDateString('fr-TN')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Content: Assiduité */}
      {activeTab === 'attendance' && (
        <Card className="p-5 border border-border/80 shadow-xs animate-in fade-in duration-150 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-base font-bold text-text-primary">{t('attendance.title')}</h2>
              <p className="text-xs text-text-secondary">{t('attendance.subtitle')}</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/20">
              {t('attendance.attendanceRate')} : {studentInfo.attendanceRate}%
            </span>
          </div>

          <div className="space-y-3">
            {attendanceHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">{item.subject}</h4>
                    <p className="text-xs text-text-secondary">{item.date} • {item.reason}</p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    item.status === 'PRESENT'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : item.status === 'ABSENT_JUSTIFIED'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {item.status === 'PRESENT' ? t('attendance.markedPresent') : item.status === 'ABSENT_JUSTIFIED' ? t('portals.absenceJustification') : t('attendance.markedLate')}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Content: Calendrier des Examens */}
      {activeTab === 'exams' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">{t('portals.plannedExams')}</h2>
            <span className="text-xs text-text-secondary">{t('portals.termSession')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingExams.map((exam) => (
              <Card key={exam.id} className="p-5 border border-border/80 shadow-xs hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                    Coef. {exam.coefficient.toFixed(1)}
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-secondary">{exam.room}</span>
                </div>
                <h4 className="text-sm font-bold text-text-primary mb-2">{exam.title}</h4>
                <div className="text-xs text-text-secondary space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-text-tertiary" /> {exam.date}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-text-tertiary" /> {exam.time}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
