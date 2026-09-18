'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardCheck, FileText,
  CreditCard, Settings, ChevronDown, School, BarChart3, Crown, UserCheck,
  Shield, Building2, Home, Calendar, Layers, PanelLeftClose, PanelLeft,
  MessageSquare, Bell, Video, Sliders, AlertOctagon, Briefcase,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionsStore } from '@/store/permissions-store';
import { useTranslation } from '@/components/providers/i18n-provider';

export interface NavigationItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  key: string;
  permission?: string;
  children?: { name: string; href: string; icon: typeof LayoutDashboard; key: string; permission?: string }[];
}

// Operational navigation ordered strictly by educational SaaS lifecycle
export const operationalNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  {
    name: 'Establishments & Rooms', href: '#', icon: Building2, key: 'nav.establishmentsGroup',
    children: [
      { name: 'Establishments & Campuses', href: '/establishments', icon: Building2, key: 'nav.establishments' },
      { name: 'Rooms & Infrastructure', href: '/rooms', icon: Home, key: 'nav.rooms', permission: 'rooms:list' },
    ],
  },
  { name: 'Employees & Staff', href: '/employees', icon: Users, key: 'nav.employees', permission: 'employees:list' },
  { name: 'Modules & Coefficients', href: '/academic-modules', icon: Layers, key: 'nav.academicModules' },
  {
    name: 'Classes & Promotion', href: '#', icon: BookOpen, key: 'nav.classes',
    children: [
      { name: 'Classes Management', href: '/classes', icon: BookOpen, key: 'nav.classes', permission: 'classes:list' },
      { name: 'Annual Deliberation & Promotion', href: '/classes/promotion', icon: GraduationCap, key: 'classes.promotionTitle', permission: 'classes:update' },
    ],
  },
  { name: 'Teachers', href: '/teachers', icon: Users, key: 'nav.teachers', permission: 'teachers:list' },
  {
    name: 'Students & Parents', href: '#', icon: GraduationCap, key: 'nav.students',
    children: [
      { name: 'Students', href: '/students', icon: GraduationCap, key: 'nav.students', permission: 'students:list' },
      { name: 'Parents', href: '/parents', icon: Users, key: 'nav.parents', permission: 'parents:list' },
    ],
  },
  {
    name: 'Schedule & Calendar', href: '#', icon: Calendar, key: 'nav.schedule',
    children: [
      { name: 'Timetable & Sessions', href: '/schedule', icon: Calendar, key: 'nav.schedule', permission: 'calendar:list' },
      { name: 'Holidays & Vacations', href: '/holidays', icon: Calendar, key: 'nav.holidays', permission: 'calendar:list' },
    ],
  },
  { name: 'Daily Attendance', href: '/attendance', icon: ClipboardCheck, key: 'nav.attendance', permission: 'attendance:list' },
  { name: 'Homework & Cahier', href: '/homework', icon: BookOpen, key: 'nav.homework' },
  { name: 'Exams & Evaluations', href: '/exams', icon: FileText, key: 'nav.exams', permission: 'exams:list' },
  {
    name: 'Finance & Caisses', href: '#', icon: CreditCard, key: 'nav.payments',
    children: [
      { name: 'Payments Ledger (TND)', href: '/payments', icon: CreditCard, key: 'nav.payments', permission: 'payments:list' },
      { name: 'Cash Register (Caisses)', href: '/payments/caisse', icon: CreditCard, key: 'nav.caisse', permission: 'payments:list' },
    ],
  },
  {
    name: 'Community & Communication', href: '#', icon: MessageSquare, key: 'nav.community',
    children: [
      { name: 'In-App Messages', href: '/community/messages', icon: MessageSquare, key: 'nav.messages' },
      { name: 'Broadcast Notifications', href: '/community/notifications', icon: Bell, key: 'nav.notifications' },
      { name: 'Réunions & Conferences', href: '/community/meetings', icon: Video, key: 'nav.meetings' },
    ],
  },
  {
    name: 'Dedicated Portals', href: '#', icon: GraduationCap, key: 'nav.portals',
    children: [
      { name: 'Teacher Portal', href: '/portal/teacher', icon: GraduationCap, key: 'nav.teacherPortal' },
      { name: 'Student Portal', href: '/portal/student', icon: GraduationCap, key: 'nav.studentPortal' },
      { name: 'Parent Portal', href: '/portal/parent', icon: Users, key: 'nav.parentPortal' },
    ],
  },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3, key: 'nav.reports', permission: 'reports:list' },
];

