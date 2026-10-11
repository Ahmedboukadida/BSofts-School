'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, BookOpen, Copy } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { showToast, showApiErrorToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

interface AiHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMatiereName?: string;
  defaultClassName?: string;
  onApplyHomework?: (data: { title: string; description: string }) => void;
  onCreated?: () => void;
}

export function AiHomeworkModal({
  isOpen,
  onClose,
  defaultMatiereName = '',
  defaultClassName = '',
  onApplyHomework,
  onCreated,
}: AiHomeworkModalProps) {
  const [topic, setTopic] = useState('');
  const [matiereName, setMatiereName] = useState(defaultMatiereName);
  const [className, setClassName] = useState(defaultClassName);
  const [instructions, setInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedHomework, setGeneratedHomework] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showToast('Veuillez renseigner le thème du devoir', 'error');
      return;
    }

    setIsLoading(true);
    setGeneratedHomework(null);

    try {
      const res = await api.post('/ai/generate/homework', {
        topic,
        matiereName: matiereName || undefined,
        className: className || undefined,
        instructions: instructions || undefined,
      });

      const hw = res.data?.homework;
      if (hw) {
        setGeneratedHomework(hw);
        showToast('Devoir généré avec succès par l’IA !', 'success');
      }
    } catch (err: any) {
      showApiErrorToast(err, 'Erreur lors de la génération du devoir');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedHomework || !onApplyHomework) return;

    let fullDescription = '';
    if (generatedHomework.instructions) {
      fullDescription += `Instructions : ${generatedHomework.instructions}\n\n`;
    }
    if (Array.isArray(generatedHomework.exercises)) {
      fullDescription += 'EXERCICES :\n';
      generatedHomework.exercises.forEach((ex: any) => {
        fullDescription += `\n[Exercice ${ex.number || ''}] ${ex.title || ''}\n${ex.content || ''}\nLivrable : ${ex.expectedDeliverable || 'Travail écrit'}\n`;
      });
    }
    if (Array.isArray(generatedHomework.rubricCriteria)) {
      fullDescription += '\nBARÈME ET CRITÈRES :\n';
      generatedHomework.rubricCriteria.forEach((c: string) => {
        fullDescription += `- ${c}\n`;
      });
    }

    onApplyHomework({
      title: generatedHomework.title || topic,
      description: fullDescription.trim(),
    });
    onClose();
  };

  const handleCopy = () => {
    if (!generatedHomework) return;
    navigator.clipboard.writeText(JSON.stringify(generatedHomework, null, 2));
    setCopied(true);
    showToast('Devoir copié dans le presse-papiers', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Générateur de Devoir & Rubrique IA"
      size="3xl"
    >
      <div className="space-y-5">
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            Créez en quelques secondes un devoir à la maison structuré avec énoncés, consignes d’auto-évaluation et grille de notation pédagogique.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Thème ou Compétence ciblée *
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Théorème de Pythagore, Analyse de texte sur Baudelaire, Chimie organique..."
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
              placeholder="Ex: Mathématiques"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Classe / Niveau
            </label>
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ex: 3ème Année Collège"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-text-primary mb-1">
              Consignes spécifiques supplémentaires (optionnel)
            </label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="Ex: Inclure un exercice de recherche et un problème appliqué à la vie réelle..."
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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
                  Génération du devoir...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer le devoir
                </>
              )}
            </Button>
          </div>
        </form>

        {generatedHomework && (
          <div className="mt-5 pt-4 border-t border-border space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                {generatedHomework.title || 'Devoir Proposé'}
              </h4>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copié' : 'Copier'}
                </Button>
                {onApplyHomework && (
                  <Button size="sm" onClick={handleApply} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Insérer dans le formulaire
                  </Button>
                )}
              </div>
            </div>

            {generatedHomework.instructions && (
              <p className="text-xs italic text-text-secondary bg-surface p-2.5 rounded-lg border border-border">
                {generatedHomework.instructions}
              </p>
            )}

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {Array.isArray(generatedHomework.exercises) &&
                generatedHomework.exercises.map((ex: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1.5">
                    <div className="font-bold text-text-primary">
                      Exercice {ex.number || idx + 1} : {ex.title}
                    </div>
                    <div className="text-text-secondary whitespace-pre-wrap">{ex.content}</div>
                    {ex.expectedDeliverable && (
                      <div className="text-[11px] text-amber-600 font-medium pt-1">
                        Livrable : {ex.expectedDeliverable}
                      </div>
                    )}
                  </div>
                ))}

              {Array.isArray(generatedHomework.rubricCriteria) && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs">
                  <div className="font-bold text-text-primary mb-1">Critères d’évaluation :</div>
                  <ul className="list-disc list-inside space-y-0.5 text-text-secondary">
                    {generatedHomework.rubricCriteria.map((c: string, idx: number) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
