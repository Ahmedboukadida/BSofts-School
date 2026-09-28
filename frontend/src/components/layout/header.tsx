'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Menu, Bell, LogOut, Settings, User, Shield, ChevronDown, School, LayoutGrid, PanelLeft } from 'lucide-react';
import { LanguageSelector } from '@/components/language-selector';
import { CommandPalette } from '@/components/command-palette';
import { useTranslation } from '@/components/providers/i18n-provider';
import { useAuthStore } from '@/store/auth-store';
import { useEstablishmentStore, EstablishmentOption, TenantOption, AcademicYearOption } from '@/store/establishment-store';
import api from '@/lib/api';

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const {
    currentEstablishmentId,
    currentTenantId,
    currentAcademicYearId,
    establishments,
    tenants,
    academicYears,
    menuOrientation,
    setCurrentEstablishmentId,
    setCurrentTenantId,
    setCurrentAcademicYearId,
    setEstablishments,
    setTenants,
    setAcademicYears,
    setMenuOrientation,
    initializeFromUser,
  } = useEstablishmentStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const [isSticky, setIsSticky] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications', { params: { isRead: false } }).catch(() => ({ data: { data: [] } }));
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Initialize establishment & load options
  useEffect(() => {
    if (user) {
      initializeFromUser(user);
    }
  }, [user, initializeFromUser]);

  const fetchContextOptions = useCallback(async () => {
    if (!user) return;
    try {
      if (user.isRoot) {
        const [tenantsRes, estsRes] = await Promise.all([
          api.get('/tenants?limit=100').catch(() => ({ data: { data: [] } })),
          api.get('/establishments?limit=100').catch(() => ({ data: { data: [] } })),
        ]);
        const rawTenants = tenantsRes.data?.data || tenantsRes.data || [];
        const tList: TenantOption[] = (Array.isArray(rawTenants) ? rawTenants : []).map((item: { id: string; user?: { firstName?: string; lastName?: string } }) => ({
          id: item.id,
          name: `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() || item.id,
        }));
        setTenants(tList);
        const rawEsts = estsRes.data?.data || estsRes.data || [];
        const eList: EstablishmentOption[] = (Array.isArray(rawEsts) ? rawEsts : []).map((e: { id: string; name: string; slug: string; category: string; tenantId: string }) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          category: e.category,
          tenantId: e.tenantId,
        }));
        setEstablishments(eList);

        // Auto-select or default logic for Root
        if (tList.length === 1) {
          setCurrentTenantId(tList[0].id);
          const tenantEsts = eList.filter((e) => e.tenantId === tList[0].id);
          if (tenantEsts.length === 1) {
            setCurrentEstablishmentId(tenantEsts[0].id);
          } else if (tenantEsts.length > 1) {
            const currentSelectedEst = useEstablishmentStore.getState().currentEstablishmentId;
            if (!currentSelectedEst || !tenantEsts.some((e) => e.id === currentSelectedEst)) {
              setCurrentEstablishmentId('ALL');
            }
          } else {
            setCurrentEstablishmentId(null);
          }
        } else if (tList.length > 1) {
          const currentSelectedTenant = useEstablishmentStore.getState().currentTenantId;
          if (!currentSelectedTenant || (currentSelectedTenant !== 'ALL' && !tList.some((t) => t.id === currentSelectedTenant))) {
            setCurrentTenantId('ALL');
            setCurrentEstablishmentId('ALL');
            setCurrentAcademicYearId('ALL');
          }
        }
      } else {
        const estsRes = await api.get('/establishments?limit=100').catch(() => ({ data: { data: [] } }));
        const rawEsts = estsRes.data?.data || estsRes.data || [];
        const eList: EstablishmentOption[] = (Array.isArray(rawEsts) ? rawEsts : []).map((e: { id: string; name: string; slug: string; category: string; tenantId: string }) => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          category: e.category,
          tenantId: e.tenantId,
        }));
        setEstablishments(eList);

        if (eList.length === 1) {
          setCurrentEstablishmentId(eList[0].id);
        } else if (eList.length > 1) {
          const currentSelectedEst = useEstablishmentStore.getState().currentEstablishmentId;
          if (!currentSelectedEst || (currentSelectedEst !== 'ALL' && !eList.some((e) => e.id === currentSelectedEst))) {
            setCurrentEstablishmentId('ALL');
          }
        }
      }
    } catch {
      // fallback
    }
  }, [user, setTenants, setEstablishments, setCurrentTenantId, setCurrentEstablishmentId, setCurrentAcademicYearId]);

  useEffect(() => {
    fetchContextOptions();
  }, [fetchContextOptions]);

  // Fetch Academic Years when establishment changes (supporting specific ID or 'ALL')
  const fetchAcademicYears = useCallback(async (estId: string | null) => {
    try {
      const activeEst = (estId && estId !== 'ALL' && estId !== 'all') ? estId : undefined;
      const res = await api.get('/academic-years', {
        params: {
          ...(activeEst ? { establishmentId: activeEst } : {}),
          limit: 100,
        },
      }).catch(() => ({ data: { data: [] } }));
      const rawYears = res.data?.data || res.data || [];
      const list: AcademicYearOption[] = (Array.isArray(rawYears) ? rawYears : []).map((y: any) => ({
        id: y.id,
        name: y.name,
        isCurrent: Boolean(y.isCurrent),
        establishmentId: y.establishmentId || '',
      }));

      // Deduplicate academic years by name if viewing multiple establishments
      const uniqueYears = list.filter((y, idx, self) =>
        idx === self.findIndex((item) => item.name === y.name)
      );

      if (uniqueYears.length === 0) {
        setAcademicYears([]);
        const currentSelected = useEstablishmentStore.getState().currentAcademicYearId;
        if (currentSelected && currentSelected !== 'ALL') {
          setCurrentAcademicYearId(null);
        }
      } else if (uniqueYears.length === 1) {
        setAcademicYears(uniqueYears);
        setCurrentAcademicYearId(uniqueYears[0].id);
      } else {
        setAcademicYears(uniqueYears);
        const currentSelected = useEstablishmentStore.getState().currentAcademicYearId;
        if (currentSelected && currentSelected !== 'ALL') {
          const exists = uniqueYears.some((y) => y.id === currentSelected);
          if (!exists) {
            const activeYear = uniqueYears.find((y) => y.isCurrent) || uniqueYears[0];
            if (activeYear) {
              setCurrentAcademicYearId(activeYear.id);
            }
          }
        }
      }
    } catch {
      // fallback
    }
  }, [setAcademicYears, setCurrentAcademicYearId]);

  useEffect(() => {
    fetchAcademicYears(currentEstablishmentId);
  }, [currentEstablishmentId, fetchAcademicYears]);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY >= 150);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await Promise.all(notifications.filter((n) => !n.isRead).map((n) => api.put(`/notifications/${n.id}/read`)));
      fetchNotifications();
    } catch { /* empty */ }
  };

  // Filter establishments based on selected tenant if root
  const visibleEstablishments = user?.isRoot && currentTenantId
    ? establishments.filter((e) => e.tenantId === currentTenantId)
    : establishments;

  return (
    <header
      className={clsx(
        'sticky top-0 z-30 bg-white transition-shadow duration-300 mb-4 rounded-b-[15px]',
        isSticky && 'shadow-[0px_7px_29px_0px_rgba(100,100,111,0.2)]'
      )}
      style={{ boxShadow: isSticky ? undefined : 'none' }}
    >
      <div className="flex items-center justify-between h-[68px] px-5 lg:px-6">
        {/* Left side: Mobile menu + Unified Search (CommandPalette) + Cascading Context Hierarchy */}
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-[#F6F7F9] transition-colors duration-200"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-[#64748B]" />
          </button>

          {/* Unified Global Command Palette Search (Item 04 & 05: Single search bar) */}
          <CommandPalette />

          {/* Cascading Context Selectors (Tenant -> Establishment -> Année Scolaire) */}
          <div className="flex items-center gap-2 flex-wrap">
            {user?.isRoot ? (
              <>
                {/* Step 1: Root Tenant Selector ('ALL' default only if multiple tenants; direct badge if single) */}
                {tenants.length > 1 ? (
                  <div className="relative animate-in fade-in duration-200">
                    <select
                      value={currentTenantId || 'ALL'}
                      onChange={(e) => {
                        const tId = e.target.value;
                        setCurrentTenantId(tId === 'ALL' ? 'ALL' : tId || null);
                        if (tId === 'ALL') {
                          setCurrentEstablishmentId('ALL');
                          setCurrentAcademicYearId('ALL');
                        } else {
                          const matching = establishments.filter((est) => est.tenantId === tId);
                          if (matching.length === 1) {
                            setCurrentEstablishmentId(matching[0].id);
                          } else if (matching.length > 1) {
                            setCurrentEstablishmentId('ALL');
                            setCurrentAcademicYearId('ALL');
                          } else {
                            setCurrentEstablishmentId(null);
                            setCurrentAcademicYearId(null);
                          }
                        }
                      }}
                      className="h-[38px] px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#242F40] shadow-sm focus:outline-none focus:border-[#CCA43B] cursor-pointer transition-all hover:border-[#CCA43B]/60"
                    >
                      <option value="ALL">🏢 Tous les Tenants (All)</option>
                      {tenants.map((t) => (
                        <option key={t.id} value={t.id}>
                          🏢 {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : tenants.length === 1 ? (
                  <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#242F40] shadow-sm">
                    <span>🏢 {tenants[0].name}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#64748B] shadow-sm">
                    <span>🏢 Aucun tenant</span>
                  </div>
                )}

                {/* Step 2: Establishment Selector under Selected Tenant (displayed ONLY when a specific tenant is active) */}
                {currentTenantId && currentTenantId !== 'ALL' && (
                  <>
                    {visibleEstablishments.length > 1 ? (
                      <div className="relative animate-in fade-in duration-200">
                        <select
                          value={currentEstablishmentId || 'ALL'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentEstablishmentId(val === 'ALL' ? 'ALL' : val || null);
                            if (val === 'ALL') {
                              setCurrentAcademicYearId('ALL');
                            }
                          }}
                          className="h-[38px] px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#242F40] shadow-sm focus:outline-none focus:border-[#CCA43B] cursor-pointer transition-all hover:border-[#CCA43B]/60"
                        >
                          <option value="ALL">🏫 Tous les Établissements (All)</option>
                          {visibleEstablishments.map((est) => (
                            <option key={est.id} value={est.id}>
                              🏫 {est.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : visibleEstablishments.length === 1 ? (
                      <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#242F40] shadow-sm">
                        <School className="w-3.5 h-3.5 text-[#CCA43B]" />
                        <span>{visibleEstablishments[0].name}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#64748B] shadow-sm">
                        <School className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>Aucun établissement</span>
                      </div>
                    )}

                    {/* Step 3: Academic Year Selector (displayed ONLY when a specific establishment is active) */}
                    {currentEstablishmentId && currentEstablishmentId !== 'ALL' && (
                      <>
                        {academicYears.length > 1 ? (
                          <div className="relative animate-in fade-in duration-200">
                            <select
                              value={currentAcademicYearId || 'ALL'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCurrentAcademicYearId(val === 'ALL' ? 'ALL' : val || null);
                              }}
                              className="h-[38px] px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#242F40] shadow-sm focus:outline-none focus:border-[#CCA43B] cursor-pointer transition-all hover:border-[#CCA43B]/60"
                            >
                              <option value="ALL">📅 Toutes les Années (All)</option>
                              {academicYears.map((year) => (
                                <option key={year.id} value={year.id}>
                                  📅 {year.name} {year.isCurrent ? '(Actuelle)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : academicYears.length === 1 ? (
                          <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#242F40] shadow-sm">
                            <span>📅 {academicYears[0].name}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#64748B] shadow-sm">
                            <span>📅 Aucune année</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Non-Root User: Only their establishment & academic year */
              <>
                {/* Non-Root Establishment Selector */}
                {establishments.length > 1 ? (
                  <div className="relative animate-in fade-in duration-200">
                    <select
                      value={currentEstablishmentId || 'ALL'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrentEstablishmentId(val === 'ALL' ? 'ALL' : val || null);
                        if (val === 'ALL') {
                          setCurrentAcademicYearId('ALL');
                        }
                      }}
                      className="h-[38px] px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#242F40] shadow-sm focus:outline-none focus:border-[#CCA43B] cursor-pointer transition-all hover:border-[#CCA43B]/60"
                    >
                      <option value="ALL">🏫 Tous les Établissements (All)</option>
                      {establishments.map((est) => (
                        <option key={est.id} value={est.id}>
                          🏫 {est.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : establishments.length === 1 ? (
                  <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#242F40] shadow-sm">
                    <School className="w-3.5 h-3.5 text-[#CCA43B]" />
                    <span>{establishments[0].name}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#64748B] shadow-sm">
                    <School className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>Aucun établissement</span>
                  </div>
                )}

                {/* Non-Root Academic Year Selector (displayed ONLY when a specific establishment is active) */}
                {currentEstablishmentId && currentEstablishmentId !== 'ALL' && (
                  <>
                    {academicYears.length > 1 ? (
                      <div className="relative animate-in fade-in duration-200">
                        <select
                          value={currentAcademicYearId || 'ALL'}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCurrentAcademicYearId(val === 'ALL' ? 'ALL' : val || null);
                          }}
                          className="h-[38px] px-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-semibold text-[#242F40] shadow-sm focus:outline-none focus:border-[#CCA43B] cursor-pointer transition-all hover:border-[#CCA43B]/60"
                        >
                          <option value="ALL">📅 Toutes les Années (All)</option>
                          {academicYears.map((year) => (
                            <option key={year.id} value={year.id}>
                              📅 {year.name} {year.isCurrent ? '(Actuelle)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : academicYears.length === 1 ? (
                      <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold text-[#242F40] shadow-sm">
                        <span>📅 {academicYears[0].name}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 h-[38px] px-3.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#64748B] shadow-sm">
                        <span>📅 Aucune année</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side: Menu Orientation toggle, Notifications, Language, Profile */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Menu Orientation Toggle (Vertical vs Horizontal Layout) */}
          <button
            onClick={() => setMenuOrientation(menuOrientation === 'vertical' ? 'horizontal' : 'vertical')}
            className="p-2 rounded-lg text-[#64748B] hover:bg-[#F6F7F9] hover:text-brand transition-colors duration-200 hidden md:flex items-center gap-1.5 text-xs font-medium border border-transparent hover:border-[#ECF0FF]"
            title={menuOrientation === 'vertical' ? 'Basculer en menu horizontal' : 'Basculer en menu vertical'}
            aria-label="Toggle menu orientation"
          >
            {menuOrientation === 'vertical' ? (
              <>
                <LayoutGrid className="w-[18px] h-[18px] text-brand" />
                <span className="hidden xl:inline text-[#3A4252] font-semibold">Mode Horizontal</span>
              </>
            ) : (
              <>
                <PanelLeft className="w-[18px] h-[18px] text-brand" />
                <span className="hidden xl:inline text-[#3A4252] font-semibold">Mode Vertical</span>
              </>
            )}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#F6F7F9] transition-colors duration-200"
            >
              <Bell className="w-[22px] h-[22px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-[7px] h-[7px] bg-coral rounded-full" />
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-[7px] shadow-[0px_4px_45px_0px_rgba(0,0,0,0.1)] z-50 animate-scale-in">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#ECF0FF]">
                  <h3 className="text-[14px] font-semibold text-[#3A4252]">
                    {t('header.notifications')} ({notifications.filter((n) => !n.isRead).length})
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[12px] font-medium text-brand hover:text-brand-hover transition-colors duration-200">
                      {t('header.markAllRead')}
                    </button>
                  )}
                </div>
                <div className="max-h-[217px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[14px] text-[#64748B]">{t('header.noNotifications')}</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`px-5 py-3 border-b border-dashed border-[#eee] hover:bg-[#ebf2fa] transition-colors duration-200 ${!notif.isRead ? 'relative' : ''}`}>
                        {!notif.isRead && <span className="absolute right-5 top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-brand" />}
                        <div className="flex items-start gap-3">
                          <div className="w-[44px] h-[44px] rounded-full bg-[#f6f5fe] flex items-center justify-center shrink-0">
                            <Bell className="w-4 h-4 text-brand" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium text-[#3A4252]">{notif.title}</p>
                            <p className="text-[13px] text-[#64748B] mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[11px] text-[#9999b3] mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="px-5 py-3 border-t border-dashed border-[#eee] text-center">
                    <button className="text-[13px] font-medium text-brand hover:underline transition-all duration-200">
                      {t('header.seeAll') || 'See All'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Selector (Item 06: Clean EN, FR, AR badges) */}
          <LanguageSelector />

          {/* User Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-lg hover:bg-[#E5E5E5]/40 transition-colors duration-200"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#242F40] flex items-center justify-center border-2 border-[#CCA43B]">
                <span className="text-[13px] font-bold text-[#CCA43B]">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[14px] font-semibold text-[#242F40] leading-tight">{user?.firstName} {user?.lastName}</p>
                <p className="text-[12px] text-[#363636]/70 leading-tight">{user?.isRoot ? 'Root Admin' : 'Admin'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#363636] hidden md:block" />
            </button>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-[210px] bg-white rounded-xl shadow-premium-lg p-4 z-50 animate-scale-in border border-[#E5E5E5]">
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#E5E5E5]">
                  <div className="w-[34px] h-[34px] rounded-full bg-[#242F40] flex items-center justify-center shrink-0">
                    <span className="text-[12px] font-bold text-[#CCA43B]">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#242F40] truncate">{user?.firstName} {user?.lastName}</p>
                    <p className="text-[11px] text-[#363636]/70 truncate">{user?.isRoot ? 'Root Admin' : 'Admin'}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/settings?tab=profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#242F40] hover:bg-[#CCA43B]/10 hover:text-[#CCA43B] rounded-lg transition-all duration-200 group"
                    onClick={() => setShowProfile(false)}
                  >
                    <User className="w-4 h-4 text-[#363636] group-hover:text-[#CCA43B] transition-colors" /> {t('settings.profile') || 'Mon Profil'}
                  </Link>
                  <Link
                    href="/settings?tab=appearance"
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#242F40] hover:bg-[#CCA43B]/10 hover:text-[#CCA43B] rounded-lg transition-all duration-200 group"
                    onClick={() => setShowProfile(false)}
                  >
                    <Settings className="w-4 h-4 text-[#363636] group-hover:text-[#CCA43B] transition-colors" /> {t('settings.appearance') || 'Préférences'}
                  </Link>
                  <Link
                    href="/settings?tab=security"
                    className="flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#242F40] hover:bg-[#CCA43B]/10 hover:text-[#CCA43B] rounded-lg transition-all duration-200 group"
                    onClick={() => setShowProfile(false)}
                  >
                    <Shield className="w-4 h-4 text-[#363636] group-hover:text-[#CCA43B] transition-colors" /> {t('settings.security') || 'Sécurité & Mot de passe'}
                  </Link>
                </div>
                <div className="border-t border-[#E5E5E5] mt-3 pt-3">
                  <button
                    onClick={() => { logout(); setShowProfile(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-bold text-[#363636] hover:bg-[#E5E5E5]/50 hover:text-[#242F40] rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" /> {t('nav.logout') || 'Déconnexion'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function clsx(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
