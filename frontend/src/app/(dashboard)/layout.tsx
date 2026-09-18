'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionsStore } from '@/store/permissions-store';
import { useEstablishmentStore } from '@/store/establishment-store';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { HorizontalNav } from '@/components/layout/horizontal-nav';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const routePermissions: Record<string, string> = {
  '/students': 'students:list',
  '/teachers': 'teachers:list',
  '/parents': 'parents:list',
  '/employees': 'employees:list',
  '/classes': 'classes:list',
  '/attendance': 'attendance:list',
  '/schedule': 'calendar:list',
  '/holidays': 'calendar:list',
  '/exams': 'exams:list',
  '/payments': 'payments:list',
  '/reports': 'reports:list',
  '/rooms': 'rooms:list',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, loadUser } = useAuthStore();
  const { menuOrientation } = useEstablishmentStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { hasPermission } = usePermissionsStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && pathname.startsWith('/admin') && user && !user.isRoot) {
      router.push('/dashboard');
    }
    const requiredPermission = routePermissions[pathname];
    if (requiredPermission && isAuthenticated && !hasPermission(requiredPermission)) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, pathname, user, router, hasPermission]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex">
        <div className="hidden lg:flex lg:w-[270px] bg-white border-r border-[#ECF0FF] flex-col gap-3 p-4">
          <div className="h-14 skeleton" />
          <div className="space-y-2 mt-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 skeleton" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-[68px] bg-white border-b border-[#ECF0FF] skeleton mb-4 rounded-b-[15px]" />
          <div className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 skeleton rounded-[15px]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isHorizontal = menuOrientation === 'horizontal';

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#F6F7F9] flex flex-col">
          {/* Sidebar: In horizontal mode, only active on mobile drawer */}
          <div className={isHorizontal ? 'lg:hidden' : ''}>
            <Sidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          <div
            className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
              isHorizontal
                ? 'lg:ml-0'
                : sidebarCollapsed
                ? 'lg:ml-[80px]'
                : 'lg:ml-[270px]'
            }`}
          >
            <Header onMenuClick={() => setSidebarOpen(true)} />
            {isHorizontal && <HorizontalNav />}
            <main className="flex-1 overflow-y-auto">
              <div className="px-5 lg:px-6 pb-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        <ScrollToTop />
      </ErrorBoundary>
    </ToastProvider>
  );
}
