'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, BookOpen, AlertCircle, Copy } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

interface AiExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExam?: (generated: any) => void;
  onCreated?: () => void;
  defaultMatiereName?: string;
  defaultClassName?: string;
}

export function AiExamModal({
  isOpen,
  onClose,
  onApplyExam,
  onCreated,
  defaultMatiereName = '',
  defaultClassName = '',
}: AiExamModalProps) {
  const [topic, setTopic] = useState('');
  const [matiereName, setMatiereName] = useState(defaultMatiereName);
  const [className, setClassName] = useState(defaultClassName);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [type, setType] = useState<'QCM' | 'MIXED' | 'OPEN'>('MIXED');
  const [duration, setDuration] = useState(60);

  const [isLoading, setIsLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Veuillez spécifier le sujet ou le chapitre de l’examen', 'error');
      return;
    }

    setIsLoading(true);
    setGeneratedExam(null);

    try {
      const res = await api.post('/ai/generate/exam', {
        topic,
        matiereName: matiereName || undefined,
        className: className || undefined,
        questionCount: Number(questionCount),
        difficulty,
        type,
        duration: Number(duration),
      });

      const exam = res.data?.exam;
      if (exam) {
        setGeneratedExam(exam);
        showToast('Sujet d’examen généré avec succès par l’IA !', 'success');
      } else {
        showToast('Aucun contenu généré', 'error');
      }
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la génération du sujet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedExam) return;
    navigator.clipboard.writeText(JSON.stringify(generatedExam, null, 2));
    setCopied(true);
    showToast('Contenu de l’examen copié dans le presse-papiers', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (generatedExam && onApplyExam) {
      onApplyExam(generatedExam);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concepteur d'Épreuve IA (Assistant Pédagogique)"
      size="4xl"
    >
      <div className="space-y-6">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            Générez automatiquement un sujet d’examen complet avec barème, questions à choix multiples ou ouvertes et corrigé-type, adapté au niveau scolaire et au programme de votre établissement.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Sujet ou Chapitre à évaluer *
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Les fonctions exponentielles, La révolution industrielle, Grammaire..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Matière
            </label>
            <Input
              value={matiereName}
              onChange={(e) => setMatiereName(e.target.value)}
              placeholder="Ex: Mathématiques, Histoire, Français..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Niveau / Classe
            </label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ex: 4ème Année Secondaire, 3ème Collège..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Difficulté
            </label>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              options={[
                { value: 'EASY', label: 'Facile (Notions de base)' },
                { value: 'MEDIUM', label: 'Standard (Intermédiaire)' },
                { value: 'HARD', label: 'Avancé (Approfondissement)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Format des questions
            </label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: 'MIXED', label: 'Mixte (QCM + Problèmes)' },
                { value: 'QCM', label: 'Uniquement QCM' },
                { value: 'OPEN', label: 'Questions ouvertes / Rédaction' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Nombre de questions
            </label>
            <Input
              type="number"
              min={1}
              max={20}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Durée estimée (minutes)
            </label>
            <Input
              type="number"
              min={15}
              max={240}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer le sujet
                </>
              )}
            </Button>
          </div>
        </form>

        {generatedExam && (
          <div className="mt-6 pt-4 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  {generatedExam.title || 'Sujet Généré'}
                </h4>
                <p className="text-xs text-text-secondary">
                  Durée: {generatedExam.durationMinutes || duration} min | Barème: {generatedExam.totalPoints || 20} pts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copié' : 'Copier JSON'}
                </Button>
                {onApplyExam && (
                  <Button size="sm" onClick={handleApply} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Appliquer à l’épreuve
                  </Button>
                )}
              </div>
            </div>

            {generatedExam.instructions && (
              <p className="text-xs italic text-text-tertiary bg-surface p-2.5 rounded-lg border border-border">
                Consignes : {generatedExam.instructions}
              </p>
            )}

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {Array.isArray(generatedExam.questions) ? (
                generatedExam.questions.map((q: any, idx: number) => (
                  <div
                    key={q.id || idx}
                    className="p-3.5 rounded-xl bg-surface border border-border space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-text-primary">
                        Question {idx + 1} ({q.points || 2} pts) : {q.question}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold uppercase text-text-tertiary shrink-0">
                        {q.type || 'Standard'}
                      </span>
                    </div>

                    {Array.isArray(q.options) && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 pt-1">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div
                            key={optIdx}
                            className={`p-1.5 rounded-md border text-[11px] ${
                              q.correctAnswer && opt.includes(q.correctAnswer)
                                ? 'bg-emerald-500/10 border-emerald-300 text-emerald-700 dark:text-emerald-300 font-semibold'
                                : 'bg-background border-border text-text-secondary'
                            }`}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.correctAnswer && (
                      <div className="pt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Corrigé : {q.correctAnswer}
                      </div>
                    )}
                    {q.explanation && (
                      <div className="text-[11px] text-text-tertiary italic">
                        Explication : {q.explanation}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-surface border border-border text-xs whitespace-pre-wrap">
                  {generatedExam.rawContent || JSON.stringify(generatedExam, null, 2)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