// Root Admin SaaS Configuration sequence (Platform -> Tenants -> Billing -> Access -> Observability)
export const rootNavigation: NavigationItem[] = [
  { name: 'Platform Settings', href: '/admin/settings', icon: Sliders, key: 'nav.platformSettings' },
  { name: 'School Tenants', href: '/admin/tenants', icon: Building2, key: 'nav.tenants' },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: UserCheck, key: 'nav.subscriptions' },
  { name: 'Pricing Plans', href: '/admin/plans', icon: CreditCard, key: 'nav.plans' },
  { name: 'Platform Modules', href: '/admin/modules', icon: Layers, key: 'pages.modulesTitle' },
  { name: 'Business Functions', href: '/admin/functions', icon: Briefcase, key: 'nav.functions' },
  { name: 'System Roles', href: '/admin/roles', icon: UserCheck, key: 'nav.roles' },
  { name: 'Permissions', href: '/admin/permissions', icon: Shield, key: 'nav.permissions' },
  { name: 'User Audit Logs', href: '/admin/audit-logs', icon: Shield, key: 'nav.auditLogs' },
  { name: 'System Error Logs', href: '/admin/system-logs', icon: AlertOctagon, key: 'nav.systemLogs' },
];

// Role-scoped specific navigation menus
export const studentNavigation: NavigationItem[] = [
  { name: 'My Portal', href: '/portal/student', icon: GraduationCap, key: 'nav.studentPortal' },
  { name: 'Schedule', href: '/schedule', icon: Calendar, key: 'nav.schedule' },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, key: 'nav.attendance' },
  { name: 'Homework', href: '/homework', icon: BookOpen, key: 'nav.homework' },
  { name: 'Exams & Notes', href: '/exams', icon: FileText, key: 'nav.exams' },
  { name: 'Messages', href: '/community/messages', icon: MessageSquare, key: 'nav.messages' },
];

export const teacherNavigation: NavigationItem[] = [
  { name: 'Teacher Portal', href: '/portal/teacher', icon: GraduationCap, key: 'nav.teacherPortal' },
  { name: 'My Classes', href: '/classes', icon: BookOpen, key: 'nav.classes' },
  { name: 'Daily Attendance', href: '/attendance', icon: ClipboardCheck, key: 'nav.attendance' },
  { name: 'Homework & Cahier', href: '/homework', icon: BookOpen, key: 'nav.homework' },
  { name: 'Exams & Grades', href: '/exams', icon: FileText, key: 'nav.exams' },
  { name: 'Schedule', href: '/schedule', icon: Calendar, key: 'nav.schedule' },
  { name: 'Messages', href: '/community/messages', icon: MessageSquare, key: 'nav.messages' },
];

