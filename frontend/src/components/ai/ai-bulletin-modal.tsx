'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, MessageSquareQuote, Copy } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

interface AiBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  studentName?: string;
  periodId?: string;
  initialAverage?: number;
  onApplyRemarks?: (remarks: string) => void;
}

export function AiBulletinModal({
  isOpen,
  onClose,
  studentId,
  studentName = 'Élève sélectionné',
  periodId,
  initialAverage,
  onApplyRemarks,
}: AiBulletinModalProps) {
  const [averageScore, setAverageScore] = useState<number | ''>(
    initialAverage !== undefined ? initialAverage : '',
  );
  const [conduct, setConduct] = useState('Attentif et sérieux en classe');
  const [strengths, setStrengths] = useState('Travail régulier, bon investissement');
  const [areasForImprovement, setAreasForImprovement] = useState('Approfondir la participation orale');
  const [language, setLanguage] = useState<'FR' | 'EN' | 'AR'>('FR');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedRemarks, setGeneratedRemarks] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      showToast('Aucun élève spécifié', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/ai/generate/bulletin-remarks', {
        studentId,
        averageScore: averageScore !== '' ? Number(averageScore) : undefined,
        conduct,
        strengths,
        areasForImprovement,
        language,
      });

      const remarks = res.data?.remarks;
      if (remarks) {
        setGeneratedRemarks(remarks);
        showToast('Appréciation pédagogique générée avec succès !', 'success');
      }
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la génération de l’appréciation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedRemarks && onApplyRemarks) {
      onApplyRemarks(generatedRemarks);
      onClose();
    }
  };

  const handleCopy = () => {
    if (!generatedRemarks) return;
    navigator.clipboard.writeText(generatedRemarks);
    setCopied(true);
    showToast('Appréciation copiée', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rédacteur d'Appréciation IA pour Bulletin"
      size="2xl"
    >
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            Rédigez une appréciation générale personnalisée, constructive et bienveillante pour le bulletin de <span className="font-bold">{studentName}</span>.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Moyenne Générale (/20)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="20"
                value={averageScore}
                onChange={(e) => setAverageScore(e.target.value ? Number(e.target.value) : '')}
                placeholder="Ex: 14.50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Langue de rédaction
              </label>
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                options={[
                  { value: 'FR', label: 'Français' },
                  { value: 'AR', label: 'Arabe' },
                  { value: 'EN', label: 'Anglais' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Comportement & Attitude
            </label>
            <Input
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              placeholder="Ex: Très sérieux, attentif, discret..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Points forts constatés
            </label>
            <Input
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="Ex: Rigueur mathématique, bonne expression..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Axes de progrès
            </label>
            <Input
              value={areasForImprovement}
              onChange={(e) => setAreasForImprovement(e.target.value)}
              placeholder="Ex: Gagner en autonomie, participation orale..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Fermer
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rédaction en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer l’appréciation
                </>
              )}
            </Button>
          </div>
        </form>

        {generatedRemarks && (
          <div className="mt-4 pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4 text-amber-500" />
                Appréciation Pédagogique Proposée
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copié' : 'Copier'}
                </Button>
                {onApplyRemarks && (
                  <Button size="sm" onClick={handleApply} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Insérer dans le bulletin
                  </Button>
                )}
              </div>
            </div>

            <Textarea
              value={generatedRemarks}
              onChange={(e) => setGeneratedRemarks(e.target.value)}
              rows={4}
              className="text-xs leading-relaxed"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
