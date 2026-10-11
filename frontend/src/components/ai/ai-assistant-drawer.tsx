'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  Maximize2,
  Minimize2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTenantAi } from '@/hooks/use-tenant-ai';
import { api } from '@/lib/api';
import { showToast } from '@/components/ui/toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

export function AiAssistantDrawer() {
  const { hasAiFeature, provider, model } = useTenantAi();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "👋 Bonjour ! Je suis l'assistant pédagogique et administratif IA de votre établissement scolaire. Comment puis-je vous aider aujourd'hui ?",
      time: 'Maintenant',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // If the tenant does NOT have the AI feature enabled, render NOTHING
  if (!hasAiFeature) {
    return null;
  }

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post('/ai/chat', {
        message: text,
        history,
      });

      const reply = res.data?.reply || "Je n'ai pas pu générer de réponse.";
      const assistantMsg: Message = {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        "Une erreur est survenue lors de la communication avec l'assistant IA.";
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errMsg}`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Conversation réinitialisée. En quoi puis-je vous aider ?",
        time: 'Maintenant',
      },
    ]);
    showToast('Historique de discussion réinitialisé', 'info');
  };

  const quickPrompts = [
    'Quels sont les examens programmés pour ma classe ?',
    'Donne-moi des idées pour améliorer l’assiduité des élèves',
    'Structure un plan de cours type pour le secondaire',
  ];

  return (
    <>
      {/* Floating Sparkle Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-xs shadow-xl shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        title="Ouvrir l'Assistant Scolaire IA"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        <span>Assistant IA</span>
      </button>

      {/* Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className={`relative z-10 w-full ${
              isExpanded ? 'max-w-2xl' : 'max-w-md'
            } h-full bg-surface border-l border-border shadow-2xl flex flex-col transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-surface flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                    Assistant Scolaire IA
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      En ligne
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-tertiary">
                    {provider} ({model}) • Données isolées
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="p-1.5 h-8 w-8 text-text-tertiary hover:text-text-primary"
                  title="Effacer la discussion"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 h-8 w-8 text-text-tertiary hover:text-text-primary hidden sm:flex"
                  title={isExpanded ? 'Réduire' : 'Agrandir'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 h-8 w-8 text-text-tertiary hover:text-text-primary"
                  title="Fermer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 text-xs ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-muted/50 text-text-primary rounded-bl-xs border border-border'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.time && (
                      <div
                        className={`text-[9px] mt-1 ${
                          m.role === 'user' ? 'text-amber-100 text-right' : 'text-text-tertiary text-left'
                        }`}
                      >
                        {m.time}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-[#242F40] text-[#CCA43B] flex items-center justify-center shrink-0 border border-[#363636] mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 text-xs items-center text-text-tertiary">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/30 border border-border">
                    L’assistant réfléchit...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (if chat is short) */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2">
                <p className="text-[11px] font-semibold text-text-tertiary mb-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5" /> Suggestions rapides :
                </p>
                <div className="flex flex-col gap-1.5">
                  {quickPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      type="button"
                      className="text-left text-xs p-2 rounded-lg bg-surface hover:bg-muted/60 text-text-secondary hover:text-text-primary border border-border transition-colors cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Input */}
            <div className="p-3.5 border-t border-border bg-surface shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Posez votre question à l'assistant scolaire..."
                  className="flex-1 bg-background text-text-primary text-xs rounded-xl px-3.5 py-2.5 border border-border focus:outline-hidden focus:border-amber-500 transition-colors"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-3 rounded-xl shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-text-tertiary text-center mt-1.5">
                Les réponses sont strictement isolées à l’établissement du compte connecté.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
