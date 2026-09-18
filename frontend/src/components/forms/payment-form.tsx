'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useTranslation } from '@/components/providers/i18n-provider';
import {
  CreditCard,
  Banknote,
  FileCheck,
  Building2,
  Receipt,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId?: string | null;
  onSuccess: () => void;
}

interface PaymentData {
  studentId: string;
  parentId: string;
  amount: number;
  caisseId: string;
  planId: string;
  paymentDate: string;
  dueDate: string;
  method: string;
  reference: string;
  checkNumber: string;
  notes: string;
  status: string;
  currency: string;
}

const initialPaymentData: PaymentData = {
  studentId: '',
  parentId: '',
  amount: 250,
  caisseId: '',
  planId: '',
  paymentDate: new Date().toISOString().split('T')[0],
  dueDate: new Date().toISOString().split('T')[0],
  method: 'CASH',
  reference: '',
  checkNumber: '',
  notes: '',
  status: 'COMPLETED',
  currency: 'TND',
};

export function PaymentForm({ isOpen, onClose, paymentId, onSuccess }: PaymentFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PaymentData>(initialPaymentData);
  const [students, setStudents] = useState<{ id: string; firstName: string; lastName: string; registrationNumber?: string }[]>([]);
  const [parents, setParents] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [caisses, setCaisses] = useState<{ id: string; name: string; balance?: number }[]>([]);
  const [plans, setPlans] = useState<{ id: string; name: string; amount?: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateReference = () => {
    const timestamp = Date.now().toString().slice(-6);
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, reference: `REC-${timestamp}-${rand}` }));
  };

  const fetchDependencies = useCallback(async () => {
    try {
      const [stuRes, parRes, caiRes, plaRes] = await Promise.all([
        api.get('/students?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/parents?limit=100').catch(() => ({ data: { data: [] } })),
        api.get('/caisses?limit=50').catch(() => ({ data: { data: [] } })),
        api.get('/payment-plans?limit=50').catch(() => ({ data: { data: [] } })),
      ]);
      setStudents(stuRes.data.data || []);
      setParents(parRes.data.data || []);
      setCaisses(caiRes.data.data || []);
      setPlans(plaRes.data.data || []);
    } catch (err) {
      console.error('Failed to load payment form dependencies:', err);
    }
  }, []);

  const fetchPayment = useCallback(async () => {
    if (!paymentId) return;
    try {
      const response = await api.get(`/student-payments/${paymentId}`);
      const p = response.data;
      setFormData({
        studentId: p.studentId || '',
        parentId: p.parentId || '',
        amount: Number(p.amount) || 0,
        caisseId: p.caisseId || '',
        planId: p.planId || '',
        paymentDate: p.paidAt ? new Date(p.paidAt).toISOString().split('T')[0] : '',
        dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : '',
        method: p.method || 'CASH',
        reference: p.reference || '',
        checkNumber: p.checkNumber || '',
        notes: p.notes || '',
        status: p.status || 'COMPLETED',
        currency: p.currency || 'TND',
      });
    } catch (err) {
      console.error('Failed to fetch payment:', err);
    }
  }, [paymentId]);

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
      if (paymentId) {
        fetchPayment();
      } else {
        setFormData(initialPaymentData);
        generateReference();
      }
      setError('');
    }
  }, [isOpen, paymentId, fetchDependencies, fetchPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      setError(t('paymentForm.studentRequiredError') || 'Veuillez sélectionner un élève');
      return;
    }
    if (Number(formData.amount) <= 0) {
      setError(t('paymentForm.amountPositiveError') || 'Le montant doit être supérieur à 0 TND');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload: Record<string, unknown> = {
        studentId: formData.studentId,
        amount: Number(formData.amount),
        currency: 'TND',
        method: formData.method,
        status: formData.status,
        paidAt: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        reference: formData.reference || undefined,
        checkNumber: formData.checkNumber || undefined,
        notes: formData.notes || undefined,
      };

      if (formData.parentId) payload.parentId = formData.parentId;
      if (formData.planId) payload.planId = formData.planId;

      if (paymentId) {
        await api.put(`/student-payments/${paymentId}`, payload);
      } else {
        await api.post('/student-payments', payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paymentId ? (t('paymentForm.editPaymentModal') || 'Modifier le paiement') : (t('paymentForm.collectPaymentModal') || 'Encaisser un règlement (TND)')}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-coral/10 border border-coral/20 text-coral text-sm rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount & Currency Hero Box */}
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              {t('paymentForm.depositAmount') || 'Montant du versement'}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <input
                type="number"
                step="0.001"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="text-3xl font-extrabold text-text-primary bg-transparent border-b-2 border-primary focus:outline-none w-44"
                required
              />
              <span className="text-lg font-bold text-primary">TND</span>
            </div>
            <p className="text-xs text-text-secondary mt-1">{t('paymentForm.currencyLegalNote') || 'Dinar Tunisien (Devise légale)'}</p>
          </div>

          <div className="flex flex-col items-end gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">{t('paymentForm.paymentRef') || 'Réf :'}</span>
              <span className="text-xs font-mono font-semibold bg-surface px-2.5 py-1 rounded-lg border border-border">
                {formData.reference || (t('paymentForm.autoGenerated') || 'Auto-généré')}
              </span>
              <button
                type="button"
                onClick={generateReference}
                className="p-1 hover:bg-surface rounded text-primary transition-colors"
                title={t('paymentForm.regenerateRef') || 'Régénérer la référence'}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                formData.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  : formData.status === 'PENDING'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-coral/10 text-coral border border-coral/20'
              }`}
            >
              {formData.status === 'COMPLETED' ? (t('paymentForm.paidImmediately') || 'Payé immédiatement') : formData.status === 'PENDING' ? (t('paymentForm.pendingValidation') || 'En attente') : formData.status}
            </span>
          </div>
        </div>

        {/* Student & Parent Assignment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              {t('paymentForm.concernedStudent') || 'Élève concerné *'}
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            >
              <option value="">{t('paymentForm.selectStudentPlaceholder') || '-- Sélectionner un élève --'}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} {s.registrationNumber ? `(${s.registrationNumber})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              {t('paymentForm.parentPayer') || 'Parent ou Payeur (Optionnel)'}
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">{t('paymentForm.sameAsStudent') || '-- Même que le dossier élève --'}</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Caisse & Plan Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {caisses.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                {t('paymentForm.collectionCaisse') || "Caisse d'encaissement"}
              </label>
              <select
                value={formData.caisseId}
                onChange={(e) => setFormData({ ...formData, caisseId: e.target.value })}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="">{t('paymentForm.centralCaisse') || 'Caisse Centrale'}</option>
                {caisses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.balance !== undefined ? `(${Number(c.balance).toFixed(2)} TND)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {plans.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                {t('paymentForm.associatedPlan') || 'Plan de scolarité associé'}
              </label>
              <select
                value={formData.planId}
                onChange={(e) => {
                  const selPlan = plans.find((p) => p.id === e.target.value);
                  setFormData({
                    ...formData,
                    planId: e.target.value,
                    amount: selPlan?.amount ? Number(selPlan.amount) : formData.amount,
                  });
                }}
                className="w-full h-10 px-3 text-sm bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="">{t('paymentForm.freePayment') || 'Paiement libre / Hors forfait'}</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.amount ? `(${Number(p.amount).toFixed(2)} TND)` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Payment Method Selector Cards */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            {t('paymentForm.paymentMethod') || 'Mode de paiement *'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'CASH', label: t('paymentForm.cash') || 'Espèces', icon: Banknote },
              { id: 'CHECK', label: t('paymentForm.check') || 'Chèque', icon: FileCheck },
              { id: 'BANK_TRANSFER', label: t('paymentForm.bankTransfer') || 'Virement', icon: Building2 },
              { id: 'STRIPE', label: t('paymentForm.creditCard') || 'Carte Bancaire', icon: CreditCard },
            ].map((method) => {
              const MethodIcon = method.icon;
              const isSelected = formData.method === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, method: method.id })}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary shadow-sm ring-1 ring-primary/20'
                      : 'border-border bg-surface hover:bg-surface-hover text-text-secondary'
                  }`}
                >
                  <MethodIcon className="w-5 h-5 mb-1" />
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional check number or transaction reference */}
        {formData.method === 'CHECK' && (
          <div className="animate-in fade-in duration-150">
            <Input
              label={t('paymentForm.checkNumberAndBank') || 'Numéro de chèque & Banque émettrice *'}
              placeholder={t('paymentForm.checkNumberPlaceholder') || 'Ex: Chèque n° 4892019 - BIAT / Attijari'}
              value={formData.checkNumber}
              onChange={(e) => setFormData({ ...formData, checkNumber: e.target.value })}
              required
            />
          </div>
        )}

        {/* Dates & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label={t('paymentForm.paymentDate') || 'Date de paiement'}
            type="date"
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
          />

          <Input
            label={t('paymentForm.dueDate') || "Date d'échéance"}
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <Select
            label={t('paymentForm.settlementStatus') || 'Statut du règlement'}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'COMPLETED', label: t('paymentForm.statusPaid') || 'Payé / Réglé' },
              { value: 'PENDING', label: t('paymentForm.statusPending') || 'En attente d’encaissement' },
              { value: 'OVERDUE', label: t('paymentForm.statusOverdue') || 'En retard' },
              { value: 'CANCELLED', label: t('paymentForm.statusCancelled') || 'Annulé' },
            ]}
          />
        </div>

        {/* Notes */}
        <Textarea
          label={t('paymentForm.accountingNotes') || 'Notes comptables & Libellé sur le reçu'}
          placeholder={t('paymentForm.accountingNotesPlaceholder') || 'Ex: Frais de scolarité 2ème trimestre + transport scolaire...'}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>

          <Button type="submit" isLoading={isLoading} className="gap-2 bg-primary hover:bg-primary/90">
            <Receipt className="w-4 h-4" />
            {paymentId ? (t('common.save') || 'Mettre à jour') : (t('paymentForm.recordDeposit') || 'Enregistrer le versement')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
