'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { School, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

export default function LoginPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      // Determine primary user role and redirect to dedicated view (Item 08)
      const currentUser = useAuthStore.getState().user;
      const roleNames = currentUser?.userRoles?.map((r) => r.role.name.toUpperCase()) || [];

      if (!currentUser?.isRoot) {
        if (roleNames.includes('STUDENT')) {
          router.push('/portal/student');
          return;
        }
        if (roleNames.includes('TEACHER')) {
          router.push('/portal/teacher');
          return;
        }
        if (roleNames.includes('PARENT')) {
          router.push('/portal/parent');
          return;
        }
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('auth.login.error');
      setError(message);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">{t('auth.login.title')}</h1>
        <p className="text-sm text-text-secondary mt-2">{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 bg-coral/5 border border-coral/10 text-coral text-sm rounded-2xl animate-slide-down flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">!</span>
            </div>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary">{t('auth.login.email')}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
            <input
              type="email"
              placeholder="admin@bsofts.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-primary">{t('auth.login.password')}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-tertiary" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-13 pl-11 pr-4 glass rounded-2xl text-sm text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:bg-white/90 shadow-sm"
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-13 rounded-2xl text-base font-semibold shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-all duration-300" isLoading={isLoading}>
          {t('auth.login.submit')}<ArrowRight className="ml-2 w-4.5 h-4.5" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.login.noAccount')}{' '}
        <Link href="/register" className="text-brand hover:text-brand-hover font-semibold transition-colors duration-200">{t('auth.login.createOne')}</Link>
      </p>
    </div>
  );
}
