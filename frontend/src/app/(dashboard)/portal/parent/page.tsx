'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  MessageSquare,
  TrendingUp,
  Receipt,
  GraduationCap,
  Send,
  Calendar,
  Award,
  Printer,
  School,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useAuthStore } from '@/store/auth-store';
import api from '@/lib/api';
import type { TimetableSlot } from '@/types';

export default function ParentPortalPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [parentData, setParentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'bulletin' | 'attendance' | 'schedule'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'T1' | 'T2' | 'T3'>('T2');

  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [justificationReason, setJustificationReason] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [noticeSent, setNoticeSent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchParentData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/parents/me');
      const data = res.data;
      setParentData(data);
      if (data?.students?.length > 0) {
        setSelectedChildId((prev) => {
          const exists = data.students.some((s: any) => (s.student?.id || s.studentId) === prev);
          return exists ? prev : (data.students[0].student?.id || data.students[0].studentId);
        });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible de charger le dossier parental');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  const rawStudents: any[] = parentData?.students || [];
  const children = rawStudents.map((sp: any, idx: number) => {
    const s = sp.student || {};
    const ca = s.classAssignments?.[0];
    const className = ca?.class?.name || 'Classe non assignée';
    const schoolName = parentData?.establishment?.name || 'BSofts School';

    const notes: any[] = s.notes || [];
    const totalCoef = notes.reduce((acc: number, n: any) => acc + Number(n.coefficient || 1), 0);
    const totalWeighted = notes.reduce((acc: number, n: any) => acc + (Number(n.value || 0) * Number(n.coefficient || 1)), 0);
    const average = totalCoef > 0 ? Number((totalWeighted / totalCoef).toFixed(2)) : 0.0;

    const attendances: any[] = s.attendances || [];
    const totalAtt = attendances.length;
    const presentCount = attendances.filter((a: any) => a.status === 'PRESENT').length;
    const unjustifiedCount = attendances.filter((a: any) => a.status === 'ABSENT').length;
    const justifiedCount = attendances.filter((a: any) => a.status === 'EXCUSED' || a.status === 'ABSENT_JUSTIFIED').length;
    const attendanceRate = totalAtt > 0 ? Number(((presentCount / totalAtt) * 100).toFixed(1)) : 100.0;

    const payments: any[] = s.payments || [];
    const tuitionPaid = payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    const tuitionTotal = Number(s.tuitionFee ?? 2400);
    const tuitionRemaining = Math.max(0, tuitionTotal - tuitionPaid);

    return {
      id: s.id || `child-${idx}`,
      raw: s,
      firstName: s.firstName || 'Élève',
      lastName: s.lastName || '',
      registrationNumber: s.registrationNumber || s.matricule || `ETU-${idx + 1}`,
      className,
      school: schoolName,
      academicYear: ca?.academicYear?.name || '2025 - 2026',
      average,
      attendanceRate,
      unjustifiedAbsences: unjustifiedCount,
      justifiedAbsences: justifiedCount,
      tuitionTotal,
      tuitionPaid,
      tuitionRemaining,
      notes,
      attendances,
      bulletins: s.bulletins || [],
      upcomingSessions: s.upcomingSessions || [],
      upcomingExams: s.upcomingExams || [],
    };
  });

  const currentChild = children.find((c) => c.id === selectedChildId) || children[0];

  const currentChildNotes = (currentChild?.notes || []).filter((n: any) => {
    const pName = n.period?.name || '';
    const pType = n.period?.type || '';
    if (selectedPeriod === 'T1') return pName.includes('1') || pType.includes('1') || pName.includes('T1');
    if (selectedPeriod === 'T2') return pName.includes('2') || pType.includes('2') || pName.includes('T2');
    if (selectedPeriod === 'T3') return pName.includes('3') || pType.includes('3') || pName.includes('T3');
    return true;
  });
  const filteredNotes = currentChildNotes.length > 0 ? currentChildNotes : (currentChild?.notes || []);

  const childNotes = filteredNotes.map((n: any, idx: number) => ({
    id: n.id || `note-${idx}`,
    matiere: n.matiere?.name || n.matiereName || 'Matière',
    coefficient: Number(n.coefficient || n.matiere?.coefficient || 1),
    continuousScore: Number(n.value || 0),
    examScore: Number(n.value || 0),
    average: Number(n.value || 0),
    appreciation: n.comment || 'Travail sérieux et régulier',
  }));

  const childTotalCoef = childNotes.reduce((acc: number, curr: any) => acc + curr.coefficient, 0);
  const childTotalWeighted = childNotes.reduce((acc: number, curr: any) => acc + (curr.average * curr.coefficient), 0);
  const calculatedChildAverage = childTotalCoef > 0 ? (childTotalWeighted / childTotalCoef).toFixed(2) : (currentChild ? currentChild.average.toFixed(2) : '0.00');

  const attendanceLogs = (currentChild?.attendances || []).map((att: any, idx: number) => {
    const d = att.session?.date ? new Date(att.session.date).toLocaleDateString('fr-FR') : (att.markedAt ? new Date(att.markedAt).toLocaleDateString('fr-FR') : "Aujourd'hui");
    const st = att.session?.startTime ? new Date(att.session.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '08:00';
    const et = att.session?.endTime ? new Date(att.session.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '10:00';
    return {
      id: att.id || `att-${idx}`,
      date: d,
      time: `${st} - ${et}`,
      subject: att.session?.topic || 'Séance de cours',
      status: att.status === 'EXCUSED' ? 'ABSENT_JUSTIFIED' : att.status,
      reason: att.reason || '',
    };
  });

  const childTimetable: TimetableSlot[] = (currentChild?.upcomingSessions || []).map((s: any, idx: number) => {
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
      id: s.id || `pt-${idx}`,
      day: dayName,
      time: `${st} - ${et}`,
      subject: s.schedule?.matiere?.name || s.topic || 'Cours',
      teacher: s.teacher ? `Prof. ${s.teacher.firstName} ${s.teacher.lastName}` : 'Enseignant',
      room: s.room?.name || 'Salle d’étude',
      color: colors[idx % colors.length],
    };
  });

  const recentNotifications = currentChild ? [
    {
      id: 'n1',
      date: "Aujourd'hui",
      title: currentChild.notes?.length > 0 ? 'Dernière note enregistrée' : 'Dossier scolaire actif',
      message: currentChild.notes?.length > 0
        ? `${currentChild.firstName} a obtenu ${currentChild.notes[0].value} / 20 en ${currentChild.notes[0].matiere?.name || 'Matière'}.`
        : `Dossier académique de ${currentChild.firstName} initialisé pour l'année en cours.`,
      type: 'SUCCESS',
    },
    {
      id: 'n2',
      date: 'Situation financière',
      title: 'Frais de scolarité',
      message: currentChild.tuitionRemaining > 0
        ? `Solde restant à régler: ${currentChild.tuitionRemaining.toFixed(3)} TND pour l'année scolaire.`
        : `Tous les règlements de scolarité sont à jour (${currentChild.tuitionPaid.toFixed(3)} TND acquittés).`,
      type: currentChild.tuitionRemaining > 0 ? 'WARNING' : 'SUCCESS',
    },
    {
      id: 'n3',
      date: 'Vie scolaire',
      title: 'Assiduité & Présences',
      message: currentChild.unjustifiedAbsences > 0
        ? `${currentChild.unjustifiedAbsences} absence(s) nécessitant une justification auprès de l'établissement.`
        : `Assiduité exemplaire: taux global de présence à ${currentChild.attendanceRate}%.`,
      type: currentChild.unjustifiedAbsences > 0 ? 'WARNING' : 'INFO',
    },
  ] : [];

  const handleSendJustification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificationReason.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/parents/justify-absence', {
        studentId: currentChild?.id,
        reason: justificationReason,
      });
      setNoticeSent("La justification d'absence a été transmise à la vie scolaire avec succès.");
      setIsJustifyModalOpen(false);
      setJustificationReason('');
      fetchParentData();
      setTimeout(() => setNoticeSent(''), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de la soumission de la justification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageSubject.trim() || !messageBody.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/parents/message', {
        studentId: currentChild?.id,
        subject: messageSubject,
        message: messageBody,
      });
      setNoticeSent("Votre message a été transmis à la direction de l'établissement.");
      setIsMessageModalOpen(false);
      setMessageSubject('');
      setMessageBody('');
      setTimeout(() => setNoticeSent(''), 5000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erreur lors de l’envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-border/60 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-border/40 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-48 bg-border/50 rounded-2xl animate-pulse" />
        </div>
        <div className="h-32 bg-border/30 rounded-3xl animate-pulse border border-border/60" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 bg-border/30 rounded-2xl animate-pulse border border-border/60" />
          <div className="h-44 bg-border/30 rounded-2xl animate-pulse border border-border/60" />
          <div className="h-44 bg-border/30 rounded-2xl animate-pulse border border-border/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-coral/30 rounded-3xl bg-coral/5 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-text-primary">Erreur de chargement du portail</h2>
        <p className="text-sm text-text-secondary max-w-md mx-auto">{error}</p>
        <Button onClick={fetchParentData} className="gap-2 bg-primary hover:bg-primary/90">
          <RefreshCw className="w-4 h-4" />
          <span>Réessayer</span>
        </Button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <div className="border-b border-border pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t('portals.parentPortalTitle')} {user ? `— ${user.firstName} ${user.lastName}` : ''}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('portals.parentPortalSubtitle')}
          </p>
        </div>
        <Card className="p-12 border border-border text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <School className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Aucun élève rattaché à votre compte</h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Votre compte parental est activé mais aucun élève n&apos;est actuellement lié à votre fiche. Veuillez contacter l&apos;administration de l&apos;établissement scolaire pour rattacher vos enfants.
          </p>
          <Button onClick={() => setIsMessageModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90">
            <MessageSquare className="w-4 h-4" />
            <span>Contacter l&apos;administration</span>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Title & Child Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            {t('portals.parentPortalTitle')} {user ? `— ${user.firstName} ${user.lastName}` : ''}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('portals.parentPortalSubtitle')}
          </p>
        </div>

        {/* Children Switcher Pills */}
        <div className="flex items-center gap-2 p-1.5 bg-surface border border-border rounded-2xl shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary px-2 hidden sm:inline">
            {t('portals.switchChild')} :
          </span>
          {children.map((child) => {
            const isSelected = child.id === selectedChildId;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-text-primary hover:bg-surface-hover'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                {child.firstName} ({child.className})
              </button>
            );
          })}
        </div>
      </div>

      {noticeSent && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium rounded-2xl flex items-center gap-3 animate-slide-down">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{noticeSent}</span>
        </div>
      )}

      {/* Hero Child Summary Banner */}
      <div className="rounded-3xl bg-surface border border-border/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#242F40] text-[#CCA43B] flex items-center justify-center text-2xl font-bold border border-[#363636]">
              {currentChild.firstName[0]}{currentChild.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-surface-hover text-text-secondary border border-border">
                  {currentChild.registrationNumber}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {currentChild.className}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-text-primary">
                {currentChild.firstName} {currentChild.lastName}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {currentChild.school} • {t('portals.academicYear')} 2025 - 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Button
              variant="secondary"
              className="gap-2 text-xs"
              onClick={() => setIsJustifyModalOpen(true)}
            >
              <Clock className="w-4 h-4" />
              {t('portals.absenceJustification')}
            </Button>
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 text-xs"
              onClick={() => setIsMessageModalOpen(true)}
            >
              <MessageSquare className="w-4 h-4" />
              {t('portals.contactAdministration')}
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Dedicated Tabs Navigation (Item 10) */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Vue d&apos;ensemble & Règlements</span>
        </button>

        <button
          onClick={() => setActiveTab('bulletin')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'bulletin'
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Notes & Bulletin Trimestriel</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Assiduité & Absences</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-primary text-white shadow-sm shadow-primary/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Emploi du Temps & Séances</span>
        </button>
      </div>

      {/* TAB 1: Vue d'ensemble & Règlements */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tuition Card (Enforced TND) */}
            <Card className="p-5 border border-border/80 shadow-xs bg-surface">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t('portals.financialSituation')}
                </span>
                <Receipt className="w-5 h-5 text-primary" />
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-text-secondary">{t('finance.tuition')} :</span>
                  <span className="text-base font-bold text-text-primary">{currentChild.tuitionTotal.toFixed(3)} TND</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-emerald-600 font-medium">{t('portals.tuitionPaid')} :</span>
                  <span className="text-base font-bold text-emerald-600">{currentChild.tuitionPaid.toFixed(3)} TND</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-border">
                  <span className="text-sm font-semibold text-text-primary">{t('portals.remainingDue')} :</span>
                  <span className={`text-xl font-black ${currentChild.tuitionRemaining > 0 ? 'text-coral' : 'text-emerald-600'}`}>
                    {currentChild.tuitionRemaining.toFixed(3)} TND
                  </span>
                </div>
              </div>

              {currentChild.tuitionRemaining > 0 ? (
                <div className="mt-4 pt-3 border-t border-border">
                  <Button className="w-full text-xs font-semibold bg-primary hover:bg-primary/90 gap-2">
                    <CreditCard className="w-4 h-4" />
                    {t('portals.payTuitionOnline')}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('common.active')} - 100% à jour
                </div>
              )}
            </Card>

            {/* Academic GPA Card */}
            <Card className="p-5 border border-border/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t('portals.calculatedAverage')}
                </span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-black text-text-primary">
                {currentChild.average.toFixed(2)} <span className="text-base font-medium text-text-secondary">/ 20</span>
              </h3>
              <p className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {currentChild.average >= 16
                  ? t('portals.mentionVeryGood')
                  : currentChild.average >= 14
                  ? 'Mention Bien'
                  : currentChild.average >= 12
                  ? 'Mention Assez Bien'
                  : currentChild.average >= 10
                  ? 'Mention Passable'
                  : 'Poursuivre les efforts'}
              </p>
              <p className="text-xs text-text-secondary mt-3">
                {t('portals.classRank')} : {currentChild.bulletins?.[0]?.rank ? `${currentChild.bulletins[0].rank}ème` : '-'}
              </p>
            </Card>

            {/* Attendance Card */}
            <Card className="p-5 border border-border/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  {t('attendance.attendanceRate')}
                </span>
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-3xl font-black text-text-primary">
                {currentChild.attendanceRate}%
              </h3>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>{t('portals.regularizedAbsences')} :</span>
                  <span className="font-semibold text-text-primary">{currentChild.justifiedAbsences} séance(s)</span>
                </div>
                <div className="flex items-center justify-between text-text-secondary">
                  <span>{t('attendance.absents')} :</span>
                  <span className={`font-semibold ${currentChild.unjustifiedAbsences > 0 ? 'text-coral' : 'text-emerald-600'}`}>
                    {currentChild.unjustifiedAbsences} séance(s)
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Notifications Feed */}
          <Card className="p-5 border border-border/80 shadow-xs">
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              {t('nav.notifications')}
            </h3>

            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-2xl border border-border bg-surface hover:bg-surface-hover transition-colors flex items-start gap-3.5"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'SUCCESS'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : notif.type === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {notif.type === 'SUCCESS' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : notif.type === 'WARNING' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-text-primary">{notif.title}</h4>
                      <span className="text-[11px] text-text-secondary">{notif.date}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Notes & Bulletin (Item 10) */}
      {activeTab === 'bulletin' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-4 border border-border/80 bg-surface shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-text-secondary">Période du Relevé :</span>
                <div className="flex items-center gap-1.5">
                  {(['T1', 'T2', 'T3'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPeriod(p)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        selectedPeriod === p
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-surface-hover text-text-primary border border-border'
                      }`}
                    >
                      {p === 'T1' ? '1er Trimestre' : p === 'T2' ? '2ème Trimestre' : '3ème Trimestre'}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => window.print()}
                className="gap-2 text-xs font-semibold bg-primary hover:bg-primary/90"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer le Bulletin de {currentChild.firstName}</span>
              </Button>
            </div>
          </Card>

          <Card className="overflow-hidden border border-border/80 shadow-sm print:shadow-none print:border-none">
            <div className="p-6 border-b border-border bg-surface-hover/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-text-primary">
                    BULLETIN TRIMESTRIEL DE L&apos;ÉLÈVE
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {currentChild.firstName} {currentChild.lastName} ({currentChild.registrationNumber}) • {currentChild.className} • {currentChild.school}
                  </p>
                </div>
              </div>

              <div className="bg-primary/5 p-3 rounded-2xl border border-primary/15 text-left sm:text-right">
                <p className="text-xs text-text-secondary uppercase font-semibold">Moyenne Générale</p>
                <p className="text-2xl font-black text-primary font-mono">{calculatedChildAverage} / 20</p>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">
                  {Number(calculatedChildAverage) >= 16
                    ? 'Mention Très Bien'
                    : Number(calculatedChildAverage) >= 14
                    ? 'Mention Bien'
                    : Number(calculatedChildAverage) >= 12
                    ? 'Mention Assez Bien'
                    : Number(calculatedChildAverage) >= 10
                    ? 'Mention Passable'
                    : 'Poursuivre les efforts'}
                  {currentChild.bulletins?.[0]?.rank ? ` • ${currentChild.bulletins[0].rank}ème de la classe` : ''}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-hover/60 text-xs uppercase font-semibold text-text-secondary border-b border-border">
                  <tr>
                    <th className="py-3 px-4">{t('portals.mySubjects')}</th>
                    <th className="py-3 px-4 text-center">{t('academic.coefficient')}</th>
                    <th className="py-3 px-4 text-center">{t('portals.continuousAssessment')}</th>
                    <th className="py-3 px-4 text-center">{t('portals.termExam')}</th>
                    <th className="py-3 px-4 text-center font-bold text-primary">{t('portals.calculatedAverage')}</th>
                    <th className="py-3 px-4">{t('portals.appreciation')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {childNotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-secondary text-sm">
                        Aucune note n&apos;a encore été enregistrée pour cette période.
                      </td>
                    </tr>
                  ) : (
                    childNotes.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-text-primary">{item.matiere}</td>
                        <td className="py-3.5 px-4 text-center text-text-secondary font-mono">{item.coefficient.toFixed(1)}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{item.continuousScore.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{item.examScore.toFixed(2)}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-primary text-base">
                          {item.average.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-text-secondary italic">{item.appreciation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-surface-hover/40 font-bold border-t border-border">
                  <tr>
                    <td className="py-3.5 px-4 text-text-primary">Total des Coefficients</td>
                    <td className="py-3.5 px-4 text-center font-mono text-text-primary">{childTotalCoef.toFixed(1)}</td>
                    <td className="py-3.5 px-4 text-center text-xs text-text-secondary" colSpan={2}>
                      Bilan global pondéré
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-primary text-lg font-black">
                      {calculatedChildAverage}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-600 font-semibold">
                      {Number(calculatedChildAverage) >= 10 ? 'Félicitations du Conseil' : 'Travail à intensifier'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Assiduité & Absences (Item 10) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <Card className="p-5 border border-border/80 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Historique Détaillé des Présences & Absences
                </h3>
                <p className="text-xs text-text-secondary">
                  Suivi en temps réel des appels journaliers réalisés par les professeurs.
                </p>
              </div>

              <Button
                onClick={() => setIsJustifyModalOpen(true)}
                className="gap-2 text-xs font-semibold bg-primary hover:bg-primary/90"
              >
                <Clock className="w-4 h-4" />
                <span>Justifier une absence</span>
              </Button>
            </div>

            {attendanceLogs.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                Aucun enregistrement d&apos;assiduité ou d&apos;absence pour cet élève.
              </div>
            ) : (
              <div className="space-y-3">
                {attendanceLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl border border-border bg-surface hover:bg-surface-hover transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          log.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : log.status === 'ABSENT_JUSTIFIED'
                            ? 'bg-blue-500/10 text-blue-600'
                            : log.status === 'LATE'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-coral/10 text-coral'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">{log.subject}</h4>
                        <p className="text-xs text-text-secondary">
                          {log.date} ({log.time}) {log.reason ? `• ${log.reason}` : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-bold ${
                        log.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : log.status === 'ABSENT_JUSTIFIED'
                          ? 'bg-blue-500/10 text-blue-600'
                          : log.status === 'LATE'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-coral/10 text-coral'
                      }`}
                    >
                      {log.status === 'PRESENT'
                        ? 'Présent'
                        : log.status === 'ABSENT_JUSTIFIED'
                        ? 'Absence Justifiée'
                        : log.status === 'LATE'
                        ? 'En retard'
                        : 'Absence Non Justifiée'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: Emploi du Temps (Item 10) */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Emploi du Temps Hebdomadaire - {currentChild.className}
              </h2>
              <p className="text-xs text-text-secondary">Année scolaire en cours</p>
            </div>

            <Button
              variant="secondary"
              className="gap-2 text-xs"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer Emploi du Temps</span>
            </Button>
          </div>

          {childTimetable.length === 0 ? (
            <div className="p-8 text-center text-text-secondary text-sm bg-surface rounded-2xl border border-border">
              Aucune séance d&apos;emploi du temps n&apos;est actuellement programmée pour cette classe.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {childTimetable.map((slot) => (
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
          )}
        </div>
      )}

      {/* Modal Justifier une absence */}
      <Modal
        isOpen={isJustifyModalOpen}
        onClose={() => setIsJustifyModalOpen(false)}
        title={`${t('portals.absenceJustification')} - ${currentChild.firstName}`}
        size="5xl"
      >
        <form onSubmit={handleSendJustification} className="space-y-4">
          <p className="text-xs text-text-secondary">
            {t('attendance.teacherAbsenceDesc')}
          </p>
          <Input
            label={`${t('attendance.dateLabel')}`}
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required
          />
          <Textarea
            label={`${t('attendance.reasonCol')} *`}
            placeholder={t('attendance.absenceReasonPlaceholder')}
            value={justificationReason}
            onChange={(e) => setJustificationReason(e.target.value)}
            required
            rows={4}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsJustifyModalOpen(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              <Send className="w-4 h-4" />
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Contacter Administration */}
      <Modal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        title={t('portals.contactAdministration')}
        size="5xl"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <Input
            label={t('common.subject') || 'Objet *'}
            placeholder="Ex: Demande de rendez-vous"
            value={messageSubject}
            onChange={(e) => setMessageSubject(e.target.value)}
            required
          />
          <Textarea
            label={t('common.message') || 'Message *'}
            placeholder="Ex: Bonjour..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            required
            rows={5}
          />
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsMessageModalOpen(false)} disabled={isSubmitting}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              <Send className="w-4 h-4" />
              {isSubmitting ? t('common.loading') : t('common.submit')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
