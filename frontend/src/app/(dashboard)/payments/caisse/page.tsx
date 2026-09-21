'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  ArrowLeft,
  Printer,
  Lock,
  Search,
  ArrowRightLeft,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from '@/components/providers/i18n-provider';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import api from '@/lib/api';
import { useEstablishmentStore } from '@/store/establishment-store';
import type { CaisseTransaction, Caisse } from '@/types';

export default function CaissePage() {
  const { t } = useTranslation();
  const { currentEstablishmentId } = useEstablishmentStore();
  const [caisses, setCaisses] = useState<Caisse[]>([]);
  const [selectedCaisseId, setSelectedCaisseId] = useState<string>('');
  const [transactions, setTransactions] = useState<CaisseTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<CaisseTransaction | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [caisseClosed, setCaisseClosed] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferForm, setTransferForm] = useState({
    toCaisseId: '',
    amount: '',
    description: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeEstId =
        currentEstablishmentId && currentEstablishmentId !== 'ALL' && currentEstablishmentId !== 'all'
          ? currentEstablishmentId
          : undefined;

      const caisseUrl = activeEstId
        ? `/caisses?limit=50&establishmentId=${activeEstId}`
        : '/caisses?limit=50';
      const caissesRes = await api.get(caisseUrl);
      const caisseList: Caisse[] = caissesRes.data?.data || caissesRes.data || [];
      setCaisses(caisseList);

      const activeCaisse = selectedCaisseId && caisseList.some((c) => c.id === selectedCaisseId)
        ? selectedCaisseId
        : (caisseList.length > 0 ? caisseList[0].id : '');
      setSelectedCaisseId(activeCaisse);

      const txUrl = activeCaisse
        ? `/financial-transactions?caisseId=${activeCaisse}&limit=50`
        : activeEstId
        ? `/financial-transactions?establishmentId=${activeEstId}&limit=50`
        : '/financial-transactions?limit=50';
      const txRes = await api.get(txUrl);
      const txList = txRes.data?.data || txRes.data || [];

      if (Array.isArray(txList)) {
        setTransactions(
          txList.map((item: Record<string, unknown>) => ({
            id: String(item.id || ''),
            receiptNumber: (item.reference as string) || `REC-${String(item.id || '').slice(0, 8).toUpperCase()}`,
            date: item.createdAt ? new Date(item.createdAt as string).toISOString().slice(0, 16).replace('T', ' ') : '2026-09-17 10:00',
            studentName: (item.description as string) || 'Paiement scolarité',
            amount: Number(item.amount || 0),
            currency: 'TND',
            method: (item.type === 'EXPENSE' ? 'CASH' : (item.category as string) || 'CASH') as CaisseTransaction['method'],
            cashierName: 'Agent Caisse',
            category: item.type === 'TRANSFER' ? 'TRANSFER' : 'TUITION',
            notes: (item.description as string) || '',
            status: 'CONFIRMED',
          }))
        );
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du chargement des données de caisse');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCaisseId, currentEstablishmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaisseId || !transferForm.toCaisseId || !transferForm.amount) return;
    setIsTransferring(true);
    try {
      await api.post('/financial-transactions/transfer', {
        fromCaisseId: selectedCaisseId,
        toCaisseId: transferForm.toCaisseId,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || 'Transfert inter-caisses',
      });
      showToast('Transfert inter-caisses exécuté avec succès', 'success');
      setTransferModalOpen(false);
      setTransferForm({ toCaisseId: '', amount: '', description: '' });
      await loadData();
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors du transfert');
    } finally {
      setIsTransferring(false);
    }
  };

  const totalCollected = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCash = transactions.filter((t) => t.method === 'CASH').reduce((acc, curr) => acc + curr.amount, 0);
  const totalChecks = transactions.filter((t) => t.method === 'CHECK').reduce((acc, curr) => acc + curr.amount, 0);
  const totalTransfers = transactions.filter((t) => t.method === 'BANK_TRANSFER').reduce((acc, curr) => acc + curr.amount, 0);

  const filteredTx = transactions.filter(
    (t) =>
      (t.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.receiptNumber || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="border-b border-border pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/payments"
              className="text-xs font-bold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour aux Paiements
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                {t('finance.caisseTitle')}
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">
                {t('finance.caisseSubtitle')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {caisses.length > 1 && (
            <select
              value={selectedCaisseId}
              onChange={(e) => setSelectedCaisseId(e.target.value)}
              className="text-xs font-bold bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {caisses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({Number(c.balance || 0).toFixed(3)} TND)
                </option>
              ))}
            </select>
          )}

          <Button
            variant="secondary"
            onClick={() => loadData()}
            disabled={isLoading}
            className="gap-2 font-bold text-xs"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="secondary"
            onClick={() => setTransferModalOpen(true)}
            className="gap-2 font-bold text-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfert
          </Button>

          <Button
            onClick={() => setCloseModalOpen(true)}
            disabled={caisseClosed}
            className={`gap-2 font-bold text-xs ${
              caisseClosed
                ? 'bg-surface text-text-tertiary border border-border cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            <Lock className="w-4 h-4" />
            {caisseClosed ? 'Caisse Clôturée' : t('finance.closeCaisse')}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/80">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
            {t('finance.dailyTotal')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-text-primary">{totalCollected.toFixed(3)}</span>
            <span className="text-xs font-bold text-text-tertiary">TND</span>
          </div>
        </Card>

        <Card className="p-4 border-border/80 border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            {t('finance.cashTotal')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{totalCash.toFixed(3)}</span>
            <span className="text-xs font-bold text-text-tertiary">TND</span>
          </div>
        </Card>

        <Card className="p-4 border-border/80 border-l-4 border-l-primary">
          <span className="text-xs font-bold text-primary uppercase tracking-wider block">
            {t('finance.checksPending')}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-primary">{totalChecks.toFixed(3)}</span>
            <span className="text-xs font-bold text-text-tertiary">TND</span>
          </div>
        </Card>

        <Card className="p-4 border-border/80 border-l-4 border-l-purple-500">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
            Virements Bancaires
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-purple-600">{totalTransfers.toFixed(3)}</span>
            <span className="text-xs font-bold text-text-tertiary">TND</span>
          </div>
        </Card>
      </div>

      {/* Search & Transaction Table */}
      <Card className="overflow-hidden border-border/80">
        <div className="p-4 border-b border-border bg-surface-hover/30 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher par élève ou N° reçu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-surface border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <span className="text-xs text-text-secondary font-medium">
            Session ouverte par : <strong className="text-text-primary">Mme. Karima Ben Amor</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/40 text-xs font-bold text-text-secondary uppercase">
                <th className="py-3 px-4">{t('finance.receiptNumber')}</th>
                <th className="py-3 px-4">Heure</th>
                <th className="py-3 px-4">Élève & Classe</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4 text-right">{t('common.amount')}</th>
                <th className="py-3 px-4 text-center">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-hover/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-primary">{tx.receiptNumber}</td>
                  <td className="py-3 px-4 text-xs text-text-secondary">{tx.date.split(' ')[1]}</td>
                  <td className="py-3 px-4 font-bold text-text-primary">{tx.studentName}</td>
                  <td className="py-3 px-4 text-xs font-semibold text-text-secondary">{tx.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                        tx.method === 'CASH'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : tx.method === 'CHECK'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-purple-500/10 text-purple-600'
                      }`}
                    >
                      {tx.method === 'CASH' ? 'Espèces' : tx.method === 'CHECK' ? 'Chèque' : 'Virement'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-text-primary">
                    {tx.amount.toFixed(3)} <span className="text-xs text-text-tertiary">TND</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 text-text-secondary hover:text-primary rounded-lg transition-colors"
                      title={t('finance.printReceipt')}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Receipt Preview */}
      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={t('finance.receipt')}
        size="5xl"
      >
        {selectedTx && (
          <div className="space-y-6">
            <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h2 className="text-base font-black text-text-primary">BSOFTS SCHOOL ACADEMY</h2>
                  <p className="text-text-secondary">Avenue Habib Bourguiba, Tunis • Tél: +216 71 000 000</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-primary block">{selectedTx.receiptNumber}</span>
                  <span className="text-text-secondary">{selectedTx.date}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <span className="text-text-tertiary block">{t('finance.studentLearner')}</span>
                  <span className="font-bold text-text-primary text-sm">{selectedTx.studentName}</span>
                </div>
                <div>
                  <span className="text-text-tertiary block">{t('finance.cashierOperator')}</span>
                  <span className="font-bold text-text-primary">{selectedTx.cashierName}</span>
                </div>
              </div>

              <div className="p-3 bg-surface-hover rounded-xl flex items-center justify-between text-sm">
                <span className="font-bold">{selectedTx.notes}</span>
                <span className="text-lg font-black text-emerald-600">{selectedTx.amount.toFixed(3)} TND</span>
              </div>

              <div className="text-center pt-4 text-text-tertiary text-[11px]">
                {t('finance.receiptFooter')}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedTx(null)}>
                {t('common.close')}
              </Button>
              <Button onClick={() => window.print()} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
                <Printer className="w-4 h-4" />
                {t('finance.printReceipt')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Close Caisse */}
      <Modal
        isOpen={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title={t('finance.closeCaisse')}
        size="5xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-secondary">
            {t('finance.closeCaisseDesc')}
          </p>

          <div className="p-4 bg-surface-hover rounded-xl text-xs space-y-2 border border-border">
            <div className="flex justify-between font-bold">
              <span>{t('finance.totalCashToRemit')}</span>
              <span className="text-emerald-600">{totalCash.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{t('finance.totalPhysicalChecks')}</span>
              <span className="text-primary">{totalChecks.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>{t('finance.totalTransfersAccounted')}</span>
              <span className="text-purple-600">{totalTransfers.toFixed(3)} TND</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-black text-sm">
              <span>{t('finance.totalDailyRevenue')}</span>
              <span className="text-text-primary">{totalCollected.toFixed(3)} TND</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setCloseModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                setCaisseClosed(true);
                setCloseModalOpen(false);
              }}
              className="gap-2 bg-primary hover:bg-primary/90 font-bold"
            >
              <Lock className="w-4 h-4" />
              {t('finance.confirmCloseCaisse')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Inter-Caisse Transfer */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfert Inter-Caisses Sécurisé"
        size="5xl"
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4">
          <p className="text-xs text-text-secondary">
            Transférer des fonds en temps réel avec mise à jour atomique des soldes et journalisation d&apos;audit.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Caisse Source</label>
              <input
                type="text"
                disabled
                value={caisses.find((c) => c.id === selectedCaisseId)?.name || 'Caisse Active'}
                className="w-full text-xs font-bold bg-surface-hover/50 border border-border rounded-xl px-3 py-2 text-text-secondary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Caisse Destination</label>
              <select
                required
                value={transferForm.toCaisseId}
                onChange={(e) => setTransferForm({ ...transferForm, toCaisseId: e.target.value })}
                className="w-full text-xs font-bold bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Sélectionner la caisse de destination...</option>
                {caisses
                  .filter((c) => c.id !== selectedCaisseId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({Number(c.balance || 0).toFixed(3)} TND)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Montant du Transfert (TND)</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                required
                placeholder="0.000"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                className="w-full text-xs font-bold bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-primary block mb-1">Motif / Justification</label>
              <input
                type="text"
                placeholder="Ex: Alimentation caisse menus dépenses"
                value={transferForm.description}
                onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                className="w-full text-xs font-bold bg-surface border border-border rounded-xl px-3 py-2 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setTransferModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isTransferring} className="gap-2 bg-primary hover:bg-primary/90 font-bold">
              <ArrowRightLeft className="w-4 h-4" />
              {isTransferring ? 'Traitement...' : 'Exécuter le Virement'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
