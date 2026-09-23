'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School, Check, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';
import type { Plan } from '@/types';

const DEFAULT_PLANS: (Plan & { description?: string; popular?: boolean })[] = [
  { id: 'free', name: 'Free', price: 0, currency: 'DT', interval: 'MONTHLY', description: 'Petites structures (jusqu\'à 50 élèves)' },
  { id: 'basic', name: 'Basique', price: 50, currency: 'DT', interval: 'MONTHLY', description: 'Recommandé pour écoles standards (jusqu\'à 200 élèves)', popular: true },
  { id: 'premium', name: 'Premium', price: 150, currency: 'DT', interval: 'MONTHLY', description: 'Gestion complète & visioconférence illimitée' },
  { id: 'enterprise', name: 'Entreprise', price: 500, currency: 'DT', interval: 'YEARLY', description: 'Multi-campus, API & support dédié 24/7' },
];

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuthStore();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<(Plan & { description?: string; popular?: boolean })[]>(DEFAULT_PLANS);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('basic');
  const [plansLoading, setPlansLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check URL search params for pre-selected plan
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const planParam = urlParams.get('plan')?.toLowerCase();
      if (planParam) {
        const found = DEFAULT_PLANS.find(p => p.name.toLowerCase().includes(planParam) || p.id.toLowerCase().includes(planParam));
        if (found) setSelectedPlanId(found.id);
      }
    }

    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await api.get('/landing/plans');
        const data = res.data;
        const active = (Array.isArray(data) ? data : data?.data || []).filter((p: { isActive?: boolean }) => p.isActive !== false);
        if (Array.isArray(active) && active.length > 0) {
          const mapped: (Plan & { description?: string; popular?: boolean })[] = active.map((p: any, i: number) => {
            const rawPrice = Number(p.price);
            const numPrice = isNaN(rawPrice) ? (DEFAULT_PLANS[i]?.price ?? 0) : rawPrice;
            const nameLower = (p.name || '').toLowerCase();
            const isPopular = nameLower.includes('basic') || nameLower.includes('basique') || i === 1;
            return {
              id: p.id,
              name: p.name || DEFAULT_PLANS[i]?.name || 'Plan',
              price: numPrice,
              currency: 'DT',
              interval: p.interval || DEFAULT_PLANS[i]?.interval || 'MONTHLY',
              description: p.description || DEFAULT_PLANS[i]?.description || '',
              popular: isPopular,
            };
          });
          setPlans(mapped);

          // Update preselection if matching
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const planParam = urlParams.get('plan')?.toLowerCase();
            if (planParam) {
              const matched = mapped.find(p => p.name.toLowerCase().includes(planParam) || p.id.toLowerCase().includes(planParam));
              if (matched) setSelectedPlanId(matched.id);
              else setSelectedPlanId(mapped[1]?.id || mapped[0]?.id);
            } else {
              setSelectedPlanId(mapped[1]?.id || mapped[0]?.id);
            }
          } else {
            setSelectedPlanId(mapped[1]?.id || mapped[0]?.id);
          }
        }
      } catch {
        // Keep resilient DEFAULT_PLANS
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanContinue = () => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[1]?.id || plans[0]?.id);
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError(t('common.passwordsDoNotMatch')); return; }
    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        ...(selectedPlanId ? { planId: selectedPlanId } : {}),
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.register.error'));
    } finally { setIsLoading(false); }
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval?.toLowerCase()) {
      case 'monthly': case 'month': return '/mois';
      case 'yearly': case 'year': return '/an';
      default: return '';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-11 h-11 rounded-2xl bg-[#CCA43B] flex items-center justify-center border border-[#242F40] shadow-sm transition-all duration-300">
            <School className="w-5.5 h-5.5 text-[#242F40]" />
          </div>
          <div className="text-left">
            <span className="font-bold text-lg text-text-primary block tracking-tight">BSofts</span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-medium">School</span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('auth.register.title')}</h1>
        <p className="text-sm text-text-secondary mt-1">{t('auth.register.subtitle')}</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-[#242F40] text-[#CCA43B] border border-[#363636] shadow-sm' : 'glass text-text-tertiary'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className="text-sm font-semibold text-text-primary">{t('auth.register.step1')}</span>
        </div>
        <div className="w-10 h-px bg-[#E5E5E5]" />
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-[#242F40] text-[#CCA43B] border border-[#363636] shadow-sm' : 'glass text-text-tertiary'}`}>
            2
          </div>
          <span className="text-sm font-semibold text-text-primary">{t('auth.register.step2')}</span>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-2xl mb-6 animate-slide-down font-medium">{error}</div>}

      {step === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`cursor-pointer rounded-2xl p-5 text-center transition-all duration-300 relative flex flex-col justify-between border ${
                    isSelected
                      ? 'bg-[#242F40] text-white border-[#CCA43B] shadow-xl scale-[1.02] ring-2 ring-[#CCA43B]/40'
                      : 'bg-white text-text-primary border-[#E5E5E5] hover:border-[#CCA43B]/50 hover:shadow-md hover:scale-[1.01]'
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#CCA43B] text-[#242F40] text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Populaire
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? 'bg-[#CCA43B] border-[#CCA43B] text-[#242F40]' : 'border-[#E5E5E5] text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className={`text-base font-bold mb-1 ${isSelected ? 'text-white' : 'text-text-primary'}`}>
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className={`text-[11px] leading-relaxed mb-3 ${isSelected ? 'text-white/70' : 'text-text-secondary'}`}>
                        {plan.description}
                      </p>
                    )}
                  </div>
                  <div className="pt-3 border-t border-dashed border-[#E5E5E5]/20">
                    <span className={`text-3xl font-bold font-feature-tabular ${isSelected ? 'text-[#CCA43B]' : 'text-text-primary'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-semibold ml-1 ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                      {plan.currency} {getIntervalLabel(plan.interval)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            className="w-full h-13 rounded-2xl text-base font-bold bg-[#CCA43B] text-[#242F40] hover:bg-[#b89332] shadow-lg shadow-[#CCA43B]/25 transition-all duration-300"
            onClick={handlePlanContinue}
            isLoading={plansLoading}
          >
            {t('auth.register.continue')}<ArrowRight className="ml-2 w-4.5 h-4.5" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">{t('auth.register.firstName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
                <input placeholder="John" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required
                  className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">{t('auth.register.lastName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
                <input placeholder="Doe" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required
                  className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">{t('auth.register.email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
              <input type="email" placeholder="john@school.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
                className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">{t('auth.register.password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
              <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required
                className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">{t('auth.register.confirmPassword')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
              <input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required
                className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="h-13 px-6 rounded-2xl border border-[#E5E5E5] bg-white text-[#242F40] hover:bg-[#E5E5E5]/40 font-semibold">
              <ArrowLeft className="mr-2 w-4 h-4" />{t('common.back')}
            </Button>
            <Button type="submit" className="flex-1 h-13 rounded-2xl text-base font-bold bg-[#242F40] text-white hover:bg-[#1a222e] border border-[#363636] shadow-lg shadow-[#242F40]/20" isLoading={isLoading}>
              {t('auth.register.submit')}<ArrowRight className="ml-2 w-4.5 h-4.5 text-[#CCA43B]" />
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-[#363636]">
        {t('auth.register.hasAccount')}{' '}
        <Link href="/login" className="text-[#242F40] hover:text-[#CCA43B] font-bold transition-colors duration-200">{t('auth.register.signIn')}</Link>
      </p>
    </div>
  );
}
