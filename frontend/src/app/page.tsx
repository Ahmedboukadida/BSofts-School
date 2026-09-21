'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  School, Check, ArrowRight, GraduationCap, Users, BookOpen, BarChart3,
  Star, Menu, X, UserPlus, Settings, Rocket, ChevronDown,
  Zap, Clock, Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/providers/i18n-provider';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { LanguageSelector } from '@/components/language-selector';
import { Hero3DScene } from '@/components/ui/hero-3d-scene';
import api from '@/lib/api';

const features = [
  {
    icon: GraduationCap,
    titleKey: 'landing.features.studentManagement',
    descKey: 'landing.features.studentDesc',
    image: '/images/students-learning.jpg',
    tag: 'Academic Track',
  },
  {
    icon: Users,
    titleKey: 'landing.features.teacherPortal',
    descKey: 'landing.features.teacherDesc',
    image: '/images/teacher-classroom.jpg',
    tag: 'Faculty & Pedagogy',
  },
  {
    icon: BookOpen,
    titleKey: 'landing.features.classManagement',
    descKey: 'landing.features.classDesc',
    image: '/images/campus-architecture.jpg',
    tag: 'Campus & Classes',
  },
  {
    icon: BarChart3,
    titleKey: 'landing.features.reports',
    descKey: 'landing.features.reportDesc',
    image: '/images/digital-analytics.jpg',
    tag: 'Analytics & Multi-Caisse',
  },
];

const fallbackPlans = [
  { nameKey: 'landing.pricing.free', price: '0', intervalKey: 'landing.pricing.monthly', featureKeys: ['landing.pricing.feature1', 'landing.pricing.feature2', 'landing.pricing.feature3', 'landing.pricing.feature4'], popular: false },
  { nameKey: 'landing.pricing.basic', price: '4,900', intervalKey: 'landing.pricing.monthly', featureKeys: ['landing.pricing.feature5', 'landing.pricing.feature6', 'landing.pricing.feature7', 'landing.pricing.feature8', 'landing.pricing.feature9'], popular: true },
  { nameKey: 'landing.pricing.premium', price: '19,900', intervalKey: 'landing.pricing.monthly', featureKeys: ['landing.pricing.feature10', 'landing.pricing.feature11', 'landing.pricing.feature12', 'landing.pricing.feature13', 'landing.pricing.feature14', 'landing.pricing.feature15'], popular: false },
];

const testimonials = [
  { name: 'Ahmed B.', roleKey: 'landing.testimonials.items.0.role', textKey: 'landing.testimonials.items.0.text' },
  { name: 'Fatima K.', roleKey: 'landing.testimonials.items.1.role', textKey: 'landing.testimonials.items.1.text' },
  { name: 'Youssef M.', roleKey: 'landing.testimonials.items.2.role', textKey: 'landing.testimonials.items.2.text' },
];

const howItWorks = [
  { icon: UserPlus, titleKey: 'landing.howItWorks.step1', descKey: 'landing.howItWorks.step1Desc' },
  { icon: Settings, titleKey: 'landing.howItWorks.step2', descKey: 'landing.howItWorks.step2Desc' },
  { icon: Rocket, titleKey: 'landing.howItWorks.step3', descKey: 'landing.howItWorks.step3Desc' },
];

const faqs = [
  { qKey: 'landing.faq.q1', aKey: 'landing.faq.a1' },
  { qKey: 'landing.faq.q2', aKey: 'landing.faq.a2' },
  { qKey: 'landing.faq.q3', aKey: 'landing.faq.a3' },
  { qKey: 'landing.faq.q4', aKey: 'landing.faq.a4' },
  { qKey: 'landing.faq.q5', aKey: 'landing.faq.a5' },
];

const fallbackStats = { students: 500, teachers: 50, exams: 1000, uptime: 99 };


