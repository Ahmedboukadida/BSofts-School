'use client';

import { useTranslation } from '@/components/providers/i18n-provider';
import { Auth3DScene } from '@/components/ui/auth-3d-scene';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-[55%] items-center justify-center p-12 relative overflow-hidden bg-[#242F40]">
        <div className="absolute inset-0 bg-[#242F40]" />
        {/* Interactive Three.js 3D Armillary & Knowledge Sphere */}
        <Auth3DScene />
        <div className="absolute top-[15%] left-[10%] w-4 h-4 bg-[#CCA43B]/25 rounded-full animate-float pointer-events-none" />
        <div
          className="absolute top-[60%] right-[15%] w-3 h-3 bg-white/15 rounded-full animate-float pointer-events-none"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-[20%] left-[25%] w-2 h-2 bg-[#CCA43B]/30 rounded-full animate-float pointer-events-none"
          style={{ animationDelay: '2s' }}
        />
        <div className="relative z-10 max-w-md text-white pointer-events-auto">
          <div className="flex items-center gap-3.5 mb-10">
            <div className="w-12 h-12 bg-[#CCA43B] rounded-2xl flex items-center justify-center shadow-xl shadow-[#CCA43B]/20">
              <svg
                className="w-6.5 h-6.5 text-[#242F40]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">BSofts School</h1>
              <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-medium">
                {t('auth.layout.platform')}
              </p>
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight tracking-tight">
            {t('auth.layout.tagline')}
          </h2>
          <p className="text-lg text-white/50 leading-relaxed mb-10">
            {t('auth.layout.subtagline')}
          </p>
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-[#CCA43B] font-feature-tabular">500+</p>
                <p className="text-xs text-white/40 mt-1">{t('auth.layout.studentsCount')}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#CCA43B] font-feature-tabular">50+</p>
                <p className="text-xs text-white/40 mt-1">{t('auth.layout.teachersCount')}</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center">
                <p className="text-3xl font-bold text-[#CCA43B] font-feature-tabular">99%</p>
                <p className="text-xs text-white/40 mt-1">{t('auth.layout.uptime')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
