'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ChevronDown, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionsStore } from '@/store/permissions-store';
import { useTranslation } from '@/components/providers/i18n-provider';
import {
  operationalNavigation,
  rootNavigation,
  studentNavigation,
  teacherNavigation,
  parentNavigation,
  NavigationItem,
} from './sidebar';

export function HorizontalNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissionsStore();
  const { t } = useTranslation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const roleNames = (user?.userRoles?.map((r) => r.role.name.toUpperCase()) || []);

  const activeNavigation = (() => {
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
  })();

  const filteredNavigation = activeNavigation.filter((item) => {
    if (item.children) {
      const visible = item.children.filter((c) => !c.permission || hasPermission(c.permission));
      return visible.length > 0;
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      ref={containerRef}
      className="hidden lg:flex items-center gap-1 px-5 py-2 bg-white border-b border-[#ECF0FF] mb-4 shadow-xs relative z-30 overflow-visible text-xs font-semibold flex-wrap"
    >
      {filteredNavigation.map((item) => {
        const isActive = isItemActive(item);
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
          const isOpen = openDropdown === item.key;
          return (
            <div key={item.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(isOpen ? null : item.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
                  isActive ? 'bg-brand/10 text-brand font-bold' : 'text-[#3A4252] hover:bg-[#F6F7F9]'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{t(item.key) || item.name}</span>
                <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform duration-200', isOpen && 'rotate-180')} />
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-white rounded-xl shadow-[0px_10px_35px_0px_rgba(0,0,0,0.15)] border border-[#ECF0FF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {item.children?.map((child) => {
                    if (child.permission && !hasPermission(child.permission)) return null;
                    const childActive = pathname === child.href || pathname.startsWith(child.href + '/');
                    return (
                      <Link
                        key={child.key}
                        href={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className={clsx(
                          'flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors',
                          childActive ? 'bg-brand/10 text-brand font-bold' : 'text-[#64748B] hover:bg-[#F6F7F9] hover:text-[#3A4252]'
                        )}
                      >
                        <child.icon className={clsx('w-3.5 h-3.5 shrink-0', childActive ? 'text-brand' : 'text-[#94A3B8]')} />
                        <span className="truncate">{t(child.key) || child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap',
              isActive ? 'bg-brand/10 text-brand font-bold' : 'text-[#3A4252] hover:bg-[#F6F7F9]'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{t(item.key) || item.name}</span>
          </Link>
        );
      })}

      {user?.isRoot && (
        <div className="flex items-center gap-1 pl-3 ml-2 border-l border-[#ECF0FF]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'root-admin' ? null : 'root-admin')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap text-coral hover:bg-coral/5 font-bold',
                openDropdown === 'root-admin' && 'bg-coral/10'
              )}
            >
              <Crown className="w-4 h-4 text-coral shrink-0" />
              <span>{t('nav.rootAdmin') || 'SaaS Configuration'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {openDropdown === 'root-admin' && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-[0px_10px_35px_0px_rgba(0,0,0,0.15)] border border-[#ECF0FF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {rootNavigation.map((rItem) => (
                  <Link
                    key={rItem.key}
                    href={rItem.href}
                    onClick={() => setOpenDropdown(null)}
                    className={clsx(
                      'flex items-center gap-2.5 px-4 py-2 text-xs font-medium transition-colors',
                      pathname === rItem.href ? 'bg-coral/10 text-coral font-bold' : 'text-[#64748B] hover:bg-[#F6F7F9] hover:text-[#3A4252]'
                    )}
                  >
                    <rItem.icon className="w-3.5 h-3.5 text-coral shrink-0" />
                    <span className="truncate">{t(rItem.key) || rItem.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
