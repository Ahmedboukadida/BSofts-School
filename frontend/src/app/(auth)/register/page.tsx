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

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register } = useAuthStore();
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.get('/landing/plans');
        const data = res.data;
        const active = (Array.isArray(data) ? data : data.data || []).filter((p: { isActive?: boolean }) => p.isActive !== false);
        if (Array.isArray(active) && active.length > 0) {
          setPlans(active);
        } else {
          setStep(2);
        }
      } catch {
        setStep(2);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanContinue = () => {
    if (plans.length > 0 && !selectedPlanId) { setError(t('auth.register.selectPlanError')); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError(t('common.passwordsDoNotMatch')); return; }
    setIsLoading(true);
    try {
      await register({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, password: formData.password, ...(selectedPlanId ? { planId: selectedPlanId } : {}) });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('auth.register.error'));
    } finally { setIsLoading(false); }
  };

  const getIntervalLabel = (interval: string) => {
    switch (interval?.toLowerCase()) {
      case 'monthly': case 'month': return '/mo';
      case 'yearly': case 'year': return '/yr';
      default: return '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <Link href="/" className="inline-flex items-center gap-3 mb-8 group">
          <div className="w-11 h-11 rounded-2xl bg-[#CCA43B] flex items-center justify-center border border-[#242F40] shadow-sm transition-all duration-300">
            <School className="w-5.5 h-5.5 text-white" />
          </div>
          <div className="text-left">
            <span className="font-bold text-lg text-text-primary block tracking-tight">BSofts</span>
            <span className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-medium">School</span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('auth.register.title')}</h1>
        <p className="text-sm text-text-secondary mt-2">{t('auth.register.subtitle')}</p>
      </div>

      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 1 ? 'bg-[#242F40] text-[#CCA43B] border border-[#363636] shadow-sm' : 'glass text-text-tertiary'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <span className="text-sm font-semibold text-text-primary">{t('auth.register.step1')}</span>
        </div>
        <div className="w-10 h-px bg-border" />
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= 2 ? 'bg-[#242F40] text-[#CCA43B] border border-[#363636] shadow-sm' : 'glass text-text-tertiary'}`}>
            2
          </div>
          <span className="text-sm font-semibold text-text-primary">{t('auth.register.step2')}</span>
        </div>
      </div>

      {error && <div className="p-4 bg-coral/5 border border-coral/10 text-coral text-sm rounded-2xl mb-6 animate-slide-down">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id}
                className={`cursor-pointer rounded-2xl p-6 text-center transition-all duration-300 ${selectedPlanId === plan.id ? 'glass shadow-premium-lg ring-2 ring-brand/30 scale-[1.02]' : 'glass hover:shadow-premium hover:scale-[1.01]'}`}
                onClick={() => setSelectedPlanId(plan.id)}>
                {selectedPlanId === plan.id && (
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#242F40] text-[#CCA43B] mb-3 animate-scale-in border border-[#363636]">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                <h3 className="text-base font-bold text-text-primary">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-text-primary font-feature-tabular">{plan.price}</span>
                  <span className="text-sm text-text-tertiary ml-1">{plan.currency}{getIntervalLabel(plan.interval)}</span>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" className="w-full h-13 rounded-2xl text-base font-semibold shadow-lg shadow-brand/20" onClick={handlePlanContinue} isLoading={plansLoading}>
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
            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="h-13 px-6 rounded-2xl glass">
              <ArrowLeft className="mr-2 w-4 h-4" />{t('common.back')}
            </Button>
            <Button type="submit" className="flex-1 h-13 rounded-2xl text-base font-semibold shadow-lg shadow-brand/20" isLoading={isLoading}>
              {t('auth.register.submit')}<ArrowRight className="ml-2 w-4.5 h-4.5" />
            </Button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-text-secondary">
        {t('auth.register.hasAccount')}{' '}
        <Link href="/login" className="text-brand hover:text-brand-hover font-semibold transition-colors duration-200">{t('auth.register.signIn')}</Link>
      </p>
    </div>
  );
}
