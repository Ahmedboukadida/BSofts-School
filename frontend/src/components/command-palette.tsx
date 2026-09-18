'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Layers,
  ArrowRight,
  PlusCircle,
  Globe,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Portails' | 'Recherche Rapide';
  icon: typeof LayoutDashboard;
  href?: string;
  action?: () => void;
  badge?: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; type: string; href: string }[]>([]);
  const router = useRouter();
  const { setLocale } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Dynamic search for students / teachers when query is > 2 chars
  useEffect(() => {
    if (query.trim().length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const [stuRes, teaRes] = await Promise.all([
            api.get(`/students?search=${encodeURIComponent(query)}&limit=3`).catch(() => ({ data: { data: [] } })),
            api.get(`/teachers?search=${encodeURIComponent(query)}&limit=3`).catch(() => ({ data: { data: [] } })),
          ]);
          const stuList = (stuRes.data.data || []).map((s: { id: string; firstName?: string; lastName?: string; registrationNumber?: string }) => ({
            id: s.id,
            name: `${s.firstName || ''} ${s.lastName || ''} (Élève - ${s.registrationNumber || ''})`.trim(),
            type: 'Élève',
            href: `/students`,
          }));
          const teaList = (teaRes.data.data || []).map((t: { id: string; firstName?: string; lastName?: string; specialization?: string }) => ({
            id: t.id,
            name: `${t.firstName || ''} ${t.lastName || ''} (Enseignant - ${t.specialization || ''})`.trim(),
            type: 'Enseignant',
            href: `/teachers`,
          }));
          setSearchResults([...stuList, ...teaList]);
        } catch {
          setSearchResults([]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const defaultItems: CommandItem[] = [
    // Navigation
    { id: 'nav-dashboard', title: 'Tableau de bord', category: 'Navigation', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'nav-students', title: 'Gestion des Élèves', category: 'Navigation', icon: GraduationCap, href: '/students' },
    { id: 'nav-teachers', title: 'Corps Enseignant', category: 'Navigation', icon: Users, href: '/teachers' },
    { id: 'nav-classes', title: 'Classes & Niveaux', category: 'Navigation', icon: BookOpen, href: '/classes' },
    { id: 'nav-schedule', title: 'Emploi du temps', category: 'Navigation', icon: Calendar, href: '/schedule' },
    { id: 'nav-exams', title: 'Examens & Bulletins', category: 'Navigation', icon: FileText, href: '/exams' },
    { id: 'nav-payments', title: 'Comptabilité & Paiements TND', category: 'Navigation', icon: CreditCard, href: '/payments' },
    { id: 'nav-academic-modules', title: 'Modules & Coefficients Académiques', category: 'Navigation', icon: Layers, href: '/academic-modules', badge: 'Nouveau' },
    { id: 'nav-reports', title: 'Statistiques & Rapports KPI', category: 'Navigation', icon: BarChart3, href: '/reports' },
    { id: 'nav-audit', title: 'Journal d’Audit & Sécurité', category: 'Navigation', icon: Shield, href: '/admin/audit-logs', badge: 'Admin' },
    
    // Portals
    { id: 'portal-student', title: 'Espace Élève (Portail Apprenant)', category: 'Portails', icon: GraduationCap, href: '/portal/student', badge: 'Portail' },
    { id: 'portal-parent', title: 'Espace Parents (Portail Famille)', category: 'Portails', icon: Users, href: '/portal/parent', badge: 'Portail' },

    // Quick Actions
    {
      id: 'act-new-student',
      title: 'Inscrire un nouvel élève',
      category: 'Actions',
      icon: PlusCircle,
      href: '/students',
      badge: 'Action',
    },
    {
      id: 'act-new-payment',
      title: 'Encaisser un versement de scolarité',
      category: 'Actions',
      icon: CreditCard,
      href: '/payments',
      badge: 'Action',
    },
    {
      id: 'act-fr',
      title: 'Passer la langue en Français',
      category: 'Actions',
      icon: Globe,
      action: () => setLocale('fr'),
    },
    {
      id: 'act-ar',
      title: 'Passer la langue en Arabe (العربية)',
      category: 'Actions',
      icon: Globe,
      action: () => setLocale('ar'),
    },
    {
      id: 'act-en',
      title: 'Passer la langue en Anglais (English)',
      category: 'Actions',
      icon: Globe,
      action: () => setLocale('en'),
    },
  ];

  // Merge search results into items
  const dynamicItems: CommandItem[] = searchResults.map((res) => ({
    id: `res-${res.id}`,
    title: res.name,
    category: 'Recherche Rapide',
    icon: res.type === 'Élève' ? GraduationCap : Users,
    href: res.href,
    badge: res.type,
  }));

  const allItems = [...dynamicItems, ...defaultItems];

  const filteredItems = allItems.filter((item) => {
    if (!query) return true;
    return item.title.toLowerCase().includes(query.toLowerCase()) ||
           item.category.toLowerCase().includes(query.toLowerCase());
  });

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary bg-surface-hover/80 hover:bg-surface-hover border border-border/80 rounded-xl transition-all hover:border-primary/40 group"
      >
        <Search className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
        <span className="font-medium">Rechercher...</span>
        <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-text-secondary bg-surface border border-border rounded shadow-xs ml-1">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl bg-surface border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Input Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border gap-3 bg-surface">
          <Search className="w-5 h-5 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Tapez une commande ou cherchez (ex: élève, note, module, TND)..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-surface-hover rounded text-text-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-semibold text-text-secondary bg-surface-hover rounded border border-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-secondary">
              <Sparkles className="w-8 h-8 text-text-secondary/40 mx-auto mb-2" />
              <p className="font-medium">Aucun résultat trouvé pour &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Essayez un autre terme ou explorez les rubriques principales.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const ItemIcon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-md shadow-primary/20 font-medium'
                      : 'hover:bg-surface-hover text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-surface-hover text-primary'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm">{item.title}</p>
                      <p className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/25 text-white'
                            : 'bg-primary/10 text-primary border border-primary/20'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'translate-x-0.5 text-white' : 'text-text-secondary opacity-40'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-surface-hover/50 border-t border-border flex items-center justify-between text-[11px] text-text-secondary">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono font-semibold px-1.5 py-0.5 bg-surface rounded border border-border">↑</kbd>{' '}
              <kbd className="font-mono font-semibold px-1.5 py-0.5 bg-surface rounded border border-border">↓</kbd> pour naviguer
            </span>
            <span>
              <kbd className="font-mono font-semibold px-1.5 py-0.5 bg-surface rounded border border-border">↵</kbd> pour sélectionner
            </span>
          </div>
          <span className="font-semibold text-primary">BSofts School 2026</span>
        </div>
      </div>
    </div>
  );
}
