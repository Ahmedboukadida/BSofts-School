'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Plus, Search, CreditCard, CheckCircle, Clock,
  Edit, Trash2, ArrowRightLeft, DollarSign, Wallet,
  Calendar, UserCheck, RefreshCw, Send, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useToast, showApiErrorToast } from '@/components/ui/toast';
import { usePagination } from '@/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import api from '@/lib/api';
import { LoadingCard } from '@/components/ui/spinner';
import { CURRENCY } from '@/lib/constants';
import type { StudentPaymentItem, CaisseItem, TransactionItem, TeacherPaymentItem } from '@/types';

export default function PaymentsPage() {
  const { t } = useTranslation();
  const toast = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'CAISSE' | 'TEACHER'>('STUDENT');

  // Tab 1: Student Payments State
  const [studentPayments, setStudentPayments] = useState<StudentPaymentItem[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [isStudentLoading, setIsStudentLoading] = useState(true);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [studentFormData, setStudentFormData] = useState({
    studentId: '',
    parentId: '',
    amount: '',
    method: 'CASH',
    status: 'PAID',
    notes: '',
  });
  const [studentFormLoading, setStudentFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; id: string | null }>({ show: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Online Payment Checkout Modal State
  const [onlinePayModal, setOnlinePayModal] = useState<{
    show: boolean;
    payment: StudentPaymentItem | null;
    availableGateways: ('CLIC_TO_PAY' | 'STRIPE')[];
    selectedGateway: 'CLIC_TO_PAY' | 'STRIPE';
    isLoading: boolean;
    isInitiating: boolean;
  }>({
    show: false,
    payment: null,
    availableGateways: [],
    selectedGateway: 'CLIC_TO_PAY',
    isLoading: false,
    isInitiating: false,
  });

  // Tab 2: Caisses & Transactions State
  const [caisses, setCaisses] = useState<CaisseItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isCaisseLoading, setIsCaisseLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromCaisseId: '',
    toCaisseId: '',
    amount: '',
    description: '',
  });
  const [transferLoading, setTransferLoading] = useState(false);

  // Tab 3: Teacher Payroll State
  const [teacherPayments, setTeacherPayments] = useState<TeacherPaymentItem[]>([]);
  const [payrollPeriod, setPayrollPeriod] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isTeacherLoading, setIsTeacherLoading] = useState(true);
  const [generatePayrollLoading, setGeneratePayrollLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');

  // 1. Fetch Student Payments
  const fetchStudentPayments = useCallback(async () => {
    try {
      setIsStudentLoading(true);
      const res = await api.get('/student-payments?limit=100');
      const list = res.data?.data || res.data || [];
      setStudentPayments(Array.isArray(list) ? list : []);
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement des paiements étudiants');
    } finally {
      setIsStudentLoading(false);
    }
  }, []);

  // 2. Fetch Caisses & Transactions
  const fetchCaisseData = useCallback(async () => {
    try {
      setIsCaisseLoading(true);
      const [caisseRes, txRes] = await Promise.all([
        api.get('/caisses?limit=100'),
        api.get('/financial-transactions?limit=100'),
      ]);
      const cList = caisseRes.data?.data || caisseRes.data || [];
      const txList = txRes.data?.data || txRes.data || [];
      setCaisses(Array.isArray(cList) ? cList : []);
      setTransactions(Array.isArray(txList) ? txList : []);
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement des caisses');
    } finally {
      setIsCaisseLoading(false);
    }
  }, []);

  // 3. Fetch Teacher Payroll
  const fetchTeacherPayments = useCallback(async () => {
    try {
      setIsTeacherLoading(true);
      const res = await api.get(`/teacher-payments?period=${payrollPeriod}&limit=100`);
      const list = res.data?.data || res.data || [];
      setTeacherPayments(Array.isArray(list) ? list : []);
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement de la paie enseignants');
    } finally {
      setIsTeacherLoading(false);
    }
  }, [payrollPeriod]);

  useEffect(() => {
    fetchStudentPayments();
    fetchCaisseData();
    fetchTeacherPayments();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mockOnline = params.get('mockOnline');
      if (mockOnline) {
        toast.showToast(
          `Paiement sécurisé par ${mockOnline === 'clictopay' ? 'ClicToPay (Monétique Tunisie)' : 'Stripe'} simulé avec succès en environnement bac à sable.`,
          'success'
        );
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [fetchStudentPayments, fetchCaisseData, fetchTeacherPayments]);

  // Handle Student Payment Form Submit
  const handleStudentFormSubmit = async () => {
    if (!studentFormData.amount || Number(studentFormData.amount) <= 0) {
      toast.showToast('Veuillez spécifier un montant valide', 'error');
      return;
    }

    setStudentFormLoading(true);
    try {
      if (editingPaymentId) {
        await api.put(`/student-payments/${editingPaymentId}`, {
          amount: Number(studentFormData.amount),
          method: studentFormData.method,
          status: studentFormData.status,
          notes: studentFormData.notes,
        });
        toast.showToast(t('crud.updateSuccess') || 'Paiement mis à jour', 'success');
      } else {
        if (!studentFormData.studentId) {
          toast.showToast('Veuillez renseigner un ID étudiant', 'error');
          setStudentFormLoading(false);
          return;
        }
        await api.post('/student-payments', {
          studentId: studentFormData.studentId,
          parentId: studentFormData.parentId || studentFormData.studentId,
          amount: Number(studentFormData.amount),
          currency: 'TND',
          method: studentFormData.method,
          notes: studentFormData.notes,
        });
        toast.showToast(t('crud.createSuccess') || 'Paiement enregistré avec succès', 'success');
      }
      setShowStudentForm(false);
      setEditingPaymentId(null);
      setStudentFormData({ studentId: '', parentId: '', amount: '', method: 'CASH', status: 'PAID', notes: '' });
      fetchStudentPayments();
    } catch (err) {
      console.error('Error saving student payment:', err);
      toast.showToast(t('common.error') || 'Erreur lors de l’enregistrement', 'error');
    } finally {
      setStudentFormLoading(false);
    }
  };

  // Handle Delete Student Payment
  const handleDeletePayment = async () => {
    if (!confirmDelete.id) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/student-payments/${confirmDelete.id}`);
      setConfirmDelete({ show: false, id: null });
      fetchStudentPayments();
      toast.showToast(t('crud.deleteSuccess') || 'Paiement supprimé', 'success');
    } catch (err) {
      console.error('Failed to delete payment:', err);
      toast.showToast(t('common.error') || 'Erreur lors de la suppression', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Transfer Between Caisses
  const handleExecuteTransfer = async () => {
    if (!transferForm.fromCaisseId || !transferForm.toCaisseId) {
      toast.showToast('Veuillez sélectionner la caisse source et de destination', 'error');
      return;
    }
    if (transferForm.fromCaisseId === transferForm.toCaisseId) {
      toast.showToast('La caisse source et de destination doivent être distinctes', 'error');
      return;
    }
    const transferAmount = Number(transferForm.amount);
    if (!transferAmount || transferAmount <= 0) {
      toast.showToast('Montant de transfert invalide', 'error');
      return;
    }

    const sourceCaisse = caisses.find((c) => c.id === transferForm.fromCaisseId);
    if (sourceCaisse && Number(sourceCaisse.balance) < transferAmount) {
      toast.showToast(`Solde insuffisant dans la caisse source (${Number(sourceCaisse.balance).toFixed(2)} ${CURRENCY})`, 'error');
      return;
    }

    setTransferLoading(true);
    try {
      await api.post('/financial-transactions/transfer', {
        fromCaisseId: transferForm.fromCaisseId,
        toCaisseId: transferForm.toCaisseId,
        amount: transferAmount,
        description: transferForm.description || 'Transfert inter-caisses',
      });
      toast.showToast('Transfert de fonds exécuté avec succès', 'success');
      setShowTransferModal(false);
      setTransferForm({ fromCaisseId: '', toCaisseId: '', amount: '', description: '' });
      fetchCaisseData();
    } catch (err: unknown) {
      console.error('Transfer failed:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Échec du transfert inter-caisses';
      toast.showToast(msg, 'error');
    } finally {
      setTransferLoading(false);
    }
  };

  // Handle Generate Monthly Teacher Payroll
  const handleGeneratePayroll = async () => {
    setGeneratePayrollLoading(true);
    try {
      const res = await api.post('/teacher-payments/generate-payroll', {
        period: payrollPeriod,
      });
      toast.showToast(res.data.message || `Paie générée pour ${payrollPeriod}`, 'success');
      fetchTeacherPayments();
    } catch (err: unknown) {
      console.error('Payroll generation failed:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erreur lors du calcul de la paie';
      toast.showToast(msg, 'error');
    } finally {
      setGeneratePayrollLoading(false);
    }
  };

  // Handle Update Teacher Payment Status
  const handleUpdateTeacherStatus = async (id: string, newStatus: 'PAID' | 'PENDING') => {
    try {
      await api.put(`/teacher-payments/${id}/status`, { status: newStatus });
      toast.showToast('Statut du paiement enseignant mis à jour', 'success');
      fetchTeacherPayments();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.showToast(t('common.error') || 'Erreur de mise à jour', 'error');
    }
  };

  // Online Payment Handlers (ClicToPay Tunisie / Stripe International)
  const handleInitiateOnlinePay = async (p: StudentPaymentItem) => {
    try {
      setOnlinePayModal({
        show: true,
        payment: p,
        availableGateways: [],
        selectedGateway: 'CLIC_TO_PAY',
        isLoading: true,
        isInitiating: false,
      });

      const res = await api.get(`/student-payments/${p.id}/gateways`);
      const gateways: ('CLIC_TO_PAY' | 'STRIPE')[] = res.data?.availableGateways || [];

      if (gateways.length === 0) {
        toast.showToast("Le paiement en ligne n'est pas encore configuré ou activé pour cet établissement.", 'warning');
        setOnlinePayModal({ show: false, payment: null, availableGateways: [], selectedGateway: 'CLIC_TO_PAY', isLoading: false, isInitiating: false });
        return;
      }

      if (gateways.length === 1) {
        // Direct checkout if only one gateway is configured
        await executeOnlineCheckout(p.id, gateways[0]);
        return;
      }

      // Both gateways enabled: prompt the user to choose
      setOnlinePayModal({
        show: true,
        payment: p,
        availableGateways: gateways,
        selectedGateway: gateways.includes('CLIC_TO_PAY') ? 'CLIC_TO_PAY' : gateways[0],
        isLoading: false,
        isInitiating: false,
      });
    } catch (err: any) {
      console.error('Failed to fetch payment gateways:', err);
      const msg = err?.response?.data?.message || 'Erreur lors de la récupération des options de paiement en ligne';
      toast.showToast(msg, 'error');
      setOnlinePayModal({ show: false, payment: null, availableGateways: [], selectedGateway: 'CLIC_TO_PAY', isLoading: false, isInitiating: false });
    }
  };

  const executeOnlineCheckout = async (paymentId: string, gateway: 'CLIC_TO_PAY' | 'STRIPE') => {
    try {
      setOnlinePayModal((prev) => ({ ...prev, isInitiating: true }));
      const res = await api.post(`/student-payments/${paymentId}/online-checkout`, { gateway });
      const { checkoutUrl, message } = res.data || {};

      if (checkoutUrl) {
        toast.showToast(message || 'Redirection vers la passerelle sécurisée...', 'success');
        setOnlinePayModal({ show: false, payment: null, availableGateways: [], selectedGateway: 'CLIC_TO_PAY', isLoading: false, isInitiating: false });
        window.location.href = checkoutUrl;
      } else {
        toast.showToast('Lien de paiement initialisé', 'success');
        setOnlinePayModal({ show: false, payment: null, availableGateways: [], selectedGateway: 'CLIC_TO_PAY', isLoading: false, isInitiating: false });
        fetchStudentPayments();
      }
    } catch (err: any) {
      console.error('Online checkout failed:', err);
      const msg = err?.response?.data?.message || 'Échec de l’initialisation de la transaction en ligne';
      toast.showToast(msg, 'error');
      setOnlinePayModal((prev) => ({ ...prev, isInitiating: false }));
    }
  };

  // Filtered Student Payments
  const filteredStudentPayments = useMemo(() => {
    return studentPayments.filter((p) => {
      const matchesStatus = paymentStatusFilter === 'ALL' || p.status === paymentStatusFilter;
      const name = `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.toLowerCase();
      const reg = (p.student?.registrationNumber || '').toLowerCase();
      const query = studentSearch.toLowerCase();
      return matchesStatus && (name.includes(query) || reg.includes(query));
    });
  }, [studentPayments, studentSearch, paymentStatusFilter]);

  const {
    paginatedItems: paginatedStudentPayments,
    currentPage: studentPage,
    totalPages: studentTotalPages,
    goToPage: goStudentPage,
    totalItems: studentTotalItems,
  } = usePagination({ items: filteredStudentPayments, itemsPerPage: 10 });

  // Filtered Teacher Payments
  const filteredTeacherPayments = useMemo(() => {
    return teacherPayments.filter((tp) => {
      const name = `${tp.teacher?.firstName || ''} ${tp.teacher?.lastName || ''}`.toLowerCase();
      return name.includes(teacherSearch.toLowerCase());
    });
  }, [teacherPayments, teacherSearch]);

  // Overall Financial KPIs
  const totalStudentPaid = useMemo(
    () => studentPayments.filter((p) => p.status === 'PAID').reduce((sum, p) => sum + Number(p.amount), 0),
    [studentPayments]
  );
  const totalStudentPending = useMemo(
    () => studentPayments.filter((p) => p.status === 'PENDING').reduce((sum, p) => sum + Number(p.amount), 0),
    [studentPayments]
  );
  const totalVaultBalance = useMemo(
    () => caisses.reduce((sum, c) => sum + Number(c.balance), 0),
    [caisses]
  );
  const totalTeacherPayroll = useMemo(
    () => teacherPayments.reduce((sum, tp) => sum + Number(tp.amount), 0),
    [teacherPayments]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('finance.paymentsTitle')}</h1>
          <p className="text-text-secondary">
            {t('finance.paymentsSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'STUDENT' && (
            <Button onClick={() => {
              setEditingPaymentId(null);
              setStudentFormData({ studentId: '', parentId: '', amount: '', method: 'CASH', status: 'PAID', notes: '' });
              setShowStudentForm(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('finance.newPayment')}
            </Button>
          )}
          {activeTab === 'CAISSE' && (
            <Button onClick={() => setShowTransferModal(true)}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {t('finance.interCaisseTransfer')}
            </Button>
          )}
          {activeTab === 'TEACHER' && (
            <Button onClick={handleGeneratePayroll} isLoading={generatePayrollLoading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('finance.generatePayroll')}
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border flex gap-8">
        <button
          onClick={() => setActiveTab('STUDENT')}
          className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'STUDENT'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          {t('finance.tuitionPaymentsTab')} ({studentPayments.length})
        </button>

        <button
          onClick={() => setActiveTab('CAISSE')}
          className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'CAISSE'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Wallet className="w-4 h-4" />
          {t('finance.caissesTab')} ({caisses.length})
        </button>

        <button
          onClick={() => setActiveTab('TEACHER')}
          className={`pb-3 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'TEACHER'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {t('finance.teachersPayrollTab')} ({teacherPayments.length})
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success-muted/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">{t('finance.collectedTuition')}</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalStudentPaid.toLocaleString()} {CURRENCY}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning-muted rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">{t('finance.pendingTuition')}</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalStudentPending.toLocaleString()} {CURRENCY}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-muted/30 rounded-lg">
                <Wallet className="w-6 h-6 text-brand" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">{t('finance.cashTreasury')}</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalVaultBalance.toLocaleString()} {CURRENCY}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium">{t('finance.payrollMass')} ({payrollPeriod})</p>
                <p className="text-xl font-bold text-text-primary">
                  {totalTeacherPayroll.toLocaleString()} {CURRENCY}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PAIEMENTS SCOLARITÉ */}
      {/* ======================================================== */}
      {activeTab === 'STUDENT' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-surface rounded-lg max-w-md border border-border">
                <Search className="w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder={t('finance.searchPaymentPlaceholder')}
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-text-primary placeholder:text-text-tertiary"
                />
              </div>

              <div className="flex items-center gap-3">
                <Select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: t('finance.filterStatus') },
                    { value: 'PAID', label: t('finance.paid') },
                    { value: 'PENDING', label: t('finance.pending') },
                    { value: 'CANCELLED', label: t('finance.cancelled') },
                  ]}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isStudentLoading ? (
              <LoadingCard />
            ) : filteredStudentPayments.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>{t('finance.noPaymentsFound')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.studentCol')} & {t('attendance.registrationCol')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.amount')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.paymentMethod')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.status')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.dateLabel').replace(' *', '')}</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudentPayments.map((p) => (
                      <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-hover">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">
                            {p.student ? `${p.student.firstName} ${p.student.lastName}` : '-'}
                          </p>
                          <p className="text-xs text-text-tertiary">
                            {t('attendance.registrationCol')}: {p.student?.registrationNumber || '-'}
                          </p>
                        </td>
                        <td className="py-3 px-4 font-bold text-text-primary">
                          {Number(p.amount).toLocaleString()} {CURRENCY}
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          <span className="px-2 py-0.5 rounded text-xs bg-surface border border-border">
                            {p.method || 'CASH'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              p.status === 'PAID'
                                ? 'bg-success-muted text-success'
                                : p.status === 'PENDING'
                                ? 'bg-warning-muted text-warning'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {p.status === 'PAID' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {p.status === 'PAID' ? t('finance.paid') : t('finance.pending')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-text-secondary">
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.status === 'PENDING' && (
                              <button
                                onClick={() => handleInitiateOnlinePay(p)}
                                className="px-2.5 py-1 bg-[#242F40] hover:bg-[#363636] text-[#CCA43B] text-xs font-semibold rounded-lg border border-[#CCA43B]/40 flex items-center gap-1.5 transition-all shadow-xs"
                                title="Régler en ligne via ClicToPay ou Stripe"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Payer en ligne</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingPaymentId(p.id);
                                setStudentFormData({
                                  studentId: p.student?.id || '',
                                  parentId: '',
                                  amount: String(p.amount || ''),
                                  method: p.method || 'CASH',
                                  status: p.status || 'PAID',
                                  notes: p.notes || '',
                                });
                                setShowStudentForm(true);
                              }}
                              className="p-1.5 hover:bg-surface-hover rounded transition-colors text-text-secondary"
                              title={t('common.edit')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete({ show: true, id: p.id })}
                              className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {studentTotalItems > 0 && (
              <Pagination
                currentPage={studentPage}
                totalPages={studentTotalPages}
                onPageChange={goStudentPage}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CAISSES & MOUVEMENTS */}
      {/* ======================================================== */}
      {activeTab === 'CAISSE' && (
        <div className="space-y-6">
          {/* Caisse Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caisses.map((caisse) => (
              <Card key={caisse.id} className="relative overflow-hidden border border-border hover:shadow-md transition-shadow">
                <div className="absolute top-0 left-0 h-1.5 w-full bg-brand" />
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-muted/30 text-brand">
                        {caisse.type}
                      </span>
                      <h3 className="font-bold text-lg text-text-primary mt-1">{caisse.name}</h3>
                      <p className="text-xs text-text-tertiary">{caisse.description || 'Caisse opérationnelle'}</p>
                    </div>
                    <div className="p-2.5 rounded-full bg-surface border border-border">
                      <Wallet className="w-5 h-5 text-brand" />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-subtle flex justify-between items-end">
                    <div>
                      <p className="text-xs text-text-secondary">{t('finance.cashTreasury')}</p>
                      <p className="text-2xl font-black text-text-primary">
                        {Number(caisse.balance).toLocaleString()} <span className="text-sm font-semibold">{CURRENCY}</span>
                      </p>
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {caisse._count?.transactions || 0} {t('finance.caissesTab')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Transactions Ledger */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-text-primary">{t('finance.caissesTab')}</h2>
                  <p className="text-xs text-text-secondary">{t('finance.caisseSubtitle')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isCaisseLoading ? (
                <LoadingCard />
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  {t('finance.noPaymentsFound')}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.dateLabel').replace(' *', '')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.sourceCaisse')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.status')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.reasonCol')}</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.amount')}</th>
                        <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('portals.remainingDue')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-border-subtle hover:bg-surface-hover text-sm">
                          <td className="py-3 px-4 text-text-secondary">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 font-semibold text-text-primary">
                            {tx.caisse?.name || 'Caisse'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                tx.type === 'INCOME'
                                  ? 'bg-success-muted text-success'
                                  : tx.type === 'EXPENSE'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'bg-indigo-50 text-indigo-700'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-text-secondary">
                            {tx.description || tx.category || 'Mouvement'}
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-bold ${
                              tx.type === 'INCOME'
                                ? 'text-success'
                                : tx.type === 'EXPENSE'
                                ? 'text-destructive'
                                : 'text-indigo-600'
                            }`}
                          >
                            {tx.type === 'EXPENSE' ? '-' : '+'}
                            {Number(tx.amount).toLocaleString()} {CURRENCY}
                          </td>
                          <td className="py-3 px-4 text-right text-text-primary font-mono text-xs">
                            {Number(tx.balance).toLocaleString()} {CURRENCY}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SALAIRES ENSEIGNANTS */}
      {/* ======================================================== */}
      {activeTab === 'TEACHER' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-text-secondary flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {t('finance.payrollMass')}:
                </label>
                <input
                  type="month"
                  value={payrollPeriod}
                  onChange={(e) => setPayrollPeriod(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-text-primary font-medium"
                />
              </div>

              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-surface rounded-lg max-w-sm border border-border">
                <Search className="w-4 h-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  className="bg-transparent border-none outline-none text-sm flex-1 text-text-primary"
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isTeacherLoading ? (
              <LoadingCard />
            ) : filteredTeacherPayments.length === 0 ? (
              <div className="text-center py-12 text-text-tertiary">
                <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>{t('finance.noPaymentsFound')}</p>
                <Button onClick={handleGeneratePayroll} className="mt-4" isLoading={generatePayrollLoading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('finance.generatePayroll')}
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('portals.teacher')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.category')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('portals.attendance')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('finance.amount')}</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('attendance.status')}</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-text-secondary">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeacherPayments.map((tp) => (
                      <tr key={tp.id} className="border-b border-border-subtle hover:bg-surface-hover">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-text-primary">
                            {tp.teacher ? `${tp.teacher.firstName} ${tp.teacher.lastName}` : '-'}
                          </p>
                          <p className="text-xs text-text-tertiary">{tp.period}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-text-secondary">
                          <span className="px-2 py-0.5 rounded text-xs bg-surface border border-border">
                            {tp.contract?.contractType || 'HORAIRE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-text-primary">
                          {tp.hoursWorked !== undefined && tp.hoursWorked !== null ? `${tp.hoursWorked} h` : '-'}
                        </td>
                        <td className="py-3 px-4 font-bold text-text-primary">
                          {Number(tp.amount).toLocaleString()} {CURRENCY}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              tp.status === 'PAID'
                                ? 'bg-success-muted text-success'
                                : 'bg-warning-muted text-warning'
                            }`}
                          >
                            {tp.status === 'PAID' ? <CheckCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            {tp.status === 'PAID' ? t('finance.paid') : t('finance.pending')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {tp.status === 'PENDING' ? (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateTeacherStatus(tp.id, 'PAID')}
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                              {t('finance.paid')}
                            </Button>
                          ) : (
                            <span className="text-xs text-success font-medium flex items-center justify-end gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {t('finance.paid')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal 1: Enregistrer Règlement Élève */}
      <Modal
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        title={editingPaymentId ? t('finance.editPaymentModalTitle') : t('finance.recordPaymentModalTitle')}
        size="5xl"
      >
        <div className="space-y-4">
          {!editingPaymentId && (
            <Input
              label={t('common.student')}
              placeholder="UUID"
              value={studentFormData.studentId}
              onChange={(e) => setStudentFormData({ ...studentFormData, studentId: e.target.value })}
            />
          )}

          <Input
            label={`${t('finance.amount')} (${CURRENCY})`}
            type="number"
            placeholder="Ex: 250"
            value={studentFormData.amount}
            onChange={(e) => setStudentFormData({ ...studentFormData, amount: e.target.value })}
          />

          <Select
            label={t('finance.paymentMethod')}
            value={studentFormData.method}
            onChange={(e) => setStudentFormData({ ...studentFormData, method: e.target.value })}
            options={[
              { value: 'CASH', label: `${t('finance.cash')} (CASH)` },
              { value: 'CHECK', label: `${t('finance.check')}` },
              { value: 'CARD', label: `${t('finance.creditCard')}` },
              { value: 'BANK_TRANSFER', label: `${t('finance.bankTransfer')}` },
            ]}
          />

          <Select
            label={t('attendance.status')}
            value={studentFormData.status}
            onChange={(e) => setStudentFormData({ ...studentFormData, status: e.target.value })}
            options={[
              { value: 'PAID', label: `${t('finance.paid')} (PAID)` },
              { value: 'PENDING', label: `${t('finance.pending')} (PENDING)` },
            ]}
          />

          <Input
            label={t('attendance.reasonCol')}
            placeholder="Ex: Reçu N° 4022"
            value={studentFormData.notes}
            onChange={(e) => setStudentFormData({ ...studentFormData, notes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowStudentForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleStudentFormSubmit} isLoading={studentFormLoading}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Transfert Inter-Caisses */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title={t('finance.transferModalTitle')}
        size="5xl"
      >
        <div className="space-y-4">
          <Select
            label={t('finance.sourceCaisse')}
            value={transferForm.fromCaisseId}
            onChange={(e) => setTransferForm({ ...transferForm, fromCaisseId: e.target.value })}
            options={[
              { value: '', label: '-- Sélectionner --' },
              ...caisses.map((c) => ({
                value: c.id,
                label: `${c.name} (${Number(c.balance).toLocaleString()} ${CURRENCY})`,
              })),
            ]}
          />

          <Select
            label={t('finance.targetCaisse')}
            value={transferForm.toCaisseId}
            onChange={(e) => setTransferForm({ ...transferForm, toCaisseId: e.target.value })}
            options={[
              { value: '', label: '-- Sélectionner --' },
              ...caisses.map((c) => ({
                value: c.id,
                label: `${c.name} (${Number(c.balance).toLocaleString()} ${CURRENCY})`,
              })),
            ]}
          />

          <Input
            label={`${t('finance.amount')} (${CURRENCY})`}
            type="number"
            placeholder="Ex: 500"
            value={transferForm.amount}
            onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
          />

          <Input
            label={t('attendance.reasonCol')}
            placeholder="Ex: Virement..."
            value={transferForm.description}
            onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleExecuteTransfer} isLoading={transferLoading}>
              <Send className="w-4 h-4 mr-2" />
              {t('finance.executeTransfer')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.show}
        onClose={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={handleDeletePayment}
        title={t('finance.deletePaymentTitle')}
        message={t('finance.deletePaymentMsg')}
        isLoading={deleteLoading}
      />

      {/* Online Payment Gateway Selection Modal (ClicToPay Tunisie vs Stripe International) */}
      <Modal
        isOpen={onlinePayModal.show}
        onClose={() =>
          !onlinePayModal.isInitiating &&
          setOnlinePayModal({
            show: false,
            payment: null,
            availableGateways: [],
            selectedGateway: 'CLIC_TO_PAY',
            isLoading: false,
            isInitiating: false,
          })
        }
        title="Règlement Sécurisé en Ligne"
        size="lg"
      >
        <div className="space-y-5">
          {onlinePayModal.isLoading ? (
            <div className="py-8 text-center text-text-secondary flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#CCA43B]" />
              <p className="text-sm font-medium">Vérification des passerelles de paiement bancaire...</p>
            </div>
          ) : (
            <>
              {onlinePayModal.payment && (
                <div className="p-4 rounded-xl bg-[#242F40] text-white border border-[#363636] flex justify-between items-center">
                  <div>
                    <span className="text-xs text-[#E5E5E5]/70 block">Bénéficiaire & Scolarité</span>
                    <p className="font-bold text-base text-white">
                      {onlinePayModal.payment.student
                        ? `${onlinePayModal.payment.student.firstName} ${onlinePayModal.payment.student.lastName}`
                        : 'Élève'}
                    </p>
                    <p className="text-xs text-[#CCA43B] font-mono">
                      Matricule: {onlinePayModal.payment.student?.registrationNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#E5E5E5]/70 block">{t('finance.amountDue')}</span>
                    <p className="text-xl font-black text-[#CCA43B]">
                      {Number(onlinePayModal.payment.amount).toLocaleString()} {CURRENCY}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
                  {t('finance.selectGateway')}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* ClicToPay Option */}
                  {onlinePayModal.availableGateways.includes('CLIC_TO_PAY') && (
                    <button
                      type="button"
                      onClick={() => setOnlinePayModal((prev) => ({ ...prev, selectedGateway: 'CLIC_TO_PAY' }))}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        onlinePayModal.selectedGateway === 'CLIC_TO_PAY'
                          ? 'border-[#CCA43B] bg-[#CCA43B]/10 shadow-sm ring-1 ring-[#CCA43B]'
                          : 'border-border bg-surface hover:border-[#CCA43B]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-[#CCA43B]" />
                            {t('finance.clictopayTitle')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {t('finance.clictopayBadge')}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {t('finance.clictopayDesc')}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#CCA43B]">{t('finance.clictopaySub')}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            onlinePayModal.selectedGateway === 'CLIC_TO_PAY'
                              ? 'border-[#CCA43B] bg-[#CCA43B]'
                              : 'border-border'
                          }`}
                        >
                          {onlinePayModal.selectedGateway === 'CLIC_TO_PAY' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#242F40]" />
                          )}
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Stripe Option */}
                  {onlinePayModal.availableGateways.includes('STRIPE') && (
                    <button
                      type="button"
                      onClick={() => setOnlinePayModal((prev) => ({ ...prev, selectedGateway: 'STRIPE' }))}
                      className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        onlinePayModal.selectedGateway === 'STRIPE'
                          ? 'border-[#CCA43B] bg-[#CCA43B]/10 shadow-sm ring-1 ring-[#CCA43B]'
                          : 'border-border bg-surface hover:border-[#CCA43B]/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#CCA43B]" />
                            {t('finance.stripeTitle')}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {t('finance.stripeBadge')}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {t('finance.stripeDesc')}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-text-tertiary">{t('finance.stripeSub')}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            onlinePayModal.selectedGateway === 'STRIPE'
                              ? 'border-[#CCA43B] bg-[#CCA43B]'
                              : 'border-border'
                          }`}
                        >
                          {onlinePayModal.selectedGateway === 'STRIPE' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#242F40]" />
                          )}
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-secondary flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  {t('finance.pciDssNotice')}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  variant="secondary"
                  disabled={onlinePayModal.isInitiating}
                  onClick={() =>
                    setOnlinePayModal({
                      show: false,
                      payment: null,
                      availableGateways: [],
                      selectedGateway: 'CLIC_TO_PAY',
                      isLoading: false,
                      isInitiating: false,
                    })
                  }
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    if (onlinePayModal.payment) {
                      executeOnlineCheckout(onlinePayModal.payment.id, onlinePayModal.selectedGateway);
                    }
                  }}
                  isLoading={onlinePayModal.isInitiating}
                  className="bg-[#242F40] hover:bg-[#363636] text-[#CCA43B] border border-[#CCA43B]"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t('finance.payWith', {
                    gateway: onlinePayModal.selectedGateway === 'CLIC_TO_PAY'
                      ? t('finance.clictopayGatewayLabel')
                      : t('finance.stripeGatewayLabel'),
                  })}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