function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const duration = 2000; const steps = 60; const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => { current += increment; if (current >= target) { setCount(target); clearInterval(timer); } else { setCount(Math.floor(current)); } }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref} className="tabular-nums">{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState(fallbackPlans);
  const [stats, setStats] = useState(fallbackStats);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await api.get('/landing/plans');
      const data = res.data;
      const activePlans = (Array.isArray(data) ? data : data.data || []).filter((p: { isActive?: boolean }) => p.isActive);
      if (activePlans.length > 0) setPlans(activePlans.map((p: { name?: string; price?: number; interval?: string }, i: number) => ({
        nameKey: p.name || fallbackPlans[i]?.nameKey || '', price: String(p.price ?? fallbackPlans[i]?.price ?? '0'),
        intervalKey: p.interval || fallbackPlans[i]?.intervalKey || 'landing.pricing.monthly',
        featureKeys: fallbackPlans[i]?.featureKeys || [], popular: i === 1,
      })));
    } catch { /* keep fallback */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/landing/stats');
      const data = res.data;
      if (data && typeof data === 'object') setStats({ students: data.students ?? fallbackStats.students, teachers: data.teachers ?? fallbackStats.teachers, exams: data.exams ?? fallbackStats.exams, uptime: data.uptime ?? fallbackStats.uptime });
    } catch { /* keep fallback */ }
  }, []);

  useEffect(() => { fetchPlans(); fetchStats(); }, [fetchPlans, fetchStats]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('opacity-100', 'translate-y-0'); entry.target.classList.remove('opacity-0', 'translate-y-12'); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);


  return (
    <div className="min-h-screen bg-background" style={{ scrollBehavior: 'smooth' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500" style={{ background: scrollY > 20 ? 'rgba(255,255,255,0.92)' : 'transparent', backdropFilter: scrollY > 20 ? 'blur(20px) saturate(180%)' : 'none', borderBottom: scrollY > 20 ? '1px solid rgba(229,229,229,0.8)' : '1px solid transparent' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#CCA43B] flex items-center justify-center shadow-lg shadow-[#CCA43B]/20 group-hover:shadow-[#CCA43B]/40 transition-all duration-300 group-hover:scale-105">
                <School className="w-5 h-5 text-[#242F40]" />
              </div>
              <div>
                <span className="font-bold text-sm text-text-primary block tracking-tight">BSofts</span>
                <span className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-medium">School</span>
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <a href="#features" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl transition-all duration-300 hover:bg-white/50">{t('nav.features')}</a>
              <a href="#pricing" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl transition-all duration-300 hover:bg-white/50">{t('nav.pricing')}</a>
              <LanguageSelector variant="glass" />
              <div className="w-px h-6 bg-border mx-1" />
              <Link href="/login"><Button variant="ghost" size="sm" className="rounded-xl">{t('auth.login.submit')}</Button></Link>
              <Link href="/register"><Button size="sm" variant="coral" className="rounded-xl shadow-lg shadow-coral/20 hover:shadow-coral/40 transition-all duration-300">{t('landing.hero.cta')}</Button></Link>
            </div>
            <div className="flex md:hidden items-center gap-2">
              <LanguageSelector variant="glass" />
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 rounded-xl text-text-secondary hover:bg-white/60 transition-all duration-300">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-border/30">
            <div className="px-4 py-4 space-y-1">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/60 transition-all duration-200">{t('nav.features')}</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-white/60 transition-all duration-200">{t('nav.pricing')}</a>
              <div className="h-px bg-border my-2" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}><Button variant="ghost" className="w-full justify-start rounded-xl">{t('auth.login.submit')}</Button></Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}><Button className="w-full rounded-xl" variant="coral">{t('landing.hero.cta')}</Button></Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-18">
        <div className="absolute inset-0 gradient-mesh" />
        <Hero3DScene />
        <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] bg-brand/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-coral/[0.04] rounded-full blur-[120px]" />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-[20%] right-[15%] w-3 h-3 bg-coral/40 rounded-full animate-float" />
        <div className="absolute top-[35%] left-[20%] w-2 h-2 bg-brand/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-[25%] right-[25%] w-4 h-4 bg-coral/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="py-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-8 animate-hero-text">
                <Star className="w-4 h-4 text-brand" />
                <span className="text-sm font-semibold text-text-primary">{t('landing.hero.badge')}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary leading-[1.08] tracking-tight">
                <span className="block animate-hero-text">{t('landing.hero.title')}</span>
                <span className="block gradient-text animate-hero-text animate-hero-text-delay-1">{t('landing.hero.highlight')}</span>
              </h1>
              <p className="mt-8 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-lg animate-hero-text animate-hero-text-delay-2">
                {t('landing.hero.subtitle')}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4 animate-hero-text animate-hero-text-delay-3">
                <Link href="/register">
                  <Button size="lg" variant="coral" className="min-w-[220px] h-14 text-base font-semibold rounded-2xl shadow-xl shadow-coral/25 hover:shadow-coral/40 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]">
                    {t('landing.hero.cta')}<ArrowRight className="ml-2.5 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="min-w-[180px] h-14 text-base font-semibold rounded-2xl glass hover:bg-white/80 transition-all duration-300">
                    {t('auth.login.submit')}
                  </Button>
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-6 animate-hero-text animate-hero-text-delay-3">
                <div className="flex -space-x-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold shadow-sm"
                      style={{ background: ['#242F40', '#CCA43B', '#363636', '#242F40', '#CCA43B'][i], color: '#FFFFFF' }}>
                      {['A', 'F', 'Y', 'M', 'S'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-text-secondary">
                  <span className="font-semibold text-text-primary">500+</span> schools trust us
                </div>
              </div>
            </div>

            {/* Hero Visual - 3D Isometric LMS Platform Asset */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="relative w-full max-w-lg" style={{ transform: `translateY(${scrollY * -0.05}px)` }}>
                {/* Main 3D Showcase Card */}
                <div className="relative rounded-3xl overflow-hidden border border-[#E5E5E5] bg-white shadow-premium-xl group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#242F40]">
                    <Image
                      src="/images/lms-hero-3d.jpg"
                      alt="BSofts School 3D LMS Platform"
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 512px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Top Header Pill */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#242F40]/85 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#CCA43B] animate-pulse" />
                        <span>Interactive 3D Campus</span>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#CCA43B] text-[#242F40] text-xs font-bold shadow-md">
                        SaaS v2.4
                      </div>
                    </div>

                    {/* Bottom Status Ribbon */}
                    <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-[#242F40]/90 backdrop-blur-md border border-white/10 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-[#CCA43B] font-semibold uppercase tracking-wider">Cloud Education System</p>
                          <p className="text-sm font-bold text-white">Tunisian Curriculum & Multi-Caisse</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/90 bg-white/10 px-2.5 py-1 rounded-lg">
                          <Check className="w-3.5 h-3.5 text-[#CCA43B]" />
                          <span>Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 1 - Top Right */}
                <div className="absolute -top-3 -right-3 bg-white border border-[#E5E5E5] rounded-2xl p-3 shadow-premium-lg animate-bounce-in" style={{ animationDelay: '0.6s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#CCA43B]/15 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#CCA43B]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#242F40]">500+ Students</p>
                      <p className="text-[10px] text-[#363636]">Active Enrollment</p>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 2 - Bottom Left */}
                <div className="absolute -bottom-3 -left-3 bg-white border border-[#E5E5E5] rounded-2xl p-3 shadow-premium-lg animate-bounce-in" style={{ animationDelay: '0.8s' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-[#242F40] rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#CCA43B]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#242F40]">99.9% Uptime</p>
                      <p className="text-[10px] text-[#363636]">High Availability</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="glass rounded-3xl p-10 shadow-premium-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[{ value: stats.students, suffix: '+', labelKey: 'landing.stats.students', icon: GraduationCap },
                { value: stats.teachers, suffix: '+', labelKey: 'landing.stats.teachers', icon: Users },
                { value: stats.exams, suffix: '+', labelKey: 'landing.stats.exams', icon: BookOpen },
                { value: stats.uptime, suffix: '%', labelKey: 'landing.stats.uptime', icon: BarChart3 },
              ].map((stat, i) => (
                <div key={stat.labelKey} className="text-center group reveal opacity-0 translate-y-12 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand group-hover:shadow-glow-brand transition-all duration-500">
                    <stat.icon className="w-6 h-6 text-brand group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="text-4xl sm:text-5xl font-bold text-text-primary font-feature-tabular">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-2 text-sm font-medium text-text-secondary">{t(stat.labelKey)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-6">
              <Zap className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-text-primary">{t('nav.features')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">{t('landing.features.title')}</h2>
            <p className="mt-6 text-xl text-text-secondary leading-relaxed">{t('landing.features.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <div key={feature.titleKey} className="group reveal opacity-0 translate-y-12 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative bg-white rounded-3xl border border-[#E5E5E5] overflow-hidden shadow-premium hover:shadow-premium-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">
                  {/* Feature Image Header */}
                  <div className="relative h-52 w-full overflow-hidden bg-[#242F40]">
                    <Image
                      src={feature.image}
                      alt={t(feature.titleKey)}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Badge & Category */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#242F40]/80 backdrop-blur-md border border-white/15 text-[#CCA43B] text-xs font-semibold shadow-sm">
                        {feature.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#CCA43B] flex items-center justify-center shadow-lg shrink-0">
                        <feature.icon className="w-5 h-5 text-[#242F40]" />
                      </div>
                      <h3 className="text-xl font-bold text-white drop-shadow-sm">{t(feature.titleKey)}</h3>
                    </div>
                  </div>

                  {/* Feature Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-[#363636] leading-relaxed text-[15px]">{t(feature.descKey)}</p>
                    <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#242F40] font-semibold group-hover:text-[#CCA43B] transition-colors">
                      <span>{t('landing.hero.cta')}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#CCA43B]" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-6">
              <Rocket className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-text-primary">{t('landing.howItWorks.title')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">{t('landing.howItWorks.subtitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-px bg-[#E5E5E5]" />
            {howItWorks.map((step, i) => (
              <div key={step.titleKey} className="relative reveal opacity-0 translate-y-12 transition-all duration-700" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="text-center">
                  <div className="relative inline-flex mb-8">
                    <div className="w-20 h-20 bg-[#242F40] rounded-3xl flex items-center justify-center shadow-xl shadow-[#242F40]/20 border border-[#CCA43B]/20">
                      <step.icon className="w-9 h-9 text-[#CCA43B]" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#CCA43B] rounded-xl flex items-center justify-center shadow-lg shadow-[#CCA43B]/30">
                      <span className="text-sm font-bold text-[#242F40]">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">{t(step.titleKey)}</h3>
                  <p className="text-text-secondary leading-relaxed max-w-xs mx-auto">{t(step.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-6">
              <Clock className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-text-primary">{t('landing.pricing.title')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">{t('landing.pricing.subtitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {plans.map((plan, i) => (
              <div key={plan.nameKey} className={`relative reveal opacity-0 translate-y-12 transition-all duration-700 ${plan.popular ? 'md:-mt-4' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-[#CCA43B] text-[#242F40] text-xs font-bold px-5 py-1.5 rounded-full shadow-lg shadow-[#CCA43B]/30 uppercase tracking-wider">{t('landing.pricing.popular')}</span>
                  </div>
                )}
                <div className={`rounded-3xl p-8 transition-all duration-500 border ${plan.popular ? 'bg-[#242F40] text-white shadow-premium-xl scale-[1.02] border-[#CCA43B]/40' : 'bg-white border-[#E5E5E5] card-premium'}`}>
                  <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-text-primary'}`}>{t(plan.nameKey)}</h3>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className={`text-5xl font-bold font-feature-tabular ${plan.popular ? 'text-[#CCA43B]' : 'text-text-primary'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.popular ? 'text-white/60' : 'text-text-tertiary'}`}>{t(plan.intervalKey)}</span>
                  </div>
                  <ul className="mt-8 space-y-3.5">
                    {plan.featureKeys.map((fk) => (
                      <li key={fk} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-white/10' : 'bg-[#CCA43B]/15'}`}>
                          <Check className={`w-3 h-3 ${plan.popular ? 'text-[#CCA43B]' : 'text-[#242F40]'}`} />
                        </div>
                        <span className={`text-sm ${plan.popular ? 'text-white/80' : 'text-text-secondary'}`}>{t(fk)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button variant={plan.popular ? 'coral' : 'secondary'} className={`w-full h-12 rounded-xl font-semibold ${plan.popular ? 'bg-[#CCA43B] hover:bg-[#b89332] text-[#242F40] shadow-lg shadow-[#CCA43B]/25 font-bold' : 'glass hover:bg-white/80'}`}>
                      {t('landing.pricing.getStarted')}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-6">
              <Star className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-text-primary">{t('landing.testimonials.title')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">{t('landing.testimonials.subtitle')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={testimonial.name} className="reveal opacity-0 translate-y-12 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="bg-white rounded-3xl border border-[#E5E5E5] p-8 h-full flex flex-col shadow-premium hover:shadow-premium-lg transition-all duration-300">
                  <div className="flex items-center gap-1 mb-5">
                    {[...Array(5)].map((_, j) => (<Star key={j} className="w-4.5 h-4.5 text-[#CCA43B] fill-[#CCA43B]" />))}
                  </div>
                  <p className="text-[#363636] leading-relaxed mb-8 flex-1">&ldquo;{t(testimonial.textKey)}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-[#E5E5E5]">
                    <div className="w-11 h-11 rounded-full bg-[#242F40] flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-[#CCA43B]">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#242F40]">{testimonial.name}</p>
                      <p className="text-xs text-[#363636]/70">{t(testimonial.roleKey)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass-lavender rounded-full mb-6">
              <Headphones className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-text-primary">{t('landing.faq.title')}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">{t('landing.faq.subtitle')}</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={faq.qKey} className="reveal opacity-0 translate-y-12 transition-all duration-700" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`rounded-2xl overflow-hidden transition-all duration-300 border border-[#E5E5E5] ${openFaq === i ? 'glass shadow-premium-lg' : 'glass'}`}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between w-full px-7 py-5 text-left hover:bg-[#E5E5E5]/30 transition-colors duration-200">
                    <span className="font-semibold text-text-primary text-[15px] pr-4">{t(faq.qKey)}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-brand/10 rotate-180' : 'bg-surface-hover'}`}>
                      <ChevronDown className="w-4 h-4 text-text-tertiary" />
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-400 ${openFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-7 pb-6"><p className="text-[15px] text-text-secondary leading-relaxed">{t(faq.aKey)}</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[2rem] overflow-hidden reveal opacity-0 translate-y-12 transition-all duration-700">
            <div className="absolute inset-0 bg-[#242F40]" />
            <div className="absolute top-10 left-[15%] w-3 h-3 bg-[#CCA43B]/30 rounded-full animate-float" />
            <div className="absolute bottom-10 right-[20%] w-2 h-2 bg-white/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="relative px-8 py-20 sm:px-16 sm:py-24 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">{t('landing.cta.title')}</h2>
              <p className="text-white/70 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">{t('landing.cta.subtitle')}</p>
              <Link href="/register">
                <Button size="lg" variant="coral" className="min-w-[220px] h-14 text-base font-bold bg-[#CCA43B] hover:bg-[#b89332] text-[#242F40] rounded-2xl shadow-xl shadow-[#CCA43B]/30 hover:shadow-[#CCA43B]/50 transition-all duration-500">
                  {t('landing.cta.button')}<ArrowRight className="ml-2.5 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative bg-[#242F40] text-white pt-20 pb-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CCA43B] mb-5">{t('landing.footer.product')}</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.features')}</a></li>
                <li><a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.pricing')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CCA43B] mb-5">{t('landing.footer.support')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.helpCenter')}</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CCA43B] mb-5">{t('landing.footer.legal')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.privacyPolicy')}</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.termsOfService')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#CCA43B] mb-5">{t('landing.footer.company')}</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.aboutUs')}</a></li>
                <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors duration-300">{t('landing.footer.careers')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCA43B] flex items-center justify-center shadow-md"><School className="w-4.5 h-4.5 text-[#242F40]" /></div>
              <span className="font-bold text-sm">BSofts School</span>
            </div>
            <p className="text-sm text-white/40">&copy; {new Date().getFullYear()} BSofts. {t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
}