export const parentNavigation: NavigationItem[] = [
  { name: 'Parent Portal', href: '/portal/parent', icon: Users, key: 'nav.parentPortal' },
  { name: 'My Children', href: '/students', icon: GraduationCap, key: 'nav.students' },
  { name: 'Attendance Record', href: '/attendance', icon: ClipboardCheck, key: 'nav.attendance' },
  { name: 'Tuition & Fees', href: '/payments', icon: CreditCard, key: 'nav.payments' },
  { name: 'Timetable', href: '/schedule', icon: Calendar, key: 'nav.schedule' },
  { name: 'Messages', href: '/community/messages', icon: MessageSquare, key: 'nav.messages' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissionsStore();
  const { t } = useTranslation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const roleNames = useMemo(() => {
    return (user?.userRoles?.map((r) => r.role.name.toUpperCase()) || []);
  }, [user]);

  const activeNavigation = useMemo(() => {
    if (user?.isRoot) return operationalNavigation;
    if (roleNames.includes('STUDENT') && !roleNames.includes('ADMIN') && !roleNames.includes('SUPER_ADMIN')) {
      return studentNavigation;
    }
    if (roleNames.includes('TEACHER') && !roleNames.includes('ADMIN') && !roleNames.includes('SUPER_ADMIN')) {
      return teacherNavigation;
    }
    if (roleNames.includes('PARENT') && !roleNames.includes('ADMIN') && !roleNames.includes('SUPER_ADMIN')) {
      return parentNavigation;
    }
    return operationalNavigation;
  }, [user, roleNames]);

  const filteredNavigation = activeNavigation.filter((item) => {
    if (item.children) {
      const visibleChildren = item.children.filter((c) => !c.permission || hasPermission(c.permission));
      return visibleChildren.length > 0;
    }
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const isItemActive = (item: NavigationItem): boolean => {
    if (item.href === '#') {
      return item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false;
    }
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const toggleSubmenu = (key: string) => {
    setOpenSubmenu(openSubmenu === key ? null : key);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovering(false);
      setOpenSubmenu(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const renderMenuItem = (item: NavigationItem) => {
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      const isOpen = openSubmenu === item.key || (collapsed && isHovering && openSubmenu === item.key);
      return (
        <li key={item.key} className="mb-0.5">
          <button
            onClick={() => toggleSubmenu(item.key)}
            className={clsx(
              'flex items-center gap-3 w-full rounded-lg text-[14px] font-medium transition-all duration-200',
              collapsed && !isHovering ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-[#3A4252] hover:bg-[#E5E5E5]/50'
            )}
          >
            <item.icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-brand' : 'text-[#64748B]')} />
            {!collapsed || isHovering ? (
              <>
                <span className="flex-1 text-left truncate">{t(item.key) || item.name}</span>
                <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} />
              </>
            ) : null}
          </button>
          {(!collapsed || isHovering) && isOpen && (
            <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[#E5E5E5] pl-2">
              {item.children?.map((child) => {
                if (child.permission && !hasPermission(child.permission)) return null;
                const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                return (
                  <li key={child.key}>
                    <Link
                      href={child.href}
                      className={clsx(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                        childActive ? 'bg-brand/10 text-brand font-semibold' : 'text-[#64748B] hover:bg-[#E5E5E5]/50 hover:text-[#3A4252]'
                      )}
                      onClick={onClose}
                    >
                      <child.icon className={clsx('w-4 h-4 shrink-0', childActive ? 'text-brand' : 'text-[#94A3B8]')} />
                      <span className="truncate">{t(child.key) || child.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.key} className="mb-0.5">
        <Link
          href={item.href}
          className={clsx(
            'flex items-center gap-3 rounded-lg text-[14px] font-medium transition-all duration-200',
            collapsed && !isHovering ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
            isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-[#3A4252] hover:bg-[#E5E5E5]/50'
          )}
          onClick={onClose}
        >
          <item.icon className={clsx('w-5 h-5 shrink-0', isActive ? 'text-brand' : 'text-[#64748B]')} />
          {!collapsed || isHovering ? <span className="truncate">{t(item.key) || item.name}</span> : null}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 h-full bg-white z-50 transition-all duration-300 ease-in-out flex flex-col border-r border-[#E5E5E5]',
          collapsed && !isHovering ? 'w-[80px]' : 'w-[270px]',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        onMouseEnter={collapsed ? handleMouseEnter : undefined}
        onMouseLeave={collapsed ? handleMouseLeave : undefined}
      >
        {/* Logo & Collapse Toggle */}
        <div className={clsx(
          'flex items-center justify-between h-[70px] border-b border-[#E5E5E5] shrink-0',
          collapsed && !isHovering ? 'justify-center px-2' : 'px-6'
        )}>
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#CCA43B] flex items-center justify-center border border-[#242F40] shadow-sm shrink-0">
              <School className="w-5 h-5 text-white" />
            </div>
            {(!collapsed || isHovering) && (
              <div>
                <span className="font-bold text-[20px] text-[#242F40] tracking-tight block leading-tight">BSofts</span>
                <span className="text-[11px] text-[#9999b3] uppercase tracking-[0.15em] font-medium">School</span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          {onToggleCollapse && (!collapsed || isHovering) && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-[#9999b3] hover:text-[#242F40] hover:bg-[#E5E5E5]/50 transition-all"
              title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
              aria-label="Toggle sidebar collapse"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-5 px-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e0e0e2 #F0F0F4' }}>
          {/* Section: Main */}
          {(!collapsed || isHovering) && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#445164]">
              {t('nav.main') || 'Main'}
            </p>
          )}
          <ul className="space-y-0.5">
            {filteredNavigation.map((item) => renderMenuItem(item))}
          </ul>

          {/* Root admin section */}
          {user?.isRoot && (
            <>
              {(!collapsed || isHovering) && (
                <>
                  <div className="mx-3 my-4 h-px bg-[#ECF0FF]" />
                  <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#445164] flex items-center gap-2">
                    <Crown className="w-3 h-3 text-coral" />
                    {t('nav.rootAdmin')}
                  </p>
                </>
              )}
              {collapsed && !isHovering && <div className="mx-2 my-4 h-px bg-[#ECF0FF]" />}
              <ul className="space-y-0.5">
                {rootNavigation.map((item) => renderMenuItem(item))}
              </ul>
            </>
          )}
        </nav>

        {/* Footer: Expand Button if collapsed & Settings */}
        <div className="border-t border-[#E5E5E5] p-4 shrink-0 space-y-2">
          {onToggleCollapse && collapsed && !isHovering && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg text-[#9999b3] hover:text-brand hover:bg-[#E5E5E5]/50 transition-all"
              title="Agrandir le menu"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          <Link
            href="/settings"
            className={clsx(
              'flex items-center gap-3 rounded-lg text-[14px] font-medium transition-all duration-200',
              collapsed && !isHovering ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              pathname === '/settings' ? 'bg-brand/10 text-brand font-semibold' : 'text-[#3A4252] hover:bg-[#E5E5E5]/50'
            )}
          >
            <Settings className={clsx('w-5 h-5 shrink-0', pathname === '/settings' ? 'text-brand' : 'text-[#64748B]')} />
            {(!collapsed || isHovering) && (t('nav.settings') || 'Settings')}
          </Link>
        </div>
      </aside>
    </>
  );
}
